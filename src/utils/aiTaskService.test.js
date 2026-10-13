import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseTaskWithAI } from './aiTaskService.js'

describe('parseTaskWithAI', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sends prompts to the configured backend without including an API key', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://todo-api.example.com/')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { title: 'Call Rahul' },
        meta: { model: 'gemini-2.5-flash' },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(parseTaskWithAI('Call Rahul tomorrow')).resolves.toMatchObject({
      title: 'Call Rahul',
      model: 'gemini-2.5-flash',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://todo-api.example.com/api/ai/parse-task',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      }),
    )
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(requestBody.prompt).toBe('Call Rahul tomorrow')
    expect(requestBody).not.toHaveProperty('apiKey')
  })
})
