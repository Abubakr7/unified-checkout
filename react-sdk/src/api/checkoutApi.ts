/**
 * CyberSource Unified Checkout API Client
 *
 * Usage:
 *   import { createCheckoutApi } from './checkoutApi';
 *   const api = createCheckoutApi('https://your-backend.com/api');
 */

import type {
  CaptureContextConfig,
  CaptureContextResponse,
  CheckoutResponse,
  PaymentResponse,
} from '../types';

export interface CheckoutApi {
  healthCheck(): Promise<{ status: string; timestamp: string }>;
  getDefaultConfig(): Promise<{ success: boolean; data: CaptureContextConfig }>;
  generateCaptureContext(config: CaptureContextConfig): Promise<CaptureContextResponse>;
  prepareCheckout(captureContext: string, decodedData: any): Promise<CheckoutResponse>;
  completePayment(response: string): Promise<PaymentResponse>;
}

export function createCheckoutApi(baseUrl: string): CheckoutApi {
  const fetchJson = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  return {
    async healthCheck() {
      return fetchJson('/health');
    },

    async getDefaultConfig() {
      return fetchJson('/config');
    },

    async generateCaptureContext(config: CaptureContextConfig) {
      return fetchJson<CaptureContextResponse>('/capture-context', {
        method: 'POST',
        body: JSON.stringify({ captureContextRequest: config }),
      });
    },

    async prepareCheckout(captureContext: string, captureContextDecoded: any) {
      return fetchJson<CheckoutResponse>('/checkout', {
        method: 'POST',
        body: JSON.stringify({ captureContext, captureContextDecoded }),
      });
    },

    async completePayment(response: string) {
      return fetchJson<PaymentResponse>('/complete-payment', {
        method: 'POST',
        body: JSON.stringify({ response }),
      });
    },
  };
}

// Default instance (can be overridden)
let defaultApiUrl = 'http://localhost:3000/api';

export function setDefaultApiUrl(url: string) {
  defaultApiUrl = url;
}

export function getDefaultApi(): CheckoutApi {
  return createCheckoutApi(defaultApiUrl);
}
