import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

import { createClerkClient } from '@clerk/backend';

loadEnv({ path: resolve(__dirname, '../.env') });
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY ?? '',
});

async function verifyClerkToken(token: string): Promise<string> {
  if (!token) {
    throw new HttpsError('unauthenticated', 'Missing auth token');
  }
  if (!process.env.CLERK_SECRET_KEY) {
    return 'dev-user';
  }
  try {
    const payload = await clerk.verifyToken(token);
    return payload.sub;
  } catch {
    throw new HttpsError('unauthenticated', 'Invalid token');
  }
}

type CreateOrderInput = {
  items: unknown[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryNotes?: string;
  addressSnapshot?: string;
  clerkToken: string;
};

export const createOrder = onCall(async (request) => {
  const data = request.data as CreateOrderInput;
  const userId = await verifyClerkToken(data.clerkToken);

  const ref = await db.collection('orders').add({
    userId,
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    discount: data.discount ?? 0,
    total: data.total,
    deliveryNotes: data.deliveryNotes ?? '',
    addressSnapshot: data.addressSnapshot ?? '',
    status: 'pending_payment',
    createdAt: FieldValue.serverTimestamp(),
  });

  return { orderId: ref.id };
});

export const createXenditPayment = onCall(async (request) => {
  const { orderId, clerkToken } = request.data as { orderId: string; clerkToken: string };
  const userId = await verifyClerkToken(clerkToken);

  const orderRef = db.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    throw new HttpsError('not-found', 'Order not found');
  }
  const order = orderSnap.data()!;
  if (order.userId !== userId) {
    throw new HttpsError('permission-denied', 'Not your order');
  }

  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    const mockUrl = `https://checkout.xendit.co/web/mock-${orderId}`;
    await orderRef.update({ paymentUrl: mockUrl, xenditInvoiceId: `mock-${orderId}` });
    return { paymentUrl: mockUrl, invoiceId: `mock-${orderId}` };
  }

  const response = await fetch('https://api.xendit.co/v2/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    },
    body: JSON.stringify({
      external_id: orderId,
      amount: order.total,
      description: `MealsToGo order ${orderId}`,
      invoice_duration: 86400,
      currency: 'IDR',
      customer: {
        given_names: 'MealsToGo',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new HttpsError('internal', `Xendit error: ${errText}`);
  }

  const invoice = (await response.json()) as { id: string; invoice_url: string };
  await orderRef.update({
    paymentUrl: invoice.invoice_url,
    xenditInvoiceId: invoice.id,
  });

  return { paymentUrl: invoice.invoice_url, invoiceId: invoice.id };
});

export const xenditWebhook = onRequest(async (req, res) => {
  const token = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
  if (token && req.headers['x-callback-token'] !== token) {
    res.status(401).send('Unauthorized');
    return;
  }

  const body = req.body as {
    external_id?: string;
    status?: string;
  };

  const orderId = body.external_id;
  if (!orderId) {
    res.status(400).send('Missing external_id');
    return;
  }

  if (body.status === 'PAID' || body.status === 'SETTLED') {
    await db.collection('orders').doc(orderId).update({
      status: 'paid',
      paidAt: FieldValue.serverTimestamp(),
    });
  }

  res.status(200).send('OK');
});

export const adminUpsertRestaurant = onCall(async (request) => {
  const { clerkToken, restaurant } = request.data as {
    clerkToken: string;
    restaurant: Record<string, unknown>;
  };
  const userId = await verifyClerkToken(clerkToken);
  const adminIds = (process.env.CLERK_ADMIN_USER_IDS ?? '').split(',').filter(Boolean);
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    throw new HttpsError('permission-denied', 'Admin only');
  }

  const id = (restaurant.id as string) || db.collection('restaurants').doc().id;
  const { id: _omit, location, ...rest } = restaurant;
  const payload: Record<string, unknown> = { ...rest };
  if (location && typeof location === 'object') {
    const loc = location as { latitude: number; longitude: number };
    payload.location = new admin.firestore.GeoPoint(loc.latitude, loc.longitude);
  }
  await db.collection('restaurants').doc(id).set(payload, { merge: true });
  return { id };
});
