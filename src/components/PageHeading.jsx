function PageHeading({ eyebrow, title, description, action, aiAction }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-heading-actions">
        {aiAction && (
          <button type="button" className="secondary-button ai-heading-btn" onClick={aiAction}>
            <span>✨</span> AI Creator
          </button>
        )}
        {action && (
          <button className="primary-button" onClick={action}>
            <span>＋</span> Add a task
          </button>
        )}
      </div>
    </div>
  )
}

export default PageHeading
