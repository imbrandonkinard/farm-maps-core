// Core Components
export { default as DrawControl } from './components/DrawControl/DrawControl';
export { ControlPanel } from './components/ControlPanel/ControlPanel';
export { FeatureSearchPanel } from './components/FeatureSearchPanel/FeatureSearchPanel';
export { FeatureSelectPopup } from './components/FeatureSelectPopup/FeatureSelectPopup';

// Hooks - Removed due to React dependency conflicts
// export { useMapFeatures } from './hooks/useMapFeatures';
// export { useMapLayers } from './hooks/useMapLayers';

// Store
export {
  mapSlice,
  updateFeatures,
  deleteFeatures,
  updateCurrentArea,
  updateFeatureProperties,
  clearFeatures,
  setFeatures,
  selectFeatures,
  selectCurrentArea,
  selectGeoJSON,
  selectFeatureById
} from './store/mapSlice';

// Utilities
export {
  calculateAreaInAcres,
  calculateAreaInMultipleUnits,
  isPointInPolygon,
  getPolygonCentroid,
  bufferPolygon,
  simplifyPolygon
} from './utils/geometry';

export {
  createDefaultLayer,
  filterLayerFeatures,
  getLayerFeatureNames,
  validateLayer,
  mergeLayers
} from './utils/layerUtils';

export {
  updateMapboxDrawConstants,
  getDefaultDrawingStyles,
  createMapboxDraw,
  isMapReadyForDrawing
} from './utils/mapboxUtils';

// Types
export type {
  MapLayer,
  DrawControlProps,
  DrawControlRef,
  FeatureUpdateEvent,
  MapViewProps,
  ControlPanelProps,
  FeatureSearchPanelProps,
  FeatureSelectPopupProps,
  MapState,
  UseMapFeaturesReturn,
  UseMapLayersReturn,
  FarmMapsConfig
} from './types';

// Default configuration
export const defaultConfig = {
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  controls: {
    polygon: true,
    point: false,
    line: false,
    trash: true
  },
  theme: 'default' as const,
  enableAdvancedFeatures: false
};
