import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTh, FaList } from 'react-icons/fa'
import { motion } from 'framer-motion'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { fieldAPI } from '../../services/api'
import { demoFields } from '../../lib/demoData'

const Fields = () => {
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCrop, setFilterCrop] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newField, setNewField] = useState({ name: '', location: '', size: '', cropType: '' })

  React.useEffect(() => {
    fieldAPI.getAll()
      .then((data) => setFields(Array.isArray(data) ? data : data?.fields || demoFields))
      .catch(() => setFields(demoFields))
      .finally(() => setLoading(false))
  }, [])

  const crops = ['all', ...new Set(fields.map((f) => f.cropType).filter(Boolean))]

  const filteredFields = fields.filter((field) => {
    const matchSearch = field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.cropType?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCrop = filterCrop === 'all' || field.cropType === filterCrop
    return matchSearch && matchCrop
  })

  const handleAddField = async (e) => {
    e.preventDefault()
    try {
      await fieldAPI.create(newField)
    } catch (error) {
      console.error('Error adding field:', error)
    }
    setFields((prev) => [...prev, { ...newField, id: Date.now(), health: 85, soilHealth: 'Good' }])
    setShowAddModal(false)
    setNewField({ name: '', location: '', size: '', cropType: '' })
  }

  const handleDeleteField = async (id) => {
    if (!window.confirm('Delete this field?')) return
    try {
      await fieldAPI.delete(id)
    } catch (error) {
      console.error('Error deleting field:', error)
    }
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="page-shell page-shell-dark">
      <PageHeader
        eyebrow="Field Management"
        title={t('fields.title') || 'My Fields'}
        description="Track field details, crop health, and satellite insights"
        actions={
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="text-sm" /> {t('fields.addField') || 'Add Field'}
          </button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-100"
            aria-label="Search fields"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-4 py-3 rounded-3xl input-floating text-slate-100"
            aria-label="Filter by crop"
          >
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop === 'all' ? 'All Crops' : crop}
              </option>
            ))}
          </select>

          <div className="flex rounded-3xl overflow-hidden border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              aria-label="Grid view"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              aria-label="List view"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {filteredFields.length === 0 ? (
        <div className="frosted-panel text-center py-16">
          <p className="text-slate-300 text-lg">No fields found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            <FaPlus className="mr-2" /> Add Your First Field
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="frosted-panel hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">{field.name}</h3>
                <div className="flex gap-2">
                  <Link to={`/fields/${field.id}`} className="text-emerald-400 hover:text-emerald-300">
                    <FaEye />
                  </Link>
                  <Link to={`/fields/${field.id}/edit`} className="text-blue-400 hover:text-blue-300">
                    <FaEdit />
                  </Link>
                  <button onClick={() => handleDeleteField(field.id)} className="text-red-400 hover:text-red-300">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p><span className="text-slate-500">Crop:</span> {field.cropType || 'Not set'}</p>
                <p><span className="text-slate-500">Location:</span> {field.location || 'Not set'}</p>
                <p><span className="text-slate-500">Size:</span> {field.size || 'Not set'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Health:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    field.health > 70 ? 'bg-emerald-500/20 text-emerald-400' :
                    field.health > 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {field.health || 85}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="frosted-panel overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-3 px-4 text-slate-400 font-medium">Name</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Crop</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Location</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Size</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Health</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.map((field) => (
                <tr key={field.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{field.name}</td>
                  <td className="py-3 px-4 text-slate-300">{field.cropType || '-'}</td>
                  <td className="py-3 px-4 text-slate-300">{field.location || '-'}</td>
                  <td className="py-3 px-4 text-slate-300">{field.size || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      field.health > 70 ? 'bg-emerald-500/20 text-emerald-400' :
                      field.health > 40 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {field.health || 85}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link to={`/fields/${field.id}`} className="text-emerald-400 hover:text-emerald-300">
                        <FaEye />
                      </Link>
                      <Link to={`/fields/${field.id}/edit`} className="text-blue-400 hover:text-blue-300">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDeleteField(field.id)} className="text-red-400 hover:text-red-300">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="frosted-panel w-full max-w-md p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Field</h2>
            <form onSubmit={handleAddField}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Field Name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Crop Type"
                  value={newField.cropType}
                  onChange={(e) => setNewField({ ...newField, cropType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newField.location}
                  onChange={(e) => setNewField({ ...newField, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Size (ha)"
                  value={newField.size}
                  onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Add Field</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fields
