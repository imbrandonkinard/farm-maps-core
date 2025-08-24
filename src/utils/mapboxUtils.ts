import MapboxDraw from '@mapbox/mapbox-gl-draw';

/**
 * Update MapboxDraw constants to work with Maplibre
 * This ensures compatibility between Mapbox and Maplibre
 */
export const updateMapboxDrawConstants = (): void => {
  MapboxDraw.constants.classes.CANVAS = 'maplibregl-canvas';
  MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
  MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
  MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';
  MapboxDraw.constants.classes.ATTRIBUTION = 'maplibregl-ctrl-attrib';
};

/**
 * Default drawing styles for polygons
 */
export const getDefaultDrawingStyles = () => [
  // Selected polygon fill (rendered on top)
  {
    'id': 'gl-draw-polygon-fill-selected',
    'type': 'fill',
    'filter': ['all',
      ['==', '$type', 'Polygon'],
      ['==', 'active', 'true']
    ],
    'paint': {
      'fill-color': '#D20C0C',
      'fill-outline-color': '#D20C0C',
      'fill-opacity': 0.1
    }
  },
  // Selected polygon stroke (rendered on top)
  {
    'id': 'gl-draw-polygon-stroke-selected',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'Polygon'],
      ['==', 'active', 'true']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#D20C0C',
      'line-width': 2
    }
  },
  // Unselected polygon fill
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all',
      ['==', '$type', 'Polygon'],
      ['==', 'active', 'false']
    ],
    'paint': {
      'fill-color': '#D20C0C',
      'fill-outline-color': '#D20C0C',
      'fill-opacity': 0.1
    }
  },
  // Unselected polygon stroke
  {
    'id': 'gl-draw-polygon-stroke',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'Polygon'],
      ['==', 'active', 'false']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#D20C0C',
      'line-width': 2
    }
  },
  // Vertex point halos
  {
    'id': 'gl-draw-polygon-and-line-vertex-halo-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['==', 'active', 'false']
    ],
    'paint': {
      'circle-radius': 6,
      'circle-color': '#FFF'
    }
  },
  // Vertex points
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['==', 'active', 'false']
    ],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#D20C0C'
    }
  },
  // Active vertex point halos
  {
    'id': 'gl-draw-polygon-and-line-vertex-halo-active',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['==', 'active', 'true']
    ],
    'paint': {
      'circle-radius': 8,
      'circle-color': '#FFF'
    }
  },
  // Active vertex points
  {
    'id': 'gl-draw-polygon-and-line-vertex-active',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['==', 'active', 'true']
    ],
    'paint': {
      'circle-radius': 6,
      'circle-color': '#D20C0C'
    }
  },
  // Midpoint halos
  {
    'id': 'gl-draw-polygon-midpoint-halo',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'midpoint'],
      ['==', '$type', 'Point']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#FFF'
    }
  },
  // Midpoints
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all',
      ['==', 'meta', 'midpoint'],
      ['==', '$type', 'Point']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#D20C0C'
    }
  }
];

/**
 * Create MapboxDraw instance with default configuration
 * @param options - Custom options to override defaults
 * @returns Configured MapboxDraw instance
 */
export const createMapboxDraw = (options: any = {}) => {
  updateMapboxDrawConstants();

  const defaultOptions = {
    displayControlsDefault: false,
    controls: {
      polygon: true,
      point: false,
      line: false,
      trash: true
    },
    defaultMode: 'simple_select',
    userProperties: true,
    clickBuffer: 2,
    touchBuffer: 4,
    boxSelect: false,
    styles: getDefaultDrawingStyles()
  };

  return new MapboxDraw({
    ...defaultOptions,
    ...options
  });
};

/**
 * Check if a map instance is ready for drawing
 * @param map - The map instance
 * @returns True if map is ready
 */
export const isMapReadyForDrawing = (map: any): boolean => {
  if (!map) {
    return false;
  }

  if (typeof map.isStyleLoaded !== 'function' ||
    typeof map.addControl !== 'function') {
    return false;
  }

  if (!map.isStyleLoaded()) {
    return false;
  }

  // Check if map has a valid style
  const style = map.getStyle();
  if (!style || !style.layers) {
    return false;
  }

  return true;
};
