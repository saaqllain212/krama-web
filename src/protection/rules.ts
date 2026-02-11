import { z } from 'zod';

// 1. Auth Rules
export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" })
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" })
});

// 2. Payment Rules
// Accepts BOTH naming conventions for compatibility:
// - CheckoutModal sends: orderId, paymentId, signature
// - Legacy code may send: orderCreationId, razorpayPaymentId, razorpaySignature
export const PaymentSchema = z.object({
  couponCode: z.string().optional().nullable(),
  // Current field names (from CheckoutModal)
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  signature: z.string().optional(),
  // Legacy field names (kept for safety)
  orderCreationId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

// 3. Admin Rules
export const AdminActionSchema = z.object({
  action: z.enum([
    'TOGGLE_SIGNUP', 
    'UPDATE_LIMIT', 
    'TOGGLE_PREMIUM', 
    'DELETE_USER', 
    'UPDATE_PRICE', 
    'CREATE_COUPON', 
    'TOGGLE_COUPON',
    // New admin actions
    'UPDATE_FEATURE_FLAG',
    'TOGGLE_MAINTENANCE',
    'UPDATE_TRIAL_DAYS',
    'UPDATE_DEFAULT_GOAL',
    'UPDATE_XP_MULTIPLIER',
    'UPDATE_USER_STATS',
    'RESET_USER_STREAK',
    'BULK_EXTEND_TRIALS',
  ]),
  payload: z.any()
});
