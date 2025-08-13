export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  priority: number // 1=High, 2=Medium, 3=Low
  ai_priority_score: number // 0.00-1.00
  ai_suggestions?: {
    suggestedPriority?: number
    priorityScore: number
    estimatedDuration?: number
    suggestedTags?: string[]
    insights?: string[]
    recommendations?: string[]
  }
  due_date?: string
  created_at: string
  updated_at: string
  tags: string[]
  estimated_duration?: number
  actual_duration?: number
}
