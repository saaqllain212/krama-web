import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendAlertMessage } from '@/sentinel/telegram';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // 1. Authenticate
    const { data: { user }, error } = await (await supabase).auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Data from Request
    // We expect the frontend to tell us *which* guardian to alert, 
    // but for security, we should ideally fetch this from DB. 
    // For MVP speed, we trust the client's current settings state or fetch fresh.
    const { guardianId, guardianName, hoursMissed } = await req.json();

    if (!guardianId) {
        return NextResponse.json({ error: 'No Guardian ID' }, { status: 400 });
    }

    // 3. Send the Shame Message
    // "Saqlain failed his goal. He missed it by X hours."
    await sendAlertMessage(guardianId, guardianName || 'Guardian', hoursMissed);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sentinel Alert Error:", error);
    return NextResponse.json({ error: 'Failed to alert' }, { status: 500 });
  }
}