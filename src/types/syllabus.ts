export type SyllabusStatus = 'locked' | 'unlocked' | 'completed';

export interface SyllabusNode {
  id: string;
  title: string;
  type: 'branch' | 'leaf'; // 'branch' has children, 'leaf' is a checkbox
  children?: SyllabusNode[];
  status?: string; // e.g., "locked" from your json
}

export interface ExamManifest {
  id: string;
  name: string;
  description: string;
  file: string; // e.g., "upsc-gs1.json"
}