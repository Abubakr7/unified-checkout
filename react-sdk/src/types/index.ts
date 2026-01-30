// Types for CyberSource Unified Checkout Integration

export interface CaptureContextConfig {
  targetOrigins: string[];
  clientVersion: string;
  allowedCardNetworks: string[];
  allowedPaymentTypes: string[];
  country: string;
  locale: string;
  captureMandate: {
    billingType: string;
    requestEmail: boolean;
    requestPhone: boolean;
    requestShipping: boolean;
    shipToCountries: string[];
    showAcceptedNetworkIcons: boolean;
  };
  completeMandate: {
    type: string;
    decisionManager: boolean;
  };
  orderInformation: {
    amountDetails: {
      totalAmount: string;
      currency: string;
    };
    billTo?: BillingAddress;
    shipTo?: ShippingAddress;
  };
}

export interface BillingAddress {
  address1: string;
  administrativeArea: string;
  buildingNumber?: string;
  country: string;
  district?: string;
  locality: string;
  postalCode: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nameSuffix?: string;
  title?: string;
  phoneNumber: string;
  phoneType?: string;
}

export interface ShippingAddress {
  address1: string;
  administrativeArea: string;
  buildingNumber?: string;
  country: string;
  district?: string;
  locality: string;
  postalCode: string;
  firstName: string;
  lastName: string;
}

export interface CaptureContextResponse {
  success: boolean;
  data?: {
    captureContext: string;
    decodedData: any;
  };
  error?: string;
}

export interface CheckoutData {
  clientLibrary: string;
  clientLibraryIntegrity: string;
  captureContext: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: CheckoutData;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    response: string;
    decodedData: any;
  };
  error?: string;
}

export interface UnifiedCheckoutConfig {
  apiBaseUrl: string;
  onPaymentComplete?: (response: PaymentResponse) => void;
  onPaymentError?: (error: Error) => void;
  onPaymentCancel?: () => void;
}

// CyberSource SDK types (from their library)
declare global {
  function Accept(captureContext: string): Promise<AcceptInstance>;

  interface AcceptInstance {
    unifiedPayments(sidebar: boolean): Promise<UnifiedPaymentsInstance>;
  }

  interface UnifiedPaymentsInstance {
    show(args: ShowArgs): Promise<TransactionToken>;
    complete(token: TransactionToken): Promise<string>;
  }

  interface ShowArgs {
    containers: {
      paymentSelection: string;
    };
  }

  type TransactionToken = any;
}
