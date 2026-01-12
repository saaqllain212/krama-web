import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { checkRateLimit } from "./ratelimit";
import * as Sentry from "@sentry/nextjs"; // 👈 NEW: Import Sentry

type GuardOptions = {
  schema?: ZodSchema;      // Which rulebook to use (optional)
  requireAuth?: boolean;   // Does this route require login? (optional)
};

export function Guard(
  handler: (req: NextRequest, validData?: any) => Promise<NextResponse>,
  options: GuardOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // 1. TRAFFIC CONTROL (Rate Limit)
      // We identify users by IP address
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await checkRateLimit(ip);
      
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429 }
        );
      }

      // 2. SECURITY CHECK (Input Validation)
      let validData = null;
      
      // Only try to parse JSON if a schema is provided
      if (options.schema) {
        try {
          const body = await req.json();
          const validation = options.schema.safeParse(body);

          if (!validation.success) {
             // Return the specific field that failed
             return NextResponse.json(
               { error: "Invalid Data", details: validation.error.format() },
               { status: 400 }
             );
          }
          validData = validation.data;
        } catch (e) {
          return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
      }

      // 3. PROCEED
      // If we get here, the request is safe. Run the original code.
      return await handler(req, validData);

    } catch (error: any) {
      // 🚨 NEW: REPORT TO WATCHTOWER 🚨
      console.error("Guard Blocked Request:", error);
      Sentry.captureException(error); // This sends the email to you

      return NextResponse.json(
        { error: "Internal Server Error" }, 
        { status: 500 }
      );
    }
  };
}