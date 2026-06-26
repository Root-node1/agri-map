import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { fieldAPI } from '../../services/djangoApi'

const Fields = () => {
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newField, setNewField] = useState({
    name: '',
    location: '',
    size: '',
    cropType: ''
  })

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      const res = await fieldAPI.getAll()
      setFields(res.data || [])
    } catch (error) {
      console.error('Error fetching fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddField = async (e) => {
    e.preventDefault()
    try {
      await fieldAPI.create(newField)
      setShowAddModal(false)
      setNewField({ name: '', location: '', size: '', cropType: '' })
      fetchFields()
    } catch (error) {
      console.error('Error adding field:', error)
      alert('Error adding field. Please try again.')
    }
  }

  const handleDeleteField = async (id) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await fieldAPI.delete(id)
        fetchFields()
      } catch (error) {
        console.error('Error deleting field:', error)
        alert('Error deleting field. Please try again.')
      }
    }
  }

  const filteredFields = fields.filter(field =>
    field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.cropType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-shell-dark">
      <div className="glass-card rounded-[2rem] p-8 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('fields.title') || 'My Fields'}</h1>
            <p className="text-slate-300 mt-2">Track field details and crop health in one place.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[280px]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={t('fields.searchPlaceholder') || 'Search fields...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <FaPlus className="text-sm" /> {t('fields.addField') || 'Add Field'}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-2">
        {filteredFields.length > 0 ? (
          filteredFields.map((field, index) => (
            <motion.div
              key={field.id || index}
              className="stat-card rounded-[2rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{field.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{field.cropType || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <button className="icon-btn" title={t('fields.viewField') || 'View'}>
                    <FaEye />
                  </button>
                  <button className="icon-btn" title={t('fields.editField') || 'Edit'}>
                    <FaEdit />
                  </button>
                  <button
                    className="icon-btn danger"
                    title={t('fields.deleteField') || 'Delete'}
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-slate-300 text-sm">
                <div className="rounded-3xl bg-white/5 p-4">{t('fields.location') || 'Location'}: {field.location || 'N/A'}</div>
                <div className="rounded-3xl bg-white/5 p-4">{t('fields.size') || 'Size'}: {field.size || 0} ha</div>
                <div className="rounded-3xl bg-white/5 p-4">{t('fields.cropType') || 'Crop Type'}: {field.cropType || 'N/A'}</div>
                <div className="rounded-3xl bg-white/5 p-4">{t('fields.soilHealth') || 'Soil Health'}: {field.soilHealth || 'Unknown'}</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass-card rounded-[2rem] p-12 text-center text-slate-300">
            <p>No fields found. Add your first field!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2>{t('fields.addField') || 'Add Field'}</h2>
            <form onSubmit={handleAddField} className="space-y-4">
              <div className="form-group">
                <label>{t('fields.fieldName') || 'Field Name'}</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  required
                  placeholder="Enter field name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none"
                />
              </div>
              <div className="form-group">
                <label>{t('fields.location') || 'Location'}</label>
                <input
                  type="text"
                  value={newField.location}
                  onChange={(e) => setNewField({ ...newField, location: e.target.value })}
                  placeholder="Enter location"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none"
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none"
                />
              </div>
              <div className="form-group">
                <label>{t('fields.cropType') || 'Crop Type'}</label>
                <input
                  type="text"
                  value={newField.cropType}
                  onChange={(e) => setNewField({ ...newField, cropType: e.target.value })}
                  placeholder="Enter crop type"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none"
                />
              </div>
              <div className="modal-actions flex flex-wrap gap-3 justify-end pt-3">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fields
