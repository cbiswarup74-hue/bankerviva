export type Language = 'en' | 'hi';

export type DifficultyLevel = 'easy' | 'moderate' | 'hard';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string | number;
  exam_type: string;
  module: string;
  difficulty: DifficultyLevel | string;
  cbt_set_number?: number;
  
  // English Fields
  question_text: string;
  audio_script?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  explanation: string;

  // Hindi Bilingual Fields (Optional)
  question_text_hi?: string;
  audio_script_hi?: string;
  options_hi?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  explanation_hi?: string;

  // Evaluation Keys
  correct_answer: OptionKey | string;
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
    question_id: string | number;
    selected_option: OptionKey | null;
    correct_option: OptionKey | string;
    is_correct: boolean;
  }[];
}