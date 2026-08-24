declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function fbEvent(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data);
  }
}

export function gtmPush(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  }
}

// Helpers for standard FB events
export const pixel = {
  viewContent: (name: string, id: string, price: number) =>
    fbEvent('ViewContent', { content_name: name, content_ids: [id], value: price, currency: 'UAH', content_type: 'product' }),

  addToCart: (name: string, id: string, price: number, quantity = 1) =>
    fbEvent('AddToCart', { content_name: name, content_ids: [id], value: price * quantity, currency: 'UAH', content_type: 'product' }),

  initiateCheckout: (value: number, numItems: number) =>
    fbEvent('InitiateCheckout', { value, currency: 'UAH', num_items: numItems }),

  purchase: (orderId: string, value: number, productIds: string[]) =>
    fbEvent('Purchase', { value, currency: 'UAH', content_ids: productIds, content_type: 'product', order_id: orderId }),
};
