import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactMapGL, { NavigationControl } from 'react-map-gl/maplibre';
import { ControlPanel } from '../ControlPanel/ControlPanel';
import { FeatureSearchPanel } from '../FeatureSearchPanel/FeatureSearchPanel';
import { FeatureSelectPopup } from '../FeatureSelectPopup/FeatureSelectPopup';
import {
  updateFeatures,
  deleteFeatures,
  updateCurrentArea,
  updateFeatureProperties,
  selectFeatures,
  selectCurrentArea,
  selectGeoJSON
} from '../../store/mapSlice';
import { createMapboxDraw, updateMapboxDrawConstants } from '../../utils/mapboxUtils';
import { calculateAreaInAcres } from '../../utils/geometry';
import { MapViewProps, MapLayer } from '../../types';

export const MapView: React.FC<MapViewProps> = ({
  initialViewState = {
    longitude: -156.3319,
    latitude: 20.7967,
    zoom: 7
  },
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  onMapLoad,
  onFeatureCreate,
  onFeatureUpdate,
  onFeatureDelete,
  onFeatureSelect,
  showNavigationControl = true,
  showAreaDisplay = true,
  showControlPanel = true,
  showFeatureSearch = true,
  customLayers = [],
  drawingControls = {
    polygon: true,
    point: false,
    line: false,
    trash: true
  },
  defaultDrawingMode = 'simple_select',
  enableDebugLogging = false
}) => {
  const dispatch = useDispatch();
  const features = useSelector(selectFeatures);
  const geojson = useSelector(selectGeoJSON);
  const roundedArea = useSelector(selectCurrentArea);

  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [activeLayer, setActiveLayer] = useState<MapLayer | null>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    if (enableDebugLogging) {
      console.log('Features state changed:', features);
      console.log('Features count:', features.length);
      console.log('Features details:', features.map(f => ({
        id: f.id,
        name: f.properties?.name,
        type: f.geometry?.type
      })));
    }
  }, [features, enableDebugLogging]);

  // Load custom layers
  useEffect(() => {
    if (customLayers.length > 0) {
      setLayers(customLayers);
      setActiveLayer(customLayers[0]);
    }
  }, [customLayers]);

  // Load default Ahupuaa layer if no custom layers
  useEffect(() => {
    if (customLayers.length === 0) {
      // Load Ahupuaa layer
      fetch('/Ahupuaa.geojson')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const ahupuaaLayer: MapLayer = {
            id: 'boundary_ahupuaa_layer',
            name: 'Ahupuaa Boundaries',
            data: data,
            nameProperty: 'ahupuaa',
            style: {
              fill: {
                color: '#088',
                opacity: 0.2
              },
              line: {
                color: '#088',
                width: 2
              }
            }
          };
          setLayers([ahupuaaLayer]);
          setActiveLayer(ahupuaaLayer);

          // Load School Complex Areas layer after Ahupuaa is loaded
          return fetch('/School_Complex_Areas.geojson');
        })
        .then(response => {
          if (response && response.ok) {
            return response.json();
          }
          return null;
        })
        .then(data => {
          if (data) {
            const schoolLayer: MapLayer = {
              id: 'boundary_school_complex_layer',
              name: 'School Complex Areas',
              data: data,
              nameProperty: 'school_complex',
              style: {
                fill: {
                  color: '#f0f',
                  opacity: 0.1
                },
                line: {
                  color: '#f0f',
                  width: 1
                }
              }
            };
            setLayers(prev => [...prev, schoolLayer]);
          }
        })
        .catch(error => {
          console.warn('Could not load default layers:', error);
        });
    }
  }, [customLayers]);

  const handleFeatureSelection = useCallback((feature: any) => {
    if (onFeatureSelect) {
      onFeatureSelect(feature);
    }
    setPopupInfo(null);
  }, [onFeatureSelect]);

  const onPolygonClick = useCallback((polygon: any) => {
    // Calculate area and update Redux store
    const area = calculateAreaInAcres(polygon);
    dispatch(updateCurrentArea(area));

    if (onFeatureSelect) {
      onFeatureSelect(polygon);
    }
  }, [dispatch, onFeatureSelect]);

  const onDelete = useCallback((event: any) => {
    if (event.type === 'delete' && event.features) {
      dispatch(deleteFeatures(event.features));
    }
  }, [dispatch]);

  const handleMapClick = useCallback((event: any) => {
    if (!mapLoaded) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point);
    const ahupuaaFeatures = features.filter((f: any) =>
      f.layer.id === 'boundary_ahupuaa_layer' ||
      f.layer.id === 'boundary_school_complex_layer'
    );

    if (ahupuaaFeatures.length > 0) {
      const clickedFeatures = ahupuaaFeatures.map((f: any) => ({
        id: f.id,
        properties: f.properties,
        geometry: f.geometry
      }));

      setPopupInfo({
        features: clickedFeatures,
        position: { x: event.point.x, y: event.point.y }
      });
    } else {
      setPopupInfo(null);
    }
  }, [mapLoaded]);

  const mapStyleWithLayers = useMemo(() => {
    if (!layers.length) return mapStyle;

    const sources: any = {};
    const mapLayers: any = [];

    // Add sources for each layer
    layers.forEach((layer, index) => {
      const sourceId = `source-${layer.id}`;
      sources[sourceId] = {
        type: 'geojson',
        data: layer.data
      };

      // Add fill layer
      mapLayers.push({
        id: `fill-${layer.id}`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': layer.style?.fill?.color || '#088',
          'fill-opacity': layer.style?.fill?.opacity || 0.2
        }
      });

      // Add line layer
      mapLayers.push({
        id: `line-${layer.id}`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': layer.style?.line?.color || '#088',
          'line-width': layer.style?.line?.width || 2
        }
      });
    });

    return {
      version: 8 as const,
      sources: {
        ...sources,
        'osm': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 22
        },
        ...mapLayers
      ]
    };
  }, [layers, mapStyle]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex'
    }}>
      <div style={{
        flex: 1,
        position: 'relative'
      }}>
        {/* Area calculation box */}
        {showAreaDisplay && (
          <div style={{
            position: 'absolute',
            bottom: 40,
            left: 10,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            borderRadius: '4px',
            width: '150px',
            textAlign: 'center',
            fontFamily: 'Open Sans, sans-serif',
            fontSize: '13px'
          }}>
            <p style={{ margin: 0 }}>
              Draw a polygon using the draw tools.
            </p>
            {roundedArea && (
              <>
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{roundedArea}</p>
                <p style={{ margin: 0 }}>acres</p>
              </>
            )}
          </div>
        )}

        <ReactMapGL
          ref={mapRef}
          initialViewState={initialViewState}
          mapStyle={mapStyleWithLayers}
          mapLib={import('maplibre-gl')}
          dragPan={true}
          dragRotate={false}
          touchPitch={false}
          doubleClickZoom={false}
          style={{ width: '100%', height: '100%' }}
          onClick={handleMapClick}
          onLoad={(event) => {
            const map = event.target;
            setMapLoaded(true);

            // Initialize drawing functionality
            updateMapboxDrawConstants();
            const draw = createMapboxDraw({
              displayControlsDefault: false,
              controls: drawingControls,
              defaultMode: defaultDrawingMode,
              userProperties: true,
              clickBuffer: 2,
              touchBuffer: 4,
              boxSelect: false
            });

            map.addControl(draw, 'top-left');

            // Store draw reference
            drawRef.current = draw;

            // Add event listeners
            map.on('draw.create', (e: any) => {
              if (enableDebugLogging) {
                console.log('Draw create event:', e);
                console.log('Raw features from MapboxDraw:', e.features);
              }

              const enhancedFeatures = e.features.map((f: any) => ({
                ...f,
                properties: { ...f.properties, name: `Field ${f.id.slice(0, 6)}` }
              }));

              // Dispatch Redux action to add new features
              dispatch(updateFeatures(enhancedFeatures));

              if (onFeatureCreate) {
                onFeatureCreate(enhancedFeatures);
              }
            });

            map.on('draw.update', (e) => {
              if (enableDebugLogging) {
                console.log('Draw update event:', e);
              }

              // Dispatch Redux action to update features
              dispatch(updateFeatures(e.features));

              if (onFeatureUpdate) {
                onFeatureUpdate(e.features);
              }
            });

            map.on('draw.delete', (e) => {
              if (enableDebugLogging) {
                console.log('Draw delete event:', e);
              }

              // Dispatch Redux action to delete features
              dispatch(deleteFeatures(e.features));

              if (onFeatureDelete) {
                onFeatureDelete(e.features);
              }
            });

            map.on('draw.selectionchange', (e) => {
              if (e.features && e.features.length > 0) {
                draw.changeMode('direct_select', { featureId: e.features[0].id });
              }
            });

            if (onMapLoad) {
              onMapLoad(map);
            }
          }}
        >
          {showNavigationControl && (
            <NavigationControl
              position="top-right"
              showCompass={false}
              showZoom={true}
            />
          )}
        </ReactMapGL>

        {/* Feature Selection Popup */}
        {popupInfo && (
          <FeatureSelectPopup
            features={popupInfo.features}
            position={popupInfo.position}
            onSelect={handleFeatureSelection}
            onClose={() => setPopupInfo(null)}
          />
        )}
      </div>

      {showControlPanel && (
        <div style={{
          width: '300px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #eee',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            Drawn Fields
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px'
          }}>
            <ControlPanel
              polygons={features}
              onPolygonClick={onPolygonClick}
              onDelete={onDelete}
            />
          </div>
        </div>
      )}

      {showFeatureSearch && activeLayer && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
          width: '250px'
        }}>
          <FeatureSearchPanel
            layers={layers}
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            onFeatureSelect={handleFeatureSelection}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;
