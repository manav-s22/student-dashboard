import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Settings({ userEmail }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [displayName, setDisplayName] = useState('')
  const [university, setUniversity] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setDisplayName(data.display_name || '')
        setUniversity(data.university || '')
      }
    }
    loadProfile()
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName,
      university: university,
    })

    setProfileMessage(error ? error.message : 'Saved')
    setProfileSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage(null)
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      setPasswordSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordMessage('Password updated')
      setNewPassword('')
    }

    setPasswordSaving(false)
  }

  const handleExport = async () => {
    setExporting(true)

    const tables = ['courses', 'assignments', 'assessments', 'class_schedule', 'study_materials', 'announcements', 'placements']
    const exportData = {}

    for (const table of tables) {
      const { data } = await supabase.from(table).select('*')
      exportData[table] = data || []
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-dashboard-export.json'
    a.click()
    URL.revokeObjectURL(url)

    setExporting(false)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>

      <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">Profile</h3>
        <p className="text-neutral-400 text-sm mb-3">{userEmail}</p>
        <form onSubmit={handleProfileSave} className="space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="University"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
          />
          {profileMessage && <p className="text-sm text-indigo-400">{profileMessage}</p>}
          <button
            type="submit"
            disabled={profileSaving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            minLength={6}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
          />
          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-green-400">{passwordMessage}</p>}
          <button
            type="submit"
            disabled={passwordSaving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">Appearance</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded-lg text-sm ${
              theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded-lg text-sm ${
              theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
            }`}
          >
            Light
          </button>
        </div>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">Export Your Data</h3>
        <p className="text-neutral-400 text-sm mb-3">
          Download everything — courses, assignments, grades, schedule, and more — as a JSON file.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export Data'}
        </button>
      </div>
    </div>
  )
}

export default Settings