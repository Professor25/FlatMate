# Razorpay Integration Guide

This document explains how to properly configure and use Razorpay payment gateway in the FlatMate application.

## Prerequisites

1. A Razorpay account (Sign up at https://razorpay.com/)
2. Razorpay API credentials (Key ID and Key Secret)

## Setup Instructions

### 1. Get Razorpay Credentials

1. Login to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Navigate to **Settings** → **API Keys**
3. Generate API Keys if you haven't already
4. You will get:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret**

### 2. Configure Environment Variables

Update the `.env` file in the project root with your Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx

# Backend Server
PORT=5000
VITE_API_BASE_URL=http://localhost:5000
```

**Important Notes:**
- Use **test mode** credentials (`rzp_test_`) during development
- Use **live mode** credentials (`rzp_live_`) only in production
- Never commit the `.env` file to version control
- The frontend needs `VITE_RAZORPAY_KEY_ID`, the backend needs both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### 3. Install Dependencies

Dependencies are already installed. If needed, run:

```bash
npm install
```

### 4. Run the Application

#### Option A: Run frontend and backend together (Recommended)

```bash
npm run dev:full
```

This will start:
- Frontend (Vite) on `http://localhost:5173`
- Backend (Express) on `http://localhost:5000`

#### Option B: Run separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Architecture

### Backend Server (`server/index.js`)

The Express server handles secure Razorpay operations:

1. **Create Order** (`POST /api/payment/create-order`)
   - Creates a Razorpay order with the specified amount
   - Returns order ID to the frontend

2. **Verify Payment** (`POST /api/payment/verify`)
   - Verifies payment signature for security
   - Confirms payment authenticity

3. **Get Payment Details** (`GET /api/payment/:paymentId`)
   - Fetches payment information from Razorpay

4. **Webhook Handler** (`POST /api/payment/webhook`)
   - Handles Razorpay webhook events (optional)

### Frontend Integration

**Razorpay Utilities** (`src/utils/razorpay.js`)
- `loadRazorpayScript()` - Loads Razorpay Checkout SDK
- `createRazorpayOrder()` - Creates order via backend API
- `verifyRazorpayPayment()` - Verifies payment via backend API
- `processRazorpayPayment()` - Complete payment flow

**PayModal Component** (`src/Components/Member/PayModal.jsx`)
- Integrated Razorpay checkout
- Supports Online Payment (via Razorpay) and Cash payments
- Automatic receipt generation
- Firebase database updates

## Payment Flow

1. **User initiates payment**
   - Opens PayModal and selects "Online Payment"
   - Clicks "Pay Now"

2. **Order creation**
   - Frontend calls backend to create Razorpay order
   - Backend returns order ID

3. **Razorpay Checkout**
   - Razorpay checkout modal opens
   - User completes payment using UPI/Card/NetBanking/Wallets

4. **Payment verification**
   - Frontend receives payment response
   - Backend verifies payment signature
   - Confirms payment authenticity

5. **Database update**
   - Payment details saved to Firebase
   - User's dues updated
   - Receipt generated

## Testing

### Test Mode

Use Razorpay test credentials and test cards:

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay`

### Test Payment Flow

1. Start the application: `npm run dev:full`
2. Login as a member
3. Navigate to payment section
4. Select "Online Payment"
5. Click "Pay Now"
6. Use test credentials in Razorpay checkout
7. Verify payment is recorded in Firebase

## Security Best Practices

1. **Never expose Key Secret** to the frontend
2. **Always verify payments** on the backend
3. **Use HTTPS** in production
4. **Implement webhook verification** for production
5. **Enable 3D Secure** for card payments
6. **Monitor suspicious activities** in Razorpay dashboard

## Production Deployment

1. **Switch to Live Mode:**
   - Get live API keys from Razorpay dashboard
   - Update `.env` with live credentials
   - Test thoroughly before going live

2. **Configure Webhooks:**
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Generate webhook secret
   - Add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_webhook_secret`

3. **Update API Base URL:**
   - Set `VITE_API_BASE_URL` to your production API URL

4. **Enable HTTPS:**
   - Use SSL certificate for backend server
   - Razorpay requires HTTPS in production

## Troubleshooting

### Error: "Failed to load Razorpay SDK"
- Check internet connection
- Ensure Razorpay checkout script can be loaded
- Check browser console for errors

### Error: "Payment verification failed"
- Verify backend is running
- Check Key Secret is correct
- Ensure payment signature matches

### Error: "Failed to create order"
- Check backend logs
- Verify API credentials are correct
- Ensure backend can connect to Razorpay API

### Payment successful but not recorded
- Check Firebase permissions
- Verify Firebase database rules
- Check browser console for errors

## Support

- **Razorpay Documentation:** https://razorpay.com/docs/
- **Razorpay Support:** https://razorpay.com/support/
- **Razorpay API Reference:** https://razorpay.com/docs/api/

## Important URLs

- Razorpay Dashboard: https://dashboard.razorpay.com/
- API Keys: https://dashboard.razorpay.com/app/website-app-settings/api-keys
- Webhooks: https://dashboard.razorpay.com/app/webhooks
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
