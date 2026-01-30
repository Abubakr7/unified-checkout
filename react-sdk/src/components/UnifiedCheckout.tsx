/**
 * UnifiedCheckout Component
 *
 * A ready-to-use checkout component that handles the entire payment flow.
 *
 * Usage:
 *   <UnifiedCheckout
 *     apiBaseUrl="https://your-backend.com/api"
 *     orderAmount="21.00"
 *     currency="USD"
 *     onPaymentComplete={(response) => handleSuccess(response)}
 *     onPaymentError={(error) => handleError(error)}
 *   />
 */

import React, { useEffect, useCallback, useState } from 'react';
import { useCheckout } from '../hooks/useCheckout';
import type { CaptureContextConfig, PaymentResponse } from '../types';

export interface UnifiedCheckoutProps {
  // Required
  apiBaseUrl: string;
  orderAmount: string;
  currency: string;

  // Optional config
  targetOrigin?: string;
  allowedCardNetworks?: string[];
  allowedPaymentTypes?: string[];
  country?: string;
  locale?: string;
  useSidebar?: boolean;

  // Callbacks
  onPaymentComplete?: (response: PaymentResponse) => void;
  onPaymentError?: (error: Error) => void;
  onReady?: () => void;

  // Styling
  className?: string;
  style?: React.CSSProperties;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
}

export const UnifiedCheckout: React.FC<UnifiedCheckoutProps> = ({
  apiBaseUrl,
  orderAmount,
  currency,
  targetOrigin = window.location.origin,
  allowedCardNetworks = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
  allowedPaymentTypes = ['PANENTRY', 'CLICKTOPAY', 'GOOGLEPAY'],
  country = 'US',
  locale = 'en_US',
  useSidebar = true,
  onPaymentComplete,
  onPaymentError,
  onReady,
  className,
  style,
  loadingComponent,
  errorComponent,
}) => {
  const containerId = 'unified-checkout-container';
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    isLoading,
    error,
    generateCaptureContext,
    startCheckout,
    reset,
  } = useCheckout({
    apiBaseUrl,
    onPaymentComplete,
    onPaymentError,
  });

  // Build capture context config
  const buildConfig = useCallback((): CaptureContextConfig => ({
    targetOrigins: [targetOrigin],
    clientVersion: '0.26',
    allowedCardNetworks,
    allowedPaymentTypes,
    country,
    locale,
    captureMandate: {
      billingType: 'FULL',
      requestEmail: true,
      requestPhone: true,
      requestShipping: true,
      shipToCountries: ['US', 'GB'],
      showAcceptedNetworkIcons: true,
    },
    completeMandate: {
      type: 'AUTH',
      decisionManager: true,
    },
    orderInformation: {
      amountDetails: {
        totalAmount: orderAmount,
        currency,
      },
    },
  }), [targetOrigin, allowedCardNetworks, allowedPaymentTypes, country, locale, orderAmount, currency]);

  // Initialize checkout
  const initialize = useCallback(async () => {
    try {
      const config = buildConfig();
      await generateCaptureContext(config);
      setIsInitialized(true);
      onReady?.();
    } catch (err) {
      // Error handled by hook
    }
  }, [buildConfig, generateCaptureContext, onReady]);

  // Start checkout when initialized
  useEffect(() => {
    if (isInitialized && !isLoading && !error) {
      startCheckout(`#${containerId}`, useSidebar);
    }
  }, [isInitialized, isLoading, error, startCheckout, useSidebar]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    reset();
    setIsInitialized(false);
    initialize();
  }, [reset, initialize]);

  // Render error
  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error, handleRetry)}</>;
    }
    return (
      <div className="unified-checkout-error" style={{ padding: '20px', color: '#dc3545' }}>
        <p>Error: {error.message}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  // Render loading
  if (isLoading && !isInitialized) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="unified-checkout-loading" style={{ padding: '20px', textAlign: 'center' }}>
        Loading checkout...
      </div>
    );
  }

  return (
    <div
      id={containerId}
      className={className}
      style={{
        minHeight: '100px',
        ...style,
      }}
    />
  );
};

export default UnifiedCheckout;
