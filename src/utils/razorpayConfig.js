/*
 * Razorpay Configuration Constants
 * These constants are used throughout the application for Razorpay integration
 */

export const RAZORPAY_CONFIG = {
  // Payment gateway name
  GATEWAY_NAME: 'Razorpay',
  
  // Currency
  CURRENCY: 'INR',
  
  // Company/App details shown in checkout
  COMPANY_NAME: 'FlatMate',
  COMPANY_LOGO: '/logo.png', // Update with your actual logo path
  
  // Theme colors for Razorpay checkout
  THEME_COLOR: '#2563eb', // Blue color matching app theme
  
  // Payment methods to enable (optional)
  PAYMENT_METHODS: {
    netbanking: true,
    card: true,
    upi: true,
    wallet: true,
  },
  
  // Retry settings (optional)
  RETRY: {
    enabled: true,
    max_count: 3,
  },
  
  // Checkout preferences
  CHECKOUT_PREFERENCES: {
    readonly: {
      contact: false,
      email: false,
    },
  },
};

// Payment status constants
export const PAYMENT_STATUS = {
  CREATED: 'created',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// Error messages
export const ERROR_MESSAGES = {
  SCRIPT_LOAD_FAILED: 'Failed to load Razorpay SDK. Please check your internet connection.',
  ORDER_CREATE_FAILED: 'Failed to create payment order. Please try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled by user.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  VERIFICATION_FAILED: 'Payment verification failed. Please contact support.',
  INVALID_AMOUNT: 'Invalid payment amount.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  VERIFICATION_SUCCESS: 'Payment verified successfully.',
  ORDER_CREATED: 'Payment order created successfully.',
};
