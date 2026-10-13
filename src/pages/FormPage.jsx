import { useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'

function FormPage({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Personal')
  const [due, setDue] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (title.trim()) onSubmit(title.trim(), category, due)
  }

  return (
    <section className="content form-content">
      <PageHeading eyebrow="MAKE IT HAPPEN" title="A new task" description="Write it down, then take it one step at a time." />
      <form className="task-form" onSubmit={submit}>
        <label className="field-label" htmlFor="task-title">What needs doing?<span>REQUIRED</span></label>
        <input autoFocus required id="task-title" className="title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Send the project update" maxLength={100} />
        <div className="field-hint">Keep it clear and actionable.</div>
        <div className="form-row">
          <label className="field-group"><span className="field-label">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Personal</option><option>Work</option></select></label>
          <label className="field-group"><span className="field-label">Due date</span><input type="date" value={due} onChange={(event) => setDue(event.target.value)} /></label>
        </div>
        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" type="submit"><span>＋</span> Create task</button></div>
      </form>
      <div className="form-note"><span>✳</span><div><strong>One thing at a time.</strong><p>You don’t have to do it all today. Just start with one.</p></div></div>
    </section>
  )
}

export default FormPage
