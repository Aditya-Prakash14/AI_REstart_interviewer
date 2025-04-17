-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  techstack TEXT[] NOT NULL,
  questions TEXT[] NOT NULL,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  finalized BOOLEAN DEFAULT FALSE,
  coverImage TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewId UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  totalScore INTEGER NOT NULL,
  categoryScores JSONB NOT NULL,
  strengths TEXT[] NOT NULL,
  areasForImprovement TEXT[] NOT NULL,
  finalAssessment TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Interviews policies
CREATE POLICY "Users can view all interviews" 
  ON interviews FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own interviews" 
  ON interviews FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = userId::text);

CREATE POLICY "Users can update their own interviews" 
  ON interviews FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = userId::text);

-- Feedback policies
CREATE POLICY "Users can view feedback for their interviews" 
  ON feedback FOR SELECT 
  TO authenticated 
  USING (auth.uid()::text = userId::text);

CREATE POLICY "Users can create feedback for their interviews" 
  ON feedback FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = userId::text);

CREATE POLICY "Users can update their own feedback" 
  ON feedback FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = userId::text);
