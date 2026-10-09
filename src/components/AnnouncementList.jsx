import { supabase } from '../lib/supabase'

const CATEGORY_STYLES = {
  reminder: { label: 'Reminder', color: '#6366f1' },
  deadline: { label: 'Deadline', color: '#ef4444' },
  exam: { label: 'Exam Period', color: '#f59e0b' },
  break: { label: 'Break', color: '#10b981' },
  event: { label: 'Event', color: '#0ea5e9' },
}

function AnnouncementList({ announcements, onDeleted }) {
  const handleDelete = async (id) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (!error) onDeleted()
  }

  if (announcements.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-8">
        No announcements yet — add your first one above.
      </p>
    )
  }

  const sorted = [...announcements].sort((a, b) => {
    if (!a.event_date) return 1
    if (!b.event_date) return -1
    return new Date(a.event_date) - new Date(b.event_date)
  })

  return (
    <div className="space-y-3">
      {sorted.map((a) => {
        const style = CATEGORY_STYLES[a.category] || CATEGORY_STYLES.reminder
        return (
          <div
            key={a.id}
            className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${style.color}20`, color: style.color }}
                >
                  {style.label}
                </span>
                {a.event_date && (
                  <span className="text-xs text-neutral-500">
                    {new Date(a.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <p className="text-white font-medium">{a.title}</p>
              {a.description && (
                <p className="text-neutral-400 text-sm mt-1">{a.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(a.id)}
              className="text-neutral-500 hover:text-red-400 text-sm shrink-0"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default AnnouncementList