
export type Condition = 'A' | 'B' | 'C';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  conditionLabel?: string; // e.g. "Correction"
}

export interface SurveyResponses {
  [key: string]: number;
}

export interface SessionData {
  sessionId: string;
  timestamp: string;
  eligibility: {
    age: boolean;
    taiwanese: boolean;
    nativeEnglish: boolean;
    canChat: boolean;
  };
  consent: boolean;
  condition: Condition;
  preSurvey: SurveyResponses;
  chatLog: ChatMessage[];
  validTurns: number;
  postSurvey: SurveyResponses;
  status: 'started' | 'ineligible' | 'chatting' | 'completed' | 'abandoned';
  
  // Derived metrics
  metrics?: {
    completion_time_seconds: number;
    user_word_count: number;
    bot_word_count: number;
    user_turn_count: number;
    avg_user_message_length: number;
    avg_response_latency_seconds: number;
    user_words_per_minute: number;
    user_to_bot_word_ratio: number;
    chinese_character_count: number;
    user_messages_containing_chinese: number;
  };
}
