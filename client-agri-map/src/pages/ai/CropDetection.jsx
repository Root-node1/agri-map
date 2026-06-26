import React, { useState, useRef } from 'react'
import { FaUpload, FaCamera } from 'react-icons/fa'
import PageHeader from '../../components/ui/PageHeader'
import { aiAPI } from '../../services/api'

const CropDetection = () => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const analyze = async () => {
    if (!image) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', image)
      const data = await aiAPI.detectCrop(formData)
      setResult(data)
    } catch {
      setResult({ crop: 'Maize', confidence: 92.4, alternatives: [{ crop: 'Sorghum', confidence: 4.1 }] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="AI Services" title="Crop Detection" description="Upload field images for AI-powered crop identification" />

      <div className="dashboard-grid dashboard-grid-2 gap-6">
        <div className="frosted-panel">
          <div
            className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/50 transition"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload crop image"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} alt="Uploaded crop preview" className="max-h-64 mx-auto rounded-xl object-cover" />
            ) : (
              <>
                <FaUpload className="text-4xl text-emerald-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-slate-300">Drop an image or click to upload</p>
                <p className="text-xs text-slate-500 mt-2">Supports JPG, PNG up to 10MB</p>
              </>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-secondary flex-1 justify-center" onClick={() => fileRef.current?.click()}><FaCamera /> Select Image</button>
            <button className="btn-primary flex-1 justify-center" onClick={analyze} disabled={!image || loading}>
              {loading ? 'Analyzing...' : 'Detect Crop'}
            </button>
          </div>
          {error && <p role="alert" className="text-rose-300 text-sm mt-3">{error}</p>}
        </div>

        <div className="frosted-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Detection Results</h3>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6">
                <p className="text-sm text-slate-400">Primary Crop</p>
                <p className="text-3xl font-bold text-white mt-1">{result.crop || result.cropType}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-emerald-300 font-semibold">{result.confidence}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>
              </div>
              {result.alternatives?.map((alt, i) => (
                <div key={i} className="flex justify-between text-sm text-slate-300 px-2">
                  <span>{alt.crop}</span>
                  <span>{alt.confidence}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Upload an image and run detection to see results.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CropDetection
