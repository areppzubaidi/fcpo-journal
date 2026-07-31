import { useState, useEffect } from 'react'

type Journal = {
  id: number
  title: string
  authors: string
  category: string
  download_date: string
}

type User = {
  id: number
  username: string
  role: string
}

const API_URL = 'http://192.168.100.20:32346'

function App() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [token, setToken] = useState<string>(localStorage.getItem('fcpo_token') || '')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', authors: '', category: '', publisher: '', doi: '', keywords: '', notes: '', month: 0, year: 2026 })

  // Fetch journals when we have a token
  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/api/journals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setJournals(data.journals || []))
      .catch(err => console.error(err))
  }, [token])

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('fcpo_token', data.token)
      setToken(data.token)
      setUser(data.user)
      setLoginError('')
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      alert('Account created! Please login.')
      setUsername('')
      setPassword('')
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fcpo_token')
    setToken('')
    setUser(null)
    setJournals([])
  }

  // Add journal
  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          download_date: new Date().toISOString().slice(0, 10),
          month: new Date().getMonth() + 1
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add')
      setJournals([data, ...journals])
      setShowForm(false)
      setForm({ title: '', authors: '', category: '', publisher: '', doi: '', keywords: '', notes: '', month: 0, year: 2026 })
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Delete journal (admin only button shows for admin)
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this journal?')) return
    try {
      const res = await fetch(`${API_URL}/api/journals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      setJournals(journals.filter(j => j.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  // If not logged in, show login page
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">📚 FCPO Journal Manager</h1>
          <form onSubmit={handleLogin}>
            <input
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-3" type="submit">
              Login
            </button>
            <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300" type="button" onClick={handleRegister}>
              Register New Account
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">📚 FCPO Journal Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">👤 {user?.username} ({user?.role})</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Journals</p>
            <p className="text-2xl font-bold text-gray-800">{journals.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-2xl font-bold text-gray-800">
              {journals.filter(j => j.download_date?.startsWith('2026-07')).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Set(journals.map(j => j.category)).size}
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Journal
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddJournal} className="bg-white rounded-lg shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title *" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input placeholder="Authors" value={form.authors} onChange={e => setForm({...form, authors: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input placeholder="Publisher" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input placeholder="DOI / URL" value={form.doi} onChange={e => setForm({...form, doi: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input placeholder="Keywords" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input placeholder="Year" type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <button type="submit" className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 md:col-span-2">Save Journal</button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Title</th>
                <th className="text-left px-4 py-3 text-gray-600">Authors</th>
                <th className="text-left px-4 py-3 text-gray-600">Category</th>
                <th className="text-left px-4 py-3 text-gray-600">Downloaded</th>
                {user?.role === 'admin' && <th className="text-left px-4 py-3 text-gray-600">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {journals.map(j => (
                <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{j.title}</td>
                  <td className="px-4 py-3 text-gray-600">{j.authors}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{j.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{j.download_date?.slice(0, 10)}</td>
                  {user?.role === 'admin' && (
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(j.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {journals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No journals yet. Click "+ Add Journal" to add your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default App
