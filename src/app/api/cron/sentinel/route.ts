import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendAlertMessage } from '@/sentinel/telegram';

export async function GET() {
  const supabase = createClient();
  
  try {
    const { data: sentinels } = await (await supabase)
      .from('sentinel_settings')
      .select(`
        *,
        syllabus_settings ( daily_goal_hours )
      `)
      .eq('is_active', true)
      .not('guardian_chat_id', 'is', null);

    if (!sentinels || sentinels.length === 0) return NextResponse.json({ ok: true });

    let alertsSent = 0;
    const now = new Date();

    for (const user of sentinels) {
      // 1. Check Anti-Spam (Don't alert twice in 20 hours)
      if (user.last_alerted_at) {
        const lastAlert = new Date(user.last_alerted_at).getTime();
        if ((now.getTime() - lastAlert) < (20 * 60 * 60 * 1000)) continue;
      }

      // 2. Check "Point of No Return"
      const targetHours = user.syllabus_settings?.daily_goal_hours || 4;
      
      // Calculate Hours Logged Today
      const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
      const { data: logs } = await (await supabase)
        .from('focus_logs')
        .select('duration_minutes')
        .eq('user_id', user.user_id)
        .gte('started_at', startOfDay.toISOString());

      const loggedHours = (logs?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0) / 60;
      const hoursRemaining = Math.max(0, targetHours - loggedHours);

      // Time left in the day (until Midnight)
      const midnight = new Date(); midnight.setHours(24,0,0,0);
      const hoursLeftInDay = (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);

      // If they have completed the goal, SKIP.
      if (loggedHours >= targetHours) continue;

      // 🚨 FAILURE CONDITION:
      // If the hours they need is GREATER than the hours left in the day.
      if (hoursRemaining > hoursLeftInDay) {
         
         await sendAlertMessage(
            user.guardian_chat_id, 
            user.guardian_name || 'Guardian', 
            hoursRemaining.toFixed(1)
         );

         await (await supabase)
            .from('sentinel_settings')
            .update({ last_alerted_at: now.toISOString() })
            .eq('id', user.id);

         alertsSent++;
      }
    }

    return NextResponse.json({ ok: true, alerts: alertsSent });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}