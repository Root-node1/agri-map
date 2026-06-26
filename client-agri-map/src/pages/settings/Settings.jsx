import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'

const Settings = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true, marketing: false })
  const [security, setSecurity] = useState({ twoFactor: false })
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ]

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile, notifications, and security" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full text-sm font-medium ${tab === t.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300'}`}>{t.label}</button>
        ))}
      </div>

      {saved && <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-200 text-sm">Settings saved successfully.</div>}

      {tab === 'profile' && (
        <div className="frosted-panel max-w-lg space-y-4">
          {['firstName', 'lastName', 'email', 'phone'].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm text-slate-300 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input id={field} type={field === 'email' ? 'email' : 'text'} value={profile[field]} onChange={(e) => setProfile({ ...profile, [field]: e.target.value })} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          ))}
          <button className="btn-primary" onClick={save}>Save Profile</button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="frosted-panel max-w-lg space-y-4">
          {Object.entries(notifications).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
              <span className="text-slate-300 capitalize">{key} notifications</span>
              <input type="checkbox" checked={val} onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
            </label>
          ))}
          <button className="btn-primary" onClick={save}>Save Preferences</button>
        </div>
      )}

      {tab === 'security' && (
        <div className="frosted-panel max-w-lg space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div><p className="text-white font-medium">Two-Factor Authentication</p><p className="text-sm text-slate-400">Add an extra layer of security</p></div>
            <input type="checkbox" checked={security.twoFactor} onChange={(e) => setSecurity({ twoFactor: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
          </label>
          <div>
            <label htmlFor="new-password" className="block text-sm text-slate-300 mb-1">Change Password</label>
            <input id="new-password" type="password" placeholder="New password" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white mb-2 outline-none focus:ring-2 focus:ring-emerald-400" />
            <input type="password" placeholder="Confirm password" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400" aria-label="Confirm new password" />
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-white font-medium mb-2">Active Sessions</p>
            <p className="text-sm text-slate-400">Current device · Nairobi, Kenya · Active now</p>
          </div>
          <button className="btn-primary" onClick={save}>Update Security</button>
        </div>
      )}
    </div>
  )
}

export default Settings
