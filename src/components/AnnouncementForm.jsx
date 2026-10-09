import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { value: 'reminder', label: 'Personal Reminder' },
  { value: 'deadline', label: 'University Deadline' },
  { value: 'exam', label: 'Exam Period' },
  { value: 'break', label: 'Break / Holiday' },
  { value: 'event', label: 'Event' },
]

function AnnouncementForm({ onAdded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [category, setCategory] = useState('reminder')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('announcements').insert({
      user_id: user.id,
      title,
      description,
      event_date: eventDate || null,
      category,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setDescription('')
      setEventDate('')
      setCategory('reminder')
      onAdded()
    }

    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6"
    >
      <h3 className="text-white font-semibold mb-4">Add Announcement / Reminder</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 sm:col-span-2"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="text-black">
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details (optional)"
          rows={2}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 sm:col-span-2 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Adding...' : 'Add'}
      </button>
    </form>
  )
}

export default AnnouncementForm