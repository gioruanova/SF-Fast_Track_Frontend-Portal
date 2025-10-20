"use client"

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './button'

// Configuración necesaria para que los iconos de Leaflet funcionen correctamente
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void
  onCancel?: () => void
  initialPosition?: [number, number]
  initialAddress?: string
  readOnly?: boolean
  height?: string
}

interface LocationMarkerProps {
  position: [number, number] | null
  setPosition: (position: [number, number] | null) => void
  onLocationSelect: (lat: number, lng: number) => void
  readOnly?: boolean
}

function LocationMarker({ position, setPosition, readOnly }: LocationMarkerProps) {
  const map = useMap()
  
  useMapEvents({
    click(e) {
      if (!readOnly) {
        const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng]
        setPosition(newPosition)
        // Centrar el mapa en la nueva posición
        map.setView(e.latlng, map.getZoom())
      }
    },
  })

  // Crear un marcador personalizado más grande y visible
  const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [25, 41], // Tamaño original del icono
    iconAnchor: [12, 41], // Punto de anclaje correcto
    popupAnchor: [0, -41],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  })

  return (
    <Marker 
      position={position || [0, 0]} 
      icon={customIcon}
      draggable={!readOnly}
      eventHandlers={{
        dragend: (e) => {
          if (!readOnly) {
            const marker = e.target
            const newPosition: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng]
            setPosition(newPosition)
          }
        }
      }}
    >
    </Marker>
  )
}

export function MapSelector({ onLocationSelect, onCancel, initialPosition, initialAddress, readOnly = false, height = '100%' }: MapSelectorProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || null
  )
  
  // Si no hay posición inicial, usar la posición por defecto
  const defaultPosition: [number, number] = [-34.6037, -58.3816]
  const currentPosition = position || defaultPosition
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Geocodificación usando Nominatim (gratuito)
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ar`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newPosition: [number, number] = [parseFloat(lat), parseFloat(lon)]
        setPosition(newPosition)
        // NO llamamos onLocationSelect aquí, solo actualizamos la posición
      } else {
        setError('No se pudo encontrar la dirección')
      }
    } catch (err) {
      setError('Error al geocodificar la dirección')
      console.error('Geocoding error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Si hay una dirección inicial, geocodificar (solo si no es readOnly)
  useEffect(() => {
    if (initialAddress && !initialPosition && !readOnly) {
      geocodeAddress(initialAddress)
    }
  }, [initialAddress, initialPosition, readOnly, geocodeAddress])



  return (
    <div className="w-full relative overflow-hidden" style={{ height }}>
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
      <MapContainer
        center={currentPosition}
        zoom={position ? 15 : 10}
        style={{ 
          height: '100%', 
          width: '100%', 
          zIndex: 1,
          background: '#f0f0f0'
        }}
        key={position ? `${position[0]}-${position[1]}` : 'default'}
        scrollWheelZoom={!readOnly}
        doubleClickZoom={!readOnly}
        zoomControl={!readOnly}
        dragging={!readOnly}
        attributionControl={false}
        whenReady={() => setMapLoaded(true)}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
          readOnly={readOnly}
        />
      </MapContainer>
      
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Buscando dirección...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {!readOnly && (
        <div className="absolute bottom-4 left-4 bg-background p-3 rounded shadow text-sm max-w-xs z-20 hidden md:block">
          <p className="font-medium mb-1">Instrucciones:</p>
          <p>• Haz clic en el mapa para seleccionar ubicación</p>
          <p>• Arrastra el marcador para ajustar la posición</p>
          <p>• Usa los controles para hacer zoom</p>
        </div>
      )}

      
      {!readOnly && onCancel && (
        <div 
        className="
        absolute 
        bottom-0
        md:bottom-4 
        md:right-4 
        right-0
        
        
        md:p-2
        p-1
        w-full
        md:w-auto
        flex 
        gap-0.5 
        md:gap-2 
        z-20 
        flex-wrap 
        justify-between 
        md:justify-start">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="md:p-2 px-2 py-0.5  text-xs md:text-sm"
            
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (currentPosition) {
                onLocationSelect(currentPosition[0], currentPosition[1])
              }
            }}
            disabled={!currentPosition}
            variant="default"
            className="md:p-2 px-2 py-0.5 text-xs md:text-sm"
            
          >
            Confirmar Ubicación
          </Button>
        </div>
      )}
    </div>
  )
}
