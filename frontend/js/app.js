/**
 * Main Application Logic for Unified Checkout Frontend
 */

// Application State
const appState = {
  currentPage: 'home',
  captureContextRequest: null,
  captureContext: null,
  captureContextDecoded: null,
  checkoutData: null,
  paymentResponse: null,
  paymentResponseDecoded: null,
};

/**
 * Initialize the application
 */
async function initApp() {
  // Check API health
  try {
    const health = await api.healthCheck();
    console.log('API Status:', health.status);
  } catch (error) {
    console.error('API is not available:', error);
    showError('Backend API is not available. Make sure the server is running on https://localhost:3000');
    return;
  }

  // Load initial page
  showPage('home');
}

/**
 * Show a specific page/view
 */
function showPage(page) {
  appState.currentPage = page;
  const content = document.getElementById('app-content');

  switch (page) {
    case 'home':
      renderHomePage(content);
      break;
    case 'config':
      renderConfigPage(content);
      break;
    case 'capture-context':
      renderCaptureContextPage(content);
      break;
    case 'checkout':
      renderCheckoutPage(content);
      break;
    case 'complete':
      renderCompletePage(content);
      break;
    default:
      renderHomePage(content);
  }
}

/**
 * Render Home Page
 */
function renderHomePage(container) {
  container.innerHTML = `
    <div class="py-4 text-center">
      <h2>Choose Your Use Case</h2>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Unified Checkout</h5>
            <p class="card-text">
              Embrace the future of online payments with Unified Checkout, your pre-configured,
              multi payment method solution that fast-tracks your business to go live, reducing development burdens.
              <br><br>
              <em>For Cybersource and Visa Acceptance Solutions gateway users</em>
            </p>
            <button class="btn btn-primary" onclick="showPage('config')">
              Begin Unified Checkout Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Config Page
 */
async function renderConfigPage(container) {
  container.innerHTML = `
    <div class="py-4 text-center">
      <h2>Request Capture Context</h2>
    </div>
    <div class="py-2">
      <p class="lead">
        Once you are ready to render the checkout page, you need to request the Capture Context from the
        <code>/up/v1/capture-contexts</code> endpoint. The capture context request below drives Unified Checkout's
        behavior, including accepted payment types, card networks, address information to be collected, and more.
      </p>
    </div>
    <div id="config-form">
      <p>Loading configuration...</p>
    </div>
  `;

  try {
    const result = await api.getConfig();
    if (result.success) {
      appState.captureContextRequest = result.data;
      renderConfigForm(result.data);
    } else {
      showError('Failed to load configuration: ' + result.error);
    }
  } catch (error) {
    showError('Error loading configuration: ' + error.message);
  }
}

/**
 * Render the configuration form
 */
function renderConfigForm(config) {
  const formContainer = document.getElementById('config-form');
  formContainer.innerHTML = `
    <button class="btn btn-primary mb-3" onclick="generateCaptureContext()">
      Generate Capture Context
    </button>
    <div class="form-group">
      <label for="captureContextRequest">
        Capture Context Request payload. You can change the request parameters by editing the values below:
      </label>
      <textarea
        class="form-control"
        id="captureContextRequest"
        style="height: 400px; font-family: monospace;"
      >${JSON.stringify(config, null, 2)}</textarea>
    </div>
  `;
}

/**
 * Generate capture context
 */
async function generateCaptureContext() {
  const textarea = document.getElementById('captureContextRequest');

  try {
    const requestData = JSON.parse(textarea.value);

    showLoading('Generating Capture Context...');

    const result = await api.generateCaptureContext(requestData);

    if (result.success) {
      appState.captureContext = result.data.captureContext;
      appState.captureContextDecoded = result.data.decodedData;
      showPage('capture-context');
    } else {
      showError('Failed to generate capture context: ' + result.error);
    }
  } catch (error) {
    showError('Error: ' + error.message);
  }
}

/**
 * Render Capture Context Result Page
 */
function renderCaptureContextPage(container) {
  container.innerHTML = `
    <div class="py-4 text-center">
      <h2>Capture Context Request Success</h2>
    </div>
    <div class="py-2">
      <p class="lead">
        Your request returned the Capture Context encoded as JWT.
        This JWT contains all of the information to start the Unified Checkout widget on your checkout page.
      </p>
    </div>
    <button class="btn btn-primary mb-3" onclick="launchCheckout()">
      Launch Checkout Page
    </button>
    <div class="form-group mb-3">
      <label for="captureContextJwt">
        Capture Context encoded as JWT
        (<a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">decode with jwt.io</a>):
      </label>
      <textarea
        class="form-control"
        id="captureContextJwt"
        rows="10"
        readonly
        style="font-family: monospace;"
      >${appState.captureContext}</textarea>
    </div>
    <div class="form-group">
      <label for="captureContextDecoded">Decoded capture context:</label>
      <textarea
        class="form-control"
        id="captureContextDecoded"
        rows="15"
        readonly
        style="font-family: monospace;"
      >${JSON.stringify(appState.captureContextDecoded, null, 2)}</textarea>
    </div>
  `;
}

/**
 * Launch checkout page
 */
async function launchCheckout() {
  try {
    showLoading('Preparing checkout...');

    const result = await api.prepareCheckout(
      appState.captureContext,
      appState.captureContextDecoded
    );

    if (result.success) {
      appState.checkoutData = result.data;
      showPage('checkout');
    } else {
      showError('Failed to prepare checkout: ' + result.error);
    }
  } catch (error) {
    showError('Error: ' + error.message);
  }
}

/**
 * Render Checkout Page
 */
function renderCheckoutPage(container) {
  container.innerHTML = `
    <div class="checkout-container">
      <div class="row">
        <div class="col-md-8" id="leftPanelContainer">
          <h4>Shopping Cart (2 items)</h4>
          <div class="cart-items">
            <div class="cart-item">
              <div class="cart-item-image">
                <img src="https://tinyurl.com/bdzaav2f" alt="Product 1"/>
              </div>
              <div class="cart-item-body">
                <h5>Light Roast Coffee</h5>
                <p>Our lightest roast coffee, notes of berries and chocolate</p>
              </div>
            </div>
            <div class="cart-item">
              <div class="cart-item-image">
                <img src="https://tinyurl.com/3xkhwtnb" alt="Product 2"/>
              </div>
              <div class="cart-item-body">
                <h5>Pour Over</h5>
                <p>Brew the perfect cup</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4" id="rightPanelContainer">
          <div class="panel panel-default">
            <div class="panel-body">
              <h4>Order Summary</h4>
              <p>Subtotal (2 items) <span class="float-end">$ 20.00</span></p>
              <p>Shipping <span class="float-end">$ 0.00</span></p>
              <p>Estimated tax (98074) <span class="float-end">$ 1.00</span></p>
              <hr/>
              <h4>Order Total <span class="float-end">$ 21.00</span></h4>
              <hr/>
              <div id="buttonPaymentListContainer">
                <button type="button" class="btn btn-lg btn-primary w-100 mb-2" disabled>
                  Loading...
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load the CyberSource SDK dynamically
  loadCyberSourceSDK();
}

/**
 * Load CyberSource SDK and initialize checkout
 */
function loadCyberSourceSDK() {
  const { clientLibrary, clientLibraryIntegrity, captureContext } = appState.checkoutData;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = clientLibrary;
  script.integrity = clientLibraryIntegrity;
  script.crossOrigin = 'anonymous';

  script.onload = async function() {
    try {
      await initializeUnifiedCheckout(captureContext);
    } catch (error) {
      console.error('Error initializing checkout:', error);
      showError('Error initializing checkout: ' + error.message);
    }
  };

  script.onerror = function() {
    showError('Failed to load CyberSource SDK');
  };

  document.head.appendChild(script);
}

/**
 * Initialize Unified Checkout widget
 */
async function initializeUnifiedCheckout(captureContext) {
  const showArgs = {
    containers: {
      paymentSelection: '#buttonPaymentListContainer'
    }
  };
  const sidebar = true;

  try {
    const accept = await Accept(captureContext);
    const up = await accept.unifiedPayments(sidebar);
    const tt = await up.show(showArgs);
    const completeResponse = await up.complete(tt);

    // Process the payment response
    await processPaymentResponse(completeResponse);
  } catch (error) {
    console.error('Checkout error:', error);
    showError('Something went wrong during checkout: ' + error);
  }
}

/**
 * Process payment response
 */
async function processPaymentResponse(response) {
  try {
    appState.paymentResponse = response;

    const result = await api.completePayment(response);

    if (result.success) {
      appState.paymentResponseDecoded = result.data.decodedData;
      showPage('complete');
    } else {
      showError('Failed to process payment: ' + result.error);
    }
  } catch (error) {
    showError('Error processing payment: ' + error.message);
  }
}

/**
 * Render Payment Complete Page
 */
function renderCompletePage(container) {
  container.innerHTML = `
    <div class="py-4 text-center">
      <h2 class="text-success">Payment Success!</h2>
    </div>
    <div class="py-2">
      <p class="lead">
        Your payment was processed successfully. The response is below.
      </p>
    </div>
    <button class="btn btn-primary mb-3" onclick="showPage('home')">
      Start Checkout Process Over
    </button>
    <div class="form-group mb-3">
      <label for="paymentResponse">JWT-encoded complete response:</label>
      <textarea
        class="form-control"
        id="paymentResponse"
        rows="8"
        readonly
        style="font-family: monospace;"
      >${appState.paymentResponse}</textarea>
    </div>
    <div class="form-group">
      <label for="paymentResponseDecoded">Decoded complete response:</label>
      <textarea
        class="form-control"
        id="paymentResponseDecoded"
        rows="15"
        readonly
        style="font-family: monospace;"
      >${JSON.stringify(appState.paymentResponseDecoded, null, 2)}</textarea>
    </div>
  `;
}

/**
 * Show loading state
 */
function showLoading(message) {
  const content = document.getElementById('app-content');
  content.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">${message}</p>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  const content = document.getElementById('app-content');
  content.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Error</h4>
      <p>${message}</p>
      <hr>
      <button class="btn btn-outline-danger" onclick="showPage('home')">
        Go Back Home
      </button>
    </div>
  `;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
