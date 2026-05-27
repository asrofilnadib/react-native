import { Text, View } from 'react-native';

import type { OrderStatus } from '@/types';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'paid', label: 'Order confirmed' },
  { key: 'preparing', label: 'Preparing your order' },
  { key: 'ready', label: 'Order is ready' },
  { key: 'delivering', label: 'Rider is picking up your order' },
  { key: 'completed', label: 'Delivered' },
];

const STATUS_ORDER: OrderStatus[] = [
  'draft',
  'pending_payment',
  'paid',
  'preparing',
  'ready',
  'delivering',
  'completed',
  'cancelled',
];

function statusIndex(status: OrderStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx < 0 ? 0 : idx;
}

type Props = {
  status: OrderStatus;
};

export function OrderTimeline({ status }: Props) {
  const current = statusIndex(status);

  return (
    <View className="py-2">
      {STEPS.map((step, index) => {
        const stepIdx = statusIndex(step.key);
        const done = current >= stepIdx;
        const active = current === stepIdx;
        return (
          <View key={step.key} className="flex-row mb-4">
            <View className="items-center mr-3">
              <View
                className={`h-4 w-4 rounded-full ${done ? 'bg-primary' : 'bg-gray-200'} ${active ? 'border-2 border-primary' : ''}`}
              />
              {index < STEPS.length - 1 ? (
                <View className={`w-0.5 flex-1 min-h-[24px] ${done ? 'bg-primary' : 'bg-gray-200'}`} />
              ) : null}
            </View>
            <Text className={`flex-1 pt-0 ${done ? 'text-text font-medium' : 'text-textLight'}`}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
