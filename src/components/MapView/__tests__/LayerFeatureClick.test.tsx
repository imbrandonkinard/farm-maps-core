import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MapView } from '../MapView';
import { MapLayer } from '../../../types';

// Mock react-map-gl/maplibre
jest.mock('react-map-gl/maplibre', () => ({
  Map: ({ children, onClick, onLoad, ...props }: any) => (
    <div data-testid="map" onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Source: ({ children, ...props }: any) => <div data-testid="source" {...props}>{children}</div>,
  Layer: ({ ...props }: any) => <div data-testid="layer" {...props} />,
}));

// Mock maplibre-gl
jest.mock('maplibre-gl', () => ({
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    getStyle: jest.fn().mockReturnValue({
      layers: [
        { id: 'test_layer_circle_0' },
        { id: 'test_layer_fill_0' },
        { id: 'test_layer_line_0' }
      ]
    }),
    isStyleLoaded: jest.fn().mockReturnValue(true),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    getSource: jest.fn().mockReturnValue(null),
    queryRenderedFeatures: jest.fn().mockReturnValue([]),
    getCanvas: jest.fn().mockReturnValue({
      style: { cursor: '' }
    }),
    getLayer: jest.fn().mockReturnValue(true),
    setLayoutProperty: jest.fn(),
  })),
  NavigationControl: () => <div data-testid="navigation-control" />,
  GeolocateControl: () => <div data-testid="geolocate-control" />,
}));

// Mock @mapbox/mapbox-gl-draw
jest.mock('@mapbox/mapbox-gl-draw', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getMode: jest.fn().mockReturnValue('simple_select'),
    getFeatureIdsAt: jest.fn().mockReturnValue([]),
    get: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    getAll: jest.fn().mockReturnValue({ features: [] }),
    onChange: jest.fn(),
  })),
}));

// Mock mapboxUtils
jest.mock('../../../utils/mapboxUtils', () => ({
  getFeatureCenter: jest.fn().mockReturnValue([0, 0]),
  calculateFeatureArea: jest.fn().mockReturnValue(100),
}));

describe('LayerFeatureClick', () => {
  const mockLayer: MapLayer = {
    id: 'test_layer',
    name: 'Test Layer',
    nameProperty: 'name',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'feature_1',
          geometry: {
            type: 'Point',
            coordinates: [-156.3319, 20.7967]
          },
          properties: {
            name: 'Test Point',
            type: 'Test Feature',
            description: 'A test point feature'
          }
        },
        {
          type: 'Feature',
          id: 'feature_2',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-156.4, 20.7], [-156.3, 20.7], [-156.3, 20.8], [-156.4, 20.8], [-156.4, 20.7]]]
          },
          properties: {
            name: 'Test Polygon',
            type: 'Test Feature',
            area: 100
          }
        }
      ]
    },
    style: {
      fill: { color: '#FF6B35', opacity: 0.5 },
      line: { color: '#FF6B35', width: 2 }
    }
  };

  const defaultProps = {
    layers: [mockLayer],
    activeLayer: mockLayer,
    onLayerUpload: jest.fn(),
    enableDebugLogging: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect clicks on layer point features', async () => {
    const mockMap = {
      queryRenderedFeatures: jest.fn().mockReturnValue([
        {
          id: 'feature_1',
          geometry: { type: 'Point', coordinates: [-156.3319, 20.7967] },
          properties: { name: 'Test Point', type: 'Test Feature' }
        }
      ]),
      getStyle: jest.fn().mockReturnValue({
        layers: [{ id: 'test_layer_circle_0' }]
      }),
      on: jest.fn(),
      off: jest.fn(),
      isStyleLoaded: jest.fn().mockReturnValue(true),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn().mockReturnValue(null),
      getCanvas: jest.fn().mockReturnValue({ style: { cursor: '' } }),
      getLayer: jest.fn().mockReturnValue(true),
      setLayoutProperty: jest.fn(),
    };

    // Mock the map instance
    const { Map } = require('maplibre-gl');
    Map.mockImplementation(() => mockMap);

    render(<MapView {...defaultProps} />);

    // Simulate a click on a layer feature
    const mapElement = screen.getByTestId('map');
    fireEvent.click(mapElement, {
      point: { x: 100, y: 100 }
    });

    // Verify that queryRenderedFeatures was called
    expect(mockMap.queryRenderedFeatures).toHaveBeenCalledWith(
      { x: 100, y: 100 },
      { layers: ['test_layer_circle_0'] }
    );
  });

  it('should detect clicks on layer polygon features', async () => {
    const mockMap = {
      queryRenderedFeatures: jest.fn().mockReturnValue([
        {
          id: 'feature_2',
          geometry: { type: 'Polygon', coordinates: [[[-156.4, 20.7], [-156.3, 20.7], [-156.3, 20.8], [-156.4, 20.8], [-156.4, 20.7]]] },
          properties: { name: 'Test Polygon', type: 'Test Feature', area: 100 }
        }
      ]),
      getStyle: jest.fn().mockReturnValue({
        layers: [{ id: 'test_layer_fill_0' }, { id: 'test_layer_line_0' }]
      }),
      on: jest.fn(),
      off: jest.fn(),
      isStyleLoaded: jest.fn().mockReturnValue(true),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn().mockReturnValue(null),
      getCanvas: jest.fn().mockReturnValue({ style: { cursor: '' } }),
      getLayer: jest.fn().mockReturnValue(true),
      setLayoutProperty: jest.fn(),
    };

    const { Map } = require('maplibre-gl');
    Map.mockImplementation(() => mockMap);

    render(<MapView {...defaultProps} />);

    const mapElement = screen.getByTestId('map');
    fireEvent.click(mapElement, {
      point: { x: 200, y: 200 }
    });

    expect(mockMap.queryRenderedFeatures).toHaveBeenCalledWith(
      { x: 200, y: 200 },
      { layers: ['test_layer_fill_0', 'test_layer_line_0'] }
    );
  });

  it('should change cursor when hovering over layer features', async () => {
    const mockCanvas = { style: { cursor: '' } };
    const mockMap = {
      queryRenderedFeatures: jest.fn().mockReturnValue([
        {
          id: 'feature_1',
          geometry: { type: 'Point' },
          properties: { name: 'Test Point' }
        }
      ]),
      getStyle: jest.fn().mockReturnValue({
        layers: [{ id: 'test_layer_circle_0' }]
      }),
      getCanvas: jest.fn().mockReturnValue(mockCanvas),
      on: jest.fn(),
      off: jest.fn(),
      isStyleLoaded: jest.fn().mockReturnValue(true),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn().mockReturnValue(null),
      getLayer: jest.fn().mockReturnValue(true),
      setLayoutProperty: jest.fn(),
    };

    const { Map } = require('maplibre-gl');
    Map.mockImplementation(() => mockMap);

    render(<MapView {...defaultProps} />);

    // Simulate mouse move over a layer feature
    const mapElement = screen.getByTestId('map');
    fireEvent.mouseMove(mapElement, {
      point: { x: 100, y: 100 }
    });

    // The cursor should be set to pointer
    expect(mockCanvas.style.cursor).toBe('pointer');
  });

  it('should not detect clicks when no layer features are present', async () => {
    const mockMap = {
      queryRenderedFeatures: jest.fn().mockReturnValue([]),
      getStyle: jest.fn().mockReturnValue({
        layers: [{ id: 'test_layer_circle_0' }]
      }),
      on: jest.fn(),
      off: jest.fn(),
      isStyleLoaded: jest.fn().mockReturnValue(true),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn().mockReturnValue(null),
      getCanvas: jest.fn().mockReturnValue({ style: { cursor: '' } }),
      getLayer: jest.fn().mockReturnValue(true),
      setLayoutProperty: jest.fn(),
    };

    const { Map } = require('maplibre-gl');
    Map.mockImplementation(() => mockMap);

    render(<MapView {...defaultProps} />);

    const mapElement = screen.getByTestId('map');
    fireEvent.click(mapElement, {
      point: { x: 100, y: 100 }
    });

    expect(mockMap.queryRenderedFeatures).toHaveBeenCalledWith(
      { x: 100, y: 100 },
      { layers: ['test_layer_circle_0'] }
    );
  });

  it('should handle multiple overlapping features from different sources', async () => {
    const mockMap = {
      queryRenderedFeatures: jest.fn().mockReturnValue([
        {
          id: 'layer_feature_1',
          geometry: { type: 'Point' },
          properties: { name: 'Layer Point' }
        }
      ]),
      getStyle: jest.fn().mockReturnValue({
        layers: [{ id: 'test_layer_circle_0' }]
      }),
      on: jest.fn(),
      off: jest.fn(),
      isStyleLoaded: jest.fn().mockReturnValue(true),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn().mockReturnValue(null),
      getCanvas: jest.fn().mockReturnValue({ style: { cursor: '' } }),
      getLayer: jest.fn().mockReturnValue(true),
      setLayoutProperty: jest.fn(),
    };

    const mockDraw = {
      getMode: jest.fn().mockReturnValue('simple_select'),
      getFeatureIdsAt: jest.fn().mockReturnValue(['drawn_feature_1']),
      get: jest.fn().mockReturnValue({
        id: 'drawn_feature_1',
        geometry: { type: 'Polygon' },
        properties: { name: 'Drawn Field' }
      })
    };

    const { Map } = require('maplibre-gl');
    Map.mockImplementation(() => mockMap);

    render(<MapView {...defaultProps} />);

    const mapElement = screen.getByTestId('map');
    fireEvent.click(mapElement, {
      point: { x: 100, y: 100 }
    });

    // Should detect both drawn and layer features
    expect(mockMap.queryRenderedFeatures).toHaveBeenCalled();
  });

  it('should not detect clicks when in drawing mode', async () => {
    const mockMap = {
      queryRenderedFeatures: jest.fn(),
      getStyle: jest.fn().mockReturnValue({
        layers: [{ id: 'test_layer_circle_0' }]
      }),
      on: jest.fn(),
      off: jest.fn(),
      isStyleLoaded: jest.fn().mockReturnValue(true),
      addSource: jest.fn(),
      addLayer: jest.fn(),
      getSource: jest.fn().mockReturnValue(null),
      getCanvas: jest.fn().mockReturnValue({ style: { cursor: '' } }),
      getLayer: jest.fn().mockReturnValue(true),
      setLayoutProperty: jest.fn(),
    };

    const mockDraw = {
      getMode: jest.fn().mockReturnValue('draw_polygon'),
      getFeatureIdsAt: jest.fn().mockReturnValue([]),
    };

    const { Map } = require('maplibre-gl');
    Map.mockImplementation(() => mockMap);

    render(<MapView {...defaultProps} />);

    const mapElement = screen.getByTestId('map');
    fireEvent.click(mapElement, {
      point: { x: 100, y: 100 }
    });

    // Should not query for features when in drawing mode
    expect(mockMap.queryRenderedFeatures).not.toHaveBeenCalled();
  });
});
