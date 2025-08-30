import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MapView } from '../MapView';
import { mapSlice } from '../../../store/mapSlice';

// Mock react-map-gl/maplibre
jest.mock('react-map-gl/maplibre', () => ({
  Map: ({ children, onClick, onMouseMove, ...props }: any) => (
    <div data-testid="map" onClick={onClick} onMouseMove={onMouseMove} {...props}>
      {children}
    </div>
  ),
  Source: ({ children }: any) => <div data-testid="source">{children}</div>,
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
}));

// Mock maplibre-gl
const mockMap = {
  on: jest.fn(),
  off: jest.fn(),
  getStyle: jest.fn(() => ({
    layers: [
      { id: 'test-layer_circle_0' },
      { id: 'test-layer_fill_0' },
      { id: 'other-layer_circle_0' }
    ]
  })),
  addSource: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  removeSource: jest.fn(),
  getCanvas: jest.fn(() => ({ style: { cursor: '' } })),
  queryRenderedFeatures: jest.fn(() => []),
  isStyleLoaded: jest.fn(() => true),
  getSource: jest.fn(() => null),
};

jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => mockMap),
  NavigationControl: jest.fn(),
  GeolocateControl: jest.fn(),
}));

// Mock mapboxUtils
jest.mock('../../../utils/mapboxUtils', () => ({
  createMapboxDraw: jest.fn(() => ({
    getMode: jest.fn(() => 'simple_select'),
    getFeatureIdsAt: jest.fn(() => []), // No drawn features
    get: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(() => ({ features: [] })),
  })),
}));

// Mock console.log to capture logs
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });

describe('LayerFeatureClickPopup', () => {
  let store: any;

  const mockLayer = {
    id: 'test-layer',
    name: 'Test Layer',
    nameProperty: 'name',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          id: 'layer-feature-1',
          type: 'Feature',
          properties: {
            name: 'Test Point',
            type: 'Point Feature'
          },
          geometry: {
            type: 'Point',
            coordinates: [-156.3319, 20.7967]
          }
        }
      ]
    },
    style: {
      fill: { color: '#088', opacity: 0.2 },
      line: { color: '#088', width: 2 }
    }
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        map: mapSlice.reducer,
      },
      preloadedState: {
        features: {},
        currentArea: null,
        geojson: {
          type: 'FeatureCollection',
          features: []
        },
      },
    });
    mockConsoleLog.mockClear();

    // Reset mock implementations
    mockMap.queryRenderedFeatures.mockReturnValue([]);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it('should log feature click detection when clicking on layer point feature', async () => {
    // Mock queryRenderedFeatures to return a layer feature
    mockMap.queryRenderedFeatures.mockReturnValue([
      {
        id: 'layer-feature-1',
        layer: { id: 'test-layer_circle_0' },
        properties: {
          name: 'Test Point',
          type: 'Point Feature'
        },
        geometry: {
          type: 'Point',
          coordinates: [-156.3319, 20.7967]
        }
      }
    ]);

    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
          customLayers={[mockLayer]}
        />
      </Provider>
    );

    const map = screen.getByTestId('map');

    // Simulate click on map
    fireEvent.click(map, {
      point: { x: 100, y: 100 }
    });

    // Wait for the click handler to process
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎯 Feature click detected!',
        expect.objectContaining({
          totalFeatures: 1,
          drawnFeatures: 0,
          layerFeatures: 1,
          features: expect.arrayContaining([
            expect.objectContaining({
              id: 'layer-feature-1',
              name: 'Test Point',
              source: 'layer',
              layerId: 'test-layer',
              geometryType: 'Point'
            })
          ])
        })
      );
    });
  });

  it('should log polygon popup display for single layer feature', async () => {
    // Mock queryRenderedFeatures to return a layer feature
    mockMap.queryRenderedFeatures.mockReturnValue([
      {
        id: 'layer-feature-1',
        layer: { id: 'test-layer_circle_0' },
        properties: {
          name: 'Test Point',
          type: 'Point Feature'
        },
        geometry: {
          type: 'Point',
          coordinates: [-156.3319, 20.7967]
        }
      }
    ]);

    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
          customLayers={[mockLayer]}
        />
      </Provider>
    );

    const map = screen.getByTestId('map');

    // Simulate click on map
    fireEvent.click(map, {
      point: { x: 100, y: 100 }
    });

    // Wait for the click handler to process
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📍 Showing polygon popup for single feature:',
        'Test Point'
      );
    });
  });

  it('should log feature selection popup for overlapping features', async () => {
    // Mock queryRenderedFeatures to return multiple features
    mockMap.queryRenderedFeatures.mockReturnValue([
      {
        id: 'layer-feature-1',
        layer: { id: 'test-layer_circle_0' },
        properties: {
          name: 'Test Point 1',
          type: 'Point Feature'
        },
        geometry: {
          type: 'Point',
          coordinates: [-156.3319, 20.7967]
        }
      },
      {
        id: 'layer-feature-2',
        layer: { id: 'test-layer_circle_0' },
        properties: {
          name: 'Test Point 2',
          type: 'Point Feature'
        },
        geometry: {
          type: 'Point',
          coordinates: [-156.3319, 20.7967]
        }
      }
    ]);

    const multiFeatureLayer = {
      ...mockLayer,
      data: {
        ...mockLayer.data,
        features: [
          ...mockLayer.data.features,
          {
            id: 'layer-feature-2',
            type: 'Feature',
            properties: {
              name: 'Test Point 2',
              type: 'Point Feature'
            },
            geometry: {
              type: 'Point',
              coordinates: [-156.3319, 20.7967]
            }
          }
        ]
      }
    };

    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
          customLayers={[multiFeatureLayer]}
        />
      </Provider>
    );

    const map = screen.getByTestId('map');

    // Simulate click on map
    fireEvent.click(map, {
      point: { x: 100, y: 100 }
    });

    // Wait for the click handler to process
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎯 Feature click detected!',
        expect.objectContaining({
          totalFeatures: 2,
          drawnFeatures: 0,
          layerFeatures: 2
        })
      );
    });

    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📋 Showing feature selection popup for overlapping features'
      );
    });
  });

  it('should not log feature click when no layer features are detected', async () => {
    // Mock queryRenderedFeatures to return no features
    mockMap.queryRenderedFeatures.mockReturnValue([]);

    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
          customLayers={[mockLayer]}
        />
      </Provider>
    );

    const map = screen.getByTestId('map');

    // Simulate click on map
    fireEvent.click(map, {
      point: { x: 100, y: 100 }
    });

    // Wait a bit to ensure no logs are called
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not have called the feature click log
    expect(mockConsoleLog).not.toHaveBeenCalledWith(
      '🎯 Feature click detected!',
      expect.anything()
    );
  });

  it('should log debug information about available layers and map style layers', async () => {
    // Mock queryRenderedFeatures to return a layer feature
    mockMap.queryRenderedFeatures.mockReturnValue([
      {
        id: 'layer-feature-1',
        layer: { id: 'test-layer_circle_0' },
        properties: {
          name: 'Test Point',
          type: 'Point Feature'
        },
        geometry: {
          type: 'Point',
          coordinates: [-156.3319, 20.7967]
        }
      }
    ]);

    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
          customLayers={[mockLayer]}
        />
      </Provider>
    );

    const map = screen.getByTestId('map');

    // Simulate click on map
    fireEvent.click(map, {
      point: { x: 100, y: 100 }
    });

    // Wait for the click handler to process
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Available layers:',
        ['test-layer']
      );
    });

    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Map style layers:',
        ['test-layer_circle_0', 'test-layer_fill_0', 'other-layer_circle_0']
      );
    });

    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Filtered layer IDs for query:',
        ['test-layer_circle_0', 'test-layer_fill_0']
      );
    });
  });
});
