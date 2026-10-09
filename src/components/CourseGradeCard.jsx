import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AssessmentForm from './AssessmentForm'

function CourseGradeCard({ course, assessments, onUpdated }) {
  const [targetGrade, setTargetGrade] = useState(90)

  const handleDelete = async (id) => {
    const { error } = await supabase.from('assessments').delete().eq('id', id)
    if (!error) onUpdated()
  }

  const graded = assessments.filter((a) => a.score !== null)
  const ungraded = assessments.filter((a) => a.score === null)

  const earnedWeight = graded.reduce((sum, a) => sum + (a.score / a.max_score) * a.weight, 0)
  const completedWeight = graded.reduce((sum, a) => sum + a.weight, 0)
  const remainingWeight = assessments.reduce((sum, a) => sum + a.weight, 0) - completedWeight

  const currentGrade = completedWeight > 0 ? (earnedWeight / completedWeight) * 100 : null

  // "What do I need" calculator — assumes remaining weight is split evenly
  // across ungraded items, or just shows overall needed average on what's left
  const neededOnRemaining =
    remainingWeight > 0
      ? ((targetGrade - earnedWeight) / remainingWeight) * 100
      : null

  return (
    <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
          <h3 className="text-white font-semibold">{course.name}</h3>
        </div>
        {currentGrade !== null && (
          <span className="text-xl font-bold text-white">{currentGrade.toFixed(1)}%</span>
        )}
      </div>

      <AssessmentForm courseId={course.id} onAdded={onUpdated} />

      {assessments.length === 0 ? (
        <p className="text-neutral-500 text-sm">No assessments added yet.</p>
      ) : (
        <div className="space-y-1 mb-4">
          {assessments.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm py-1 border-b border-white/5">
              <span className="text-neutral-300">{a.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-neutral-400">{a.weight}%</span>
                <span className="text-white">
                  {a.score !== null ? `${a.score}/${a.max_score}` : 'Not graded'}
                </span>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-neutral-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remainingWeight > 0 && (
        <div className="bg-white/5 rounded-lg p-3 mt-3">
          <p className="text-xs text-neutral-400 mb-2">
            {remainingWeight}% of the course is still ungraded. What do you need on the rest to hit your target?
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetGrade}
              onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 rounded bg-white/10 border border-white/10 text-white text-sm outline-none"
            />
            <span className="text-neutral-400 text-sm">% target →</span>
            <span
              className={`text-sm font-semibold ${
                neededOnRemaining > 100 ? 'text-red-400' : 'text-indigo-400'
              }`}
            >
              {neededOnRemaining !== null
                ? neededOnRemaining > 100
                  ? 'Not achievable'
                  : `${Math.max(0, neededOnRemaining).toFixed(1)}% average needed`
                : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseGradeCard