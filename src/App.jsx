import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import TasksPage from './pages/TasksPage.jsx'
import ListPage from './pages/ListPage.jsx'
import FormPage from './pages/FormPage.jsx'
import AiTaskCreatorPage from './pages/AiTaskCreatorPage.jsx'

const initialTasks = [
  { id: 1, title: 'Plan the week ahead', category: 'Personal', due: 'Today', priority: 'Medium', done: true },
  { id: 2, title: 'Review project proposal', category: 'Work', due: 'Today', priority: 'High', done: false },
  { id: 3, title: 'Send the team an update', category: 'Work', due: 'Tomorrow', priority: 'Medium', reminderTime: '10:00 AM', done: false },
  { id: 4, title: 'Pick up groceries', category: 'Personal', due: 'Friday', priority: 'Low', done: false },
]

function App() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('daymark-tasks')) || initialTasks
    } catch {
      return initialTasks
    }
  })

  useEffect(() => {
    localStorage.setItem('daymark-tasks', JSON.stringify(tasks))
  }, [tasks])

  const toggleTask = (id) => {
    setTasks((items) =>
      items.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    )
  }

  const addTask = (titleOrTask, category, due) => {
    if (titleOrTask && typeof titleOrTask === 'object') {
      const task = titleOrTask
      setTasks((items) => [
        {
          id: Date.now(),
          title: task.title,
          category: task.category || 'Personal',
          due: task.due || 'No date',
          dueDate: task.dueDate || '',
          description: task.description || '',
          priority: task.priority || 'Medium',
          reminderTime: task.reminderTime || '',
          done: false,
        },
        ...items,
      ])
    } else {
      setTasks((items) => [
        {
          id: Date.now(),
          title: titleOrTask,
          category: category || 'Personal',
          due: due || 'No date',
          priority: 'Medium',
          done: false,
        },
        ...items,
      ])
    }
    navigate('/')
  }

  return (
    <AppLayout openTaskCount={tasks.filter((task) => !task.done).length}>
      <Routes>
        <Route
          path="/"
          element={
            <TasksPage
              tasks={tasks}
              onToggle={toggleTask}
              onAdd={() => navigate('/form')}
              onOpenAi={() => navigate('/ai')}
            />
          }
        />
        <Route
          path="/list"
          element={
            <ListPage
              tasks={tasks}
              onToggle={toggleTask}
              onAdd={() => navigate('/form')}
            />
          }
        />
        <Route
          path="/form"
          element={
            <FormPage
              onSubmit={addTask}
              onCancel={() => navigate('/')}
            />
          }
        />
        <Route
          path="/ai"
          element={<AiTaskCreatorPage onAddTask={addTask} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
