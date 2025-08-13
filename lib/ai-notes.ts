export async function generateNoteAI(content: string) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const text = content.toLowerCase()
  const wordCount = text.split(/\s+/).length

  const suggestions: string[] = []
  const improvements: string[] = []
  const topics: string[] = []

  // Content analysis
  if (wordCount < 50) {
    suggestions.push("Consider expanding your ideas with more details and examples")
    improvements.push("Add more context to make your notes more comprehensive")
  }

  if (wordCount > 500) {
    suggestions.push("Consider breaking this into multiple notes for better organization")
    improvements.push("Use headings and bullet points to improve readability")
  }

  // Topic detection based on keywords
  if (text.includes("meeting") || text.includes("discussion")) {
    topics.push("meeting")
    suggestions.push("Add action items and follow-up tasks from the meeting")
  }

  if (text.includes("project") || text.includes("task")) {
    topics.push("project")
    suggestions.push("Consider creating a todo list for project milestones")
  }

  if (text.includes("idea") || text.includes("brainstorm")) {
    topics.push("brainstorming")
    suggestions.push("Explore related concepts and potential applications")
  }

  if (text.includes("research") || text.includes("study")) {
    topics.push("research")
    suggestions.push("Add sources and references to support your research")
  }

  if (text.includes("code") || text.includes("programming")) {
    topics.push("development")
    suggestions.push("Include code examples and technical specifications")
  }

  // Writing improvements
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length > 0) {
    const avgSentenceLength = wordCount / sentences.length
    if (avgSentenceLength > 25) {
      improvements.push("Consider shorter sentences for better readability")
    }
  }

  // Structure suggestions
  if (!text.includes("\n") && wordCount > 100) {
    improvements.push("Use paragraphs to organize your thoughts better")
  }

  if (wordCount > 200 && !text.match(/^#|^\*|^-|^\d+\./m)) {
    improvements.push("Add headings or bullet points to structure your content")
  }

  // Default suggestions if none found
  if (suggestions.length === 0) {
    suggestions.push("Your note looks good! Consider adding tags for better organization")
    suggestions.push("Think about connecting this note to related topics or projects")
  }

  return {
    suggestions,
    improvements,
    topics,
    sentiment: wordCount > 50 ? "informative" : "brief",
    suggestedTags: topics.slice(0, 5),
  }
}

export async function generateNoteSummary(content: string): Promise<string> {
  // Simulate AI processing
  await new Promise((resolve) => setTimeout(resolve, 600))

  const words = content.trim().split(/\s+/)
  if (words.length < 20) {
    return "Brief note with key points"
  }

  // Simple extractive summary - take first and key sentences
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length <= 2) {
    return sentences.join(". ").trim() + "."
  }

  // Return first sentence and any sentence with important keywords
  const importantKeywords = ["important", "key", "main", "conclusion", "result", "decision"]
  const keySentences = sentences.filter((sentence) =>
    importantKeywords.some((keyword) => sentence.toLowerCase().includes(keyword)),
  )

  const summary = [sentences[0]]
  if (keySentences.length > 0) {
    summary.push(keySentences[0])
  } else if (sentences.length > 2) {
    summary.push(sentences[sentences.length - 1])
  }

  return summary.join(". ").trim() + "."
}
