import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import Courses from './components/Courses'
import Assignments from './components/Assignments'
import Schedule from './components/Schedule'
import Grades from './components/Grades'
import Attendance from './components/Attendance'
import StudyMaterials from './components/StudyMaterials'
import Placements from './components/Placements'
import Announcements from './components/Announcements'
import Settings from './components/Settings'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('overview')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar
        view={view}
        onChange={setView}
        userEmail={session.user.email}
        onLogout={() => supabase.auth.signOut()}
      />

      <div className="flex-1 min-w-0 px-4 md:px-8 py-8">
        {view === 'overview' && <Overview onNavigate={setView} />}
        {view === 'courses' && <Courses />}
        {view === 'assignments' && <Assignments />}
        {view === 'schedule' && <Schedule />}
        {view === 'grades' && <Grades />}
        {view === 'attendance' && <Attendance />}
        {view === 'materials' && <StudyMaterials />}
        {view === 'placements' && <Placements />}
        {view === 'announcements' && <Announcements />}
        {view === 'settings' && <Settings userEmail={session.user.email} />}
      </div>
    </div>
  )
}

export default App