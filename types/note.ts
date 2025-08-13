export interface Note {
  id: string
  user_id: string
  title: string
  content: any // Rich text content in JSON format
  plain_text?: string
  ai_summary?: string
  ai_tags: string[]
  ai_insights?: {
    suggestions?: string[]
    improvements?: string[]
    topics?: string[]
    sentiment?: string
  }
  folder_id?: string
  is_favorite: boolean
  word_count: number
  reading_time: number
  created_at: string
  updated_at: string
  last_accessed_at: string
}
