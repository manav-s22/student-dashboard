import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PlacementForm from './PlacementForm'
import PlacementCard from './PlacementCard'

function Placements() {
  const [placements, setPlacements] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [placementsRes, resourcesRes] = await Promise.all([
      supabase.from('placements').select('*').order('created_at', { ascending: false }),
      supabase.from('placement_resources').select('*'),
    ])
    if (!placementsRes.error) setPlacements(placementsRes.data)
    if (!resourcesRes.error) setResources(resourcesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getResourcesFor = (placementId) =>
    resources.filter((r) => r.placement_id === placementId)

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Placement & Training</h2>
      <PlacementForm onAdded={fetchData} />
      {loading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : placements.length === 0 ? (
        <p className="text-neutral-400 text-center py-8">
          No applications tracked yet — add your first one above.
        </p>
      ) : (
        placements.map((p) => (
          <PlacementCard
            key={p.id}
            placement={p}
            resources={getResourcesFor(p.id)}
            onUpdated={fetchData}
          />
        ))
      )}
    </div>
  )
}

export default Placements