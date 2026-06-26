import React from 'react'

const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="glass-card rounded-[2rem] p-6 md:p-8 mb-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow && (
          <span className="hero-pill mb-3 inline-flex text-[0.65rem]">{eyebrow}</span>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{title}</h1>
        {description && <p className="text-slate-300 mt-2 text-sm md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  </div>
)

export default PageHeader
