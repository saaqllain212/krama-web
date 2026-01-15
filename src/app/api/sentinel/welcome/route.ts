import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeMessage } from '@/sentinel/telegram';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // 1. Security Check: Who is calling?
    const { data: { user }, error } = await (await supabase).auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Data
    const { guardianId, guardianName } = await req.json();

    // 3. Send the Telegram Message
    // We send it to the GUARDIAN'S ID
    await sendWelcomeMessage(guardianId, guardianName || 'Guardian');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sentinel Trigger Error:", error);
    return NextResponse.json({ error: 'Failed to trigger sentinel' }, { status: 500 });
  }
}