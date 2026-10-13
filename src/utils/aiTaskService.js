/**
 * AI Task Parsing Service for Daymark
 * Connects to the Node.js backend endpoint `/api/ai/parse-task` (powered by Google Gemini)
 * with automatic fallback parsing if backend or LLM is offline.
 */

export async function parseTaskWithAI(prompt, customApiKey = '') {
  if (!prompt || !prompt.trim()) {
    throw new Error('Please enter a task description.')
  }

  const storedKey = customApiKey || localStorage.getItem('daymark_gemini_key') || ''
  const payload = {
    prompt: prompt.trim(),
    apiKey: storedKey,
    referenceDate: new Date().toISOString(),
  }

  try {
    const response = await fetch('/api/ai/parse-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        return {
          ...result.data,
          model: result.meta?.model || 'ai-engine',
        }
      }
    }
    // If backend returned non-200, fallback to client-side heuristic parser
    console.warn('Backend returned non-OK status, falling back to client-side parser.')
    return fallbackClientParser(prompt)
  } catch (err) {
    console.warn('Backend unavailable, falling back to client-side parser:', err.message)
    return fallbackClientParser(prompt)
  }
}

/**
 * Robust client-side parser ensuring instant responsiveness
 * even if the Node server is stopped or network is offline.
 */
export function fallbackClientParser(rawText, referenceDate = new Date()) {
  const text = (rawText || '').trim()
  const ref = new Date(referenceDate)

  let title = text
  let reminderTime = null
  let dueDate = ''
  let due = 'Today'
  let priority = 'Medium'
  let category = 'Personal'

  // Clean prefix
  title = title.replace(/^(please\s+)?(remind me to|remember to|need to|i need to|have to|must|schedule|create a task to|todo:?)\s+/i, '')

  // Time extraction
  const timeRegex = /(?:at\s+)?\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i
  const timeMatch = text.match(timeRegex)
  if (timeMatch) {
    let t = timeMatch[1].toUpperCase()
    if (!t.includes(':')) {
      t = t.replace(/\s*(AM|PM)/i, ':00 $1')
    }
    reminderTime = t
  }

  // Due date & relative days
  const lower = text.toLowerCase()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(ref)
    tomorrow.setDate(tomorrow.getDate() + 1)
    dueDate = tomorrow.toISOString().split('T')[0]
    due = 'Tomorrow'
  }

  for (let i = 0; i < dayNames.length; i++) {
    const dayName = dayNames[i]
    if (new RegExp(`\\b(before|by|on|next|until)\\s+${dayName}\\b`, 'i').test(text) || new RegExp(`\\b${dayName}\\b`, 'i').test(text)) {
      const currentDay = ref.getDay()
      let diff = i - currentDay
      if (diff <= 0) diff += 7
      const targetDate = new Date(ref)
      targetDate.setDate(targetDate.getDate() + diff)
      dueDate = targetDate.toISOString().split('T')[0]
      due = dayName.charAt(0).toUpperCase() + dayName.slice(1)
      break
    }
  }

  if (!dueDate && lower.includes('today')) {
    dueDate = ref.toISOString().split('T')[0]
    due = 'Today'
  }

  // Priority
  if (/\b(urgent|asap|critical|high priority|important|immediately|finish it before|deadline)\b/i.test(text)) {
    priority = 'High'
  } else if (/\b(low priority|whenever|someday|eventually|if time permits)\b/i.test(text)) {
    priority = 'Low'
  }

  // Category
  if (/\b(call|meeting|client|report|proposal|presentation|interview|project|team|email|boss|rahul|work|code|deploy|sprint|budget)\b/i.test(text)) {
    category = 'Work'
  } else if (/\b(groceries|buy|gym|cook|doctor|dentist|mom|dad|party|movie|workout|home)\b/i.test(text)) {
    category = 'Personal'
  }

  // Clean title
  let cleanTitle = title
    .replace(/\b(tomorrow|today|yesterday)\b/gi, '')
    .replace(/(?:at\s+)?\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '')
    .replace(/\b(and\s+)?(finish|complete|do)\s+it\s+(before|by|on)\s+[a-z]+\b/gi, '')
    .replace(/\b(before|by|until|on)\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/gi, '')
    .replace(/[.,;:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:]+$/, '')
    .trim()

  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
  } else {
    cleanTitle = 'New Task'
  }

  let description = `Extracted from prompt: "${text}".`
  if (reminderTime) description += ` Reminder set for ${reminderTime}.`
  if (due) description += ` Due: ${due}.`

  return {
    title: cleanTitle,
    description,
    dueDate,
    due,
    reminderTime: reminderTime || '10:00 AM',
    priority,
    category,
    extractedBy: 'client-nlp-fallback',
    model: 'client-nlp-engine',
  }
}
