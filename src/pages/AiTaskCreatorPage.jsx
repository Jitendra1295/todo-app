import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeading from '../components/PageHeading.jsx'
import { parseTaskWithAI } from '../utils/aiTaskService.js'

const EXAMPLE_PROMPTS = [
  'Remind me to call Rahul tomorrow at 10 AM and finish it before Friday.',
  'Submit Q3 financial report to Sarah by Friday with high priority',
  'Buy groceries and cooking ingredients today at 6 PM',
  'Dentist checkup next Tuesday at 2 PM for routine cleaning',
]

function AiTaskCreatorPage({ onAddTask }) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('Remind me to call Rahul tomorrow at 10 AM and finish it before Friday.')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [extractedTask, setExtractedTask] = useState(null)
  const [showJson, setShowJson] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [customKey, setCustomKey] = useState(() => localStorage.getItem('daymark_gemini_key') || '')

  const handleParse = async (textToParse = prompt) => {
    if (!textToParse.trim()) {
      setError('Please enter a natural language prompt.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const result = await parseTaskWithAI(textToParse, customKey)
      setExtractedTask(result)
    } catch (err) {
      setError(err.message || 'Failed to parse task with AI.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('daymark_gemini_key', customKey.trim())
    } else {
      localStorage.removeItem('daymark_gemini_key')
    }
    setShowApiKeyModal(false)
  }

  const handleConfirmAndAdd = () => {
    if (!extractedTask || !extractedTask.title.trim()) return

    onAddTask({
      title: extractedTask.title.trim(),
      category: extractedTask.category || 'Personal',
      due: extractedTask.due || 'No date',
      dueDate: extractedTask.dueDate || '',
      description: extractedTask.description || '',
      priority: extractedTask.priority || 'Medium',
      reminderTime: extractedTask.reminderTime || '',
    })

    navigate('/')
  }

  return (
    <section className="content ai-creator-content">
      <div className="ai-page-header">
        <PageHeading
          eyebrow="NATURAL LANGUAGE TO ACTION"
          title="AI Task Creator"
          description="Type your task naturally. AI extracts titles, deadlines, reminders, priority, and categories instantly."
        />
        <button
          type="button"
          className="api-key-button"
          onClick={() => setShowApiKeyModal(!showApiKeyModal)}
          title="Configure Gemini API Key"
        >
          ⚙️ {customKey ? 'Gemini Key Configured' : 'API Key Setup'}
        </button>
      </div>

      {showApiKeyModal && (
        <div className="api-key-banner">
          <div className="api-key-copy">
            <strong>Google Gemini API Key (Optional)</strong>
            <p>
              Leave blank to use the smart built-in NLP parser, or paste your Gemini key to use live Gemini 2.5 Flash.
            </p>
          </div>
          <div className="api-key-inputs">
            <input
              type="password"
              placeholder="Paste AIzaSy... API key"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="key-input"
            />
            <button type="button" className="primary-button" onClick={handleSaveApiKey}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Main Prompt Card */}
      <div className="ai-input-card">
        <label className="field-label" htmlFor="ai-prompt-input">
          What would you like to get done?
          <span className="sparkle-badge">✨ AI-POWERED</span>
        </label>
        
        <textarea
          id="ai-prompt-input"
          className="ai-textarea"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Remind me to call Rahul tomorrow at 10 AM and finish it before Friday."
        />

        <div className="prompt-examples">
          <span className="examples-label">Try an example:</span>
          <div className="pills-row">
            {EXAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="example-pill"
                onClick={() => {
                  setPrompt(sample)
                  handleParse(sample)
                }}
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {error && <div className="ai-error-message">⚠️ {error}</div>}

        <div className="ai-actions-bar">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setPrompt('')
              setExtractedTask(null)
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="primary-button ai-submit-button"
            disabled={loading || !prompt.trim()}
            onClick={() => handleParse()}
          >
            {loading ? (
              <>
                <span className="spinner-sparkle">✦</span> Extracting details...
              </>
            ) : (
              <>
                <span>✨</span> Parse with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Output Card */}
      {extractedTask && (
        <div className="ai-result-card animate-fade-in">
          <div className="result-header">
            <div className="result-title-group">
              <span className="sparkle-icon">✦</span>
              <div>
                <strong>Extracted Structured Task</strong>
                <span className="extraction-model-tag">
                  Model: {extractedTask.model || extractedTask.extractedBy || 'AI Engine'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="toggle-json-btn"
              onClick={() => setShowJson(!showJson)}
            >
              {showJson ? 'Hide JSON' : 'Inspect JSON'}
            </button>
          </div>

          <div className="structured-fields-grid">
            {/* Task Title */}
            <div className="field-item full-width">
              <label className="field-tag">TASK TITLE</label>
              <input
                className="structured-input title-highlight"
                value={extractedTask.title}
                onChange={(e) =>
                  setExtractedTask({ ...extractedTask, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="field-item full-width">
              <label className="field-tag">DESCRIPTION & CONTEXT</label>
              <textarea
                className="structured-textarea"
                rows={2}
                value={extractedTask.description}
                onChange={(e) =>
                  setExtractedTask({ ...extractedTask, description: e.target.value })
                }
              />
            </div>

            {/* Due Date & Label */}
            <div className="field-item">
              <label className="field-tag">DUE DATE</label>
              <div className="input-with-badge">
                <input
                  type="text"
                  className="structured-input"
                  value={extractedTask.due}
                  onChange={(e) =>
                    setExtractedTask({ ...extractedTask, due: e.target.value })
                  }
                />
                {extractedTask.dueDate && (
                  <span className="sub-badge">📅 {extractedTask.dueDate}</span>
                )}
              </div>
            </div>

            {/* Reminder Time */}
            <div className="field-item">
              <label className="field-tag">REMINDER TIME</label>
              <div className="input-with-badge">
                <input
                  type="text"
                  className="structured-input"
                  value={extractedTask.reminderTime || ''}
                  placeholder="e.g. 10:00 AM"
                  onChange={(e) =>
                    setExtractedTask({ ...extractedTask, reminderTime: e.target.value })
                  }
                />
                <span className="sub-badge">⏰ Reminder</span>
              </div>
            </div>

            {/* Priority */}
            <div className="field-item">
              <label className="field-tag">PRIORITY</label>
              <div className="priority-selector">
                {['High', 'Medium', 'Low'].map((p) => {
                  const isSelected = extractedTask.priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`priority-pill ${p.toLowerCase()}${isSelected ? ' active' : ''}`}
                      onClick={() =>
                        setExtractedTask({ ...extractedTask, priority: p })
                      }
                    >
                      <span className="dot" /> {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category */}
            <div className="field-item">
              <label className="field-tag">CATEGORY</label>
              <div className="category-selector">
                {['Work', 'Personal'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${cat.toLowerCase()}${extractedTask.category === cat ? ' active' : ''}`}
                    onClick={() =>
                      setExtractedTask({ ...extractedTask, category: cat })
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* JSON Schema Viewer */}
          {showJson && (
            <div className="json-preview-container">
              <div className="json-header">STRUCTURED JSON OUTPUT</div>
              <pre className="json-code">
                {JSON.stringify(
                  {
                    title: extractedTask.title,
                    description: extractedTask.description,
                    dueDate: extractedTask.dueDate,
                    due: extractedTask.due,
                    reminderTime: extractedTask.reminderTime,
                    priority: extractedTask.priority,
                    category: extractedTask.category,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {/* Confirm Actions */}
          <div className="result-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-button create-final-btn"
              onClick={handleConfirmAndAdd}
            >
              <span>＋</span> Add to My Tasks
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default AiTaskCreatorPage
