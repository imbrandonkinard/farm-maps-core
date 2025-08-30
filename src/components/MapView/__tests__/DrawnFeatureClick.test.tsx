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
jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    getStyle: jest.fn(() => ({ layers: [] })),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    getCanvas: jest.fn(() => ({ style: { cursor: '' } })),
    queryRenderedFeatures: jest.fn(() => []),
    isStyleLoaded: jest.fn(() => true),
    getSource: jest.fn(() => null),
  })),
  NavigationControl: jest.fn(),
  GeolocateControl: jest.fn(),
}));

// Mock mapboxUtils
jest.mock('../../../utils/mapboxUtils', () => ({
  createMapboxDraw: jest.fn(() => ({
    getMode: jest.fn(() => 'simple_select'),
    getFeatureIdsAt: jest.fn(() => ['test-feature-id']),
    get: jest.fn(() => ({
      id: 'test-feature-id',
      properties: { name: 'Test Field' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
    })),
    on: jest.fn(),
    off: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(() => ({
      features: [{
        id: 'test-feature-id',
        properties: { name: 'Test Field' },
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
      }]
    })),
  })),
}));

// Mock console.log to capture logs
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });

describe('DrawnFeatureClick', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        map: mapSlice.reducer,
      },
      preloadedState: {
        features: {
          'test-feature-id': {
            id: 'test-feature-id',
            properties: { name: 'Test Field' },
            geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
          }
        },
        currentArea: null,
        geojson: {
          type: 'FeatureCollection',
          features: []
        },
      },
    });
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it('should log feature click detection when clicking on drawn feature', async () => {
    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
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
          drawnFeatures: 1,
          layerFeatures: 0,
          features: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-feature-id',
              name: 'Test Field',
              source: 'drawn',
              geometryType: 'Polygon'
            })
          ])
        })
      );
    });
  });

  it('should log polygon popup display for single drawn feature', async () => {
    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
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
        'Test Field'
      );
    });
  });

  it('should log direct feature selection when showPolygonPopup is false', async () => {
    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={false}
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
        '🎯 Direct feature selection for:',
        'Test Field'
      );
    });
  });

  it('should not log feature click when no features are detected', async () => {
    // Mock draw to return no features
    const mockDraw = require('../../../utils/mapboxUtils').createMapboxDraw();
    mockDraw.getFeatureIdsAt.mockReturnValue([]);

    render(
      <Provider store={store}>
        <MapView
          enableDebugLogging={true}
          showPolygonPopup={true}
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
});
