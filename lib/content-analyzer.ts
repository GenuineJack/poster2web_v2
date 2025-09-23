export interface ContentAnalysis {
  wordCount: number
  readingTime: number
  sections: number
  images: number
  links: number
  headings: number
  language: string
  sentiment: "positive" | "neutral" | "negative"
  topics: string[]
}

export function analyzeContent(text: string): ContentAnalysis {
  const words = text.split(/\s+/).filter((word) => word.length > 0)
  const wordCount = words.length
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed: 200 words per minute

  // Count different elements
  const headings = (text.match(/<h[1-6][^>]*>/gi) || []).length
  const images = (text.match(/<img[^>]*>/gi) || []).length
  const links = (text.match(/<a[^>]*>/gi) || []).length

  // Simple language detection (very basic)
  const language = detectLanguage(text)

  // Basic sentiment analysis
  const sentiment = analyzeSentiment(text)

  // Extract topics (simple keyword extraction)
  const topics = extractTopics(text)

  return {
    wordCount,
    readingTime,
    sections: 0, // Will be set by caller
    images,
    links,
    headings,
    language,
    sentiment,
    topics,
  }
}

function detectLanguage(text: string): string {
  // Very basic language detection
  const englishWords = ["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]
  const lowerText = text.toLowerCase()

  let englishCount = 0
  englishWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = lowerText.match(regex)
    if (matches) englishCount += matches.length
  })

  return englishCount > 5 ? "en" : "unknown"
}

function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "awesome",
    "love",
    "like",
    "best",
    "perfect",
    "outstanding",
  ]
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "worst",
    "hate",
    "dislike",
    "poor",
    "disappointing",
    "failed",
    "wrong",
    "problem",
  ]

  const lowerText = text.toLowerCase()

  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = lowerText.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = lowerText.match(regex)
    if (matches) negativeCount += matches.length
  })

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

function extractTopics(text: string): string[] {
  // Simple topic extraction based on word frequency
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3)

  // Common stop words to exclude
  const stopWords = new Set([
    "this",
    "that",
    "with",
    "have",
    "will",
    "from",
    "they",
    "know",
    "want",
    "been",
    "good",
    "much",
    "some",
    "time",
    "very",
    "when",
    "come",
    "here",
    "just",
    "like",
    "long",
    "make",
    "many",
    "over",
    "such",
    "take",
    "than",
    "them",
    "well",
    "were",
  ])

  // Count word frequency
  const wordCount: Record<string, number> = {}
  words.forEach((word) => {
    if (!stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })

  // Get top 5 most frequent words as topics
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
}

export function generateSEOMetadata(title: string, content: string) {
  const analysis = analyzeContent(content)

  // Generate description from first paragraph
  const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/i)
  let description = firstParagraph ? firstParagraph[1].replace(/<[^>]*>/g, "") : ""

  // Truncate description to 160 characters
  if (description.length > 160) {
    description = description.substring(0, 157) + "..."
  }

  // Generate keywords from topics
  const keywords = analysis.topics.join(", ")

  return {
    title,
    description,
    keywords,
    wordCount: analysis.wordCount,
    readingTime: analysis.readingTime,
    language: analysis.language,
  }
}
