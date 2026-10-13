import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  })
})

/**
 * Intelligent local fallback parser for when API key is absent or offline.
 * Handles inputs like: "Remind me to call Rahul tomorrow at 10 AM and finish it before Friday."
 */
function localHeuristicParser(rawText, referenceDate = new Date()) {
  const text = (rawText || '').trim()
  const ref = new Date(referenceDate)

  // 1. Clean Title & Description extraction
  let title = text

  // Common prefix cleanups
  title = title.replace(/^(please\s+)?(remind me to|remember to|need to|i need to|have to|must|schedule|create a task to|todo:?)\s+/i, '')

  // Reminder time extraction (e.g., "10 AM", "10:30 am", "tomorrow at 10 AM")
  let reminderTime = null
  const timeRegex = /(?:at\s+)?\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i
  const timeMatch = text.match(timeRegex)
  if (timeMatch) {
    reminderTime = timeMatch[1].toUpperCase()
  }

  // Due Date & relative day extraction
  let dueDate = ''
  let due = 'Today'
  const lower = text.toLowerCase()

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(ref)
    tomorrow.setDate(tomorrow.getDate() + 1)
    dueDate = tomorrow.toISOString().split('T')[0]
    due = 'Tomorrow'
  }

  // Check for specific days like "before friday", "by friday", "on monday"
  for (let i = 0; i < dayNames.length; i++) {
    const dayName = dayNames[i]
    if (new RegExp(`\\b(before|by|on|next|until)\\s+${dayName}\\b`, 'i').test(text) || new RegExp(`\\b${dayName}\\b`, 'i').test(text)) {
      const currentDay = ref.getDay()
      let diff = i - currentDay
      if (diff <= 0) diff += 7 // next coming day of that name
      const targetDate = new Date(ref)
      targetDate.setDate(targetDate.getDate() + diff)
      dueDate = targetDate.toISOString().split('T')[0]
      const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1)
      due = capitalized
      break
    }
  }

  if (!dueDate && lower.includes('today')) {
    dueDate = ref.toISOString().split('T')[0]
    due = 'Today'
  }

  // Priority detection
  let priority = 'Medium'
  if (/\b(urgent|asap|critical|high priority|important|immediately|finish it before|deadline)\b/i.test(text)) {
    priority = 'High'
  } else if (/\b(low priority|whenever|someday|eventually|if time permits)\b/i.test(text)) {
    priority = 'Low'
  }

  // Category detection
  let category = 'Personal'
  if (/\b(call|meeting|client|report|proposal|presentation|interview|project|team|email|boss|rahul|work|code|deploy|sprint|budget)\b/i.test(text)) {
    category = 'Work'
  } else if (/\b(groceries|buy|gym|cook|doctor|dentist|mom|dad|party|movie|workout|home)\b/i.test(text)) {
    category = 'Personal'
  }

  // Refine title by stripping date/time phrases
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

  if (reminderTime && !reminderTime.includes(':')) {
    reminderTime = reminderTime.replace(/\s*(AM|PM)/i, ':00 $1')
  }

  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
  } else {
    cleanTitle = 'New Task'
  }

  let description = `Extracted from prompt: "${text}".`
  if (reminderTime) {
    description += ` Reminder set for ${reminderTime}.`
  }
  if (due) {
    description += ` Target completion: ${due}.`
  }

  return {
    title: cleanTitle,
    description,
    dueDate,
    due,
    reminderTime: reminderTime || '10:00 AM',
    priority,
    category,
    extractedBy: 'heuristic_engine',
  }
}

// AI Task Parsing Route with Structured JSON Output
app.post('/api/ai/parse-task', async (req, res) => {
  const { prompt, apiKey, referenceDate } = req.body || {}

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' })
  }

  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY
  const refDate = referenceDate ? new Date(referenceDate) : new Date()

  // If no Gemini API key is configured, use the intelligent fallback engine
  if (!effectiveApiKey) {
    const parsed = localHeuristicParser(prompt, refDate)
    return res.json({
      success: true,
      data: parsed,
      meta: {
        model: 'heuristic-nlp-engine',
        note: 'Using built-in parser. Add GEMINI_API_KEY to .env for full Gemini LLM intelligence.',
      },
    })
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey })

    const systemInstruction = `
You are a precise task extraction system for a high-productivity todo application.
Current reference date & time is: ${refDate.toISOString()} (${refDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}).

Analyze the user's natural language input and extract structured task attributes:
1. title: Concise, actionable title without polite phrases like "Remind me to" or "I need to". (e.g. "Call Rahul")
2. description: Additional context, instructions, or notes mentioned in the request.
3. dueDate: Standard ISO date string "YYYY-MM-DD" if a deadline or due date is mentioned or implied. Calculate it relative to the reference date.
4. due: A friendly human-readable label for the due date (e.g. "Tomorrow", "Today", "Friday", "Oct 16").
5. reminderTime: A specific reminder time string if mentioned (e.g., "10:00 AM"), or null if none.
6. priority: Exactly one of "High", "Medium", "Low". (Mark as "High" if urgent, close deadline, or key deliverable).
7. category: Exactly one of "Work" or "Personal".
`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser input: "${prompt}"\n\nReturn strictly valid JSON adhering to the schema.` }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Actionable task title' },
            description: { type: 'string', description: 'Detailed context or notes' },
            dueDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
            due: { type: 'string', description: 'Human readable due date label' },
            reminderTime: { type: 'string', description: 'Reminder time such as 10:00 AM' },
            priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
            category: { type: 'string', enum: ['Work', 'Personal'] },
          },
          required: ['title', 'category', 'priority'],
        },
      },
    })

    const rawOutput = response.text
    const parsedData = JSON.parse(rawOutput)

    return res.json({
      success: true,
      data: {
        title: parsedData.title || 'New Task',
        description: parsedData.description || '',
        dueDate: parsedData.dueDate || '',
        due: parsedData.due || 'No date',
        reminderTime: parsedData.reminderTime || null,
        priority: parsedData.priority || 'Medium',
        category: parsedData.category || 'Personal',
        extractedBy: 'gemini-2.5-flash',
      },
      meta: {
        model: 'gemini-2.5-flash',
      },
    })
  } catch (err) {
    console.error('LLM API error, falling back to heuristic parser:', err.message)
    // Fallback gracefully so the user is never blocked
    const fallbackParsed = localHeuristicParser(prompt, refDate)
    return res.json({
      success: true,
      data: fallbackParsed,
      meta: {
        model: 'heuristic-nlp-engine (fallback)',
        warning: `LLM API call failed (${err.message}). Used fallback parser.`,
      },
    })
  }
})

app.listen(PORT, () => {
  console.log(`Daymark AI Task Server running on http://localhost:${PORT}`)
})
