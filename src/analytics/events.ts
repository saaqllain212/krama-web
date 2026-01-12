// src/analytics/events.ts

export const EVENTS = {
  // auth
  AUTH_LOGIN_CLICKED: "auth_login_clicked",
  AUTH_SIGNUP_CLICKED: "auth_signup_clicked",
  
  // syllabus
  SYLLABUS_VIEWED: "syllabus_viewed",
  TOPIC_MARKED_COMPLETE: "topic_marked_complete",
  
  // payment
  PAYMENT_BUTTON_CLICKED: "payment_button_clicked",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  
  // waitlist/landing
  WAITLIST_JOINED: "waitlist_joined",
} as const;