-- Create notes table for AI-powered note-taking
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content JSONB NOT NULL DEFAULT '{}', -- Rich text content in JSON format
  plain_text TEXT, -- Plain text version for search
  ai_summary TEXT, -- AI-generated summary
  ai_tags TEXT[] DEFAULT '{}', -- AI-suggested tags
  ai_insights JSONB, -- AI-generated insights and suggestions
  folder_id UUID, -- For future folder organization
  is_favorite BOOLEAN DEFAULT FALSE,
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_title_idx ON notes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS notes_content_idx ON notes USING gin(to_tsvector('english', plain_text));
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS notes_favorite_idx ON notes(is_favorite) WHERE is_favorite = true;

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes access
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at and last_accessed_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update word count and reading time
CREATE OR REPLACE FUNCTION update_note_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from plain_text
    NEW.word_count = COALESCE(array_length(string_to_array(trim(NEW.plain_text), ' '), 1), 0);
    
    -- Calculate reading time (average 200 words per minute)
    NEW.reading_time = GREATEST(1, CEIL(NEW.word_count::DECIMAL / 200));
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update stats
CREATE TRIGGER update_note_stats_trigger BEFORE INSERT OR UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_note_stats();
