export interface Question {
  id: string;
  exam_type: string;
  module: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  question_text: string;
  audio_script: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface ExamAttemptLog {
  id?: string;
  user_id?: string;
  exam_type: string;
  score: number;
  total_questions: number;
  status: 'PASSED' | 'FAILED' | 'CONDITIONAL';
  time_spent_seconds: number;
  response_sheet: {
    question_id: string;
    selected_option: 'A' | 'B' | 'C' | 'D' | null;
    correct_option: 'A' | 'B' | 'C' | 'D';
    is_correct: boolean;
  }[];
}