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
    <div className="fields-page">
      <div className="page-header glass">
        <h1>{t('farm.title') || 'My Fields'}</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('dashboard.admin.search') || 'Search fields...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FaPlus /> {t('farm.addField') || 'Add Field'}
          </button>
        </div>
      </div>

      <div className="fields-grid">
        {filteredFields.length > 0 ? (
          filteredFields.map((field, index) => (
            <motion.div
              key={field.id || index}
              className="field-card glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="field-header">
                <h3>{field.name}</h3>
                <div className="field-actions">
                  <button className="icon-btn" title={t('farm.viewField') || 'View'}>
                    <FaEye />
                  </button>
                  <button className="icon-btn" title={t('farm.editField') || 'Edit'}>
                    <FaEdit />
                  </button>
                  <button 
                    className="icon-btn danger" 
                    title={t('farm.deleteField') || 'Delete'}
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="field-details">
                <p><strong>{t('farm.location') || 'Location'}:</strong> {field.location || 'N/A'}</p>
                <p><strong>{t('farm.size') || 'Size'}:</strong> {field.size || 0} ha</p>
                <p><strong>{t('farm.cropType') || 'Crop Type'}:</strong> {field.cropType || 'N/A'}</p>
                <p><strong>{t('farm.soilHealth') || 'Soil Health'}:</strong> {field.soilHealth || 'Unknown'}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-data glass">
            <p>No fields found. Add your first field!</p>
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2>{t('farm.addField') || 'Add Field'}</h2>
            <form onSubmit={handleAddField}>
              <div className="form-group">
                <label>{t('farm.fieldName') || 'Field Name'}</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                  required
                  placeholder="Enter field name"
                />
              </div>
              <div className="form-group">
                <label>{t('farm.location') || 'Location'}</label>
                <input
                  type="text"
                  value={newField.location}
                  onChange={(e) => setNewField({...newField, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              <div className="form-group">
                <label>{t('farm.size') || 'Size (hectares)'}</label>
                <input
                  type="number"
                  value={newField.size}
                  onChange={(e) => setNewField({...newField, size: e.target.value})}
                  required
                  placeholder="Enter size in hectares"
                />
              </div>
              <div className="form-group">
                <label>{t('farm.cropType') || 'Crop Type'}</label>
                <input
                  type="text"
                  value={newField.cropType}
                  onChange={(e) => setNewField({...newField, cropType: e.target.value})}
                  placeholder="Enter crop type"
                />
              </div>
              <div className="modal-actions">
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
