import { supabase } from '../lib/supabase'

function CourseList({ courses, onDeleted }) {
  const handleDelete = async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (!error) onDeleted()
  }

  if (courses.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-8">
        No courses yet — add your first one above.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ backgroundColor: course.color }}
          />
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-white font-semibold">{course.name}</h3>
              {course.code && (
                <p className="text-xs text-neutral-500">{course.code}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(course.id)}
              className="text-neutral-500 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-3 text-xs text-neutral-400 mt-3">
            {course.semester && <span>{course.semester}</span>}
            <span>{course.credits} credits</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CourseList