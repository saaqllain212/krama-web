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
export const PaymentSchema = z.object({
  couponCode: z.string().optional().nullable(),
  // We purposefully do NOT validate 'amount' here because that must be calculated on the server
  orderCreationId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional()
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
    'TOGGLE_COUPON'
  ]),
  payload: z.any() // Payload shape varies by action, kept flexible
});