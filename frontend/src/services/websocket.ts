import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createStompClient() {
  return new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000
  });
}