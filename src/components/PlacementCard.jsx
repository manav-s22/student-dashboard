import { useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUS_STYLES = {
  applied: { label: 'Applied', color: '#6366f1' },
  oa: { label: 'Online Assessment', color: '#0ea5e9' },
  interview: { label: 'Interview Stage', color: '#f59e0b' },
  offer: { label: 'Offer', color: '#10b981' },
  rejected: { label: 'Rejected', color: '#6b7280' },
}

function PlacementCard({ placement, resources, onUpdated }) {
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [addingResource, setAddingResource] = useState(false)

  const style = STATUS_STYLES[placement.status] || STATUS_STYLES.applied

  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase
      .from('placements')
      .update({ status: newStatus })
      .eq('id', placement.id)
    if (!error) onUpdated()
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('placements').delete().eq('id', placement.id)
    if (!error) onUpdated()
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!resourceTitle.trim()) return

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('placement_resources').insert({
      user_id: user.id,
      placement_id: placement.id,
      title: resourceTitle,
      url: resourceUrl || null,
    })

    if (!error) {
      setResourceTitle('')
      setResourceUrl('')
      setAddingResource(false)
      onUpdated()
    }
  }

  const handleDeleteResource = async (id) => {
    const { error } = await supabase.from('placement_resources').delete().eq('id', id)
    if (!error) onUpdated()
  }

  const isUpcoming = placement.deadline && new Date(placement.deadline) >= new Date()

  return (
    <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-semibold">{placement.company}</h3>
          {placement.role && <p className="text-neutral-400 text-sm">{placement.role}</p>}
        </div>
        <button
          onClick={handleDelete}
          className="text-neutral-500 hover:text-red-400 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <select
          value={placement.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="text-xs px-2 py-1 rounded-full border-none outline-none"
          style={{ backgroundColor: `${style.color}20`, color: style.color }}
        >
          {Object.entries(STATUS_STYLES).map(([value, s]) => (
            <option key={value} value={value} className="text-black">
              {s.label}
            </option>
          ))}
        </select>

        {placement.deadline && (
          <span className={`text-xs ${isUpcoming ? 'text-amber-400' : 'text-neutral-500'}`}>
            {isUpcoming ? 'Deadline: ' : 'Was due: '}
            {new Date(placement.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {placement.notes && (
        <p className="text-neutral-400 text-sm mb-3">{placement.notes}</p>
      )}

      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-neutral-500 font-semibold mb-2 uppercase">Prep Resources</p>

        {resources.length > 0 && (
          <div className="space-y-1 mb-2">
            {resources.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate">
                    {r.title}
                  </a>
                ) : (
                  <span className="text-neutral-300 truncate">{r.title}</span>
                )}
                <button
                  onClick={() => handleDeleteResource(r.id)}
                  className="text-neutral-500 hover:text-red-400 shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {addingResource ? (
          <form onSubmit={handleAddResource} className="flex gap-2 mt-2">
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              placeholder="Resource title"
              className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs outline-none"
            />
            <input
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              placeholder="URL (optional)"
              className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs outline-none"
            />
            <button type="submit" className="text-xs text-indigo-400 hover:underline">
              Save
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAddingResource(true)}
            className="text-xs text-indigo-400 hover:underline"
          >
            + Add resource
          </button>
        )}
      </div>
    </div>
  )
}

export default PlacementCard