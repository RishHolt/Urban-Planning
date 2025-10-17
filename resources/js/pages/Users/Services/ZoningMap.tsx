import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { MapPin, Search, Filter, Layers, Info, Home, Building, Factory, TreePine, Car, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAppearance } from '../../../hooks/use-appearance';
import { PageHeader, Button, Card, Badge } from '../../../components';
import { apiService, type User as ApiUser } from '../../../lib/api';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { MapContainer, TileLayer, useMap, Marker, Popup, GeoJSON } from 'react-leaflet';
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
  id: number;
  name: string;
  type: string;
  color: string;
  coordinates: Array<[number, number]>;
  description: string;
  regulations: string[];
}

interface ZoneType {
  id: number;
  name: string;
  color: string;
  description: string;
}

// Caloocan City coordinates
const caloocanCenter: [number, number] = [14.7054, 121.0154];

// Component to render zones on the map using Leaflet directly (like Admin version)
const ZoneRenderer: React.FC<{ zones: Zone[]; onZoneClick: (zone: Zone) => void }> = ({ zones, onZoneClick }) => {
  const map = useMap();
  const zoneLayersRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  
  console.log('🗺️ ZoneRenderer received zones:', zones.length);
  
  useEffect(() => {
    if (!map) {
      console.log(`❌ Map not available in ZoneRenderer`);
      return;
    }
    
    console.log(`✅ Map available in ZoneRenderer, processing ${zones.length} zones`);
    const zoneLayers = zoneLayersRef.current;
    
    // Clear existing layers
    zoneLayers.clearLayers();
    
    // Add zone layers to map if not already added
    if (!map.hasLayer(zoneLayers)) {
      console.log(`🔄 Adding feature group to map...`);
      map.addLayer(zoneLayers);
      console.log(`✅ Feature group added to map`);
    } else {
      console.log(`✅ Feature group already on map`);
    }
    
    zones.forEach((zone) => {
      console.log(`🗺️ Processing zone ${zone.id} (${zone.name}):`, {
        hasCoordinates: !!zone.coordinates,
        coordinatesLength: zone.coordinates?.length,
        coordinates: zone.coordinates
      });
      
      // Check if coordinates are valid (exist, are array, and have content)
      const hasValidCoordinates = zone.coordinates && 
        Array.isArray(zone.coordinates) && 
        zone.coordinates.length > 0;
        
      console.log(`🔍 Zone ${zone.id} coordinate validation:`, {
        coordinates: zone.coordinates,
        isArray: Array.isArray(zone.coordinates),
        length: zone.coordinates?.length,
        hasValidCoordinates: hasValidCoordinates
      });
      
      if (!hasValidCoordinates) {
        console.log(`❌ Zone ${zone.id} has no valid coordinates, creating fallback zone`);
        
        // Create a fallback zone with visible coordinates around Caloocan
        const fallbackCoordinates: [number, number][] = [
          [121.0100, 14.7000],
          [121.0110, 14.7000],
          [121.0110, 14.7010],
          [121.0100, 14.7010],
          [121.0100, 14.7000]
        ];
        
        const fallbackGeoJsonData = {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [fallbackCoordinates]
          },
          properties: {
            id: zone.id,
            name: zone.name + ' (Fallback)',
            type: zone.type,
            color: zone.color,
            description: zone.description + ' - No coordinates available, showing approximate location'
          }
        };

        console.log(`✅ Creating fallback GeoJSON for zone ${zone.id}:`, fallbackGeoJsonData);

        // Create layer from GeoJSON using Leaflet directly
        const layer = L.geoJSON(fallbackGeoJsonData, {
          style: {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.5,
            weight: 3,
            dashArray: '5, 5' // Dashed line to indicate it's a fallback
          }
        });
        
        // Add click handler
        layer.on('click', () => {
          console.log(`🖱️ Fallback zone ${zone.id} clicked`);
          onZoneClick(zone);
        });
        
        // Add to feature group
        zoneLayers.addLayer(layer);
        console.log(`🎯 Added fallback zone ${zone.id} to map`);
        
      } else {
        // Convert coordinates to GeoJSON format
        // API returns coordinates as [lng, lat] and Leaflet GeoJSON also expects [lng, lat] - no swapping needed
        console.log(`🔄 Original coordinates for zone ${zone.id}:`, zone.coordinates);
        
        const geoJsonData = {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [zone.coordinates]
          },
          properties: {
            id: zone.id,
            name: zone.name,
            type: zone.type,
            color: zone.color,
            description: zone.description
          }
        };

        console.log(`✅ Creating GeoJSON for zone ${zone.id}:`, geoJsonData);

        // Create layer from GeoJSON using Leaflet directly
        console.log(`🔄 Creating Leaflet layer for zone ${zone.id}...`);
        const layer = L.geoJSON(geoJsonData, {
          style: {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.3,
            weight: 2
          }
        });
        
        // Make sure the layer is visible
        layer.setStyle({
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.5, // Increased opacity for better visibility
          weight: 3, // Increased weight for better visibility
          opacity: 1
        });
        
        console.log(`🔄 Layer created for zone ${zone.id}:`, layer);
        console.log(`🔄 Layer bounds:`, layer.getBounds());
        
        // Add click handler
        layer.on('click', () => {
          console.log(`🖱️ Zone ${zone.id} clicked`);
          onZoneClick(zone);
        });
        
        // Add to feature group
        console.log(`🔄 Adding layer to feature group for zone ${zone.id}...`);
        zoneLayers.addLayer(layer);
        
        // Debug marker removed for cleaner display
        
        console.log(`🎯 Added zone ${zone.id} to map`);
        console.log(`🔄 Feature group layer count:`, zoneLayers.getLayers().length);
      }
    });
    
    console.log(`✅ ZoneRenderer: Added ${zones.length} zones to map`);
    
    // Cleanup function
    return () => {
      if (map.hasLayer(zoneLayers)) {
        map.removeLayer(zoneLayers);
      }
    };
  }, [map, zones, onZoneClick]);
  
  return null; // This component doesn't render anything directly
};

// Map Reference Capture Component
const MapReferenceCapture: React.FC<{ mapRef: React.MutableRefObject<L.Map | null> }> = ({ mapRef }) => {
  const map = useMap();
  
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  
  return null;
};

// Coordinates Indicator Component
const CoordinatesIndicator: React.FC = () => {
  const map = useMap();
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!map) return;

    const handleMouseMove = (e: any) => {
      setCoordinates({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    };

    const handleMouseOut = () => {
      setCoordinates(null);
    };

    map.on('mousemove', handleMouseMove);
    map.on('mouseout', handleMouseOut);

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('mouseout', handleMouseOut);
    };
  }, [map]);

  if (!coordinates) return null;

  return (
    <div 
      className="bottom-2 left-2 z-[1000] absolute bg-white bg-opacity-75 px-2 py-1 rounded font-mono text-xs pointer-events-none"
      style={{ zIndex: 1000 }}
    >
      Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
    </div>
  );
};

// Map Wrapper Component to ensure proper rendering
const MapWrapper: React.FC<{
  zones: Zone[];
  onZoneClick: (zone: Zone) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}> = ({ zones, onZoneClick, mapRef }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={caloocanCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenReady={() => {
          if (mapRef.current) {
            console.log(`🗺️ Map is ready, center:`, mapRef.current.getCenter());
            console.log(`🗺️ Map zoom:`, mapRef.current.getZoom());
            console.log(`🗺️ Map bounds:`, mapRef.current.getBounds());
            // Trigger resize after a short delay
            setTimeout(() => {
              mapRef.current?.invalidateSize();
              console.log(`🗺️ Map size invalidated`);
            }, 100);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapReferenceCapture mapRef={mapRef} />
        <CoordinatesIndicator />
        
        {/* Render zones on the map */}
        <ZoneRenderer 
          zones={zones} 
          onZoneClick={onZoneClick}
        />
      </MapContainer>
    </div>
  );
};

const ZoningMap: React.FC = () => {
  const { appearance } = useAppearance();
  const theme = appearance;
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneTypes, setZoneTypes] = useState<ZoneType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showLegend, setShowLegend] = useState(true);
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    loadZoningData();
    checkUserAuthentication();
  }, []);

  // Check user authentication on component mount
  const checkUserAuthentication = async () => {
    try {
      // First check if we have user data in localStorage
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        try {
          const user = JSON.parse(localUserData);
          console.log('🔍 Found local user data:', user);
          
          // Validate with server
          const response = await apiService.getCurrentUser();
          if (response.success && response.user) {
            console.log('✅ User authenticated with server:', response.user);
            setUserData(response.user);
          } else {
            // Server says not authenticated, clear local data
            console.log('❌ Server authentication failed, clearing local data');
            localStorage.removeItem('user');
            setUserData(null);
          }
        } catch (error) {
          // Server error, clear local data
          console.log('❌ Server error, clearing local data:', error);
          localStorage.removeItem('user');
          setUserData(null);
        }
      } else {
        // No local user data
        console.log('🔍 No local user data found');
        setUserData(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUserData(null);
    }
  };

  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown]);

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue === null) {
        console.log('🧹 User data cleared from another tab/window');
        setUserData(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Trigger map resize when data loads
  useEffect(() => {
    if (mapRef.current && !loading && !error) {
      // Small delay to ensure map is fully rendered
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [loading, error, zones]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadZoningData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading zoning data...');
      console.log('🔄 Current timestamp:', new Date().toISOString());
      
      // Load zones and zone types from API - try both with and without cityId
      console.log('🔄 Trying API calls...');
      
      const [zonesRes, typesRes] = await Promise.all([
        axios.get('/api/zones?cityId=caloocan').catch(async (error) => {
          console.error('❌ Zones API with cityId failed:', error);
          console.log('🔄 Trying zones API without cityId...');
          return axios.get('/api/zones').catch((error2) => {
            console.error('❌ Zones API without cityId also failed:', error2);
            return { data: [] };
          });
        }),
        axios.get('/api/zone-types?cityId=caloocan').catch(async (error) => {
          console.error('❌ Types API with cityId failed:', error);
          console.log('🔄 Trying types API without cityId...');
          return axios.get('/api/zone-types').catch((error2) => {
            console.error('❌ Types API without cityId also failed:', error2);
            return { data: [] };
          });
        })
      ]);
      
      console.log('📊 Zones API Response Status:', 'status' in zonesRes ? zonesRes.status : 'N/A (fallback)');
      console.log('📊 Types API Response Status:', 'status' in typesRes ? typesRes.status : 'N/A (fallback)');
      console.log('📊 Zones API Response Headers:', 'headers' in zonesRes ? zonesRes.headers : 'N/A (fallback)');
      console.log('📊 Types API Response Headers:', 'headers' in typesRes ? typesRes.headers : 'N/A (fallback)');
      
      const zonesData = zonesRes.data;
      const typesData = typesRes.data;
      
      console.log('📊 Raw zones data:', zonesData);
      console.log('📊 Raw types data:', typesData);
      console.log('📊 Zones data type:', typeof zonesData);
      console.log('📊 Types data type:', typeof typesData);
      
      // Transform API data to match component interface
      const transformedZones = (Array.isArray(zonesData) ? zonesData : []).map((zone: any) => {
        console.log('🔄 Transforming zone:', zone);
        console.log('🔄 Zone zone_type:', zone.zone_type);
        console.log('🔄 Zone type field:', zone.type);
        
        // Handle different coordinate formats
        let coordinates: [number, number][] = [];
        
        if (zone.coordinates) {
          if (Array.isArray(zone.coordinates)) {
            // Check if it's already in the right format
            if (zone.coordinates.length > 0 && Array.isArray(zone.coordinates[0])) {
              coordinates = zone.coordinates as [number, number][];
            } else {
              console.log('⚠️ Invalid coordinates format for zone:', zone.id);
            }
          }
        } else if (zone.boundaries) {
          if (Array.isArray(zone.boundaries)) {
            coordinates = zone.boundaries as [number, number][];
          }
        }
        
        console.log('📍 Processed coordinates for zone', zone.id, ':', coordinates);
        
        const transformedZone = {
          id: zone.id,
          name: zone.name || zone.zone_name,
          type: zone.zone_type?.name || zone.type || 'Unknown',
          color: zone.zone_type?.color || zone.color || '#6B7280',
          coordinates: coordinates,
          description: zone.description || zone.zone_type?.description || 'No description available',
          regulations: zone.regulations || zone.zone_type?.regulations || []
        };
        
        console.log('✅ Transformed zone:', transformedZone);
        console.log('✅ Zone type value:', transformedZone.type);
        
        return transformedZone;
      });

      const transformedTypes = (Array.isArray(typesData) ? typesData : []).map((type: any) => ({
        id: type.id,
        name: type.name || type.type_name,
        color: type.color || '#6B7280',
        description: type.description || 'No description available'
      }));

      console.log('✅ Transformed zones:', transformedZones);
      console.log('✅ Transformed types:', transformedTypes);
      console.log('🔍 First zone coordinates:', transformedZones[0]?.coordinates);
      console.log('🔍 First zone coordinates type:', typeof transformedZones[0]?.coordinates);
      console.log('🔍 First zone coordinates is array:', Array.isArray(transformedZones[0]?.coordinates));

      setZones(transformedZones);
      setZoneTypes(transformedTypes);
      
      // Log the results
      if (transformedZones.length === 0) {
        console.log('ℹ️ No zones found in database');
        setError('No zoning data available. Please contact the administrator to set up zoning information.');
      } else {
        console.log(`✅ Loaded ${transformedZones.length} zones and ${transformedTypes.length} zone types from database`);
        
        // Debug each zone's coordinates
        transformedZones.forEach((zone: Zone, index: number) => {
          console.log(`🔍 Zone ${index + 1} (${zone.name}):`, {
            id: zone.id,
            name: zone.name,
            type: zone.type,
            color: zone.color,
            coordinates: zone.coordinates,
            coordinatesLength: zone.coordinates?.length,
            hasValidCoordinates: zone.coordinates && Array.isArray(zone.coordinates) && zone.coordinates.length > 0 && Array.isArray(zone.coordinates[0])
          });
        });
      }
    } catch (error) {
      const errorMessage = `Error loading zoning data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌ Error loading zoning data:', error);
      setError(errorMessage);
      
      // Fallback to empty arrays on error
      setZones([]);
      setZoneTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserDataChange = (user: ApiUser | null) => {
    setUserData(user);
  };

  const handleLogout = () => {
    // This is called by PageHeader after logout is complete
    console.log('Logout completed');
  };

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const flyToZone = (zone: Zone) => {
    console.log('🚀 flyToZone called with zone:', zone);
    console.log('🚀 Current timestamp:', new Date().toISOString());
    
    if (!mapRef.current) {
      console.log('❌ Map reference not available');
      return;
    }
    
    if (!zone) {
      console.log('❌ Zone is undefined or null');
      return;
    }
    
    console.log('🔄 Flying to zone:', zone);
    console.log('📍 Zone coordinates:', zone.coordinates);
    console.log('📍 Coordinates type:', typeof zone.coordinates);
    console.log('📍 Is array?', Array.isArray(zone.coordinates));
    
    // Check if coordinates exist and are valid
    if (!zone.coordinates) {
      console.log('❌ No coordinates found for zone');
      setSelectedZone(zone); // Still select the zone even without coordinates
      return;
    }
    
    // Handle different coordinate formats
    let coordinates: [number, number][] = [];
    
    if (Array.isArray(zone.coordinates)) {
      if (zone.coordinates.length === 0) {
        console.log('❌ Empty coordinates array');
        setSelectedZone(zone);
        return;
      }
      
      // Check if it's a nested array (GeoJSON format)
      if (Array.isArray(zone.coordinates[0])) {
        coordinates = zone.coordinates as [number, number][];
      } else {
        console.log('❌ Invalid coordinate format - not nested array');
        setSelectedZone(zone);
        return;
      }
    } else {
      console.log('❌ Coordinates is not an array');
      setSelectedZone(zone);
      return;
    }
    
    try {
      // Calculate bounds from zone coordinates
      // API returns coordinates as [lng, lat] format
      const lngs = coordinates.map(coord => coord[0]); // lng is at index 0
      const lats = coordinates.map(coord => coord[1]); // lat is at index 1
      
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      
      console.log('📊 Calculated bounds:', { minLat, maxLat, minLng, maxLng });
      
      // Create bounds and fit to them - Leaflet expects [lat, lng] for bounds
      const bounds = [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]];
      mapRef.current.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 16
      });
      
      // Also select the zone
      setSelectedZone(zone);
      console.log('✅ Successfully navigated to zone');
    } catch (error) {
      console.error('❌ Error navigating to zone:', error);
      console.error('❌ Zone data:', zone);
      // Still select the zone even if navigation fails
      setSelectedZone(zone);
    }
  };

  // Search location function
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setShowSearchDropdown(false);
    
    try {
      // Use Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Search service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowSearchDropdown(true);
      } else {
        console.log('No results found for:', query);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (result: any) => {
    if (!mapRef.current) return;
    
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Fly to the location
    mapRef.current.flyTo([lat, lng], 15, {
      duration: 2,
      easeLinearity: 0.1
    });
    
    // Close dropdown and clear search
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLocation(searchQuery);
    }
  };

  const filteredZones = zones.filter(zone => {
    if (!zone) {
      console.log('❌ Undefined zone found in zones array');
      return false;
    }
    
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || zone.type === selectedType;
    return matchesSearch && matchesType;
  });
  
  console.log('🔍 Filtered zones:', filteredZones);

  const getZoneIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'residential':
        return <Home className="w-5 h-5" />;
      case 'commercial':
        return <ShoppingBag className="w-5 h-5" />;
      case 'industrial':
        return <Factory className="w-5 h-5" />;
      case 'agricultural':
        return <TreePine className="w-5 h-5" />;
      case 'institutional':
        return <Building className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Head title="Zoning Map - Caloocan City" />
      <PageHeader 
                userData={userData}
                onUserDataChange={handleUserDataChange}
                onLogout={handleLogout}
            />
      
      {/* Top Navigation with Return Button */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.visit('/')}
            variant="outlined"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Legend Only */}
          <div className="xl:col-span-3 space-y-6">
            {/* Legend */}
            {showLegend && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Zone Types</h3>
                  <Button
                    onClick={() => setShowLegend(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {zoneTypes.map(type => (
                    <div key={type.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: type.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{type.name}</div>
                        <div className="text-xs text-gray-600 truncate">{type.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Legend Toggle */}
            {!showLegend && (
              <Card className="p-4">
                <Button
                  onClick={() => setShowLegend(true)}
                  variant="outlined"
                  className="w-full"
                  size="sm"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Show Legend
                </Button>
              </Card>
            )}
          </div>

          {/* Map Area - Center */}
          <div className="xl:col-span-6">
            <Card className="p-4 h-full flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Interactive Map</h3>
                  <p className="text-sm text-gray-600">Explore zoning classifications</p>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="relative flex-1 rounded-xl border-2 border-gray-300 overflow-hidden" style={{ height: '500px', minHeight: '500px' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading map...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-red-500 mb-2">⚠️</div>
                      <p className="text-sm text-red-600 mb-2">Failed to load map data</p>
                      <Button
                        onClick={loadZoningData}
                        variant="outlined"
                        size="sm"
                        className="text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <MapWrapper
                    zones={filteredZones}
                    onZoneClick={handleZoneClick}
                    mapRef={mapRef}
                  />
                )}
                
                {/* Map Legend Overlay */}
                {/* {!loading && !error && zoneTypes.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-300 p-3 z-10 max-w-48">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Zone Types</h4>
                    <div className="space-y-1 z-51">
                      {zoneTypes.map((zoneType) => (
                        <div key={zoneType.id} className="flex items-center space-x-2 text-xs">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ 
                              backgroundColor: zoneType.color,
                              opacity: 0.7
                            }}
                          ></div>
                          <span className="text-gray-700">{zoneType.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>

              {/* Selected Zone Details */}
              {selectedZone && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: selectedZone.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{selectedZone.name}</h4>
                        <p className="text-gray-600 text-sm">{selectedZone.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedZone(null)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {selectedZone.type} Zone
                    </Badge>
                    {getZoneIcon(selectedZone.type)}
                  </div>

                  {selectedZone.regulations && selectedZone.regulations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Regulations:</h5>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {selectedZone.regulations.map((regulation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{regulation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Zones */}
          <div className="xl:col-span-3 space-y-4">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Search & Filters</h3>
                <Button
                  onClick={loadZoningData}
                  variant="outlined"
                  size="sm"
                  disabled={loading}
                >
                  <Search className="w-4 h-4 mr-1" />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search zones..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Zone Type Filter */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Zone Types</option>
                  {zoneTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Zone List */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Zones</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {filteredZones.length}
                </Badge>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading zones...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-sm text-red-600 mb-2">Failed to load zoning data</p>
                    <Button
                      onClick={loadZoningData}
                      variant="outlined"
                      size="sm"
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredZones.length > 0 ? (
                  filteredZones.map(zone => {
                    console.log('🔍 Rendering zone:', zone);
                    if (!zone) {
                      console.log('❌ Zone is undefined in map function');
                      return null;
                    }
                    
                    const hasValidCoordinates = zone.coordinates && 
                      Array.isArray(zone.coordinates) && 
                      zone.coordinates.length > 0 && 
                      Array.isArray(zone.coordinates[0]);
                    
                    return (
                      <div
                        key={zone.id}
                        onClick={() => {
                          if (!zone) {
                            console.log('❌ Zone is undefined in onClick handler');
                            return;
                          }
                          hasValidCoordinates ? flyToZone(zone) : setSelectedZone(zone);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all group ${
                          selectedZone?.id === zone.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : theme === 'dark'
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-gray-500'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                        } ${!hasValidCoordinates ? 'opacity-75' : ''}`}
                        title={!hasValidCoordinates ? 'No map coordinates available - click to view details only' : 'Click to view on map'}
                      >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate group-hover:text-blue-600">
                            {zone.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate mt-1">
                            {zone.description}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge className="text-xs px-2 py-1">
                              {zone.type}
                            </Badge>
                            {getZoneIcon(zone.type)}
                            {!hasValidCoordinates && (
                              <span className="text-xs text-orange-500" title="No map coordinates">
                                📍
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">No zones found</p>
                    <p className="text-xs text-gray-500">
                      {error ? 'There was an error loading zoning data.' : 'No zoning data is available in the database.'}
                    </p>
                    {error && (
                      <Button
                        onClick={loadZoningData}
                        variant="outlined"
                        size="sm"
                        className="mt-2 text-xs"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoningMap;
