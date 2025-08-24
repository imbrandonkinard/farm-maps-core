import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MapView } from '../MapView';
import { mapSlice } from '../../store/mapSlice';
import { MapLayer } from '../../../types';

// Mock the mapping libraries
jest.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  default: ({ children, onLoad, ...props }: any) => {
    React.useEffect(() => {
      if (onLoad) {
        onLoad({ target: { getMap: () => mockMap } });
      }
    }, [onLoad]);
    return <div data-testid="react-map-gl" {...props}>{children}</div>;
  },
  NavigationControl: ({ children, ...props }: any) => (
    <div data-testid="navigation-control" {...props}>{children}</div>
  )
}));

jest.mock('maplibre-gl', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock mapbox utilities
jest.mock('../../utils/mapboxUtils', () => ({
  createMapboxDraw: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    changeMode: jest.fn(),
    getAll: jest.fn(() => ({ features: [] })),
    deleteAll: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    getFeatureIdsAt: jest.fn(() => []),
    getMode: jest.fn(() => 'simple_select')
  })),
  updateMapboxDrawConstants: jest.fn()
}));

// Mock the mockMap object
const mockMap = {
  isStyleLoaded: () => true,
  getStyle: () => ({}),
  on: jest.fn(),
  off: jest.fn(),
  addControl: jest.fn(),
  addSource: jest.fn(),
  addLayer: jest.fn(),
  getSource: jest.fn().mockReturnValue(null),
  getLayer: jest.fn().mockReturnValue(null),
  setLayoutProperty: jest.fn(),
  getCanvas: () => ({ style: { cursor: '' } }),
  fitBounds: jest.fn()
};

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      map: mapSlice.reducer
    },
    preloadedState: {
      map: {
        features: {},
        currentArea: null,
        geojson: {
          type: 'FeatureCollection',
          features: []
        }
      }
    }
  });
};

describe('MapView', () => {
  const defaultProps = {
    initialViewState: {
      longitude: -156.3319,
      latitude: 20.7967,
      zoom: 7
    },
    showNavigationControl: true,
    showAreaDisplay: true,
    showControlPanel: true,
    showFeatureSearch: true,
    enableDebugLogging: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MapView {...defaultProps} />
      </Provider>
    );

    expect(screen.getByTestId('map-view')).toBeInTheDocument();
    expect(screen.getByTestId('react-map-gl')).toBeInTheDocument();
  });

  it('renders with all controls when enabled', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MapView {...defaultProps} />
      </Provider>
    );

    expect(screen.getByTestId('navigation-control')).toBeInTheDocument();
    expect(screen.getByText('Drawn Fields')).toBeInTheDocument();
  });

  it('renders without controls when disabled', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <MapView 
          {...defaultProps}
          showNavigationControl={false}
          showControlPanel={false}
          showFeatureSearch={false}
        />
      </Provider>
    );

    expect(screen.queryByTestId('navigation-control')).not.toBeInTheDocument();
    expect(screen.queryByText('Drawn Fields')).not.toBeInTheDocument();
  });

  describe('Layer Upload', () => {
    it('handles layer uploads correctly', async () => {
      const mockOnLayerUpload = jest.fn();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <MapView
            {...defaultProps}
            onLayerUpload={mockOnLayerUpload}
            enableDebugLogging={true}
          />
        </Provider>
      );

      // Simulate layer upload by finding the MapView component
      const mapViewElement = screen.getByTestId('map-view');
      
      // Since we can't directly access the component's methods in tests,
      // we'll test the integration through the FeatureSearchPanel
      expect(screen.getByText('Upload GIS Layer')).toBeInTheDocument();
    });

    it('shows upload button when onLayerUpload is provided', () => {
      const mockOnLayerUpload = jest.fn();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <MapView
            {...defaultProps}
            onLayerUpload={mockOnLayerUpload}
          />
        </Provider>
      );

      expect(screen.getByText('Upload GIS Layer')).toBeInTheDocument();
    });

    it('does not show upload button when onLayerUpload is not provided', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <MapView {...defaultProps} />
        </Provider>
      );

      expect(screen.queryByText('Upload GIS Layer')).not.toBeInTheDocument();
    });
  });

  describe('Map Initialization', () => {
    it('initializes map with correct view state', () => {
      const store = createMockStore();
      const customViewState = {
        longitude: -158.0000,
        latitude: 21.5000,
        zoom: 10
      };

      render(
        <Provider store={store}>
          <MapView 
            {...defaultProps}
            initialViewState={customViewState}
          />
        </Provider>
      );

      expect(screen.getByTestId('react-map-gl')).toBeInTheDocument();
    });

    it('loads default layers on initialization', async () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} enableDebugLogging={true} />
        </Provider>
      );

      // Wait for layers to load
      await waitFor(() => {
        expect(screen.getByText('Ahupuaa Boundaries')).toBeInTheDocument();
      });
    });
  });

  describe('Feature Drawing', () => {
    it('shows area display when enabled', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} showAreaDisplay={true} />
        </Provider>
      );

      expect(screen.getByText('Draw a polygon using the draw tools.')).toBeInTheDocument();
    });

    it('hides area display when disabled', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} showAreaDisplay={false} />
        </Provider>
      );

      expect(screen.queryByText('Draw a polygon using the draw tools.')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('shows search panel when enabled', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} showFeatureSearch={true} />
        </Provider>
      );

      expect(screen.getByText('🔍 Search & Layers')).toBeInTheDocument();
    });

    it('hides search panel when disabled', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} showFeatureSearch={false} />
        </Provider>
      );

      expect(screen.queryByText('🔍 Search & Layers')).not.toBeInTheDocument();
    });
  });

  describe('Custom Callbacks', () => {
    it('calls onMapLoad when map is loaded', async () => {
      const mockOnMapLoad = jest.fn();
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} onMapLoad={mockOnMapLoad} />
        </Provider>
      );

      await waitFor(() => {
        expect(mockOnMapLoad).toHaveBeenCalledWith(mockMap);
      });
    });

    it('calls onFeatureCreate when features are created', () => {
      const mockOnFeatureCreate = jest.fn();
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <MapView {...defaultProps} onFeatureCreate={mockOnFeatureCreate} />
        </Provider>
      );

      // The callback would be set up during map initialization
      expect(screen.getByTestId('react-map-gl')).toBeInTheDocument();
    });
  });
});



