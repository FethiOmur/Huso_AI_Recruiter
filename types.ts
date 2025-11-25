export enum HiringRecommendation {
  STRONG_HIRE = "Strong Hire",
  INTERVIEW = "Interview",
  KEEP_ON_FILE = "Keep on File",
  REJECT = "Reject"
}

export interface CandidateAnalysis {
  id: string; // Unique ID for list rendering
  candidate_name: string;
  match_score: number;
  key_strengths: string[];
  missing_skills: string[];
  hiring_recommendation: HiringRecommendation;
  summary: string;
  fileName: string; // To track which file this came from
}

export interface ProcessingStatus {
  total: number;
  processed: number;
  currentFile: string;
  isComplete: boolean;
}