interface TagPillsProps {
  tags: string[]
  selectedTags: string[]
  interactive: boolean
  onToggle?: (tag: string) => void
  onTagClick?: (tag: string) => void
}

export function TagPills({ tags, selectedTags, interactive, onToggle, onTagClick }: TagPillsProps): JSX.Element {
  const displayTags = interactive ? tags : selectedTags

  return (
    <div className="tag-pills">
      {displayTags.map((tag) => {
        const isSelected = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            className={`tag-pill${isSelected ? ' selected' : ''}`}
            onClick={() => {
              if (interactive) {
                onToggle?.(tag)
              } else {
                onTagClick?.(tag)
              }
            }}
            disabled={!interactive && !onTagClick}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
