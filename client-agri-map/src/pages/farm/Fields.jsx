import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiSearch,
  FiGrid,
  FiList,
  FiAlertCircle,
  FiLoader,
  FiX,
  FiMapPin,
  FiCalendar,
  FiLayers,
} from 'react-icons/fi'
import PageHeader from '../../components/ui/PageHeader'
import { CardGridSkeleton } from '../../components/ui/Skeletons'
import { EmptyState, ErrorState } from '../../components/ui/StateViews'
import { fieldAPI } from '../../services/api'
import { demoFields } from '../../lib/demoData'
import { useStaggerReveal, useOverlayMotion, useMotionConfig } from '../../lib/motion'

/* Health indicator — colour plus an explicit label, so the state is never
   communicated by colour alone. Health is derived at render time only. */
const getHealthMeta = (health) => {
  const value = health ?? 85
  if (value > 70) {
    return {
      value,
      label: 'Healthy',
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500',
    }
  }
  if (value > 40) {
    return {
      value,
      label: 'Watch',
      badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
    }
  }
  return {
    value,
    label: 'At risk',
    badge: 'bg-red-500/15 text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
  }
}

const HealthBadge = ({ health }) => {
  const meta = getHealthMeta(health)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.value}%
      <span className="font-normal opacity-80">· {meta.label}</span>
    </span>
  )
}

const Fields = () => {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCrop, setFilterCrop] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newField, setNewField] = useState({ name: '', location: '', size: '', cropType: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const gridReveal = useStaggerReveal({ step: 0.055 })
  const overlay = useOverlayMotion()
  const { prefersReducedMotion } = useMotionConfig()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fieldAPI
      .getAll()
      .then((data) => {
        if (cancelled) return
        setFields(Array.isArray(data) ? data : data?.fields || demoFields)
      })
      .catch(() => {
        if (cancelled) return
        // The page still functions on demo data, but the user is told the
        // live fetch failed instead of being left to assume it succeeded.
        setLoadError(true)
        setFields(demoFields)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const crops = ['all', ...new Set(fields.map((f) => f.cropType).filter(Boolean))]

  const filteredFields = fields.filter((field) => {
    const matchSearch =
      field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.cropType?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCrop = filterCrop === 'all' || field.cropType === filterCrop
    return matchSearch && matchCrop
  })

  const hasActiveFilters = searchTerm.trim() !== '' || filterCrop !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCrop('all')
  }

  const handleAddField = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fieldAPI.create(newField)
    } catch (error) {
      console.error('Error adding field:', error)
    }
    setFields((prev) => [...prev, { ...newField, id: Date.now(), health: 85, soilHealth: 'Good' }])
    setSubmitting(false)
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

  return (
    <div className="page-shell page-shell-dark">
      <PageHeader
        eyebrow="Field Management"
        title="My Fields"
        description="Track field details, crop health, and satellite insights"
        actions={
          <motion.button
            type="button"
            onClick={() => setShowAddModal(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary agrimap-focus"
          >
            <FiPlus size={15} aria-hidden="true" /> Add Field
          </motion.button>
        }
      />

      {/* ----------------------------------------------------------------
          Toolbar — search, crop filter, view switch
          ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 group">
          <FiSearch
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search fields by name or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-3xl input-floating text-slate-800 dark:text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 focus-visible:outline-none transition-colors duration-200"
            aria-label="Search fields"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-4 py-3 rounded-3xl input-floating text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus-visible:outline-none transition-colors"
            aria-label="Filter by crop"
          >
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop === 'all' ? 'All Crops' : crop}
              </option>
            ))}
          </select>

          {/* View switch — announced as a toggle group with pressed state */}
          <div
            className="flex rounded-3xl overflow-hidden border-white/10 bg-white/5"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`px-4 py-3 transition-colors duration-200 agrimap-focus ${
                viewMode === 'grid'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              aria-label="Grid view"
            >
              <FiGrid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`px-4 py-3 transition-colors duration-200 agrimap-focus ${
                viewMode === 'list'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              aria-label="List view"
            >
              <FiList size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Non-fatal load error: data is stale/demo but the page still works */}
      {loadError && !loading && (
        <div className="mb-6">
          <ErrorState
            title="Live field data unavailable"
            description="We could not reach the field service, so the fields below are sample data. Retry to load your own records."
            onRetry={() => setReloadKey((k) => k + 1)}
            helpHref={null}
          />
        </div>
      )}

      {/* ----------------------------------------------------------------
          Content — skeleton, empty, or results
          ---------------------------------------------------------------- */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredFields.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={FiSearch}
            title="No fields match your filters"
            description={
              searchTerm
                ? `Nothing matched “${searchTerm}”. Try a different name or crop.`
                : 'No fields match the selected crop. Try another filter.'
            }
            action={
              <button type="button" onClick={clearFilters} className="btn-secondary agrimap-focus">
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={FiMapPin}
            title="No fields yet"
            description="Add your first field to start tracking crop health, soil data and satellite insights for it."
            action={
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn-primary agrimap-focus"
              >
                <FiPlus size={15} aria-hidden="true" /> Add Your First Field
              </button>
            }
          />
        )
      ) : viewMode === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={gridReveal.container}
          initial="hidden"
          animate="visible"
        >
          {filteredFields.map((field) => {
            const meta = getHealthMeta(field.health)
            return (
              <motion.article
                key={field.id}
                variants={gridReveal.item}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="frosted-panel hover:border-emerald-500/30 transition-colors flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-white leading-tight min-w-0 break-words">
                    {field.name}
                  </h3>
                  <div className="flex gap-1 shrink-0">
                    <Link
                      to={`/fields/${field.id}`}
                      className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors agrimap-focus"
                      aria-label={`View ${field.name}`}
                    >
                      <FiEye size={15} aria-hidden="true" />
                    </Link>
                    <Link
                      to={`/fields/${field.id}/edit`}
                      className="p-2 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors agrimap-focus"
                      aria-label={`Edit ${field.name}`}
                    >
                      <FiEdit2 size={15} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors agrimap-focus"
                      aria-label={`Delete ${field.name}`}
                    >
                      <FiTrash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Labelled definition list rather than "Crop: —" inline pairs */}
                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <FiLayers size={14} className="text-slate-500 shrink-0" aria-hidden="true" />
                    <dt className="text-slate-500">Crop</dt>
                    <dd className="text-slate-200 ml-auto">{field.cropType || 'Not set'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin size={14} className="text-slate-500 shrink-0" aria-hidden="true" />
                    <dt className="text-slate-500">Location</dt>
                    <dd className="text-slate-200 ml-auto text-right">
                      {field.location || 'Not set'}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} className="text-slate-500 shrink-0" aria-hidden="true" />
                    <dt className="text-slate-500">Size</dt>
                    <dd className="text-slate-200 ml-auto">{field.size || 'Not set'}</dd>
                  </div>
                </dl>

                <div className="mt-4 pt-4 border-t border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Crop health
                    </span>
                    <HealthBadge health={field.health} />
                  </div>
                  {/* Health bar — animates in, static under reduced motion */}
                  <div
                    className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden"
                    role="img"
                    aria-label={`${meta.label}, ${meta.value} percent`}
                  >
                    <motion.span
                      className={`block h-full rounded-full ${meta.bar}`}
                      initial={{ width: prefersReducedMotion ? `${meta.value}%` : 0 }}
                      animate={{ width: `${meta.value}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      ) : (
        <motion.div
          className="frosted-panel overflow-x-auto"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <table className="w-full text-left">
            <caption className="sr-only">Your fields with crop, location, size and health</caption>
            <thead className="border-b border-white/10">
              <tr>
                <th scope="col" className="py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Name</th>
                <th scope="col" className="py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Crop</th>
                <th scope="col" className="py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Location</th>
                <th scope="col" className="py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Size</th>
                <th scope="col" className="py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Health</th>
                <th scope="col" className="py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filteredFields.map((field) => (
                  <motion.tr
                    key={field.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{field.name}</td>
                    <td className="py-3 px-4 text-slate-300">{field.cropType || '—'}</td>
                    <td className="py-3 px-4 text-slate-300">{field.location || '—'}</td>
                    <td className="py-3 px-4 text-slate-300">{field.size || '—'}</td>
                    <td className="py-3 px-4">
                      <HealthBadge health={field.health} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Link
                          to={`/fields/${field.id}`}
                          className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors agrimap-focus"
                          aria-label={`View ${field.name}`}
                        >
                          <FiEye size={15} aria-hidden="true" />
                        </Link>
                        <Link
                          to={`/fields/${field.id}/edit`}
                          className="p-2 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors agrimap-focus"
                          aria-label={`Edit ${field.name}`}
                        >
                          <FiEdit2 size={15} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors agrimap-focus"
                          aria-label={`Delete ${field.name}`}
                        >
                          <FiTrash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------
          Add Field modal
          ---------------------------------------------------------------- */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            {...overlay.backdrop}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-field-title"
              className="frosted-panel relative w-full max-w-md p-6 rounded-2xl"
              {...overlay.panel}
            >
              <div className="flex items-start justify-between mb-5">
                <h2 id="add-field-title" className="text-xl font-bold text-white">
                  Add New Field
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors agrimap-focus"
                  aria-label="Close dialog"
                >
                  <FiX size={18} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleAddField}>
                <div className="space-y-3.5">
                  {[
                    { key: 'name', label: 'Field Name', placeholder: 'Green Valley', required: true },
                    { key: 'cropType', label: 'Crop Type', placeholder: 'Maize' },
                    { key: 'location', label: 'Location', placeholder: 'Central Kenya' },
                    { key: 'size', label: 'Size', placeholder: '5 ha' },
                  ].map(({ key, label, placeholder, required }) => (
                    <div key={key}>
                      <label
                        htmlFor={`new-field-${key}`}
                        className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 mb-1.5"
                      >
                        {label}
                        {!required && <span className="text-slate-500 normal-case tracking-normal font-normal"> · optional</span>}
                      </label>
                      <input
                        id={`new-field-${key}`}
                        type="text"
                        placeholder={placeholder}
                        value={newField[key]}
                        onChange={(e) => setNewField({ ...newField, [key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 focus-visible:outline-none transition-colors duration-200"
                        required={required}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={submitting ? undefined : { y: -1 }}
                    whileTap={submitting ? undefined : { scale: 0.98 }}
                    className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed agrimap-focus"
                  >
                    {submitting ? (
                      <>
                        <FiLoader size={15} className="animate-spin" aria-hidden="true" />
                        Adding...
                      </>
                    ) : (
                      'Add Field'
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary flex-1 justify-center agrimap-focus"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Fields
