# Razorpay Integration - Quick Start Guide

This is a quick reference for getting Razorpay up and running in FlatMate.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Razorpay Test Credentials
1. Go to https://razorpay.com/ and sign up (or login)
2. Navigate to: **Settings** → **API Keys** → **Generate Test Key**
3. Copy your **Key ID** (starts with `rzp_test_`)
4. Copy your **Key Secret**

### Step 2: Configure Environment Variables
Open `.env` file and add:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
PORT=5000
```

### Step 3: Run the Application
```bash
npm run dev:full
```

This starts both frontend (port 5173) and backend (port 5000).

## 🧪 Testing

### Test Payment
1. Login as a member
2. Go to payment section
3. Click "Online Payment"
4. Use test card: `4111 1111 1111 1111`
5. CVV: `123`, Expiry: `12/25`

### Test UPI
Use UPI ID: `success@razorpay`

## 📁 Files Modified/Added

### New Files:
- `server/index.js` - Backend API server
- `server/package.json` - Server package config
- `src/utils/razorpay.js` - Payment utilities
- `src/utils/razorpayConfig.js` - Configuration constants
- `RAZORPAY_SETUP.md` - Detailed setup guide
- `QUICKSTART.md` - This file

### Modified Files:
- `src/Components/Member/PayModal.jsx` - Added Razorpay integration
- `package.json` - Added scripts and dependencies
- `.env` - Added Razorpay credentials
- `.env.example` - Added Razorpay template

## 🔧 Commands

```bash
# Run frontend and backend together (Recommended)
npm run dev:full

# Run only frontend
npm run dev

# Run only backend
npm run server

# Build for production
npm run build
```

## 🆘 Troubleshooting

**Backend not starting?**
- Check if port 5000 is available
- Verify `.env` file exists with credentials

**Payment failing?**
- Ensure backend is running (`npm run server`)
- Check browser console for errors
- Verify Razorpay credentials in `.env`

**Can't see payment button?**
- Clear browser cache
- Check if you're logged in as a member (not admin)

## 📚 Need More Help?

See `RAZORPAY_SETUP.md` for:
- Detailed architecture explanation
- Production deployment guide
- Security best practices
- Webhook configuration
- Complete API reference

## 🔒 Security Notes

- ✅ API Secret is only used on backend (never exposed to frontend)
- ✅ All payments are verified server-side
- ✅ Test mode for development, live mode for production
- ❌ Never commit `.env` file to Git

## 🎉 That's It!

You now have a fully functional Razorpay payment integration. Happy coding! 🚀
