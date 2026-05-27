"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpsertRestaurant = exports.xenditWebhook = exports.createXenditPayment = exports.createOrder = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const backend_1 = require("@clerk/backend");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../.env') });
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
admin.initializeApp();
const db = admin.firestore();
const clerk = (0, backend_1.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
});
async function verifyClerkToken(token) {
    if (!token) {
        throw new https_1.HttpsError('unauthenticated', 'Missing auth token');
    }
    if (!process.env.CLERK_SECRET_KEY) {
        return 'dev-user';
    }
    try {
        const payload = await clerk.verifyToken(token);
        return payload.sub;
    }
    catch {
        throw new https_1.HttpsError('unauthenticated', 'Invalid token');
    }
}
exports.createOrder = (0, https_1.onCall)(async (request) => {
    const data = request.data;
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
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { orderId: ref.id };
});
exports.createXenditPayment = (0, https_1.onCall)(async (request) => {
    const { orderId, clerkToken } = request.data;
    const userId = await verifyClerkToken(clerkToken);
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Order not found');
    }
    const order = orderSnap.data();
    if (order.userId !== userId) {
        throw new https_1.HttpsError('permission-denied', 'Not your order');
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
        throw new https_1.HttpsError('internal', `Xendit error: ${errText}`);
    }
    const invoice = (await response.json());
    await orderRef.update({
        paymentUrl: invoice.invoice_url,
        xenditInvoiceId: invoice.id,
    });
    return { paymentUrl: invoice.invoice_url, invoiceId: invoice.id };
});
exports.xenditWebhook = (0, https_1.onRequest)(async (req, res) => {
    const token = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
    if (token && req.headers['x-callback-token'] !== token) {
        res.status(401).send('Unauthorized');
        return;
    }
    const body = req.body;
    const orderId = body.external_id;
    if (!orderId) {
        res.status(400).send('Missing external_id');
        return;
    }
    if (body.status === 'PAID' || body.status === 'SETTLED') {
        await db.collection('orders').doc(orderId).update({
            status: 'paid',
            paidAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    res.status(200).send('OK');
});
exports.adminUpsertRestaurant = (0, https_1.onCall)(async (request) => {
    const { clerkToken, restaurant } = request.data;
    const userId = await verifyClerkToken(clerkToken);
    const adminIds = (process.env.CLERK_ADMIN_USER_IDS ?? '').split(',').filter(Boolean);
    if (adminIds.length > 0 && !adminIds.includes(userId)) {
        throw new https_1.HttpsError('permission-denied', 'Admin only');
    }
    const id = restaurant.id || db.collection('restaurants').doc().id;
    const { id: _omit, location, ...rest } = restaurant;
    const payload = { ...rest };
    if (location && typeof location === 'object') {
        const loc = location;
        payload.location = new admin.firestore.GeoPoint(loc.latitude, loc.longitude);
    }
    await db.collection('restaurants').doc(id).set(payload, { merge: true });
    return { id };
});
//# sourceMappingURL=index.js.map