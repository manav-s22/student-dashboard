import { useState } from 'react'
import { supabase } from '../lib/supabase'

function AssessmentForm({ courseId, onAdded }) {
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState(100)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !weight) return

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('assessments').insert({
      user_id: user.id,
      course_id: courseId,
      name,
      weight: parseFloat(weight),
      score: score === '' ? null : parseFloat(score),
      max_score: parseFloat(maxScore),
    })

    if (error) {
      setError(error.message)
    } else {
      setName('')
      setWeight('')
      setScore('')
      setMaxScore(100)
      onAdded()
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Assessment name (e.g. Midterm)"
        required
        className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 text-sm"
      />
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Weight %"
        min="0"
        max="100"
        required
        className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 text-sm"
      />
      <input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Score"
        className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 text-sm"
      />
      <input
        type="number"
        value={maxScore}
        onChange={(e) => setMaxScore(e.target.value)}
        placeholder="Max"
        className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 text-sm"
      />
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? '...' : 'Add'}
      </button>
      {error && <p className="text-red-400 text-xs w-full">{error}</p>}
    </form>
  )
}

export default AssessmentForm