// Components
export { MapView } from './components/MapView/MapView';
export { default as DrawControl } from './components/DrawControl/DrawControl';
export { ControlPanel } from './components/ControlPanel/ControlPanel';
export { FeatureSearchPanel } from './components/FeatureSearchPanel/FeatureSearchPanel';
export { FeatureSelectPopup } from './components/FeatureSelectPopup/FeatureSelectPopup';
export { PolygonPopup } from './components/PolygonPopup';
export { UploadGISLayer } from './components/UploadGISLayer/UploadGISLayer';

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

// Basic Geometry Utilities
export {
  calculateAreaInAcres,
  calculateAreaInMultipleUnits,
  calculateArea,
  calculateTotalArea,
  isPointInPolygon,
  getPolygonCentroid,
  bufferPolygon,
  simplifyPolygon,
  calculateDistance,
  calculatePerimeter,
  doPolygonsIntersect,
  calculateIntersectionArea,
  unionPolygons,
  differencePolygons,
  getBoundingBox,
  createBoundingBoxPolygon,
  isFeatureInBbox,
  calculateAreaWeightedCentroid,
  convertArea
} from './utils/geometry';

// Advanced Geometry Utilities
export {
  calculateConvexHull,
  calculateMinimumBoundingCircle,
  calculateCenterOfMass,
  calculateEnvelope,
  calculateMinimumBoundingRectangle,
  calculateNearestPointOnLine,
  findNearestPoint,
  calculateBearing,
  calculateDestinationPoint,
  calculateMidpoint,
  calculateGreatCircleDistance,
  calculateAreaInSquareFeet,
  calculateAreaInHectares,
  calculateAreaInSquareKilometers,
  calculatePerimeterInFeet,
  calculatePerimeterInMiles,
  doesLineIntersectPolygon,
  calculateLineLength,
  bufferLine,
  simplifyLine
} from './utils/advancedGeometry';

// Measurement and Analysis Utilities
export {
  calculateTotalAreaInUnit,
  calculateAverageArea,
  findLargestFeature,
  findSmallestFeature,
  calculateFeatureDensity,
  calculateTotalPerimeter,
  calculateCompactnessRatio,
  calculateElongationRatio,
  calculateAspectRatio,
  calculateCircularity,
  calculateFractalDimension,
  calculateEfficiency,
  calculateShapeIndex,
  calculateRoundness
} from './utils/measurementUtils';

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
  PolygonPopupProps,
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
