/**
 * CyberSource Unified Checkout React SDK
 *
 * Easy integration of CyberSource Unified Checkout into any React application.
 *
 * @example
 * // Simple usage with component
 * import { UnifiedCheckout } from '@cybersource/unified-checkout-react';
 *
 * function CheckoutPage() {
 *   return (
 *     <UnifiedCheckout
 *       apiBaseUrl="https://your-backend.com/api"
 *       orderAmount="99.99"
 *       currency="USD"
 *       onPaymentComplete={(res) => console.log('Paid!', res)}
 *     />
 *   );
 * }
 *
 * @example
 * // Advanced usage with hook
 * import { useCheckout } from '@cybersource/unified-checkout-react';
 *
 * function CustomCheckout() {
 *   const { generateCaptureContext, startCheckout, isLoading } = useCheckout({
 *     apiBaseUrl: 'https://your-backend.com/api',
 *   });
 *
 *   // ... custom logic
 * }
 */

// Components
export { UnifiedCheckout } from './components/UnifiedCheckout';
export type { UnifiedCheckoutProps } from './components/UnifiedCheckout';

// Hooks
export { useCheckout } from './hooks/useCheckout';
export type { UseCheckoutOptions, UseCheckoutReturn } from './hooks/useCheckout';

// API
export { createCheckoutApi, setDefaultApiUrl, getDefaultApi } from './api/checkoutApi';
export type { CheckoutApi } from './api/checkoutApi';

// Types
export type {
  CaptureContextConfig,
  BillingAddress,
  ShippingAddress,
  CaptureContextResponse,
  CheckoutData,
  CheckoutResponse,
  PaymentResponse,
  UnifiedCheckoutConfig,
} from './types';
