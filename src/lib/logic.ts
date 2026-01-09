import { SupabaseClient } from '@supabase/supabase-js';

// 1. Constants (Exported so UI can use them too)
export const DEFAULT_SCHEDULE = [0, 1, 3, 7, 14, 30, 60];

// 2. Strict Types
export type TopicStatus = 'active' | 'completed';

export type Topic = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  status: TopicStatus;
  created_at: string;
  next_review: string | null;
  last_gap: number;
  custom_intervals?: string | null;
};

export type ReviewResult = {
  completed: boolean;
  nextGap: number;
  nextReview: Date | null;
};

/**
 * Calculates the next interval based on the current gap and schedule.
 */
export function getNextGap(currentGap: number, scheduleStr?: string | null): number | null {
  let schedule = DEFAULT_SCHEDULE;
  let isCustom = false;

  // A. Parse Custom Schedule
  if (scheduleStr) {
    const parsed = scheduleStr.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n)); // Remove garbage inputs
    
    if (parsed.length > 0) {
      schedule = parsed;
      isCustom = true;
    }
  }

  // B. Find Position in Schedule
  // We use the current gap to find where we are in the list.
  const currentIndex = schedule.indexOf(currentGap);

  // Scenario 1: Gap not in schedule (maybe user changed schedule mid-way)
  // Logic: Find the next largest number in the new schedule
  if (currentIndex === -1) {
     const nextLargest = schedule.find(n => n > currentGap);
     return nextLargest ?? schedule[schedule.length - 1];
  }

  // Scenario 2: End of Schedule
  if (currentIndex >= schedule.length - 1) {
    const lastValue = schedule[schedule.length - 1];
    
    // Feature: If custom schedule ends in 0 (e.g. "0,0"), mark completed.
    if (isCustom && lastValue === 0) return null; 
    
    // Default: Maintenance Mode (Repeat last interval forever)
    return lastValue; 
  }

  // Scenario 3: Next Step
  return schedule[currentIndex + 1];
}

/**
 * Performs the review action: calculates math, updates DB, returns result.
 */
export async function reviewTopic(supabase: SupabaseClient, topic: Topic): Promise<ReviewResult> {
  // 1. Calculate Math
  const nextGap = getNextGap(topic.last_gap, topic.custom_intervals);
  
  // 2. Prepare Updates
  const updates: any = {
    updated_at: new Date().toISOString(),
  };
  
  let result: ReviewResult;

  // CASE A: Topic Completed (End of Custom Chain)
  if (nextGap === null) {
    updates.status = 'completed';
    updates.next_review = null;
    
    result = { completed: true, nextGap: 0, nextReview: null };
  } 
  // CASE B: Active Review
  else {
    const nextDate = new Date();
    
    if (nextGap === 0) {
      // Gap 0 = Due Immediately (Keep 'now')
    } else {
      // Future: Add Days + Snap to 6 AM (Morning person logic)
      nextDate.setDate(nextDate.getDate() + nextGap);
      nextDate.setHours(6, 0, 0, 0); 
    }

    updates.status = 'active';
    updates.last_gap = nextGap;
    updates.next_review = nextDate.toISOString();
    
    result = { completed: false, nextGap, nextReview: nextDate };
  }

  // 3. Database Write
  const { error } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', topic.id);

  if (error) throw error;

  // 4. Return Result (So UI can show "See you in X days" immediately)
  return result;
}