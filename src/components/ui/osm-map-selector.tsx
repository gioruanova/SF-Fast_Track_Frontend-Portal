"use client"

import { useEffect, useState, useRef } from 'react'
import { Button } from './button'

// tipos para leaflet (carga dinamica)
declare global {
    interface Window {
        L: typeof import('leaflet')
    }
}

interface OSMMapSelectorProps {
    onLocationSelect: (lat: number, lng: number) => void
    onCancel?: () => void
    onAddressUpdate?: (address: string) => void
    initialPosition?: [number, number]
    initialAddress?: string
    readOnly?: boolean
    height?: string
}

export function OSMMapSelector({
    onLocationSelect,
    onCancel,
    onAddressUpdate,
    initialPosition,
    initialAddress,
    readOnly = false,
    height = "400px"
}: OSMMapSelectorProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [position, setPosition] = useState<[number, number] | null>(initialPosition || null)

    useEffect(() => {
        const loadOSMMap = () => {
            if (!mapRef.current || !window.L) return

            try {
                // limpiar mapa anterior
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove()
                    mapInstanceRef.current = null
                }

                // limpiar contenedor
                if (mapRef.current) {
                    mapRef.current.innerHTML = ''
                }

                // configurar tiles de openstreetmap
                const defaultCenter = position || [-34.6037, -58.3816] // Buenos Aires
                const zoom = 13

                // crear mapa con leaflet
                const map = window.L.map(mapRef.current).setView(defaultCenter, zoom)
                mapInstanceRef.current = map

                // agregar capa de tiles
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map)

                // agregar marcador
                const marker = window.L.marker(defaultCenter, {
                    draggable: !readOnly
                }).addTo(map)

                // configurar eventos de click
                if (!readOnly) {
                    map.on('click', (e: L.LeafletMouseEvent) => {
                        try {
                            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
                            marker.setLatLng(newPos)
                            setPosition(newPos)
                            // actualizar direccion con geocodificacion
                            reverseGeocode(newPos)
                        } catch (err) {
                            console.error('Error handling map click:', err)
                        }
                    })

                    // configurar eventos de arrastre
                    marker.on('dragend', (e: L.DragEndEvent) => {
                        try {
                            const newPos: [number, number] = [e.target.getLatLng().lat, e.target.getLatLng().lng]
                            setPosition(newPos)
                            // actualizar direccion con geocodificacion
                            reverseGeocode(newPos)
                        } catch (err) {
                            console.error('Error handling marker drag:', err)
                        }
                    })
                }

                // geocodificar direccion inicial
                if (initialAddress && !initialPosition) {
                    geocodeAddress(initialAddress, map, marker)
                }

                setIsLoading(false)
            } catch (err) {
                console.error('Error loading map:', err)
                setError('Error al cargar el mapa')
                setIsLoading(false)
            }
        }

        // cargar leaflet si no esta disponible
        const loadLeaflet = () => {
            if (window.L) {
                // leaflet ya esta cargado, esperar inicializacion
                setTimeout(() => {
                    if (window.L && typeof window.L.map === 'function') {
                        loadOSMMap()
                    } else {
                        setError('Error: Leaflet no está completamente cargado')
                        setIsLoading(false)
                    }
                }, 100)
                return
            }

            // cargar estilos
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)

            // cargar script
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = () => {
                // esperar inicializacion completa
                setTimeout(() => {
                    if (window.L && typeof window.L.map === 'function') {
                        // configuracion necesaria para iconos de leaflet
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        delete (window.L.Icon.Default.prototype as any)._getIconUrl
                        window.L.Icon.Default.mergeOptions({
                            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        })
                        loadOSMMap()
                    } else {
                        setError('Error: Leaflet no se cargó correctamente')
                        setIsLoading(false)
                    }
                }, 200)
            }
            script.onerror = () => {
                setError('Error al cargar el mapa')
                setIsLoading(false)
            }
            document.head.appendChild(script)
        }

        loadLeaflet()

        // limpiar mapa al desmontar componente
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [initialPosition, initialAddress, readOnly]) // eslint-disable-line react-hooks/exhaustive-deps

    const geocodeAddress = async (address: string, map: L.Map, marker: L.Marker) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            )
            const data = await response.json()

            if (data && data.length > 0) {
                const { lat, lon } = data[0]
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)]

                // verificar que sea el mapa actual
                if (map === mapInstanceRef.current && map && typeof map.setView === 'function') {
                    try {
                        map.setView(newPos, 15)
                        if (marker && typeof marker.setLatLng === 'function') {
                            marker.setLatLng(newPos)
                        }
                        setPosition(newPos)
                    } catch (err) {
                        console.error('Error setting map position:', err)
                        // solo actualizar posicion
                        setPosition(newPos)
                    }
                } else {
                    // si el mapa no es el actual, solo actualizar la posicion
                    setPosition(newPos)
                }
            }
        } catch (err) {
            console.error('Error geocoding:', err)
        }
    }

    const reverseGeocode = async (position: [number, number]) => {
        if (!onAddressUpdate) return

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&addressdetails=1`
            )
            const data = await response.json()

            if (data && data.display_name) {
                // extraer solo la direccion sin el pais y codigo postal
                const address = data.display_name
                    .split(',')
                    .slice(0, -2) // remover pais y codigo postal
                    .join(',')
                    .trim()

                onAddressUpdate(address)
            }
        } catch (err) {
            console.error('Error reverse geocoding:', err)
        }
    }

    const handleConfirmLocation = () => {
        if (position) {
            onLocationSelect(position[0], position[1])
        }
    }

    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            setError('Geolocalización no soportada')
            return
        }

        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos: [number, number] = [position.coords.latitude, position.coords.longitude]
                setPosition(pos)
                setIsLoading(false)
            },
            () => {
                setError('Error al obtener ubicación actual')
                setIsLoading(false)
            }
        )
    }

    // manejar eventos de teclado para evitar errores
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onCancel) {
                e.preventDefault()
                onCancel()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onCancel])

    return (
        <div className="w-full" style={{ height }}>
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground p-2 rounded text-sm z-10">
                    {error}
                </div>
            )}

            <div className="relative w-full h-full">
                <div ref={mapRef} className="w-full h-full rounded-lg" />

                {!readOnly && (
                    <div className="absolute bottom-4 left-4 bg-background p-3 rounded shadow text-sm max-w-xs z-20 hidden md:block">
                        <p className="font-medium mb-1">Instrucciones:</p>
                        <p>• Haz clic en el mapa para seleccionar ubicación</p>
                        <p>• Arrastra el marcador para ajustar la posición</p>
                        <p>• Usa los controles para hacer zoom</p>
                    </div>
                )}

                {!readOnly && (
                    <div className="absolute top-4 right-4 z-20">
                        <Button
                            onClick={getCurrentPosition}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
                            📍 Mi ubicación
                        </Button>
                    </div>
                )}

                {!readOnly && onCancel && (
                    <div className="absolute bottom-2 right-0  px-2 md:px-0 md:bottom-4 md:right-4 z-[1000] flex gap-2">
                        <Button
                            onClick={onCancel}
                            variant="secondary"
                            size="sm"
                            className="bg-background/90 backdrop-blur-sm text-xs md:text-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmLocation}
                            disabled={!position}
                            size="sm"
                            className="bg-primary/90 backdrop-blur-sm text-xs md:text-sm"
                        >
                            Confirmar Ubicación
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
