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



  // Use simple static map style
  const finalMapStyle = mapStyle;

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
          mapStyle={finalMapStyle}
          mapLib={import('maplibre-gl')}
          dragPan={true}
          dragRotate={false}
          touchPitch={false}
          doubleClickZoom={false}
          style={{ width: '100%', height: '100%' }}
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


    </div>
  );
};

export default MapView;
