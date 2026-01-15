import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendAlertMessage } from '@/sentinel/telegram';

// CRON JOB: Runs every 15 minutes to check for dead sentinels
export async function GET() {
  const supabase = createClient();
  
  try {
    // 1. Get all ACTIVE Sentinels
    // We also join with syllabus_settings to know their Daily Target
    const { data: sentinels, error } = await (await supabase)
      .from('sentinel_settings')
      .select(`
        *,
        syllabus_settings ( daily_goal_hours )
      `)
      .eq('is_active', true)
      .not('guardian_chat_id', 'is', null);

    if (error) throw error;
    if (!sentinels || sentinels.length === 0) return NextResponse.json({ ok: true, scanned: 0 });

    let alertsSent = 0;
    const now = new Date();

    // 2. Loop through every user
    for (const user of sentinels) {
      
      // A. Check if the "Dead Man's Switch" has expired
      const lastActive = new Date(user.last_active_at).getTime();
      const intervalMs = (user.check_in_interval_hours || 4) * 60 * 60 * 1000;
      const deadline = lastActive + intervalMs;
      
      // If time is NOT up, skip them.
      if (now.getTime() < deadline) continue;

      // B. Check if we already yelled at them today (Anti-Spam)
      // If last_alerted_at was less than 16 hours ago, skip.
      if (user.last_alerted_at) {
        const lastAlert = new Date(user.last_alerted_at).getTime();
        const hoursSinceAlert = (now.getTime() - lastAlert) / (1000 * 60 * 60);
        if (hoursSinceAlert < 16) continue;
      }

      // C. CRITICAL CHECK: Did they actually finish their work?
      // Just because the timer expired doesn't mean they failed. They might be done for the day.
      // We check their total logs for today.
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const { data: logs } = await (await supabase)
        .from('focus_logs')
        .select('duration_minutes')
        .eq('user_id', user.user_id)
        .gte('started_at', startOfDay.toISOString());

      const totalMinutes = logs?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
      const targetHours = user.syllabus_settings?.daily_goal_hours || 4; // Default to 4 if missing
      
      // If they met the goal, DO NOT ALERT.
      if ((totalMinutes / 60) >= targetHours) continue;

      // D. FIRE THE ALERT (They failed time, they failed goal, and we haven't yelled yet)
      const hoursMissed = (targetHours - (totalMinutes / 60)).toFixed(1);
      
      await sendAlertMessage(
        user.guardian_chat_id, 
        user.guardian_name || 'Guardian', 
        hoursMissed
      );

      // E. Update the Database (So we don't yell again today)
      await (await supabase)
        .from('sentinel_settings')
        .update({ last_alerted_at: now.toISOString() })
        .eq('id', user.id);

      alertsSent++;
    }

    return NextResponse.json({ ok: true, scanned: sentinels.length, alerts: alertsSent });

  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}