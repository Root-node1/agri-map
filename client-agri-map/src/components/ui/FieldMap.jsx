import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapController = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

const FieldMap = ({
  center = [-1.2864, 36.8172],
  zoom = 12,
  markers = [],
  boundary = null,
  satellite = false,
  height = '400px',
  className = '',
}) => {
  const tileUrl = satellite
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <div
      className={`rounded-[1.5rem] overflow-hidden border border-emerald-500/30 shadow-xl ${className}`}
      style={{ height }}
      role="application"
      aria-label="Interactive field map"
    >
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <MapController center={center} zoom={zoom} />
        <TileLayer
          attribution={satellite ? '&copy; Esri' : '&copy; OpenStreetMap'}
          url={tileUrl}
        />
        {boundary && (
          <Polygon
            positions={boundary}
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.25, weight: 2 }}
          />
        )}
        {markers.map((m, i) => (
          <Marker key={m.id || i} position={[m.lat, m.lng]}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default FieldMap
