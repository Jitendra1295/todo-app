import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import TasksPage from './pages/TasksPage.jsx'
import ListPage from './pages/ListPage.jsx'
import FormPage from './pages/FormPage.jsx'

const initialTasks = [
  { id: 1, title: 'Plan the week ahead', category: 'Personal', due: 'Today', done: true },
  { id: 2, title: 'Review project proposal', category: 'Work', due: 'Today', done: false },
  { id: 3, title: 'Send the team an update', category: 'Work', due: 'Tomorrow', done: false },
  { id: 4, title: 'Pick up groceries', category: 'Personal', due: 'Friday', done: false },
]

function App() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('daymark-tasks')) || initialTasks } catch { return initialTasks }
  })

  useEffect(() => localStorage.setItem('daymark-tasks', JSON.stringify(tasks)), [tasks])

  const toggleTask = (id) => setTasks((items) => items.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  const addTask = (title, category, due) => {
    setTasks((items) => [{ id: Date.now(), title, category, due: due || 'No date', done: false }, ...items])
    navigate('/')
  }

  return (
    <AppLayout openTaskCount={tasks.filter((task) => !task.done).length}>
      <Routes>
        <Route path="/" element={<TasksPage tasks={tasks} onToggle={toggleTask} onAdd={() => navigate('/form')} />} />
        <Route path="/list" element={<ListPage tasks={tasks} onToggle={toggleTask} onAdd={() => navigate('/form')} />} />
        <Route path="/form" element={<FormPage onSubmit={addTask} onCancel={() => navigate('/')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
