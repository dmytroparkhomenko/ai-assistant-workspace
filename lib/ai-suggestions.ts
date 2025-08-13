import type { Todo } from "@/types/todo"

// Simulated AI suggestions - in a real app, this would call an AI service
export async function generateAISuggestions(taskTitle: string, existingTodos: Todo[]) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simple AI logic based on keywords and patterns
  const title = taskTitle.toLowerCase()

  // Priority scoring based on keywords
  let priorityScore = 0.5 // Default medium priority
  let suggestedPriority = 2 // Medium

  // High priority keywords
  if (title.includes("urgent") || title.includes("asap") || title.includes("emergency") || title.includes("critical")) {
    priorityScore = 0.9
    suggestedPriority = 1
  }
  // Meeting/deadline keywords
  else if (title.includes("meeting") || title.includes("deadline") || title.includes("due") || title.includes("call")) {
    priorityScore = 0.7
    suggestedPriority = 1
  }
  // Planning/research keywords (lower priority)
  else if (
    title.includes("research") ||
    title.includes("plan") ||
    title.includes("think") ||
    title.includes("consider")
  ) {
    priorityScore = 0.3
    suggestedPriority = 3
  }

  // Estimate duration based on task complexity
  let estimatedDuration = 30 // Default 30 minutes

  if (title.includes("quick") || title.includes("brief") || title.includes("check")) {
    estimatedDuration = 15
  } else if (title.includes("review") || title.includes("analyze") || title.includes("write")) {
    estimatedDuration = 60
  } else if (title.includes("project") || title.includes("develop") || title.includes("create")) {
    estimatedDuration = 120
  }

  // Generate tags based on content
  const suggestedTags: string[] = []

  if (title.includes("meeting") || title.includes("call")) suggestedTags.push("meeting")
  if (title.includes("email") || title.includes("message")) suggestedTags.push("communication")
  if (title.includes("code") || title.includes("develop") || title.includes("bug")) suggestedTags.push("development")
  if (title.includes("design") || title.includes("ui") || title.includes("ux")) suggestedTags.push("design")
  if (title.includes("research") || title.includes("learn")) suggestedTags.push("research")
  if (title.includes("buy") || title.includes("purchase") || title.includes("order")) suggestedTags.push("shopping")

  // Generate insights based on existing todos
  const insights: string[] = []
  const recommendations: string[] = []

  // Check for similar tasks
  const similarTasks = existingTodos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(title.split(" ")[0]) || title.includes(todo.title.toLowerCase().split(" ")[0]),
  )

  if (similarTasks.length > 0) {
    insights.push(`Found ${similarTasks.length} similar task(s) in your list`)
    recommendations.push("Consider grouping related tasks together")
  }

  // Check workload
  const activeTasks = existingTodos.filter((todo) => !todo.completed)
  if (activeTasks.length > 10) {
    insights.push("You have a high number of active tasks")
    recommendations.push("Consider completing some existing tasks before adding more")
  }

  return {
    suggestedPriority,
    priorityScore,
    estimatedDuration,
    suggestedTags,
    insights,
    recommendations,
  }
}
