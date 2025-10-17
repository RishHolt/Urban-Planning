import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
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

interface LocationViewerProps {
  latitude: number;
  longitude: number;
  height?: string;
  showPopup?: boolean;
  popupContent?: React.ReactNode;
  zoom?: number;
  showZones?: boolean;
  projectType?: string;
  onZoneValidation?: (isValid: boolean, zoneInfo: any) => void;
}

const LocationViewer: React.FC<LocationViewerProps> = ({
  latitude,
  longitude,
  height = '300px',
  showPopup = true,
  popupContent,
  zoom = 17,
  showZones = true,
  projectType,
  onZoneValidation
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoneTypes, setZoneTypes] = useState<any[]>([]);
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [zoneValidation, setZoneValidation] = useState<{
    isValid: boolean;
    message: string;
    zoneInfo: any;
  } | null>(null);
  const position: [number, number] = [latitude, longitude];

  // Fetch zones and zone types data
  useEffect(() => {
    if (showZones) {
      setLoading(true);
      Promise.all([
        fetch('/api/zoning/zones?cityId=caloocan').then(res => res.json()),
        fetch('/api/zoning/zone-types?cityId=caloocan').then(res => res.json())
      ])
        .then(([zonesData, zoneTypesData]) => {
          setZones(zonesData);
          setZoneTypes(zoneTypesData);
          setLoading(false);
          
          // Perform zone validation
          validateLocationInZone(zonesData, zoneTypesData);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setLoading(false);
        });
    }
  }, [showZones, latitude, longitude, projectType]);

  // Function to check if a point is inside a polygon
  const isPointInPolygon = (point: [number, number], polygon: number[][]) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // Validate if the project location is in the correct zone
  const validateLocationInZone = (zonesData: Zone[], zoneTypesData: any[]) => {
    const point: [number, number] = [longitude, latitude]; // Note: GeoJSON uses [lng, lat]
    
    // Find which zone contains this point
    let containingZone = null;
    for (const zone of zonesData) {
      if (zone.coordinates && zone.coordinates.geometry) {
        const coordinates = zone.coordinates.geometry.coordinates[0];
        if (isPointInPolygon(point, coordinates)) {
          containingZone = zone;
          break;
        }
      }
    }

    if (containingZone) {
      // Find the zone type information
      const zoneType = zoneTypesData.find(zt => zt.id === containingZone.typeId);
      
      setCurrentZone({
        ...containingZone,
        zoneType: zoneType
      });

      // Check if project type is compatible with zone type
      const isCompatible = checkProjectZoneCompatibility(projectType, zoneType?.name);
      
      const validation = {
        isValid: isCompatible,
        message: isCompatible 
          ? `Project is in ${zoneType?.name || 'Unknown'} zone - Compatible`
          : `Project type "${projectType}" is not compatible with ${zoneType?.name || 'Unknown'} zone`,
        zoneInfo: {
          zone: containingZone,
          zoneType: zoneType
        }
      };
      
      setZoneValidation(validation);
      
      // Call the callback if provided
      if (onZoneValidation) {
        onZoneValidation(validation.isValid, validation.zoneInfo);
      }
    } else {
      const validation = {
        isValid: false,
        message: 'Project location is not within any defined zone',
        zoneInfo: null
      };
      
      setZoneValidation(validation);
      setCurrentZone(null);
      
      if (onZoneValidation) {
        onZoneValidation(false, null);
      }
    }
  };

  // Check if project type is compatible with zone type
  const checkProjectZoneCompatibility = (projectType: string | undefined, zoneTypeName: string | undefined) => {
    if (!projectType || !zoneTypeName) return false;
    
    const compatibilityMap: { [key: string]: string[] } = {
      'Residential': ['Residential', 'Mixed Use'],
      'Commercial': ['Commercial', 'Mixed Use', 'Business'],
      'Industrial': ['Industrial', 'Manufacturing'],
      'Agricultural': ['Agricultural', 'Rural'],
      'Mixed Use': ['Mixed Use', 'Residential', 'Commercial'],
      'Institutional': ['Institutional', 'Public', 'Mixed Use'],
      'Recreational': ['Recreational', 'Open Space', 'Mixed Use']
    };
    
    const compatibleZones = compatibilityMap[projectType] || [];
    return compatibleZones.some(zone => 
      zoneTypeName.toLowerCase().includes(zone.toLowerCase())
    );
  };

  const defaultPopupContent = (
    <div className="text-center min-w-48">
      <p className="font-medium">Application Location</p>
      <p className="text-sm text-gray-600">
        Lat: {latitude.toFixed(6)}
      </p>
      <p className="text-sm text-gray-600">
        Lng: {longitude.toFixed(6)}
      </p>
      {projectType && (
        <p className="text-sm font-medium text-blue-600 mt-1">
          Project Type: {projectType}
        </p>
      )}
      {currentZone && (
        <div className="mt-2 p-2 bg-gray-50 rounded">
          <p className="text-xs font-medium">Current Zone:</p>
          <p className="text-xs text-gray-600">{currentZone.name}</p>
          <p className="text-xs text-gray-500">{currentZone.zoneType?.name}</p>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="border border-gray-300 rounded-lg overflow-hidden relative z-0"
      style={{ height }}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
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
                fillOpacity: 0.3,
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
        
        {/* Application location marker */}
        <Marker position={position}>
          {showPopup && (
            <Popup>
              {popupContent || defaultPopupContent}
            </Popup>
          )}
        </Marker>
      </MapContainer>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
          Loading zones...
        </div>
      )}
      
    </div>
  );
};

export default LocationViewer;
