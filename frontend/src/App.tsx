    import { useState, useEffect } from 'react'
    
    type Journal = {
      id: number
      title: string
      authors: string
      category: string
      download_date: string
    }
    
    function App() {
      const [journals, setJournals] = useState<Journal[]>([])
    
      useEffect(() => {
        fetch('http://192.168.100.20:32346/api/journals')
          .then(res => res.json())
          .then(data => setJournals(data.journals))
          .catch(err => console.error(err))
      }, [])
    
      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">📚 FCPO Journal Manager</h1>
              <span className="text-sm text-gray-500">Total: {journals.length}</span>
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
    
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 text-gray-600">Authors</th>
                    <th className="text-left px-4 py-3 text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 text-gray-600">Downloaded</th>
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
                      <td className="px-4 py-3 text-gray-500">{j.download_date}</td>
                    </tr>
                  ))}
                  {journals.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No journals yet. Add some via the API!
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
    
