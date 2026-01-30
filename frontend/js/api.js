/**
 * API Client for CyberSource Unified Checkout Backend
 */
const API_BASE_URL = 'https://localhost:3000/api';

const api = {
  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  /**
   * Get default capture context configuration
   */
  async getConfig() {
    const response = await fetch(`${API_BASE_URL}/config`);
    return response.json();
  },

  /**
   * Generate capture context JWT
   * @param {Object} captureContextRequest - The capture context request payload
   */
  async generateCaptureContext(captureContextRequest) {
    const response = await fetch(`${API_BASE_URL}/capture-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ captureContextRequest }),
    });
    return response.json();
  },

  /**
   * Prepare checkout data
   * @param {string} captureContext - The capture context JWT
   * @param {Object} captureContextDecoded - The decoded capture context
   */
  async prepareCheckout(captureContext, captureContextDecoded) {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ captureContext, captureContextDecoded }),
    });
    return response.json();
  },

  /**
   * Process payment completion
   * @param {string} paymentResponse - The payment response JWT
   */
  async completePayment(paymentResponse) {
    const response = await fetch(`${API_BASE_URL}/complete-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response: paymentResponse }),
    });
    return response.json();
  },
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
