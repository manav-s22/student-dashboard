import { supabase } from '../lib/supabase'

function getYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
}

const TYPE_LABELS = { note: 'Note', video: 'Video', link: 'Link' }

function MaterialList({ materials, courses, onDeleted }) {
  const getCourse = (courseId) => courses.find((c) => c.id === courseId)

  const handleDelete = async (id) => {
    const { error } = await supabase.from('study_materials').delete().eq('id', id)
    if (!error) onDeleted()
  }

  if (materials.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-8">
        No study materials yet — add your first one above.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {materials.map((m) => {
        const course = getCourse(m.course_id)
        const videoId = m.type === 'video' ? getYouTubeId(m.url) : null

        return (
          <div
            key={m.id}
            className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative"
          >
            <button
              onClick={() => handleDelete(m.id)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-red-400 text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full">
                {TYPE_LABELS[m.type]}
              </span>
              {course && (
                <span className="text-xs flex items-center gap-1 text-neutral-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
                  {course.name}
                </span>
              )}
            </div>

            <h3 className="text-white font-semibold mb-2 pr-6">{m.title}</h3>

            {m.type === 'note' && (
              <p className="text-neutral-300 text-sm whitespace-pre-wrap">{m.content}</p>
            )}

            {m.type === 'video' && videoId && (
              <div className="aspect-video rounded-lg overflow-hidden mt-2">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={m.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {m.type === 'video' && !videoId && m.url && (
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-sm hover:underline break-all">
                {m.url}
              </a>
            )}

            {m.type === 'link' && m.url && (
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-sm hover:underline break-all">
                {m.url}
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default MaterialList