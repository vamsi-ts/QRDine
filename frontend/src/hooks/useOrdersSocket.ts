import { useEffect } from 'react';
import { createStompClient } from '../services/websocket';
import type { Order } from '../types';

interface OrderEvent {
  type: string;
  order: Order;
}

export function useOrdersSocket(onOrder: (event: OrderEvent) => void) {
  useEffect(() => {
    const client = createStompClient();
    client.onConnect = () => {
      client.subscribe('/topic/orders', (message) => onOrder(JSON.parse(message.body)));
    };
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [onOrder]);
}