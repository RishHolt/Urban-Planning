import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Zone {
  id: string;
  name: string;
  typeId: string;
  color: string;
  coordinates: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    properties: {
      name: string;
      area: string;
      description: string;
    };
  } | null;
  area: string;
  cityId: string;
  description: string;
}

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readonly?: boolean;
  height?: string;
  searchPlaceholder?: string;
  showZones?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = 14.6511, // Caloocan coordinates
  initialLng = 120.9900,
  onLocationSelect,
  readonly = false,
  height = '400px',
  searchPlaceholder = 'Search for location...',
  showZones = true
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const mapRef = useRef<L.Map>(null);

  // Fetch zones data
  useEffect(() => {
    if (showZones) {
      setLoadingZones(true);
      fetch('/api/zoning/zones?cityId=caloocan')
        .then(response => response.json())
        .then(data => {
          setZones(data);
          setLoadingZones(false);
        })
        .catch(error => {
          console.error('Error fetching zones:', error);
          setLoadingZones(false);
        });
    }
  }, [showZones]);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (!readonly) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }
      },
    });
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ph`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPosition);
        onLocationSelect(parseFloat(lat), parseFloat(lon));
        
        // Center map on found location
        if (mapRef.current) {
          mapRef.current.setView(newPosition, 15);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={searchPlaceholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={readonly}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || readonly}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Map */}
      <div 
        className="border border-gray-300 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <MapContainer
          center={position}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render zones */}
          {showZones && zones.map((zone) => {
            if (!zone.coordinates || !zone.coordinates.geometry) {
              return null;
            }
            
            // Extract coordinates from GeoJSON format
            const coordinates = zone.coordinates.geometry.coordinates[0];
            const positions = coordinates.map(coord => [coord[1], coord[0]] as [number, number]); // Note: GeoJSON is [lng, lat], Leaflet expects [lat, lng]
            
            return (
              <Polygon
                key={zone.id}
                positions={positions}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-center">
                    <div className="font-semibold text-sm">{zone.name}</div>
                    <div className="text-xs text-gray-600">{zone.area}</div>
                    <div className="text-xs text-gray-500">{zone.description}</div>
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}
          
          <Marker position={position}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Selected Location</p>
                <p className="text-sm text-gray-600">
                  Lat: {position[0].toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  Lng: {position[1].toFixed(6)}
                </p>
                {!readonly && (
                  <p className="text-xs text-blue-600 mt-1">
                    Click anywhere to change location
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
          <MapEvents />
        </MapContainer>
        
        {/* Loading indicator */}
        {loadingZones && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
            Loading zones...
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      <div className="bg-gray-50 p-3 rounded-md">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Coordinates:</span>
          <div className="flex gap-4">
            <span>Lat: {position[0].toFixed(6)}</span>
            <span>Lng: {position[1].toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
