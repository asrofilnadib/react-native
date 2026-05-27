import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { getDb, getFirebaseFunctions, isFirebaseConfigured } from '@/lib/firebase';
import type { CartItem, Order, OrderStatus } from '@/types';

type CreateOrderInput = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryNotes?: string;
  addressSnapshot?: string;
  clerkToken: string;
};

type CreateOrderResult = { orderId: string };

type CreatePaymentResult = { paymentUrl: string; invoiceId?: string };

const mockOrders = new Map<string, Order>();

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const functions = getFirebaseFunctions();
  if (!functions || !isFirebaseConfigured()) {
    const orderId = `mock-${Date.now()}`;
    mockOrders.set(orderId, {
      id: orderId,
      userId: 'local',
      items: input.items,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      discount: input.discount,
      total: input.total,
      status: 'pending_payment',
      deliveryNotes: input.deliveryNotes,
      addressSnapshot: input.addressSnapshot,
    });
    return orderId;
  }

  const fn = httpsCallable<CreateOrderInput, CreateOrderResult>(functions, 'createOrder');
  const result = await fn(input);
  return result.data.orderId;
}

export async function createXenditPayment(
  orderId: string,
  clerkToken: string,
): Promise<CreatePaymentResult> {
  const functions = getFirebaseFunctions();
  if (!functions || !isFirebaseConfigured()) {
    const order = mockOrders.get(orderId);
    if (order) {
      order.paymentUrl = `https://checkout.xendit.co/web/mock-${orderId}`;
      order.status = 'pending_payment';
    }
    return {
      paymentUrl: `https://checkout.xendit.co/web/mock-${orderId}`,
      invoiceId: `mock-inv-${orderId}`,
    };
  }

  const fn = httpsCallable<{ orderId: string; clerkToken: string }, CreatePaymentResult>(
    functions,
    'createXenditPayment',
  );
  const result = await fn({ orderId, clerkToken });
  return result.data;
}

export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void,
): Unsubscribe {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    const poll = () => {
      callback(mockOrders.get(orderId) ?? null);
    };
    poll();
    const id = setInterval(poll, 1500);
    return () => clearInterval(id);
  }

  return onSnapshot(doc(db, 'orders', orderId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      id: snap.id,
      userId: data.userId,
      items: data.items ?? [],
      subtotal: data.subtotal ?? 0,
      deliveryFee: data.deliveryFee ?? 0,
      discount: data.discount ?? 0,
      total: data.total ?? 0,
      status: (data.status as OrderStatus) ?? 'pending_payment',
      deliveryNotes: data.deliveryNotes,
      addressSnapshot: data.addressSnapshot,
      xenditInvoiceId: data.xenditInvoiceId,
      paymentUrl: data.paymentUrl,
      createdAt: data.createdAt,
    });
  });
}

export function mockMarkOrderPaid(orderId: string) {
  const order = mockOrders.get(orderId);
  if (order) {
    order.status = 'paid';
  }
}
