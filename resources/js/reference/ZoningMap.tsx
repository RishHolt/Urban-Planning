import Header from "../../components/Header";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import TextArea from "../../components/TextArea";
import SearchInput from "../../components/SearchInput";
import { Plus, Palette, Pencil, Trash2, Search, Filter } from "lucide-react";
import Swal from "../../components/Swal";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fix for Leaflet Draw readableArea error
if (typeof window !== 'undefined' && (L as any).GeometryUtil) {
  const originalReadableArea = (L as any).GeometryUtil.readableArea;
  if (originalReadableArea) {
    (L as any).GeometryUtil.readableArea = function(area: number, isMetric: boolean, type?: string) {
      try {
        // Provide default type if not specified
        const areaType = type || 'ha';
        return originalReadableArea.call(this, area, isMetric, areaType);
      } catch (error) {
        console.warn('Leaflet Draw readableArea error, using fallback:', error);
        // Fallback formatting
        if (isMetric) {
          if (area >= 10000) {
            return (area / 10000).toFixed(2) + ' ha';
          }
          return area.toFixed(2) + ' m²';
        } else {
          if (area >= 4047) {
            return (area / 4047).toFixed(2) + ' acres';
          }
          return area.toFixed(2) + ' sq ft';
        }
      }
    };
  }
}

interface ZoneData {
  id: string;
  name: string;
  type: string; // This will map to typeId for API
  color: string;
  coordinates: any;
  area?: string;
}


interface Region {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zoomLevel: number;
}

// Geodetic area calculation using spherical excess formula
// This accounts for Earth's curvature and provides accurate area calculations
const calculateGeodesicArea = (latlngs: any[]): number => {
  if (latlngs.length < 3) return 0;
  
  // Earth's radius in meters (mean radius)
  const EARTH_RADIUS = 6371000;
  
  // Convert degrees to radians
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  
  // Convert lat/lng points to radians
  const points = latlngs.map(point => ({
    lat: toRadians(point.lat),
    lng: toRadians(point.lng)
  }));
  
  // Close the polygon if not already closed
  if (points[0].lat !== points[points.length - 1].lat || 
      points[0].lng !== points[points.length - 1].lng) {
    points.push(points[0]);
  }
  
  // Calculate area using spherical excess formula
  let area = 0;
  const n = points.length - 1;
  
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Calculate the spherical excess contribution
    area += (p2.lng - p1.lng) * (2 + Math.sin(p1.lat) + Math.sin(p2.lat));
  }
  
  // Convert to square meters
  area = Math.abs(area * EARTH_RADIUS * EARTH_RADIUS / 2);
  
  return area;
};

// Drawing Control Component
const DrawingControls = ({ 
  selectedZoneType, 
  onZoneCreated,
  onZoneUpdated,
  onZoneDeleted,
  allZoneTypes,
  clearLayersRef,
  zones
}: { 
  selectedZoneType: string;
  onZoneCreated: (zone: ZoneData, layer?: any) => void;
  onZoneUpdated?: (zoneId: string, updatedData: Partial<ZoneData>) => void;
  onZoneDeleted?: (zoneId: string) => void;
  allZoneTypes: Record<string, { name: string; color: string; description?: string }>;
  clearLayersRef?: React.MutableRefObject<(() => void) | null>;
  zones: ZoneData[];
}) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawControlRef = useRef<any>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    console.log('Drawing controls effect triggered:', { 
      map: !!map, 
      mounted: mountedRef.current,
      zoneTypesCount: Object.keys(allZoneTypes).length,
      selectedZoneType
    });
    
    if (!map) {
      console.log('Map not ready');
      return;
    }

    // Clean up existing control if it exists (for zone type/color changes)
    if (mountedRef.current && drawControlRef.current) {
      console.log('Cleaning up existing drawing control for zone type change...');
      try {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      } catch (error) {
        console.warn('Error removing existing control:', error);
      }
    }

    console.log('Initializing drawing controls...');

    try {
      const drawnItems = drawnItemsRef.current;
      
      // Add drawn items layer to map
      if (!map.hasLayer(drawnItems)) {
        map.addLayer(drawnItems);
      }

      // Ensure L.Control.Draw is available
      if (!(L.Control as any).Draw) {
        console.error('Leaflet Draw is not loaded properly');
        return;
      }

      // Get current zone color or fallback
      const currentColor = allZoneTypes[selectedZoneType]?.color || '#4CAF50';

      // Initialize draw control with proper configuration
      const drawControl = new (L.Control as any).Draw({
        position: 'topright',
        edit: {
          featureGroup: drawnItems,
          remove: true
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: false, // Disable area display to prevent the type error
            drawError: {
              color: '#e1e100',
              message: '<strong>Oh snap!</strong> you can\'t draw that!'
            },
            shapeOptions: {
              color: currentColor,
              fillColor: currentColor,
              fillOpacity: 0.3,
              weight: 2
            }
          },
          rectangle: {
            showArea: false, // Disable area display to prevent the type error
            shapeOptions: {
              color: currentColor,
              fillColor: currentColor,
              fillOpacity: 0.3,
              weight: 2
            }
          },
          circle: {
            shapeOptions: {
              color: currentColor,
              fillColor: currentColor,
              fillOpacity: 0.3,
              weight: 2
            }
          },
          marker: {
            icon: L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          },
          polyline: {
            shapeOptions: {
              color: currentColor,
              weight: 3
            }
          },
          circlemarker: false
        }
      });

      drawControlRef.current = drawControl;
      map.addControl(drawControl);
      mountedRef.current = true;

      // Add global error handler for Leaflet Draw errors
      const originalOnError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (typeof message === 'string' && message.includes('type is not defined') && source?.includes('leaflet-draw')) {
          console.warn('Suppressed Leaflet Draw type error:', message);
          return true; // Prevent the error from being thrown
        }
        if (originalOnError) {
          return originalOnError.call(this, message, source, lineno, colno, error);
        }
        return false;
      };

      // Handle draw created event
      const onDrawCreated = (e: any) => {
        try {
          console.log('Draw created event:', e);
          const { layer, layerType } = e;
          const zoneId = Date.now().toString();
          
          console.log('Selected zone type:', selectedZoneType);
          console.log('Available zone types:', allZoneTypes);
          
          const zoneColor = allZoneTypes[selectedZoneType]?.color || '#4CAF50';
          console.log('Zone color:', zoneColor);
          
          // Apply style for shapes
          if (layer.setStyle && layerType !== 'marker') {
            layer.setStyle({
              color: zoneColor,
              fillColor: zoneColor,
              fillOpacity: 0.3,
              weight: 2
            });
          }

          // Calculate area for polygons and rectangles
          let area = 'N/A';
          if (layerType === 'polygon' || layerType === 'rectangle') {
            try {
              const latlngs = layer.getLatLngs()[0];
              
              // Use proper geodetic area calculation
              const areaInSquareMeters = calculateGeodesicArea(latlngs);
              
              // Format area appropriately
              if (areaInSquareMeters >= 1000000) {
                // Convert to square kilometers
                area = `${(areaInSquareMeters / 1000000).toFixed(2)} km²`;
              } else if (areaInSquareMeters >= 10000) {
                // Convert to hectares
                area = `${(areaInSquareMeters / 10000).toFixed(2)} ha`;
              } else {
                // Keep in square meters
                area = `${areaInSquareMeters.toFixed(2)} m²`;
              }
            } catch (error) {
              console.error('Error calculating area:', error);
              area = 'N/A';
            }
          } else if (layerType === 'circle') {
            try {
              const radius = layer.getRadius(); // This is in meters
              const circleArea = Math.PI * radius * radius;
              
              // Format area appropriately
              if (circleArea >= 1000000) {
                area = `${(circleArea / 1000000).toFixed(2)} km²`;
              } else if (circleArea >= 10000) {
                area = `${(circleArea / 10000).toFixed(2)} ha`;
              } else {
                area = `${circleArea.toFixed(2)} m²`;
              }
            } catch (error) {
              console.error('Error calculating circle area:', error);
              area = 'N/A';
            }
          }

          // Generate descriptive zone name with zone type
          const zoneTypeName = allZoneTypes[selectedZoneType]?.name || 'Unknown';
          const zoneNumber = Date.now().toString().slice(-6); // Use last 6 digits for zone number
          const zoneName = `${zoneTypeName} Zone ZN-${zoneNumber}`;

          const newZone: ZoneData = {
            id: zoneId,
            name: zoneName,
            type: selectedZoneType,
            color: zoneColor,
            coordinates: layer.toGeoJSON(),
            area
          };

          console.log('New zone created:', newZone);

          // Add popup
          layer.bindPopup(`
            <div style="font-family: sans-serif; min-width: 150px;">
              <strong>${newZone.name}</strong><br/>
              <strong>Type:</strong> ${zoneTypeName}<br/>
              <strong>Area:</strong> ${newZone.area}<br/>
              <small style="color: #666;">Click to view details</small>
            </div>
          `);

          layer.zoneId = zoneId;
          drawnItems.addLayer(layer);
          
          // Call the handler with both zone data and layer
          console.log('Calling onZoneCreated handler...');
          onZoneCreated(newZone, layer);
        } catch (error) {
          console.error('Error creating zone:', error);
          alert(`Error creating zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      map.on('draw:created', onDrawCreated);

      // Handle edit events
      const onDrawEdited = async (e: any) => {
        console.log('Draw edited event:', e);
        const layers = e.layers;
        
        layers.eachLayer(async (layer: any) => {
          try {
            const zoneId = layer.zoneId;
            const zoneName = layer.zoneName || `Zone ${zoneId}`;
            
            console.log('Edit event - Layer info:', { 
              zoneId, 
              zoneName, 
              hasZoneId: !!zoneId,
              layerProps: Object.keys(layer)
            });
            
            if (zoneId) {
              console.log('Updating zone:', zoneId, zoneName);
              
              // Get updated coordinates
              const updatedCoordinates = layer.toGeoJSON();
              
              // Update in Laravel backend
              await axios.put(`/api/zones/${zoneId}`, {
                coordinates: updatedCoordinates
              });
              
              // Update local state if callback provided
              if (onZoneUpdated) {
                onZoneUpdated(zoneId, { coordinates: updatedCoordinates });
              }
              
              console.log('Zone updated successfully via edit tool');
              await Swal.toast(
                `Zone "${zoneName}" updated successfully!`,
                'success',
                'top-end',
                2000
              );
            } else {
              console.warn('Layer missing zoneId for update:', layer);
              await Swal.error('Edit Error', 'Cannot edit this zone - missing zone ID. Try refreshing the page.');
            }
          } catch (error) {
            console.error('Error updating zone via edit tool:', error);
            await Swal.error('Update Failed', 'Failed to save changes. Please try again.');
          }
        });
      };

      // Handle delete events
      const onDrawDeleted = async (e: any) => {
        console.log('Draw deleted event:', e);
        const layers = e.layers;
        const layersToDelete: any[] = [];
        
        // Collect all layers that need confirmation
        layers.eachLayer((layer: any) => {
          const zoneId = layer.zoneId;
          const zoneName = layer.zoneName || `Zone ${zoneId}`;
          if (zoneId) {
            layersToDelete.push({ layer, zoneId, zoneName });
          }
        });
        
        // If no valid layers to delete, return early
        if (layersToDelete.length === 0) {
          console.warn('No valid layers found for deletion');
          return;
        }
        
        // Show confirmation dialog for each layer
        for (const { layer, zoneId, zoneName } of layersToDelete) {
          try {
            console.log('Requesting deletion confirmation for zone:', zoneId, zoneName);
            
            // Show confirmation dialog before deleting
            const result = await Swal.confirmDelete(
              'Delete Zone?',
              `Are you sure you want to delete "${zoneName}"? This action cannot be undone.`
            );

            if (result.isConfirmed) {
              console.log('Deleting zone:', zoneId, zoneName);
              
              // Delete from Laravel backend
              await axios.delete(`/api/zones/${zoneId}`);
              
              // Update local state if callback provided
              if (onZoneDeleted) {
                onZoneDeleted(zoneId);
              }
              
              console.log('Zone deleted successfully via delete tool');
              await Swal.success('Zone Deleted!', `Zone "${zoneName}" deleted successfully!`);
            } else {
              console.log('Zone deletion cancelled by user - restoring layer');
              // Re-add the layer to the map since user cancelled deletion
              drawnItems.addLayer(layer);
            }
          } catch (error) {
            console.error('Error deleting zone via delete tool:', error);
            await Swal.error('Delete Failed', 'Failed to delete zone. Please try again.');
            // Re-add the layer on error
            drawnItems.addLayer(layer);
          }
        }
      };

      map.on('draw:edited', onDrawEdited);
      map.on('draw:deleted', onDrawDeleted);

      console.log('✅ Drawing controls initialized successfully');

      // Cleanup function - only remove on unmount
      return () => {
        console.log('Cleaning up drawing controls...');
        try {
          // Restore original error handler
          if (originalOnError) {
            window.onerror = originalOnError;
          } else {
            window.onerror = null;
          }
          
          map.off('draw:created', onDrawCreated);
          map.off('draw:edited', onDrawEdited);
          map.off('draw:deleted', onDrawDeleted);
          if (drawControlRef.current) {
            // Clear z-index interval
            if ((drawControlRef.current as any).__zIndexInterval) {
              clearInterval((drawControlRef.current as any).__zIndexInterval);
            }
            map.removeControl(drawControlRef.current);
          }
          if (map.hasLayer(drawnItems)) {
            map.removeLayer(drawnItems);
          }
          mountedRef.current = false;
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing drawing controls:', error);
    }
  }, [map, selectedZoneType, allZoneTypes]); // Include selectedZoneType and allZoneTypes to recreate control when they change

  // Load existing zones into drawnItems for editing
  useEffect(() => {
    if (!mountedRef.current || zones.length === 0) return;
    
    console.log('Loading existing zones into editable layer:', zones.length);
    const drawnItems = drawnItemsRef.current;
    
    // Clear existing zones from drawnItems first
    drawnItems.clearLayers();
    
    // Add existing zones to drawnItems so they can be edited
    zones.forEach(zone => {
      try {
        if (!zone.coordinates || !zone.coordinates.geometry) {
          console.warn('Zone missing coordinates for editing:', zone);
          return;
        }
        
        // Create layer from GeoJSON
        const layer = L.geoJSON(zone.coordinates, {
          style: {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.3,
            weight: 2
          }
        });
        
        // Get the actual drawable layer (first layer from GeoJSON)
        const drawableLayer = layer.getLayers()[0];
        if (drawableLayer) {
          // Add zone metadata
          (drawableLayer as any).zoneId = zone.id;
          (drawableLayer as any).zoneName = zone.name;
          
          // Add popup
          const zoneTypeName = allZoneTypes[zone.type]?.name || 'Unknown';
          drawableLayer.bindPopup(`
            <div style="font-family: sans-serif; min-width: 150px;">
              <strong>${zone.name}</strong><br/>
              <strong>Type:</strong> ${zoneTypeName}<br/>
              <strong>Area:</strong> ${zone.area || 'N/A'}<br/>
            </div>
          `);
          
          // Add to drawnItems for editing
          drawnItems.addLayer(drawableLayer);
          console.log('Added zone to editable layer:', zone.name);
        }
      } catch (error) {
        console.error('Error adding zone to editable layer:', zone, error);
      }
    });
    
    console.log('Finished loading zones into editable layer. Total layers:', drawnItems.getLayers().length);
  }, [zones, allZoneTypes, mountedRef.current]);

  // Clear all layers
  useEffect(() => {
    const clearLayers = () => {
      drawnItemsRef.current.clearLayers();
      console.log('All drawn layers cleared');
    };
    
    // Expose clear function via ref
    if (clearLayersRef) {
      clearLayersRef.current = clearLayers;
    }
  }, [clearLayersRef]);

  return null;
};

// Map Reference Component
const MapReferenceCapture = ({ mapRef }: { mapRef: React.MutableRefObject<any> }) => {
  const map = useMap();
  
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  
  return null;
};

// Coordinates Indicator Component
const CoordinatesIndicator = () => {
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

const ZoningMap = () => {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZoneType, setSelectedZoneType] = useState(''); // Will be set after data loads
  const [allZoneTypes, setAllZoneTypes] = useState<Record<string, { name: string; color: string; description?: string }>>({});
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isEditingZoneType, setIsEditingZoneType] = useState(false);
  const [isEditingRegion, setIsEditingRegion] = useState(false);
  const [editingZoneTypeId, setEditingZoneTypeId] = useState<string | null>(null);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [zoneTypeFilter, setZoneTypeFilter] = useState<string>('all');
  const [zoneSearchQuery, setZoneSearchQuery] = useState<string>('');
  const [newZoneType, setNewZoneType] = useState({
    name: '',
    description: '',
    color: '#4CAF50'
  });
  const [newRegion, setNewRegion] = useState({
    name: '',
    latitude: '',
    longitude: '',
    zoomLevel: 14
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoneTypeValidationErrors, setZoneTypeValidationErrors] = useState<{[key: string]: string}>({});
  const [regionValidationErrors, setRegionValidationErrors] = useState<{[key: string]: string}>({});

  // North and South Caloocan coordinates - converted from DMS to decimal degrees
  const northCaloocanCenter: [number, number] = [14.7597, 121.0408]; // North Caloocan: 14°45'35"N 121°02'27"E
  const southCaloocanCenter: [number, number] = [14.6511, 120.9900]; // South Caloocan: 14°39'04"N 120°59'24"E
  
  // Caloocan coordinates (calculated center between North and South)
  const caloocanCenter: [number, number] = [
    (northCaloocanCenter[0] + southCaloocanCenter[0]) / 2, // Average latitude: 14.7054
    (northCaloocanCenter[1] + southCaloocanCenter[1]) / 2  // Average longitude: 121.0154
  ];
  
  // Map reference for programmatic control
  const mapRef = useRef<any>(null);
  const clearLayersRef = useRef<(() => void) | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter zones based on selected zone type and search query
  const filteredZones = zones.filter(zone => {
    // Filter by zone type
    const matchesType = zoneTypeFilter === 'all' || zone.type === zoneTypeFilter;
    
    // Filter by search query
    const matchesSearch = !zoneSearchQuery || 
      zone.name.toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
      (allZoneTypes[zone.type]?.name || '').toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
      (zone.area || '').toLowerCase().includes(zoneSearchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Load data from Laravel backend on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Load zones, zone types, and regions from Laravel API
        const [zonesRes, zoneTypesRes, regionsRes] = await Promise.all([
          axios.get('/api/zones?cityId=caloocan'),
          axios.get('/api/zone-types?cityId=caloocan'),
          axios.get('/api/regions?cityId=caloocan')
        ]);
        
        const zonesData = zonesRes.data;
        const zoneTypesData = zoneTypesRes.data;
        const regionsData = regionsRes.data;

        // Transform zones data to match frontend interface
        const transformedZones: ZoneData[] = zonesData.map((zone: any) => ({
          id: zone.id,
          name: zone.name,
          type: zone.typeId, // Map typeId to type
          color: zone.color,
          coordinates: zone.coordinates,
          area: zone.area
        }));

        // Create allZoneTypes object from API data
        const allTypes = zoneTypesData.reduce((acc: any, zoneType: any) => ({
          ...acc,
          [zoneType.id]: { 
            name: zoneType.name, 
            color: zoneType.color, 
            description: zoneType.description 
          }
        }), {});

        // Transform regions data
        const allRegs: Region[] = regionsData.map((region: any) => ({
          id: region.id,
          name: region.name,
          latitude: region.latitude,
          longitude: region.longitude,
          zoomLevel: region.zoom_level || region.zoomLevel // Handle both snake_case and camelCase
        }));

        console.log('Loaded regions data:', regionsData);
        console.log('Transformed regions:', allRegs);

        setZones(transformedZones);
        setAllZoneTypes(allTypes);
        setAllRegions(allRegs);
        
        // Ensure selected zone type is valid - always set to first available
        if (Object.keys(allTypes).length > 0) {
          if (!selectedZoneType || !(selectedZoneType in allTypes)) {
            const firstZoneType = Object.keys(allTypes)[0];
            console.log('Setting zone type to:', firstZoneType);
            setSelectedZoneType(firstZoneType);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError('Failed to load zoning data. Please check your connection and try refreshing the page.');
        
        // Don't set fallback zone types when API fails - this causes database constraint errors
        // The user should fix the API connection first
        setAllZoneTypes({});
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle click outside search dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    // Only add listener when dropdown is open
    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown]);

  const handleZoneCreated = async (zone: ZoneData, layer?: any) => {
    try {
      console.log('=== ZONE CREATION STARTED ===');
      console.log('Creating zone:', zone);
      console.log('Layer:', layer);
      console.log('Selected zone type:', selectedZoneType);
      console.log('All zone types:', allZoneTypes);
      
      // Validate zone data
      if (!zone.name || !zone.type || !zone.coordinates) {
        throw new Error('Invalid zone data: missing required fields');
      }
      
      // Validate that the selected zone type exists in the loaded zone types
      if (!allZoneTypes[selectedZoneType] || Object.keys(allZoneTypes).length === 0) {
        await Swal.error(
          'No Zone Types Available', 
          'You need to create zone types before you can draw zones. Click "Add Type" to create your first zone type.'
        );
        return;
      }
      
      // Save to API
      const apiData = {
        name: zone.name,
        typeId: zone.type,
        color: zone.color,
        coordinates: zone.coordinates,
        area: zone.area,
        cityId: 'caloocan'
      };
      
      console.log('Sending to API:', apiData);
      console.log('API endpoint will be called...');
      
      // Save to Laravel backend
      const response = await axios.post('/api/zones', apiData);
      const savedZone = response.data;
      console.log('Zone saved successfully:', savedZone);
      console.log('=== ZONE CREATION COMPLETED ===');

      // Update the layer with the real API ID and zone name
      if (layer) {
        layer.zoneId = savedZone.id;
        layer.zoneName = savedZone.name;
        console.log('Updated layer with real API ID:', savedZone.id);
      }

      // Create updated zone data with real API ID
      const updatedZone: ZoneData = {
        ...zone,
        id: savedZone.id,
        name: savedZone.name
      };

      // Update local state with real API data
      setZones(prev => [...prev, updatedZone]);
      
      await Swal.toast(
        `Zone "${savedZone.name}" created successfully!`,
        'success',
        'top-end',
        2000
      );
    } catch (error) {
      console.error('=== ZONE CREATION FAILED ===');
      console.error('Error creating zone:', error);
      
      // Check for specific database constraint errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Foreign key constraint violated') && errorMessage.includes('type_id')) {
        await Swal.error(
          'Invalid Zone Type', 
          'The selected zone type is not valid. Please create zone types first or refresh the page to reload available zone types.'
        );
      } else if (errorMessage.includes('Backend services are not running')) {
        await Swal.error(
          'Connection Error', 
          'Cannot connect to the backend services. Please ensure the API Gateway and zoning-map-service are running.'
        );
      } else {
        await Swal.error('Error', `Failed to create zone: ${errorMessage}`);
      }
    }
  };

  const handleZoneUpdated = (zoneId: string, updatedData: Partial<ZoneData>) => {
    console.log('Updating zone in local state:', zoneId, updatedData);
    setZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { ...zone, ...updatedData }
        : zone
    ));
  };

  const handleZoneDeleted = (zoneId: string) => {
    console.log('Removing zone from local state:', zoneId);
    setZones(prev => prev.filter(zone => zone.id !== zoneId));
  };

  // Search location function
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setShowSearchDropdown(false);
    
    try {
      // Use Nominatim (OpenStreetMap) geocoding service - get all results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph`
      );
      
      if (!response.ok) {
        throw new Error('Search service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowSearchDropdown(true);
      } else {
        await Swal.toast(
          'Location not found. Try a different search term.',
          'warning',
          'top-end',
          3000
        );
      }
    } catch (error) {
      console.error('Search error:', error);
      await Swal.toast(
        'Search failed. Please try again.',
        'error',
        'top-end',
        3000
      );
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = async (result: any) => {
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
    
    // Show success message
    await Swal.toast(
      `Navigated to: ${result.display_name}`,
      'success',
      'top-end',
      3000
    );
  };

  // Navigate to a specific zone
  const flyToZone = (zone: ZoneData) => {
    if (!mapRef.current || !zone.coordinates) return;
    
    try {
      // Calculate bounds from zone coordinates
      const coordinates = zone.coordinates.geometry.coordinates[0];
      const lats = coordinates.map((coord: number[]) => coord[1]);
      const lngs = coordinates.map((coord: number[]) => coord[0]);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Create bounds and fly to them
      const bounds = [[minLat, minLng], [maxLat, maxLng]];
      mapRef.current.fitBounds(bounds as any, {
        padding: [20, 20],
        maxZoom: 16
      });
    } catch (error) {
      console.error('Error navigating to zone:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLocation(searchQuery);
    }
  };

  const flyToFullView = () => {
    if (mapRef.current) {
      // Calculate dynamic center based on all regions
      const allRegionsForCalc = [
        { latitude: northCaloocanCenter[0], longitude: northCaloocanCenter[1] },
        { latitude: southCaloocanCenter[0], longitude: southCaloocanCenter[1] },
        ...allRegions
      ];
      
      if (allRegionsForCalc.length > 0) {
        // Calculate average center
        const avgLat = allRegionsForCalc.reduce((sum, region) => sum + region.latitude, 0) / allRegionsForCalc.length;
        const avgLng = allRegionsForCalc.reduce((sum, region) => sum + region.longitude, 0) / allRegionsForCalc.length;
        
        // Calculate zoom level based on the spread of regions
        const latitudes = allRegionsForCalc.map(r => r.latitude);
        const longitudes = allRegionsForCalc.map(r => r.longitude);
        const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
        const lngSpread = Math.max(...longitudes) - Math.min(...longitudes);
        const maxSpread = Math.max(latSpread, lngSpread);
        
        // Dynamic zoom: smaller spread = higher zoom (but zoomed out more)
        let dynamicZoom = 10; // Default zoom reduced from 12 to 10
        if (maxSpread < 0.1) dynamicZoom = 12; // Reduced from 14 to 12
        else if (maxSpread < 0.2) dynamicZoom = 11; // Reduced from 13 to 11
        else if (maxSpread > 0.5) dynamicZoom = 9; // Reduced from 11 to 9
        else if (maxSpread > 1.0) dynamicZoom = 8; // Reduced from 10 to 8
        
        mapRef.current.flyTo([avgLat, avgLng], dynamicZoom, {
          duration: 2,
          easeLinearity: 0.1
        });
      } else {
        // Fallback to original center if no regions (also zoomed out more)
        mapRef.current.flyTo(caloocanCenter, 10, {
          duration: 2,
          easeLinearity: 0.1
        });
      }
    }
  };

  // Region management functions
  const flyToRegion = (region: Region) => {
    if (mapRef.current) {
      mapRef.current.flyTo([region.latitude, region.longitude], region.zoomLevel, {
        duration: 2,
        easeLinearity: 0.1
      });
    }
  };

  const handleUpdateRegion = async () => {
    if (newRegion.name.trim() && newRegion.latitude && newRegion.longitude && editingRegionId) {
      try {
        // Update via Laravel backend
        const response = await axios.put(`/api/regions/${editingRegionId}`, {
          name: newRegion.name.trim(),
          latitude: parseFloat(newRegion.latitude),
          longitude: parseFloat(newRegion.longitude),
          zoomLevel: newRegion.zoomLevel
        });
        const updatedRegion = response.data;

        // Update local state
        setAllRegions(prev => prev.map(region => 
          region.id === editingRegionId 
            ? { 
                ...region, 
                name: updatedRegion.name,
                latitude: updatedRegion.latitude,
                longitude: updatedRegion.longitude,
                zoomLevel: updatedRegion.zoomLevel
              }
            : region
        ));
        
        setNewRegion({ name: '', latitude: '', longitude: '', zoomLevel: 14 });
        setIsRegionModalOpen(false);
        setIsEditingRegion(false);
        setEditingRegionId(null);
        
        await Swal.toast(
          `Region "${updatedRegion.name}" updated successfully!`,
          'success',
          'top-end',
          2000
        );
      } catch (error) {
        console.error('Error updating region:', error);
        await Swal.error('Error', 'Failed to update region. Please try again.');
      }
    }
  };

  const handleAddRegion = async () => {
    // Clear previous errors
    setError(null);
    setRegionValidationErrors({});
    
    // Validate form
    if (!validateRegion()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Save to Laravel backend
      const response = await axios.post('/api/regions', {
        name: newRegion.name.trim(),
        latitude: parseFloat(newRegion.latitude),
        longitude: parseFloat(newRegion.longitude),
        zoomLevel: newRegion.zoomLevel,
        cityId: 'caloocan'
      });
      const savedRegion = response.data;

      // Add to local state
      const region: Region = {
        id: savedRegion.id,
        name: savedRegion.name,
        latitude: savedRegion.latitude,
        longitude: savedRegion.longitude,
        zoomLevel: savedRegion.zoomLevel
      };
      
      setAllRegions(prev => [...prev, region]);
      setNewRegion({ name: '', latitude: '', longitude: '', zoomLevel: 14 });
      setIsRegionModalOpen(false);
      setRegionValidationErrors({});
      
      await Swal.toast(
        `Region "${region.name}" added successfully!`,
        'success',
        'top-end',
        2000
      );
    } catch (error) {
      console.error('Error creating region:', error);
      console.error('Error details:', (error as any).response?.data);
      console.error('Request data:', {
        name: newRegion.name.trim(),
        latitude: parseFloat(newRegion.latitude),
        longitude: parseFloat(newRegion.longitude),
        zoomLevel: newRegion.zoomLevel,
        cityId: 'caloocan'
      });
      
      const errorMessage = (error as any).response?.data?.message || (error as any).message || 'Failed to create region';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRegion = (regionId: string) => {
    console.log('handleEditRegion called with regionId:', regionId, 'type:', typeof regionId);
    console.log('Available regions:', allRegions.map(r => ({ id: r.id, type: typeof r.id, name: r.name })));
    
    // Try multiple comparison methods to handle type mismatches
    const region = allRegions.find(r => {
      const rId = r.id;
      const regionIdStr = regionId;
      const regionIdNum = parseInt(regionIdStr);
      
      return rId === regionIdStr || 
             (typeof rId === 'number' && rId === regionIdNum) || 
             rId.toString() === regionIdStr ||
             (typeof rId === 'string' && rId === regionIdStr);
    });
    
    console.log('Found region:', region);
    
    if (region) {
      setNewRegion({
        name: region.name,
        latitude: region.latitude.toString(),
        longitude: region.longitude.toString(),
        zoomLevel: region.zoomLevel
      });
      setEditingRegionId(regionId);
      setIsEditingRegion(true);
      setRegionValidationErrors({});
      setError(null);
      setIsRegionModalOpen(true);
      console.log('Edit modal should be open now');
    } else {
      console.error('Region not found for ID:', regionId);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    console.log('handleDeleteRegion called with regionId:', regionId, 'type:', typeof regionId);
    console.log('Available regions:', allRegions.map(r => ({ id: r.id, type: typeof r.id, name: r.name })));
    
    // Try multiple comparison methods to handle type mismatches
    const region = allRegions.find(r => {
      const rId = r.id;
      const regionIdStr = regionId;
      const regionIdNum = parseInt(regionIdStr);
      
      return rId === regionIdStr || 
             (typeof rId === 'number' && rId === regionIdNum) || 
             rId.toString() === regionIdStr ||
             (typeof rId === 'string' && rId === regionIdStr);
    });
    
    console.log('Found region for deletion:', region);
    
    if (!region) {
      console.error('Region not found for deletion, ID:', regionId);
      await Swal.error('Error', 'Region not found');
      return;
    }

    const result = await Swal.confirmDelete(
      'Delete Region?',
      `Are you sure you want to delete "${region.name}"? This action cannot be undone.`
    );

    if (result.isConfirmed) {
      try {
        // Delete from Laravel backend
        await axios.delete(`/api/regions/${regionId}`);
        
        // Update local state
        setAllRegions(prev => prev.filter(r => r.id !== regionId));
        
        // Close the modal and reset form
        setIsRegionModalOpen(false);
        setIsEditingRegion(false);
        setEditingRegionId(null);
        setNewRegion({ name: '', latitude: '', longitude: '', zoomLevel: 14 });
        
        await Swal.success('Region Deleted!', `"${region.name}" has been removed.`);
      } catch (error) {
        console.error('Error deleting region:', error);
        console.error('Error details:', (error as any).response?.data);
        await Swal.error('Error', `Failed to delete region: ${(error as any).response?.data?.message || (error as any).message || 'Unknown error'}`);
      }
    }
  };

  const handleAddCustomZoneType = async () => {
    // Clear previous errors
    setError(null);
    setZoneTypeValidationErrors({});
    
    // Validate form
    if (!validateZoneType()) {
      return;
    }

    // Store the zone type data before clearing the form
    const zoneTypeData = { ...newZoneType };
    const isEditing = isEditingZoneType;
    const editingId = editingZoneTypeId;

    // Check for duplicate names (case-insensitive)
    const trimmedName = zoneTypeData.name.trim().toLowerCase();
    const existingZoneType = Object.values(allZoneTypes).find(zt => 
      zt.name.toLowerCase() === trimmedName && 
      (!isEditing || Object.keys(allZoneTypes).find(key => allZoneTypes[key] === zt) !== editingId)
    );

    if (existingZoneType) {
      setZoneTypeValidationErrors({ name: 'A zone type with this name already exists' });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && editingId) {
        // Edit existing zone type
        const response = await axios.put(`/api/zone-types/${editingId}`, {
          name: zoneTypeData.name.trim(),
          description: zoneTypeData.description.trim(),
          color: zoneTypeData.color
        });
        const updatedZoneType = response.data;

        // Update allZoneTypes
        setAllZoneTypes(prev => ({
          ...prev,
          [editingId]: {
            name: updatedZoneType.name,
            color: updatedZoneType.color,
            description: updatedZoneType.description
          }
        }));
        
        // Close modal and reset form
        setNewZoneType({ name: '', description: '', color: '#4CAF50' });
        setIsModalOpen(false);
        setIsEditingZoneType(false);
        setEditingZoneTypeId(null);
        setZoneTypeValidationErrors({});
        
        Swal.toast(
          `Zone type "${zoneTypeData.name}" updated successfully!`,
          'success',
          'top-end',
          2000
        );
      } else {
        // Add new zone type
        const response = await axios.post('/api/zone-types', {
          name: zoneTypeData.name.trim(),
          description: zoneTypeData.description.trim(),
          color: zoneTypeData.color,
          cityId: 'caloocan'
        });
        const savedZoneType = response.data;

        // Update allZoneTypes
        setAllZoneTypes(prev => ({
          ...prev,
          [savedZoneType.id]: {
            name: savedZoneType.name,
            color: savedZoneType.color,
            description: savedZoneType.description
          }
        }));
        
        // Automatically select the newly created zone type
        setSelectedZoneType(savedZoneType.id);
        
        // Close modal and reset form
        setNewZoneType({ name: '', description: '', color: '#4CAF50' });
        setIsModalOpen(false);
        setIsEditingZoneType(false);
        setEditingZoneTypeId(null);
        setZoneTypeValidationErrors({});
        
        Swal.toast(
          `Zone type "${savedZoneType.name}" added successfully!`,
          'success',
          'top-end',
          2000
        );
      }
    } catch (error) {
      console.error('Error saving zone type:', error);
      // Check if it's a duplicate name error from the server
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('unique') || errorMessage.toLowerCase().includes('already exists')) {
        setZoneTypeValidationErrors({ name: 'A zone type with this name already exists' });
      } else {
        setError('Failed to save zone type. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditZoneType = (zoneTypeId: string) => {
    const zoneType = allZoneTypes[zoneTypeId];
    if (zoneType) {
      setNewZoneType({
        name: zoneType.name,
        description: zoneType.description || '',
        color: zoneType.color
      });
      setEditingZoneTypeId(zoneTypeId);
      setIsEditingZoneType(true);
      setZoneTypeValidationErrors({});
      setError(null);
      setIsModalOpen(true);
    }
  };

  const handleDeleteZoneType = async (zoneTypeId: string) => {
    const zoneType = allZoneTypes[zoneTypeId];
    if (!zoneType) return;

    // Check if this zone type is being used by any zones
    const zonesUsingType = zones.filter(zone => zone.type === zoneTypeId);
    
    if (zonesUsingType.length > 0) {
      await Swal.error(
        'Cannot Delete Zone Type',
        `This zone type is used by ${zonesUsingType.length} zone(s). Please delete or change those zones first.`
      );
      return;
    }

    const result = await Swal.confirmDelete(
      'Delete Zone Type?',
      `Are you sure you want to delete "${zoneType.name}"? This action cannot be undone.`
    );

    if (result.isConfirmed) {
      try {
        // Delete from Laravel backend
        await axios.delete(`/api/zone-types/${zoneTypeId}`);
        
        // Update allZoneTypes
        setAllZoneTypes(prev => {
          const newTypes = { ...prev };
          delete newTypes[zoneTypeId];
          return newTypes;
        });
        
        // If the deleted zone type was selected, switch to first available zone type
        if (selectedZoneType === zoneTypeId) {
          // Get remaining zone types after deletion
          const remainingTypes = Object.keys(allZoneTypes).filter(id => id !== zoneTypeId);
          if (remainingTypes.length > 0) {
            setSelectedZoneType(remainingTypes[0]);
          } else {
            setSelectedZoneType(''); // No zone types left
          }
        }
        
        // Close the modal and reset form
        setIsModalOpen(false);
        setIsEditingZoneType(false);
        setEditingZoneTypeId(null);
        setNewZoneType({ name: '', description: '', color: '#4CAF50' });
        
        await Swal.success('Zone Type Deleted!', `"${zoneType.name}" has been removed.`);
      } catch (error) {
        console.error('Error deleting zone type:', error);
        await Swal.error('Error', 'Failed to delete zone type. Please try again.');
      }
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewZoneType(prev => ({ ...prev, color: e.target.value }));
  };

  // Validation functions
  const validateZoneType = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!newZoneType.name?.trim()) {
      errors.name = 'Zone type name is required';
    }
    
    if (!newZoneType.color?.trim()) {
      errors.color = 'Zone color is required';
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(newZoneType.color)) {
      errors.color = 'Please enter a valid hex color code';
    }
    
    setZoneTypeValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegion = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!newRegion.name?.trim()) {
      errors.name = 'Region name is required';
    }
    
    if (!newRegion.latitude?.trim()) {
      errors.latitude = 'Latitude is required';
    } else {
      const lat = parseFloat(newRegion.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }
    }
    
    if (!newRegion.longitude?.trim()) {
      errors.longitude = 'Longitude is required';
    } else {
      const lng = parseFloat(newRegion.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }
    }
    
    if (!newRegion.zoomLevel || newRegion.zoomLevel < 1 || newRegion.zoomLevel > 20) {
      errors.zoomLevel = 'Zoom level must be between 1 and 20';
    }
    
    setRegionValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form change handlers with validation clearing
  const handleZoneTypeChange = (field: string, value: any) => {
    setNewZoneType(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (zoneTypeValidationErrors[field]) {
      setZoneTypeValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRegionChange = (field: string, value: any) => {
    setNewRegion(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (regionValidationErrors[field]) {
      setRegionValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearAllZones = async () => {
    if (zones.length === 0) {
      await Swal.info('No Zones to Clear', 'There are no zones on the map to clear.');
      return;
    }

    const result = await Swal.confirmDelete(
      'Clear All Zones?',
      `This will remove all ${zones.length} zones from the map. This action cannot be undone.`
    );

    if (result.isConfirmed) {
      try {
        // Clear from Laravel backend
        await axios.delete('/api/zones/clear/caloocan');
        
        // Clear drawing layers
        if (clearLayersRef.current) {
          clearLayersRef.current();
        }
        
        // Update local state
        setZones([]);
        
        await Swal.success('Zones Cleared!', 'All zones have been removed from the map.');
      } catch (error) {
        console.error('Error clearing zones:', error);
        await Swal.error('Error', 'Failed to clear zones. Please try again.');
      }
    }
  };

  const exportZones = async () => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Export timeout - operation took too long')), 30000)
      );
      
      // Export data from Laravel backend with timeout
      const response = await Promise.race([
        axios.get('/api/export/caloocan'),
        timeoutPromise
      ]) as any;
      const exportData = response.data;
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `caloocan_zoning_map_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      // Show success message
      await Swal.success('Export Complete!', `Successfully exported ${exportData.totalZones || 'all'} zones to JSON file.`);
      
    } catch (error) {
      console.error('Export error details:', error);
      
      // Simple, user-friendly error message
      await Swal.error('Export Unavailable', 'Unable to export data at this time. Please try again later.');
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center bg-background shadow-md p-6 rounded-xl w-full h-full">
          <div className="text-center">
            <div className="inline-block border-4 border-gray-300 border-t-blue-600 rounded-full w-8 h-8 animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading zoning data...</p>
          </div>
        </div>
      ) : loadError ? (
        <div className="flex justify-center items-center bg-background shadow-md p-6 rounded-xl w-full h-full">
          <div className="text-center">
            <div className="inline-block border-4 border-t-red-600 border-red-300 rounded-full w-8 h-8 animate-spin"></div>
            <p className="mt-4 font-semibold text-red-600">Connection Error</p>
            <p className="mt-2 max-w-md text-gray-600 text-sm">{loadError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded text-white"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
      <div className="flex flex-col bg-background shadow-md p-6 rounded-xl w-full h-full overflow-hidden">
        <div className="flex-shrink-0 mb-4 pb-2 border-gray-200 border-b-2">
          <div className="flex justify-between">
            <Header 
              title="Zoning Map" 
              subtext="Interactive zoning map for land use planning" 
            />
            
            {/* Controls next to header */}
            <div className="flex items-center gap-3">
              {/* <Button 
                variant="blue" 
                onClick={async () => {
                  try {
                    console.log('Testing API connectivity...');
                    const response = await fetch('http://localhost:3000/health');
                    const data = await response.json();
                    console.log('API health check:', data);
                    await Swal.success('API Test', `Backend is running: ${data.status}`);
                  } catch (error) {
                    console.error('API test failed:', error);
                    await Swal.error('API Test Failed', 'Backend services are not accessible');
                  }
                }}
              >
                Test API
              </Button> */}
              {/* <Button 
                variant="blue" 
                onClick={async () => {
                  try {
                    // Check if zone types are available
                    if (Object.keys(allZoneTypes).length === 0) {
                      await Swal.error('No Zone Types Available', 'You need to create zone types before testing zone creation. Click "Add Type" to create your first zone type.');
                      return;
                    }

                    // Check if selected zone type exists
                    if (!allZoneTypes[selectedZoneType]) {
                      await Swal.error('Invalid Zone Type', 'The selected zone type is not valid. Please select a valid zone type first.');
                      return;
                    }

                    console.log('Creating test zone...');
                    const testZone = {
                      name: `Test Zone ${Date.now()}`,
                      typeId: selectedZoneType,
                      color: allZoneTypes[selectedZoneType]?.color || '#4CAF50',
                      coordinates: {
                        type: "Feature",
                        geometry: {
                          type: "Polygon",
                          coordinates: [[[121.0, 14.7], [121.01, 14.7], [121.01, 14.71], [121.0, 14.71], [121.0, 14.7]]]
                        }
                      },
                      area: "Test Area",
                      cityId: 'caloocan'
                    };
                    const result = await zoningAPI.zones.create(testZone);
                    console.log('Test zone created:', result);
                    await Swal.success('Test Zone Created', 'API is working!');
                    
                    // Add to local state
                    setZones(prev => [...prev, {
                      id: result.id,
                      name: result.name,
                      type: result.typeId,
                      color: result.color,
                      coordinates: result.coordinates,
                      area: result.area
                    }]);
                  } catch (error) {
                    console.error('Test zone creation failed:', error);
                    await Swal.error('Test Failed', `Could not create test zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                Test Zone
              </Button> */}
              <Button variant="red" onClick={clearAllZones}>Clear All Zones</Button>
              <Button variant="green" onClick={exportZones}>Export Data</Button>
              <div className="flex items-center bg-white px-3 py-2 border rounded-md text-gray-600 text-sm">
                <strong>Total Zones:</strong> <span className="ml-1 font-semibold text-blue-600">{zones.length}</span>
              </div>
            </div>
          </div>
        </div>
        
         {/* Debug info and Navigation Controls */}
         <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-2 border-blue-200 rounded-lg mb-4 text-blue-800 text-xs">
           <div>
             Zone Type: {allZoneTypes[selectedZoneType as keyof typeof allZoneTypes]?.name || selectedZoneType} | 
             Color: {allZoneTypes[selectedZoneType as keyof typeof allZoneTypes]?.color} |
             Zone Types Loaded: {Object.keys(allZoneTypes).length}
           </div>
           <div className="flex items-center gap-2">
             {/* Location Search */}
             <div className="relative" ref={searchContainerRef}>
               <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                 <input
                   type="text"
                   placeholder="Search location..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onFocus={() => {
                     if (searchResults.length > 0) {
                       setShowSearchDropdown(true);
                     }
                   }}
                   className="bg-white px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 w-64 text-xs"
                   disabled={isSearching}
                 />
                 <button
                   type="submit"
                   disabled={isSearching || !searchQuery.trim()}
                   className="flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 px-2 py-1 rounded text-white text-xs transition-colors"
                   title="Search location"
                 >
                   {isSearching ? (
                     <div className="border border-white border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
                   ) : (
                     <Search size={12} />
                   )}
                 </button>
               </form>
               
               {/* Search Results Dropdown */}
               {showSearchDropdown && searchResults.length > 0 && (
                 <div className="top-full left-0 z-50 absolute bg-white shadow-lg mt-1 border border-gray-300 rounded-md w-128 max-h-60 overflow-y-auto">
                   {searchResults.map((result, index) => (
                     <button
                       key={index}
                       onClick={() => selectLocation(result)}
                       className="hover:bg-blue-50 px-3 py-2 border-gray-100 border-b last:border-b-0 w-full text-xs text-left"
                     >
                       <div className="font-medium text-gray-900 truncate">
                         {result.name || result.display_name.split(',')[0]}
                       </div>
                       <div className="text-gray-500 text-xs truncate">
                         {result.display_name}
                       </div>
                     </button>
                   ))}
                 </div>
               )}
             </div>
             
             {/* Navigation Dropdown */}
             <select
               onChange={(e) => {
                 const value = e.target.value;
                 if (value === 'full') flyToFullView();
                 else {
                   // Handle regions
                   const region = allRegions.find(r => r.id === value);
                   if (region) flyToRegion(region);
                 }
                 // Reset select after action
                 e.target.value = '';
               }}
               className="bg-white px-2 py-1 border border-gray-300 rounded text-xs"
               defaultValue=""
             >
               <option value="" disabled>Navigate to...</option>
               <option value="full">Full View</option>
               {allRegions.length > 0 && (
                 <>
                   {allRegions.map(region => (
                     <option key={region.id} value={region.id}>
                       {region.name}
                     </option>
                   ))}
                 </>
               )}
             </select>
             
             <button
               onClick={() => setIsRegionModalOpen(true)}
               className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 px-2 py-1 rounded text-white text-xs transition-colors"
               title="Add Custom Region"
             >
               <Plus size={10} />
               Region
             </button>
             
             {/* Region Edit Button */}
             {allRegions.length > 0 && (
               <div className="relative">
                 <select
                   onChange={(e) => {
                     const value = e.target.value;
                     if (value) {
                       handleEditRegion(value);
                     }
                     // Reset select after action
                     e.target.value = '';
                   }}
                   className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-white text-xs transition-colors cursor-pointer"
                   defaultValue=""
                 >
                   <option value="" disabled>Edit Region...</option>
                   {allRegions.map(region => (
                     <option key={region.id} value={region.id}>
                       {region.name}
                     </option>
                   ))}
                 </select>
               </div>
             )}
           </div>
         </div>

         {/* Main Content Layout - Left Panel + Right Map */}
         <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
           {/* Left Panel - Information */}
           <div className="flex flex-col w-80 flex-1 max-w-95 overflow-y-auto pr-2">
            {/* Instructions */}
            <div className="bg-blue-50 mb-4 p-4 border-2 border-blue-200 rounded-lg">
              <h4 className="mb-2 font-semibold text-blue-800 text-sm">How to Use:</h4>
              <ol className="space-y-1 text-blue-700 text-xs">
                <li>1. Use the drawing tools on the map</li>
                <li>2. Click and drag to create zones</li>
                <li>3. Edit or delete existing zones</li>
                <li>4. Export data when complete</li>
              </ol>
            </div>
            {/* Legend */}
            <div className="bg-white mb-4 p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700 text-sm">Zone Types:</h4>
                <Button 
                  variant="blue" 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center px-2 py-1 text-xs"
                >
                  <Plus size={12} className="mr-1" />
                  Add Type
                </Button>
              </div>
              <div className="gap-2 grid grid-cols-1">
                {Object.entries(allZoneTypes).length > 0 ? (
                  Object.entries(allZoneTypes).map(([key, value]) => {
                    const isSelected = selectedZoneType === key;
                    
                    return (
                      <div 
                        key={key} 
                        className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                          isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div 
                          className="flex-shrink-0 shadow-sm border rounded-sm w-4 h-4 cursor-pointer"
                          style={{ backgroundColor: value.color }}
                          onClick={() => setSelectedZoneType(key)}
                        ></div>
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedZoneType(key)}
                        >
                          <span className="font-medium text-sm">{value.name}</span>
                          {value.description && (
                            <div className="mt-0.5 text-gray-500 text-xs truncate">{value.description}</div>
                          )}
                        </div>
                        
                        {/* Edit button for any selected zone type */}
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditZoneType(key);
                            }}
                            className="hover:bg-blue-200 p-1 rounded text-blue-600 transition-colors"
                            title="Edit zone type"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col justify-center items-center py-2 text-center">
                    <p className="mb-2 font-medium text-gray-600 text-sm">No Zone Types Available</p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      Click "Add Type" to create your first zone type.
                    </p>
                  </div>
                )}
              </div>
            </div>

            

            {/* Zone List */}
            <div className="flex flex-col bg-white shadow-sm border-2 border-gray-200 rounded-lg">
              <div className="p-4 border-gray-200 border-b-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Created Zones ({filteredZones.length})
                    {zoneSearchQuery && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        • Searching for "{zoneSearchQuery}"
                      </span>
                    )}
                  </h3>
                </div>
                
                {/* Zone Search */}
                <div className="mb-3">
                  <SearchInput
                    placeholder="Search zones by name, type, or area..."
                    onSearch={setZoneSearchQuery}
                    onClear={() => setZoneSearchQuery('')}
                    className="text-sm"
                    debounceMs={200}
                  />
                </div>
                
                {/* Zone Type Filter Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-600" />
                    <label className="text-xs font-medium text-gray-600">
                      Filter by Zone Type
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={zoneTypeFilter}
                      onChange={(e) => setZoneTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white appearance-none cursor-pointer"
                    >
                      <option value="all">All Zone Types ({zones.length})</option>
                      {Object.entries(allZoneTypes).map(([typeId, typeData]) => {
                        const count = zones.filter(zone => zone.type === typeId).length;
                        return (
                          <option key={typeId} value={typeId}>
                            {typeData.name} ({count})
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {filteredZones.length > 0 ? (
                <div className="p-4">
                  <div className="space-y-3">
                    {filteredZones.map((zone) => (
                      <div 
                        key={zone.id} 
                        className="flex items-start gap-3 bg-gray-50 hover:shadow-md hover:bg-blue-50 cursor-pointer p-3 border-2 border-gray-200 rounded-lg transition-all duration-200"
                        onClick={() => flyToZone(zone)}
                        title="Click to navigate to this zone"
                      >
                        <div 
                          className="flex-shrink-0 shadow-md mt-0.5 border-2 border-white rounded w-5 h-5"
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <div className="flex-1 min-w-0 text-sm">
                          <div className="font-semibold text-gray-800 truncate">{zone.name}</div>
                          <div className="text-gray-600 text-xs">{(allZoneTypes as any)[zone.type]?.name || 'Unknown'}</div>
                          {zone.area && <div className="mt-1 text-gray-500 text-xs">{zone.area}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center p-4 text-gray-500 text-sm text-center">
                  {zoneTypeFilter === 'all' && !zoneSearchQuery
                    ? "No zones created yet. Use the drawing tools on the map to create zones."
                    : zoneSearchQuery && zoneTypeFilter === 'all'
                    ? `No zones found matching "${zoneSearchQuery}".`
                    : zoneSearchQuery && zoneTypeFilter !== 'all'
                    ? `No zones found matching "${zoneSearchQuery}" in the selected zone type.`
                    : `No zones found for the selected zone type.`
                  }
                </div>
              )}
            </div>
          </div>

           {/* Right Panel - Map */}
           <div className="flex-1 shadow-lg border-2 border-gray-200 rounded-lg min-h-96 overflow-hidden">
             <MapContainer
              center={caloocanCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapReferenceCapture mapRef={mapRef} />
              <CoordinatesIndicator />
              
              {/* Zones are now handled by DrawingControls for editing */}
              {/* <ZoneRenderer 
                zones={zones}
                allZoneTypes={allZoneTypes}
                zoneLayersRef={zoneLayersRef}
              /> */}
              
              <DrawingControls 
                selectedZoneType={selectedZoneType}
                onZoneCreated={handleZoneCreated}
                onZoneUpdated={handleZoneUpdated}
                onZoneDeleted={handleZoneDeleted}
                allZoneTypes={allZoneTypes}
                clearLayersRef={clearLayersRef}
                zones={zones}
              />
            </MapContainer>
          </div>
        </div>
      </div>
      )}

      {/* Add Custom Zone Type Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsModalOpen(false);
            setIsEditingZoneType(false);
            setEditingZoneTypeId(null);
            setNewZoneType({ name: '', description: '', color: '#4CAF50' });
            setZoneTypeValidationErrors({});
            setError(null);
          }
        }}
        title={isEditingZoneType ? "Edit Zone Type" : "Add Zone Type"}
        size="md"
      >
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="Zone Type Name *"
            placeholder="e.g., Residential"
            value={newZoneType.name}
            onChange={(e) => handleZoneTypeChange('name', e.target.value)}
            required
            error={zoneTypeValidationErrors.name}
            disabled={isSubmitting}
          />
          
          <TextArea
            label="Description"
            placeholder="Describe the purpose and characteristics of this zone type..."
            value={newZoneType.description}
            onChange={(e) => handleZoneTypeChange('description', e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
          
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Zone Color *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newZoneType.color}
                onChange={handleColorChange}
                className="border border-gray-300 rounded w-12 h-10"
                disabled={isSubmitting}
              />
              <Input
                placeholder="#4CAF50"
                value={newZoneType.color}
                onChange={(e) => handleZoneTypeChange('color', e.target.value)}
                leftIcon={<Palette size={16} />}
                className="font-mono"
                containerClassName="flex-1"
                error={zoneTypeValidationErrors.color}
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              Choose a color or enter a hex code
            </p>
          </div>
          
          <div className="flex justify-between pt-4">
            {/* Delete button - only show when editing */}
            <div>
              {isEditingZoneType && editingZoneTypeId && (
                <Button 
                  variant="red" 
                  onClick={() => handleDeleteZoneType(editingZoneTypeId)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm"
                  disabled={isSubmitting}
                >
                  <Trash2 size={12} />
                  Delete
                </Button>
              )}
            </div>
            
            {/* Cancel and Save buttons */}
            <div className="flex gap-2">
              <Button 
                variant="red" 
                onClick={() => {
                  if (!isSubmitting) {
                    setIsModalOpen(false);
                    setIsEditingZoneType(false);
                    setEditingZoneTypeId(null);
                    setNewZoneType({ name: '', description: '', color: '#4CAF50' });
                    setZoneTypeValidationErrors({});
                    setError(null);
                  }
                }}
                className="px-3 py-1.5 text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="green" 
                onClick={handleAddCustomZoneType}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm"
              >
                {isSubmitting ? 'Saving...' : (isEditingZoneType ? 'Update' : 'Add Zone Type')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Region Modal */}
      <Modal
        isOpen={isRegionModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsRegionModalOpen(false);
            setIsEditingRegion(false);
            setEditingRegionId(null);
            setNewRegion({ name: '', latitude: '', longitude: '', zoomLevel: 14 });
            setRegionValidationErrors({});
            setError(null);
          }
        }}
        title={isEditingRegion ? "Edit Region" : "Add Region"}
        size="md"
      >
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="Region Name *"
            placeholder="e.g., Business District, City Center"
            value={newRegion.name}
            onChange={(e) => handleRegionChange('name', e.target.value)}
            required
            error={regionValidationErrors.name}
            disabled={isSubmitting}
          />
          
          <div className="gap-3 grid grid-cols-2">
            <Input
              label="Latitude *"
              placeholder="14.7597"
              value={newRegion.latitude}
              onChange={(e) => handleRegionChange('latitude', e.target.value)}
              onBlur={(e) => {
                const value = e.target.value;
                // Auto-add decimal point for latitude (2+ digits, no decimal, no negative)
                if (value && /^\d{2,}$/.test(value) && !value.includes('.') && !value.startsWith('-')) {
                  const formatted = value.slice(0, 2) + '.' + value.slice(2);
                  setNewRegion(prev => ({ ...prev, latitude: formatted }));
                }
              }}
              type="number"
              step="any"
              min="-90"
              max="90"
              required
              error={regionValidationErrors.latitude}
              disabled={isSubmitting}
            />
            <Input
              label="Longitude *"
              placeholder="121.0408"
              value={newRegion.longitude}
              onChange={(e) => handleRegionChange('longitude', e.target.value)}
              onBlur={(e) => {
                const value = e.target.value;
                // Auto-add decimal point for longitude (3+ digits, no decimal, no negative)
                if (value && /^\d{3,}$/.test(value) && !value.includes('.') && !value.startsWith('-')) {
                  const formatted = value.slice(0, 3) + '.' + value.slice(3);
                  setNewRegion(prev => ({ ...prev, longitude: formatted }));
                }
              }}
              type="number"
              step="any"
              min="-180"
              max="180"
              required
              error={regionValidationErrors.longitude}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Zoom Level *
            </label>
            <select
              value={newRegion.zoomLevel}
              onChange={(e) => handleRegionChange('zoomLevel', parseInt(e.target.value))}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full ${
                regionValidationErrors.zoomLevel ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              <option value={10}>10 - Very Wide View</option>
              <option value={12}>12 - City View</option>
              <option value={14}>14 - District View (Default)</option>
              <option value={16}>16 - Neighborhood View</option>
              <option value={18}>18 - Street View</option>
            </select>
            {regionValidationErrors.zoomLevel && (
              <p className="text-xs text-red-600 mt-1">{regionValidationErrors.zoomLevel}</p>
            )}
            <p className="mt-1 text-gray-500 text-xs">
              Higher zoom levels show more detail but smaller area
            </p>
          </div>
          
          <div className="flex justify-between pt-4">
            {/* Delete button - only show when editing */}
            <div>
              {isEditingRegion && editingRegionId && (
                <Button 
                  variant="red" 
                  onClick={() => handleDeleteRegion(editingRegionId)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm"
                  disabled={isSubmitting}
                >
                  <Trash2 size={12} />
                  Delete
                </Button>
              )}
            </div>
            
            {/* Cancel and Save buttons */}
            <div className="flex gap-2">
              <Button 
                variant="red" 
                onClick={() => {
                  if (!isSubmitting) {
                    setIsRegionModalOpen(false);
                    setIsEditingRegion(false);
                    setEditingRegionId(null);
                    setNewRegion({ name: '', latitude: '', longitude: '', zoomLevel: 14 });
                    setRegionValidationErrors({});
                    setError(null);
                  }
                }}
                className="px-3 py-1.5 text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="green" 
                onClick={isEditingRegion ? handleUpdateRegion : handleAddRegion}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm"
              >
                {isSubmitting ? 'Saving...' : (isEditingRegion ? 'Update' : 'Add Region')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ZoningMap;
