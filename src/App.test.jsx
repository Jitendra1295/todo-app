import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

describe('task app', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows the initial tasks and completion progress', () => {
    render(<MemoryRouter><App /></MemoryRouter>)

    expect(screen.getByText('Plan the week ahead')).toBeTruthy()
    expect(screen.getByText('Review project proposal')).toBeTruthy()
    expect(screen.getByText('1 of 4 tasks completed today')).toBeTruthy()
    expect(screen.getByText('26%')).toBeTruthy()
  })

  it('updates completion status and saves it to local storage', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><App /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Complete Review project proposal' }))

    expect(screen.getByRole('button', { name: 'Mark Review project proposal incomplete' })).toBeTruthy()
    expect(screen.getByText('2 of 4 tasks completed today')).toBeTruthy()
    await waitFor(() => {
      const tasks = JSON.parse(localStorage.getItem('daymark-tasks'))
      expect(tasks.find((task) => task.title === 'Review project proposal').done).toBe(true)
    })
  })

  it('creates a task and returns to the task list', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><App /></MemoryRouter>)

    await user.click(screen.getByRole('link', { name: /new task/i }))
    await user.type(screen.getByLabelText(/what needs doing/i), 'Prepare test report')
    await user.selectOptions(screen.getByLabelText('Category'), 'Work')
    await user.click(screen.getByRole('button', { name: /create task/i }))

    expect(screen.getByText('Prepare test report')).toBeTruthy()
    await waitFor(() => {
      const tasks = JSON.parse(localStorage.getItem('daymark-tasks'))
      expect(tasks[0]).toMatchObject({ title: 'Prepare test report', category: 'Work', done: false })
    })
  })

  it('filters the all-tasks list by category', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/list']}><App /></MemoryRouter>)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by category' }), 'Personal')

    const taskList = document.querySelector('.task-list')
    expect(within(taskList).getByText('Plan the week ahead')).toBeTruthy()
    expect(within(taskList).getByText('Pick up groceries')).toBeTruthy()
    expect(within(taskList).queryByText('Review project proposal')).toBeNull()
  })
})
