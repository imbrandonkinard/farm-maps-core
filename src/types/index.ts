import { Map } from 'maplibre-gl';

// GeoJSON Types (defined locally to avoid conflicts)
export interface GeoJSONGeometry {
  type: string;
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties?: Record<string, any>;
  id?: string | number;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Map Layer Types
export interface MapLayer {
  id: string;
  name: string;
  data: GeoJSONFeatureCollection;
  nameProperty: string;
  style: {
    fill: {
      color: string;
      opacity: number;
    };
    line: {
      color: string;
      width: number;
    };
  };
}

// Drawing Control Types
export interface DrawControlProps {
  onCreate?: (event: FeatureUpdateEvent) => void;
  onUpdate?: (event: FeatureUpdateEvent) => void;
  onDelete?: (event: FeatureUpdateEvent) => void;
  onModeChange?: (mode: string) => void;
  controls?: {
    polygon?: boolean;
    point?: boolean;
    line?: boolean;
    trash?: boolean;
    combine_features?: boolean;
  };
  defaultMode?: string;
  styles?: any[];
  enableAdvancedFeatures?: boolean;
  position?: string;
}

export interface DrawControlRef {
  getMode: () => string;
  changeMode: (mode: string, options?: any) => void;
  getAll: () => any;
  getSelected: () => any;
  delete: (ids: string[]) => void;
  add: (geojson: any) => void;
}

export interface FeatureUpdateEvent {
  type: string;
  features: GeoJSONFeature[];
  target?: any;
}

// Map View Types
export interface MapViewProps {
  children?: React.ReactNode;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapStyle?: string;
  onMapLoad?: (map: any) => void;
  onFeatureCreate?: (features: any[]) => void;
  onFeatureUpdate?: (features: any[]) => void;
  onFeatureDelete?: (features: any[]) => void;
  onFeatureSelect?: (feature: any) => void;
  showNavigationControl?: boolean;
  showAreaDisplay?: boolean;
  showControlPanel?: boolean;
  showFeatureSearch?: boolean;
  customLayers?: MapLayer[];
  drawingControls?: {
    polygon: boolean;
    point: boolean;
    line: boolean;
    trash: boolean;
  };
  defaultDrawingMode?: string;
  enableDebugLogging?: boolean;
  style?: React.CSSProperties;
}

// Control Panel Types
export interface ControlPanelProps {
  polygons: GeoJSONFeature[];
  onPolygonClick: (polygon: GeoJSONFeature) => void;
  onDelete: (event: FeatureUpdateEvent) => void;
}

// Feature Search Panel Types
export interface FeatureSearchPanelProps {
  layers: MapLayer[];
  activeLayer: MapLayer | null;
  onLayerChange: (layer: MapLayer | null) => void;
  onFeatureSelect: (feature: GeoJSONFeature) => void;
}

// Feature Select Popup Types
export interface FeatureSelectPopupProps {
  features: Array<{
    id: string;
    name: string;
    feature: GeoJSONFeature;
  }>;
  position: { x: number; y: number };
  onSelect: (feature: GeoJSONFeature) => void;
  onClose: () => void;
}

// Redux Store Types
export interface MapState {
  features: Record<string, GeoJSONFeature>;
  currentArea: number | null;
  geojson: GeoJSONFeatureCollection;
}

// Hook Types
export interface UseMapFeaturesReturn {
  features: GeoJSONFeature[];
  addFeature: (feature: GeoJSONFeature) => void;
  updateFeature: (feature: GeoJSONFeature) => void;
  removeFeature: (featureId: string) => void;
  clearFeatures: () => void;
  getFeatureById: (id: string) => GeoJSONFeature | undefined;
}

export interface UseMapLayersReturn {
  layers: MapLayer[];
  activeLayer: MapLayer | null;
  addLayer: (layer: MapLayer) => void;
  removeLayer: (layerId: string) => void;
  setActiveLayer: (layer: MapLayer | null) => void;
}

// Configuration Types
export interface FarmMapsConfig {
  mapStyle: string;
  drawingStyles?: any[];
  controls?: {
    polygon?: boolean;
    point?: boolean;
    line?: boolean;
    trash?: boolean;
  };
  theme?: 'default' | 'custom';
  enableAdvancedFeatures?: boolean;
}
