export interface PersonalityType {
  id: number;
  name: string;
  description: string;
}

export interface Review {
  id: string;
  response_id: string;
  review_text: string;
  created_at: string;
}

export interface Response {
  id: string;
  email: string;
  name: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  personality_result: number;
  created_at: string;
  review_comments?: string;
  reviews?: Review[];
  personality_types?: PersonalityType;
}
