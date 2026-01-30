/**
 * React Hook for CyberSource Unified Checkout
 *
 * Usage:
 *   const { startCheckout, isLoading, error } = useCheckout({
 *     apiBaseUrl: 'https://your-backend.com/api',
 *     onPaymentComplete: (response) => console.log('Payment completed!', response),
 *   });
 */

import { useState, useCallback, useRef } from 'react';
import { createCheckoutApi, type CheckoutApi } from '../api/checkoutApi';
import type {
  CaptureContextConfig,
  CheckoutData,
  PaymentResponse,
  UnifiedCheckoutConfig,
} from '../types';

export interface UseCheckoutOptions extends UnifiedCheckoutConfig {}

export interface UseCheckoutReturn {
  // State
  isLoading: boolean;
  error: Error | null;
  captureContext: string | null;
  checkoutData: CheckoutData | null;
  paymentResult: PaymentResponse | null;

  // Actions
  generateCaptureContext: (config: CaptureContextConfig) => Promise<void>;
  startCheckout: (containerId: string, useSidebar?: boolean) => Promise<void>;
  reset: () => void;

  // API instance for direct access
  api: CheckoutApi;
}

export function useCheckout(options: UseCheckoutOptions): UseCheckoutReturn {
  const { apiBaseUrl, onPaymentComplete, onPaymentError, onPaymentCancel } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [captureContext, setCaptureContext] = useState<string | null>(null);
  const [decodedContext, setDecodedContext] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  // API instance
  const apiRef = useRef<CheckoutApi>(createCheckoutApi(apiBaseUrl));

  // Generate capture context
  const generateCaptureContext = useCallback(async (config: CaptureContextConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRef.current.generateCaptureContext(config);

      if (response.success && response.data) {
        setCaptureContext(response.data.captureContext);
        setDecodedContext(response.data.decodedData);
      } else {
        throw new Error(response.error || 'Failed to generate capture context');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onPaymentError]);

  // Start checkout flow
  const startCheckout = useCallback(async (containerId: string, useSidebar = true) => {
    if (!captureContext || !decodedContext) {
      const error = new Error('Capture context not generated. Call generateCaptureContext first.');
      setError(error);
      onPaymentError?.(error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare checkout data
      const prepareResponse = await apiRef.current.prepareCheckout(captureContext, decodedContext);

      if (!prepareResponse.success || !prepareResponse.data) {
        throw new Error(prepareResponse.error || 'Failed to prepare checkout');
      }

      const data = prepareResponse.data;
      setCheckoutData(data);

      // Load CyberSource SDK
      await loadCyberSourceSDK(data.clientLibrary, data.clientLibraryIntegrity);

      // Initialize checkout
      const accept = await Accept(data.captureContext);
      const up = await accept.unifiedPayments(useSidebar);
      const token = await up.show({
        containers: { paymentSelection: containerId }
      });
      const paymentResponse = await up.complete(token);

      // Process payment completion
      const completeResponse = await apiRef.current.completePayment(paymentResponse);
      setPaymentResult(completeResponse);

      if (completeResponse.success) {
        onPaymentComplete?.(completeResponse);
      } else {
        throw new Error(completeResponse.error || 'Payment failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [captureContext, decodedContext, onPaymentComplete, onPaymentError]);

  // Reset state
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setCaptureContext(null);
    setDecodedContext(null);
    setCheckoutData(null);
    setPaymentResult(null);
  }, []);

  return {
    isLoading,
    error,
    captureContext,
    checkoutData,
    paymentResult,
    generateCaptureContext,
    startCheckout,
    reset,
    api: apiRef.current,
  };
}

// Helper to load CyberSource SDK dynamically
function loadCyberSourceSDK(url: string, integrity: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof Accept !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    script.integrity = integrity;
    script.crossOrigin = 'anonymous';

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load CyberSource SDK'));

    document.head.appendChild(script);
  });
}
