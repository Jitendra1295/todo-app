function TaskRow({ task, onToggle }) {
  const priorityClass = task.priority ? `priority-${task.priority.toLowerCase()}` : ''

  return (
    <article className={`task-row${task.done ? ' completed' : ''}`}>
      <button
        className="checkbox"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
      >
        {task.done && '✓'}
      </button>

      <div className="task-details">
        <div className="task-title-line">
          <span className="task-title">{task.title}</span>
          {task.priority && (
            <span className={`priority-tag ${priorityClass}`}>
              {task.priority}
            </span>
          )}
        </div>
        {task.description && (
          <span className="task-desc-preview" title={task.description}>
            {task.description}
          </span>
        )}
        <span className="task-category">{task.category}</span>
      </div>

      {task.reminderTime && (
        <span className="task-reminder-pill" title={`Reminder: ${task.reminderTime}`}>
          ⏰ {task.reminderTime}
        </span>
      )}

      <span className={`tag ${task.category ? task.category.toLowerCase() : 'personal'}`}>
        {task.category}
      </span>

      <span className="task-due">
        <span className="calendar-icon">▦</span>
        {task.due}
      </span>

      <button className="row-more" aria-label={`More options for ${task.title}`}>
        ···
      </button>
    </article>
  )
}

export default TaskRow
