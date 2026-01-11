import { SupabaseClient } from '@supabase/supabase-js';

// 1. Constants
export const DEFAULT_SCHEDULE = [0, 1, 3, 7, 14, 30, 60];

// 2. Types
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
 * Calculates the next interval based on Combat Rating.
 * Rating: 0 (Struggle), 1 (Good), 2 (Easy)
 */
export function getNextGap(currentGap: number, rating: 0 | 1 | 2, scheduleStr?: string | null): number | null {
  let schedule = DEFAULT_SCHEDULE;
  let isCustom = false;

  // A. Parse Schedule
  if (scheduleStr) {
    const parsed = scheduleStr.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
    if (parsed.length > 0) {
      schedule = parsed;
      isCustom = true;
    }
  }

  // B. Find current position
  const currentIndex = schedule.indexOf(currentGap);
  
  // LOGIC: COMBAT RATINGS
  let nextIndex = currentIndex + 1; // Default "Good"

  if (rating === 0) {
     // STRUGGLE: Fall to start
     return schedule[0]; 
  }
  
  if (rating === 2) {
     // EASY: Double Jump
     nextIndex = currentIndex + 2;
  }
  
  // SAFETY: If we fell off the map (e.g. index -1), treat as new
  if (currentIndex === -1) nextIndex = 1;

  // C. End of List Check
  if (nextIndex >= schedule.length) {
    // If custom schedule ends in 0 (e.g. "0,0"), mark completed.
    if (isCustom && schedule[schedule.length - 1] === 0) return null;
    
    // Default: Cap at max interval
    return schedule[schedule.length - 1];
  }

  return schedule[nextIndex];
}

/**
 * Performs the review action.
 */
export async function reviewTopic(supabase: SupabaseClient, topic: Topic, rating: 0 | 1 | 2): Promise<ReviewResult> {
  const nextGap = getNextGap(topic.last_gap, rating, topic.custom_intervals);
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };
  
  let result: ReviewResult;

  if (nextGap === null) {
    updates.status = 'completed';
    updates.next_review = null;
    result = { completed: true, nextGap: 0, nextReview: null };
  } else {
    const nextDate = new Date();
    if (nextGap === 0) {
      // Due immediately
    } else {
      nextDate.setDate(nextDate.getDate() + nextGap);
      nextDate.setHours(6, 0, 0, 0); 
    }

    updates.status = 'active';
    updates.last_gap = nextGap;
    updates.next_review = nextDate.toISOString();
    
    result = { completed: false, nextGap, nextReview: nextDate };
  }

  const { error } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', topic.id);

  if (error) throw error;

  return result;
}