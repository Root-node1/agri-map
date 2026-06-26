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
    } catch { /* demo mode */ }
    setFields((prev) => [...prev, { ...newField, id: Date.now(), health: 85, soilHealth: 'Good' }])
    setShowAddModal(false)
    setNewField({ name: '', location: '', size: '', cropType: '' })
  }

  const handleDeleteField = async (id) => {
    if (!window.confirm('Delete this field?')) return
    try { await fieldAPI.delete(id) } catch { /* demo */ }
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
<<<<<<< HEAD
    <div>
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
        <div className="flex gap-2 flex-wrap">
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setFilterCrop(crop)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                filterCrop === crop ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300 border border-white/10'
              }`}
            >
              {crop === 'all' ? 'All' : crop}
=======
    <div className="max-w-6xl mx-auto px-4 py-8 page-shell page-shell-dark">
      <div className="glass-card rounded-[2rem] p-8 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('fields.title') || 'My Fields'}</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Track field details and crop health in one place.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[280px]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={t('dashboard.admin.search') || 'Search fields...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <FaPlus className="text-sm" /> {t('fields.addField') || 'Add Field'}
>>>>>>> baa478a6589f6cad9f2271e9c8fc366e071cc0ff
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`} aria-label="Grid view"><FaTh /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`} aria-label="List view"><FaList /></button>
        </div>
      </div>

      {filteredFields.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center text-slate-300">
          <p>No fields found. Add your first field to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="dashboard-grid dashboard-grid-2">
          {filteredFields.map((field, index) => (
            <motion.div key={field.id || index} className="stat-card rounded-[2rem]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
<<<<<<< HEAD
                  <h3 className="text-xl font-semibold text-white">{field.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{field.cropType || 'N/A'}</p>
                  {field.health && (
                    <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">
                      {field.health}% health
                    </span>
                  )}
=======
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{field.name}</h3>
                  <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">{field.cropType || 'N/A'}</p>
>>>>>>> baa478a6589f6cad9f2271e9c8fc366e071cc0ff
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Link to={`/fields/${field.id}`} className="p-2 hover:text-emerald-300" aria-label={`View ${field.name}`}><FaEye /></Link>
                  <button className="p-2 hover:text-emerald-300" aria-label={`Edit ${field.name}`}><FaEdit /></button>
                  <button className="p-2 hover:text-rose-400" onClick={() => handleDeleteField(field.id)} aria-label={`Delete ${field.name}`}><FaTrash /></button>
                </div>
              </div>
<<<<<<< HEAD
              <div className="grid gap-3 sm:grid-cols-2 text-slate-300 text-sm">
                <div className="rounded-3xl bg-white/5 p-4">Location: {field.location || 'N/A'}</div>
                <div className="rounded-3xl bg-white/5 p-4">Size: {field.size || 0} ha</div>
                <div className="rounded-3xl bg-white/5 p-4">Soil: {field.soilHealth || 'Unknown'}</div>
                <div className="rounded-3xl bg-white/5 p-4">Carbon: {field.carbon || '—'} t</div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="frosted-panel overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.map((field) => (
                <tr key={field.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                  <td className="py-3 px-4 font-medium text-white">{field.name}</td>
                  <td className="py-3 px-4">{field.cropType}</td>
                  <td className="py-3 px-4">{field.size} ha</td>
                  <td className="py-3 px-4">{field.health || '—'}%</td>
                  <td className="py-3 px-4">
                    <Link to={`/fields/${field.id}`} className="text-emerald-300 hover:text-white">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
=======
              <div className="grid gap-3 sm:grid-cols-2 text-slate-700 dark:text-slate-300 text-sm">
                <div className="rounded-3xl bg-slate-50/90 dark:bg-white/5 p-4">{t('fields.location') || 'Location'}: {field.location || 'N/A'}</div>
                <div className="rounded-3xl bg-slate-50/90 dark:bg-white/5 p-4">{t('fields.size') || 'Size'}: {field.size || 0} ha</div>
                <div className="rounded-3xl bg-slate-50/90 dark:bg-white/5 p-4">{t('fields.cropType') || 'Crop Type'}: {field.cropType || 'N/A'}</div>
                <div className="rounded-3xl bg-slate-50/90 dark:bg-white/5 p-4">{t('fields.soilHealth') || 'Soil Health'}: {field.soilHealth || 'Unknown'}</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass-card rounded-[2rem] p-12 text-center text-slate-700 dark:text-slate-300">
            <p>No fields found. Add your first field!</p>
          </div>
        )}
      </div>
>>>>>>> baa478a6589f6cad9f2271e9c8fc366e071cc0ff

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} role="dialog" aria-modal="true" aria-labelledby="add-field-title">
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2 id="add-field-title" className="text-xl font-bold text-white mb-4">Add Field</h2>
            <form onSubmit={handleAddField} className="space-y-4">
<<<<<<< HEAD
              {['name', 'location', 'size', 'cropType'].map((field) => (
                <div key={field}>
                  <label htmlFor={`field-${field}`} className="block text-sm text-slate-300 mb-1 capitalize">{field.replace('cropType', 'Crop Type')}</label>
                  <input
                    id={`field-${field}`}
                    type={field === 'size' ? 'number' : 'text'}
                    value={newField[field]}
                    onChange={(e) => setNewField({ ...newField, [field]: e.target.value })}
                    required={field === 'name' || field === 'size'}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              ))}
              <div className="flex gap-3 justify-end pt-3">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Field</button>
=======
              <div className="form-group">
                <label>{t('fields.fieldName') || 'Field Name'}</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  required
                  placeholder="Enter field name"
                  className="w-full rounded-2xl border border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-950/80 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
              <div className="form-group">
                <label>{t('fields.location') || 'Location'}</label>
                <input
                  type="text"
                  value={newField.location}
                  onChange={(e) => setNewField({ ...newField, location: e.target.value })}
                  placeholder="Enter location"
                  className="w-full rounded-2xl border border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-950/80 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
              <div className="form-group">
                <label>{t('fields.size') || 'Size (hectares)'}</label>
                <input
                  type="number"
                  value={newField.size}
                  onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                  required
                  placeholder="Enter size in hectares"
                  className="w-full rounded-2xl border border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-950/80 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
              <div className="form-group">
                <label>{t('fields.cropType') || 'Crop Type'}</label>
                <input
                  type="text"
                  value={newField.cropType}
                  onChange={(e) => setNewField({ ...newField, cropType: e.target.value })}
                  placeholder="Enter crop type"
                  className="w-full rounded-2xl border border-slate-200 bg-white/95 dark:border-slate-700 dark:bg-slate-950/80 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
              <div className="modal-actions flex flex-wrap gap-3 justify-end pt-3">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Field
                </button>
>>>>>>> baa478a6589f6cad9f2271e9c8fc366e071cc0ff
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fields
