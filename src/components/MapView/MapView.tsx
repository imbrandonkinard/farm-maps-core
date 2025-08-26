import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactMapGL, { NavigationControl } from 'react-map-gl/maplibre';
import { ControlPanel } from '../ControlPanel/ControlPanel';
import { FeatureSearchPanel } from '../FeatureSearchPanel/FeatureSearchPanel';
import { FeatureSelectPopup } from '../FeatureSelectPopup/FeatureSelectPopup';
import { PolygonPopup } from '../PolygonPopup';
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
  enableDebugLogging = false,
  customPolygonPopupContent,
  showPolygonPopup = true,
  onNavigate,
  onLayerUpload
}) => {
  const dispatch = useDispatch();
  const features = useSelector(selectFeatures);
  const geojson = useSelector(selectGeoJSON);
  const roundedArea = useSelector(selectCurrentArea);

  // Debug: Check if Redux actions are available
  if (enableDebugLogging) {
    console.log('Redux actions available:', {
      updateFeatures: typeof updateFeatures,
      deleteFeatures: typeof deleteFeatures,
      selectFeatures: typeof selectFeatures
    });
  }

  // Debug: Test Redux store connectivity
  useEffect(() => {
    if (enableDebugLogging) {
      console.log('Testing Redux store with a simple action...');
      // Test with a simple mock feature to see if Redux is working
      const testFeature = {
        id: 'test-123',
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: { name: 'Test Feature' }
      };

      setTimeout(() => {
        console.log('Dispatching test feature...');
        dispatch(updateFeatures([testFeature]));
      }, 2000);
    }
  }, [dispatch, enableDebugLogging]);

  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [activeLayer, setActiveLayer] = useState<MapLayer | null>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [polygonPopupInfo, setPolygonPopupInfo] = useState<any>(null);

  // Debug: Monitor features state changes
  useEffect(() => {
    if (enableDebugLogging) {
      console.log('Features state changed:', features);
      console.log('Features count:', features.length);
      console.log('Features details:', features.map(f => ({ id: f.id, name: f.properties?.name, type: f.geometry?.type })));
    }
  }, [features, enableDebugLogging]);

  // Handle layer uploads
  const handleLayerUpload = useCallback((uploadedLayer: MapLayer) => {
    if (enableDebugLogging) {
      console.log('Handling layer upload:', uploadedLayer);
    }

    // Add the uploaded layer to the layers array
    setLayers(prevLayers => {
      const newLayers = [...prevLayers, uploadedLayer];
      if (enableDebugLogging) {
        console.log('Updated layers:', newLayers);
      }
      return newLayers;
    });

    // Set the uploaded layer as active
    setActiveLayer(uploadedLayer);

    // Add the new layer to the map if it's already loaded
    const map = mapRef.current?.getMap();
    if (map && map.isStyleLoaded()) {
      try {
        // Add the new source
        if (!map.getSource(uploadedLayer.id)) {
          map.addSource(uploadedLayer.id, {
            type: 'geojson',
            data: uploadedLayer.data
          });
        }

        // Add the new layers based on geometry type
        const layerIndex = layers.length; // Use the current length as index

        // Check if this layer contains points, polygons, or both
        const hasPoints = uploadedLayer.data.features.some(f =>
          f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
        );
        const hasPolygons = uploadedLayer.data.features.some(f =>
          f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
        );

        if (hasPoints) {
          // Add circle layer for points
          const circleLayerId = `${uploadedLayer.id}_circle_${layerIndex}`;
          map.addLayer({
            id: circleLayerId,
            type: 'circle',
            source: uploadedLayer.id,
            filter: ['any',
              ['==', ['geometry-type'], 'Point'],
              ['==', ['geometry-type'], 'MultiPoint']
            ],
            paint: {
              'circle-radius': 8,
              'circle-color': uploadedLayer.style.fill.color,
              'circle-opacity': uploadedLayer.style.fill.opacity,
              'circle-stroke-color': uploadedLayer.style.line.color,
              'circle-stroke-width': uploadedLayer.style.line.width
            },
            layout: {
              visibility: 'visible'
            }
          });

          if (enableDebugLogging) {
            console.log('Added circle layer for points:', circleLayerId);
          }
        }

        if (hasPolygons) {
          // Add fill layer for polygons
          const fillLayerId = `${uploadedLayer.id}_fill_${layerIndex}`;
          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: uploadedLayer.id,
            filter: ['any',
              ['==', ['geometry-type'], 'Polygon'],
              ['==', ['geometry-type'], 'MultiPolygon']
            ],
            paint: {
              'fill-color': uploadedLayer.style.fill.color,
              'fill-opacity': uploadedLayer.style.fill.opacity
            },
            layout: {
              visibility: 'visible'
            }
          });

          // Add line layer for polygons
          const lineLayerId = `${uploadedLayer.id}_line_${layerIndex}`;
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: uploadedLayer.id,
            filter: ['any',
              ['==', ['geometry-type'], 'Polygon'],
              ['==', ['geometry-type'], 'MultiPolygon']
            ],
            paint: {
              'line-color': uploadedLayer.style.line.color,
              'line-width': uploadedLayer.style.line.width
            },
            layout: {
              visibility: 'visible'
            }
          });

          if (enableDebugLogging) {
            console.log('Added fill and line layers for polygons:', fillLayerId, lineLayerId);
          }
        }

        if (enableDebugLogging) {
          console.log('Successfully added uploaded layer to map:', uploadedLayer.id);
          console.log('Layer contains points:', hasPoints, 'polygons:', hasPolygons);
        }
      } catch (error) {
        console.error('Error adding uploaded layer to map:', error);
      }
    }

    // Call the callback if provided
    if (onLayerUpload) {
      onLayerUpload(uploadedLayer);
    }
  }, [onLayerUpload, enableDebugLogging, layers.length]);

  // Load layer data
  useEffect(() => {
    // Load Ahupuaa layer
    fetch('/Ahupuaa.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const ahupuaaLayer = {
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (enableDebugLogging) {
          console.log('School Complex Areas data:', data);
        }
        const schoolComplexLayer = {
          id: 'complex_area_school_layer',
          name: 'School Complex Areas',
          data: data,
          nameProperty: 'complex_area',
          style: {
            fill: {
              color: '#800080',
              opacity: 0.2
            },
            line: {
              color: '#800080',
              width: 2
            }
          }
        };
        setLayers(prevLayers => {
          const exists = prevLayers.some(layer => layer.id === schoolComplexLayer.id);
          if (exists) {
            return prevLayers;
          }
          return [...prevLayers, schoolComplexLayer];
        });

        // Load School Districts layer after School Complex Areas is loaded
        return fetch('/School_Districts.geojson');
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (enableDebugLogging) {
          console.log('School Districts data:', data);
        }
        const schoolDistrictLayer = {
          id: 'district_region_school_layer',
          name: 'School Districts',
          data: data,
          nameProperty: 'region1',
          style: {
            fill: {
              color: '#008000',
              opacity: 0.2
            },
            line: {
              color: '#008000',
              width: 2
            }
          }
        };
        setLayers(prevLayers => {
          const exists = prevLayers.some(layer => layer.id === schoolDistrictLayer.id);
          if (exists) {
            return prevLayers;
          }
          return [...prevLayers, schoolDistrictLayer];
        });

        // Load WIC Locations layer after School Districts is loaded
        return fetch('/WIC_Locations.geojson');
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (enableDebugLogging) {
          console.log('WIC Locations data:', data);
        }
        const wicLocationsLayer = {
          id: 'wic_locations_layer',
          name: 'WIC Locations',
          data: data,
          nameProperty: 'name',
          style: {
            fill: {
              color: '#FF6B35',
              opacity: 0.8
            },
            line: {
              color: '#FF6B35',
              width: 1
            }
          }
        };
        setLayers(prevLayers => {
          const exists = prevLayers.some(layer => layer.id === wicLocationsLayer.id);
          if (exists) {
            return prevLayers;
          }
          const newLayers = [...prevLayers, wicLocationsLayer];

          // Set WIC layer as active when it's loaded
          setActiveLayer(wicLocationsLayer);

          // Add the new layer to the map immediately
          const map = mapRef.current?.getMap();
          if (map && map.isStyleLoaded()) {
            try {
              // Add source if it doesn't exist
              if (!map.getSource(wicLocationsLayer.id)) {
                map.addSource(wicLocationsLayer.id, {
                  type: 'geojson',
                  data: wicLocationsLayer.data
                });
              }

              // Check geometry types
              const hasPoints = wicLocationsLayer.data.features.some((f: any) =>
                f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
              );
              const hasPolygons = wicLocationsLayer.data.features.some((f: any) =>
                f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
              );

              if (hasPoints) {
                // Add circle layer for points
                const circleLayerId = `${wicLocationsLayer.id}_circle_${newLayers.length - 1}`;
                if (!map.getLayer(circleLayerId)) {
                  map.addLayer({
                    id: circleLayerId,
                    type: 'circle',
                    source: wicLocationsLayer.id,
                    filter: ['any',
                      ['==', ['geometry-type'], 'Point'],
                      ['==', ['geometry-type'], 'MultiPoint']
                    ],
                    paint: {
                      'circle-radius': 8,
                      'circle-color': wicLocationsLayer.style.fill.color,
                      'circle-opacity': wicLocationsLayer.style.fill.opacity,
                      'circle-stroke-color': wicLocationsLayer.style.line.color,
                      'circle-stroke-width': wicLocationsLayer.style.line.width
                    }
                  });
                }
              }

              if (hasPolygons) {
                // Add fill layer for polygons
                const fillLayerId = `${wicLocationsLayer.id}_fill_${newLayers.length - 1}`;
                if (!map.getLayer(fillLayerId)) {
                  map.addLayer({
                    id: fillLayerId,
                    type: 'fill',
                    source: wicLocationsLayer.id,
                    filter: ['any',
                      ['==', ['geometry-type'], 'Polygon'],
                      ['==', ['geometry-type'], 'MultiPolygon']
                    ],
                    paint: {
                      'fill-color': wicLocationsLayer.style.fill.color,
                      'fill-opacity': wicLocationsLayer.style.fill.opacity
                    }
                  });
                }

                // Add line layer for polygons
                const lineLayerId = `${wicLocationsLayer.id}_line_${newLayers.length - 1}`;
                if (!map.getLayer(lineLayerId)) {
                  map.addLayer({
                    id: lineLayerId,
                    type: 'line',
                    source: wicLocationsLayer.id,
                    filter: ['any',
                      ['==', ['geometry-type'], 'Polygon'],
                      ['==', ['geometry-type'], 'MultiPolygon']
                    ],
                    paint: {
                      'line-color': wicLocationsLayer.style.line.color,
                      'line-width': wicLocationsLayer.style.line.width
                    }
                  });
                }
              }

              if (enableDebugLogging) {
                console.log('WIC layer added to map:', wicLocationsLayer.id);
                console.log('WIC layer data:', wicLocationsLayer.data);
                console.log('WIC layer features count:', wicLocationsLayer.data.features.length);
                console.log('WIC layer has points:', hasPoints);
                console.log('WIC layer has polygons:', hasPolygons);
              }
            } catch (error) {
              if (enableDebugLogging) {
                console.log('Error adding WIC layer to map:', error);
              }
            }
          }

          return newLayers;
        });
      })
      .catch(error => {
        console.error('Error loading layer data:', error);
      });
  }, [enableDebugLogging]);

  // Add initial layers to map and set up click handlers
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded() || layers.length === 0) return;

    // Add sources and layers for initial layers
    layers.forEach((layer, index) => {
      try {
        // Add source if it doesn't exist
        if (!map.getSource(layer.id)) {
          map.addSource(layer.id, {
            type: 'geojson',
            data: layer.data
          });
        }

        // Check geometry types
        const hasPoints = layer.data.features.some(f =>
          f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
        );
        const hasPolygons = layer.data.features.some(f =>
          f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
        );

        if (hasPoints) {
          // Add circle layer for points
          const circleLayerId = `${layer.id}_circle_${index}`;
          if (!map.getLayer(circleLayerId)) {
            map.addLayer({
              id: circleLayerId,
              type: 'circle',
              source: layer.id,
              filter: ['any',
                ['==', ['geometry-type'], 'Point'],
                ['==', ['geometry-type'], 'MultiPoint']
              ],
              paint: {
                'circle-radius': 8,
                'circle-color': layer.style.fill.color,
                'circle-opacity': layer.style.fill.opacity,
                'circle-stroke-color': layer.style.line.color,
                'circle-stroke-width': layer.style.line.width
              }
            });
          }
        }

        if (hasPolygons) {
          // Add fill layer for polygons
          const fillLayerId = `${layer.id}_fill_${index}`;
          if (!map.getLayer(fillLayerId)) {
            map.addLayer({
              id: fillLayerId,
              type: 'fill',
              source: layer.id,
              filter: ['any',
                ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
              ],
              paint: {
                'fill-color': layer.style.fill.color,
                'fill-opacity': layer.style.fill.opacity
              }
            });
          }

          // Add line layer for polygons
          const lineLayerId = `${layer.id}_line_${index}`;
          if (!map.getLayer(lineLayerId)) {
            map.addLayer({
              id: lineLayerId,
              type: 'line',
              source: layer.id,
              filter: ['any',
                ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
              ],
              paint: {
                'line-color': layer.style.line.color,
                'line-width': layer.style.line.width
              }
            });
          }
        }
      } catch (error) {
        if (enableDebugLogging) {
          console.log('Error adding layer to map:', layer.id, error);
        }
      }
    });

    // Set up click handler for map layers
    const onMapLayerClick = (e: any) => {
      const draw = drawRef.current;
      if (!draw) return;

      // Don't show popup if we're in drawing mode
      const currentMode = draw.getMode();
      if (currentMode === 'draw_polygon' || currentMode === 'direct_select') {
        return;
      }

      // Check if we clicked on a map layer feature
      const availableLayers = layers.flatMap((layer, index) => {
        const layerIds = [];
        const hasPoints = layer.data.features.some((f: any) =>
          f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
        );
        const hasPolygons = layer.data.features.some((f: any) =>
          f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
        );

        if (hasPoints) {
          layerIds.push(`${layer.id}_circle_${index}`);
        }
        if (hasPolygons) {
          layerIds.push(`${layer.id}_fill_${index}`);
        }

        if (enableDebugLogging) {
          console.log(`Layer ${layer.id}: hasPoints=${hasPoints}, hasPolygons=${hasPolygons}, layerIds=`, layerIds);
        }

        return layerIds;
      });

      if (enableDebugLogging) {
        console.log('Available layers for click detection:', availableLayers);
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: availableLayers
      });

      if (features.length > 0) {
        const feature = features[0];

        if (enableDebugLogging) {
          console.log('Clicked feature:', feature);
          console.log('Feature layer ID:', feature.layer.id);
        }

        // Find the corresponding layer by matching the layer ID pattern
        const layer = layers.find(l => {
          const layerIndex = layers.indexOf(l);
          const hasPoints = l.data.features.some(f =>
            f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
          );
          const hasPolygons = l.data.features.some(f =>
            f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
          );

          // Check if this feature belongs to this layer
          if (hasPoints && feature.layer.id === `${l.id}_circle_${layerIndex}`) {
            return true;
          }
          if (hasPolygons && feature.layer.id === `${l.id}_fill_${layerIndex}`) {
            return true;
          }
          return false;
        });

        if (layer) {
          if (enableDebugLogging) {
            console.log('Found matching layer:', layer.id);
          }

          // For point features, we need to find the closest point
          if (feature.geometry.type === 'Point') {
            // Find the actual feature data by matching coordinates
            const clickedCoords = feature.geometry.coordinates as [number, number];
            const actualFeature = layer.data.features.find(f => {
              if (f.geometry.type === 'Point') {
                const featureCoords = f.geometry.coordinates as [number, number];
                // Check if coordinates match (with small tolerance for floating point precision)
                return Math.abs(clickedCoords[0] - featureCoords[0]) < 0.000001 &&
                  Math.abs(clickedCoords[1] - featureCoords[1]) < 0.000001;
              }
              return false;
            });

            if (actualFeature) {
              if (enableDebugLogging) {
                console.log('Found matching point feature:', actualFeature);
              }
              // Show popup for the point feature
              if (showPolygonPopup) {
                setPolygonPopupInfo({
                  feature: actualFeature,
                  position: {
                    x: e.point.x,
                    y: e.point.y
                  }
                });
              }
            }
          } else {
            // For polygon features, use the existing logic
            const actualFeature = layer.data.features.find(f =>
              f.properties && f.properties[layer.nameProperty] === feature.properties?.[layer.nameProperty]
            );

            if (actualFeature) {
              if (enableDebugLogging) {
                console.log('Found matching polygon feature:', actualFeature);
              }
              // Show popup for the feature
              if (showPolygonPopup) {
                setPolygonPopupInfo({
                  feature: actualFeature,
                  position: {
                    x: e.point.x,
                    y: e.point.y
                  }
                });
              }
            }
          }
        }
      }
    };

    // Add click handler for map layers
    map.on('click', onMapLayerClick);

    return () => {
      map.off('click', onMapLayerClick);
    };
  }, [layers, mapRef, showPolygonPopup, enableDebugLogging]);

  // Add debugging for layer changes
  useEffect(() => {
    if (enableDebugLogging) {
      console.log('Layers updated:', layers);
    }
  }, [layers, enableDebugLogging]);

  useEffect(() => {
    if (enableDebugLogging) {
      console.log('Active layer changed:', activeLayer);
    }
  }, [activeLayer, enableDebugLogging]);

  // Add hover and click detection for drawn polygons
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded) return;

    let isDragging = false;

    // Add hover handler
    const onMouseMove = (e: any) => {
      if (isDragging) return;

      const draw = drawRef.current;
      if (!draw) return;

      // Use MapboxDraw's built-in feature detection
      const featureIds = draw.getFeatureIdsAt(e.point);
      if (featureIds.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
      } else {
        map.getCanvas().style.cursor = isDragging ? 'grab' : '';
      }
    };

    // Track dragging state
    const onMouseDown = () => {
      isDragging = false;
      map.getCanvas().style.cursor = 'grab';
    };

    const onDragStart = () => {
      isDragging = true;
      map.getCanvas().style.cursor = 'grabbing';
    };

    const onDragEnd = () => {
      isDragging = false;
      map.getCanvas().style.cursor = '';
    };

    // Add click handler
    const onClick = (e: any) => {
      if (isDragging) return;

      const draw = drawRef.current;
      if (!draw) return;

      // Don't show popup if we're in drawing mode
      const currentMode = draw.getMode();
      if (currentMode === 'draw_polygon' || currentMode === 'direct_select') {
        return;
      }

      // Use MapboxDraw's built-in feature detection
      const featureIds = draw.getFeatureIdsAt(e.point);
      if (featureIds.length === 0) {
        setPopupInfo(null);
        return;
      }

      // Get the full feature objects and sort by ID for consistent ordering
      const features = featureIds
        .map((id: string) => {
          try {
            const feature = draw.get(id);
            if (!feature) return null;

            return {
              id: feature.id,
              name: feature.properties?.name || `Field ${feature.id.slice(0, 6)}`,
              properties: feature.properties || {},
              geometry: feature.geometry
            };
          } catch (error) {
            console.error('Error getting feature:', error);
            return null;
          }
        })
        .filter(Boolean) // Remove any null/undefined features
        .sort((a: any, b: any) => a.id.localeCompare(b.id));

      if (features.length === 0) {
        setPopupInfo(null);
        return;
      }

      // Only show popup for overlapping features, otherwise show polygon popup
      if (features.length > 1) {
        setPopupInfo({
          features,
          position: {
            x: e.point.x,
            y: e.point.y
          }
        });
      } else {
        // Single feature, show polygon popup
        if (showPolygonPopup) {
          setPolygonPopupInfo({
            feature: features[0],
            position: {
              x: e.point.x,
              y: e.point.y
            }
          });
        } else {
          // Fallback to direct selection
          handleFeatureSelection(features[0]);
        }
      }
    };

    // Add event listeners
    map.on('mousedown', onMouseDown);
    map.on('dragstart', onDragStart);
    map.on('dragend', onDragEnd);
    map.on('mousemove', onMouseMove);
    map.on('click', onClick);

    return () => {
      map.off('mousedown', onMouseDown);
      map.off('dragstart', onDragStart);
      map.off('dragend', onDragEnd);
      map.off('mousemove', onMouseMove);
      map.off('click', onClick);
      map.getCanvas().style.cursor = '';
    };
  }, [mapLoaded]);

  // Draw all features from the Drawn Fields array
  const drawAllFeatures = useCallback(() => {
    if (!drawRef.current) return;

    if (enableDebugLogging) {
      console.log('Drawing all features from Drawn Fields');
      console.log('Features to draw:', features);
    }

    try {
      // Clear existing features
      drawRef.current.deleteAll();

      if (features && features.length > 0) {
        // Create feature collection
        const featureCollection = {
          type: 'FeatureCollection',
          features: features
        };

        // Draw all features
        drawRef.current.set(featureCollection);

        // Calculate total area
        const drawnFeatures = drawRef.current.getAll();
        const area = calculateAreaInAcres(drawnFeatures);
        dispatch(updateCurrentArea(area));

        if (enableDebugLogging) {
          console.log('Successfully drew features:', drawnFeatures);
        }
      } else {
        if (enableDebugLogging) {
          console.log('No features to draw');
        }
        dispatch(updateCurrentArea(0));
      }
    } catch (error) {
      console.error('Error drawing features:', error);
    }
  }, [features, dispatch, enableDebugLogging]);

  // Handle map initialization and feature drawing
  useEffect(() => {
    if (enableDebugLogging) {
      console.log('Map initialization effect running');
    }
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;

    const initMap = () => {
      if (retryCount >= MAX_RETRIES) {
        if (enableDebugLogging) {
          console.log('Max retries reached, forcing initialization');
        }
        setMapLoaded(true);
        drawAllFeatures();
        return;
      }

      if (!mapRef.current) {
        if (enableDebugLogging) {
          console.log(`Waiting for map ref... (attempt ${retryCount + 1})`);
        }
        timeoutId = setTimeout(() => {
          retryCount++;
          initMap();
        }, 100);
        return;
      }

      const map = mapRef.current.getMap();
      if (!map) {
        if (enableDebugLogging) {
          console.log(`Waiting for map instance... (attempt ${retryCount + 1})`);
        }
        timeoutId = setTimeout(() => {
          retryCount++;
          initMap();
        }, 100);
        return;
      }

      if (enableDebugLogging) {
        console.log('Map instance found, initializing features');
      }
      setMapLoaded(true);
      drawAllFeatures();

      // Add load handler for subsequent loads (e.g., after tab switches)
      map.on('load', () => {
        if (enableDebugLogging) {
          console.log('Map load event received, redrawing features');
        }
        drawAllFeatures();
      });
    };

    // Start initialization
    initMap();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const map = mapRef.current?.getMap();
      if (map) {
        map.off('load', drawAllFeatures);
      }
    };
  }, [drawAllFeatures, enableDebugLogging]);

  // Re-draw features when they change
  useEffect(() => {
    if (mapLoaded) {
      if (enableDebugLogging) {
        console.log('Features changed, redrawing');
      }
      drawAllFeatures();
    }
  }, [features, mapLoaded, drawAllFeatures]);

  const onUpdate = useCallback((e: any) => {
    if (enableDebugLogging) {
      console.log('onUpdate called with event:', e);
    }

    // Get all current features from draw control
    const draw = drawRef.current;
    if (!draw) return;

    // Get the complete current state of all features
    const allFeatures = draw.getAll().features;

    // Update Redux with all features
    if (enableDebugLogging) {
      console.log('Updating features in Redux:', allFeatures);
    }
    dispatch(updateFeatures(allFeatures));
  }, [dispatch, enableDebugLogging]);

  const onDelete = useCallback((e: any) => {
    if (enableDebugLogging) {
      console.log('onDelete called with event:', e);
    }
    const features = e.features;
    if (enableDebugLogging) {
      console.log('Deleting features from Redux:', features);
    }
    dispatch(deleteFeatures(features));
  }, [dispatch, enableDebugLogging]);



  const handleFeatureSelect = useCallback((feature: any) => {
    if (!feature.geometry || !feature.geometry.coordinates) return;

    // Handle different geometry types
    if (feature.geometry.type === "Point") {
      // For points, zoom to the point with some padding
      const [lng, lat] = feature.geometry.coordinates;
      mapRef.current?.getMap().flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000
      });
      return;
    }

    // For polygons (existing logic)
    // For MultiPolygon, use the first polygon
    const coordinates = feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates[0][0]
      : feature.geometry.coordinates[0];

    // Calculate bounds
    const bounds = coordinates.reduce(
      (bounds: any, coord: any) => {
        return {
          minLng: Math.min(bounds.minLng, coord[0]),
          maxLng: Math.max(bounds.maxLng, coord[0]),
          minLat: Math.min(bounds.minLat, coord[1]),
          maxLat: Math.max(bounds.maxLat, coord[1])
        };
      },
      {
        minLng: Infinity,
        maxLng: -Infinity,
        minLat: Infinity,
        maxLat: -Infinity
      }
    );

    // Fit map to bounds with padding
    mapRef.current?.getMap().fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat]
      ],
      {
        padding: 50,
        duration: 1000 // Smooth animation
      }
    );
  }, []);

  const handleFeatureSelection = useCallback((feature: any) => {
    // Select the feature in DrawControl
    if (drawRef.current) {
      drawRef.current.changeMode('simple_select', { featureIds: [feature.id] });
    }

    // Update the view to focus on the selected feature
    if (feature.geometry && feature.geometry.coordinates) {
      const coordinates = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates[0][0]
        : feature.geometry.coordinates[0];

      const bounds = coordinates.reduce(
        (bounds: any, coord: any) => {
          return {
            minLng: Math.min(bounds.minLng, coord[0]),
            maxLng: Math.max(bounds.maxLng, coord[0]),
            minLat: Math.min(bounds.minLat, coord[1]),
            maxLat: Math.max(bounds.maxLat, coord[1])
          };
        },
        {
          minLng: Infinity,
          maxLng: -Infinity,
          minLat: Infinity,
          maxLat: -Infinity
        }
      );

      mapRef.current?.getMap().fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat]
        ],
        {
          padding: 50,
          duration: 1000
        }
      );
    }

    // Close the popup
    setPopupInfo(null);
  }, []);

  // Generate map style with stable layer IDs
  const dynamicMapStyle = useMemo(() => {
    return {
      version: 8,
      sources: {
        satellite: {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Imagery &copy; ESRI',
          maxzoom: 19
        },
        ...layers.reduce((acc, layer) => ({
          ...acc,
          [layer.id]: {
            type: 'geojson',
            data: layer.data
          }
        }), {})
      },
      layers: [
        {
          id: 'satellite',
          type: 'raster',
          source: 'satellite',
          minzoom: 0,
          maxzoom: 19
        },
        ...layers.flatMap((layer, index) => {
          const layers = [];

          // Check if this layer contains points, polygons, or both
          const hasPoints = layer.data.features.some(f =>
            f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint'
          );
          const hasPolygons = layer.data.features.some(f =>
            f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
          );

          if (hasPoints) {
            // Add circle layer for points
            layers.push({
              id: `${layer.id}_circle_${index}`,
              type: 'circle',
              source: layer.id,
              filter: ['any',
                ['==', ['geometry-type'], 'Point'],
                ['==', ['geometry-type'], 'MultiPoint']
              ],
              paint: {
                'circle-radius': 8,
                'circle-color': layer.style.fill.color,
                'circle-opacity': layer.style.fill.opacity,
                'circle-stroke-color': layer.style.line.color,
                'circle-stroke-width': layer.style.line.width
              },
              layout: {
                visibility: layer === activeLayer ? 'visible' : 'none'
              }
            });
          }

          if (hasPolygons) {
            // Add fill layer for polygons
            layers.push({
              id: `${layer.id}_fill_${index}`,
              type: 'fill',
              source: layer.id,
              filter: ['any',
                ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
              ],
              paint: {
                'fill-color': layer.style.fill.color,
                'fill-opacity': layer.style.fill.opacity
              },
              layout: {
                visibility: layer === activeLayer ? 'visible' : 'none'
              }
            });

            // Add line layer for polygons
            layers.push({
              id: `${layer.id}_line_${index}`,
              type: 'line',
              source: layer.id,
              filter: ['any',
                ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
              ],
              paint: {
                'line-color': layer.style.line.color,
                'line-width': layer.style.line.width
              },
              layout: {
                visibility: layer === activeLayer ? 'visible' : 'none'
              }
            });
          }

          return layers;
        })
      ]
    };
  }, [layers, activeLayer]);

  // Update layer visibility when active layer changes
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    // Wait for style to be fully loaded
    if (!map.getStyle()) return;

    // Hide all layers first
    layers.forEach((layer) => {
      try {
        // Find all layers that belong to this layer by checking the map
        const mapLayers = map.getStyle().layers || [];
        const layerLayers = mapLayers.filter((mapLayer: any) =>
          mapLayer.id.startsWith(layer.id + '_')
        );

        layerLayers.forEach((mapLayer: any) => {
          if (map.getLayer(mapLayer.id)) {
            map.setLayoutProperty(mapLayer.id, 'visibility', 'none');
          }
        });

        if (enableDebugLogging) {
          console.log(`Hidden ${layerLayers.length} layers for ${layer.id}:`, layerLayers.map((l: any) => l.id));
        }
      } catch (error) {
        // Layer might not exist yet, ignore error
        if (enableDebugLogging) {
          console.log('Layer not ready yet:', layer.id);
        }
      }
    });

    // Show active layer
    if (activeLayer) {
      try {
        // Find all layers that belong to the active layer
        const mapLayers = map.getStyle().layers || [];
        const activeLayerLayers = mapLayers.filter((mapLayer: any) =>
          mapLayer.id.startsWith(activeLayer.id + '_')
        );

        activeLayerLayers.forEach((mapLayer: any) => {
          if (map.getLayer(mapLayer.id)) {
            map.setLayoutProperty(mapLayer.id, 'visibility', 'visible');
          }
        });

        if (enableDebugLogging) {
          console.log(`Showing ${activeLayerLayers.length} layers for active layer ${activeLayer.id}:`, activeLayerLayers.map((l: any) => l.id));
        }
      } catch (error) {
        if (enableDebugLogging) {
          console.log('Active layer not ready yet:', activeLayer.id);
        }
      }
    }
  }, [activeLayer, layers, enableDebugLogging]);

  return (
    <div
      style={{
        display: 'flex',
        height: '80vh',
        width: '100%',
        backgroundColor: '#f5f5f5'
      }}
      data-testid="map-view"
    >
      {showFeatureSearch && (
        <FeatureSearchPanel
          layers={layers}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          onFeatureSelect={handleFeatureSelect}
          onLayerUpload={handleLayerUpload}
        />
      )}
      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
        margin: '0 10px'
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
          mapStyle={dynamicMapStyle as any}
          mapLib={import('maplibre-gl')}
          dragPan={true}
          dragRotate={false}
          touchPitch={false}
          doubleClickZoom={false}
          style={{ width: '100%', height: '100%' }}
          onLoad={(event: any) => {
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
                console.log('Feature structure check:', e.features.map((f: any) => ({
                  id: f.id,
                  idType: typeof f.id,
                  hasId: !!f.id,
                  type: f.type,
                  geometry: f.geometry,
                  properties: f.properties
                })));
              }

              const enhancedFeatures = e.features.map((f: any) => ({
                ...f,
                properties: { ...f.properties, name: `Field ${f.id.slice(0, 6)}` }
              }));

              if (enableDebugLogging) {
                console.log('Enhanced features:', enhancedFeatures);
                console.log('Features have IDs:', enhancedFeatures.map((f: any) => f.id));
              }

              // Dispatch Redux action to add new features
              dispatch(updateFeatures(enhancedFeatures));

              if (enableDebugLogging) {
                console.log('Dispatched updateFeatures action with payload:', enhancedFeatures);
              }

              // Call callback if provided
              if (onFeatureCreate) {
                onFeatureCreate(enhancedFeatures);
              }
            });

            map.on('draw.update', (e: any) => {
              if (enableDebugLogging) {
                console.log('Draw update event:', e);
              }
              // Dispatch Redux action to update features
              dispatch(updateFeatures(e.features));

              // Call callback if provided
              if (onFeatureUpdate) {
                onFeatureUpdate(e.features);
              }
            });

            map.on('draw.delete', (e: any) => {
              if (enableDebugLogging) {
                console.log('Draw delete event:', e);
              }
              // Dispatch Redux action to delete features
              dispatch(deleteFeatures(e.features));

              // Call callback if provided
              if (onFeatureDelete) {
                onFeatureDelete(e.features);
              }
            });

            map.on('draw.selectionchange', (e: any) => {
              if (e.features && e.features.length > 0) {
                draw.changeMode('direct_select', { featureId: e.features[0].id });
              }
            });

            // Add style load event handler
            map.on('style.load', (e: any) => {
              if (enableDebugLogging) {
                console.log('Map style loaded, updating layer visibility');
              }
              // Trigger layer visibility update after style loads
              setTimeout(() => {
                if (activeLayer) {
                  const activeIndex = layers.findIndex(layer => layer.id === activeLayer.id);
                  if (activeIndex !== -1) {
                    try {
                      const fillLayerId = `${activeLayer.id}_fill_${activeIndex}`;
                      const lineLayerId = `${activeLayer.id}_line_${activeIndex}`;
                      const circleLayerId = `${activeLayer.id}_circle_${activeIndex}`;

                      if (map.getLayer(fillLayerId)) {
                        map.setLayoutProperty(fillLayerId, 'visibility', 'visible');
                      }
                      if (map.getLayer(lineLayerId)) {
                        map.setLayoutProperty(lineLayerId, 'visibility', 'visible');
                      }
                      if (map.getLayer(circleLayerId)) {
                        map.setLayoutProperty(circleLayerId, 'visibility', 'visible');
                      }
                    } catch (error) {
                      if (enableDebugLogging) {
                        console.log('Error updating layer visibility after style load:', error);
                      }
                    }
                  }
                }
              }, 100); // Small delay to ensure layers are ready
            });

            // Call onMapLoad callback if provided
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

        {/* Polygon Popup */}
        {polygonPopupInfo && showPolygonPopup && (
          <PolygonPopup
            feature={polygonPopupInfo.feature}
            position={polygonPopupInfo.position}
            onClose={() => setPolygonPopupInfo(null)}
            onNavigate={onNavigate}
            customContent={customPolygonPopupContent}
            showDefaultContent={!customPolygonPopupContent}
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
              onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
};
