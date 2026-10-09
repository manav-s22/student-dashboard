import { useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'oa', label: 'Online Assessment' },
  { value: 'interview', label: 'Interview Stage' },
  { value: 'offer', label: 'Offer Received' },
  { value: 'rejected', label: 'Rejected' },
]

function PlacementForm({ onAdded }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('applied')
  const [applicationDate, setApplicationDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.trim()) return

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('placements').insert({
      user_id: user.id,
      company,
      role,
      status,
      application_date: applicationDate || null,
      deadline: deadline || null,
      notes,
    })

    if (error) {
      setError(error.message)
    } else {
      setCompany('')
      setRole('')
      setStatus('applied')
      setApplicationDate('')
      setDeadline('')
      setNotes('')
      onAdded()
    }

    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6"
    >
      <h3 className="text-white font-semibold mb-4">Add Application</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          required
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role (e.g. SWE Intern)"
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value} className="text-black">
              {s.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={applicationDate}
          onChange={(e) => setApplicationDate(e.target.value)}
          placeholder="Application date"
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="Next deadline"
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500 sm:col-span-2"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
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
        {saving ? 'Adding...' : 'Add Application'}
      </button>
    </form>
  )
}

export default PlacementForm