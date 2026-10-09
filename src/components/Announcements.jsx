import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AnnouncementForm from './AnnouncementForm'
import AnnouncementList from './AnnouncementList'

function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('event_date', { ascending: true })
    if (!error) setAnnouncements(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Announcements</h2>
      <AnnouncementForm onAdded={fetchData} />
      {loading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : (
        <AnnouncementList announcements={announcements} onDeleted={fetchData} />
      )}
    </div>
  )
}

export default Announcements