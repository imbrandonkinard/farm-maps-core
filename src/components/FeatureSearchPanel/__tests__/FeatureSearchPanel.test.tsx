import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FeatureSearchPanel } from '../FeatureSearchPanel';
import { mapSlice } from '../../../store/mapSlice';

const mockStore = configureStore({
  reducer: {
    farmMaps: mapSlice.reducer,
  },
});

const mockLayers = [
  {
    id: 'boundary_ahupuaa_layer',
    name: 'Ahupuaa Boundaries',
    data: {
      type: 'FeatureCollection' as const,
      features: [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
          properties: { ahupuaa: 'Test Ahupuaa 1', objectid: '1' }
        },
        {
          id: '2',
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]] },
          properties: { ahupuaa: 'Test Ahupuaa 2', objectid: '2' }
        }
      ]
    },
    nameProperty: 'ahupuaa',
    style: { fill: { color: '#088', opacity: 0.2 }, line: { color: '#088', width: 2 } }
  },
  {
    id: 'complex_area_school_layer',
    name: 'School Complex Areas',
    data: {
      type: 'FeatureCollection' as const,
      features: [
        {
          id: '3',
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]] },
          properties: { complex_area: 'Test School Complex', objectid: '3' }
        }
      ]
    },
    nameProperty: 'complex_area',
    style: { fill: { color: '#800080', opacity: 0.2 }, line: { color: '#800080', width: 2 } }
  }
];

const mockOnLayerChange = jest.fn();
const mockOnFeatureSelect = jest.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('FeatureSearchPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render when no layers are available', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={[]}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      expect(screen.getByText('No layers available')).toBeInTheDocument();
    });

    it('should render with layers available', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      expect(screen.getByText('Select Layer')).toBeInTheDocument();
      expect(screen.getByText('Select a layer to view features')).toBeInTheDocument();
    });
  });

  describe('Search Type Toggle', () => {
    it('should have three search type buttons', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      expect(screen.getByText('Layers')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('should highlight the active search type', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const featuresButton = screen.getByText('Features');
      expect(featuresButton).toHaveStyle({ backgroundColor: '#007bff', color: '#fff' });
    });

    it('should change search type when buttons are clicked', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const layersButton = screen.getByText('Layers');
      fireEvent.click(layersButton);

      expect(layersButton).toHaveStyle({ backgroundColor: '#007bff', color: '#fff' });
    });
  });

  describe('Search Input', () => {
    it('should have a search input field', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search features...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should update placeholder text based on search type', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const allButton = screen.getByText('All');
      fireEvent.click(allButton);

      const searchInput = screen.getByPlaceholderText('Search all...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Layer Selection', () => {
    it('should show layer dropdown with available layers', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const layerSelect = screen.getByRole('combobox');
      expect(layerSelect).toBeInTheDocument();

      fireEvent.change(layerSelect, { target: { value: 'boundary_ahupuaa_layer' } });
      expect(mockOnLayerChange).toHaveBeenCalledWith(mockLayers[0]);
    });
  });

  describe('Layer Search Mode', () => {
    it('should filter layers when searching', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      // Switch to layers mode
      const layersButton = screen.getByText('Layers');
      fireEvent.click(layersButton);

      // Search for "Ahupuaa"
      const searchInput = screen.getByPlaceholderText('Search layers...');
      fireEvent.change(searchInput, { target: { value: 'Ahupuaa' } });

      // Wait for the filtered results to appear
      expect(screen.getByText('Available Layers (1)')).toBeInTheDocument();

      // Check that the layer appears in the filtered results (not just the dropdown)
      const layerElements = screen.getAllByText('Ahupuaa Boundaries');
      expect(layerElements.length).toBeGreaterThan(1); // Should appear in dropdown and results
    });

    it('should show layer information correctly', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      // Switch to layers mode
      const layersButton = screen.getByText('Layers');
      fireEvent.click(layersButton);

      // Wait for the layer information to appear
      const layerElements = screen.getAllByText('Ahupuaa Boundaries');
      expect(layerElements.length).toBeGreaterThan(1); // Should appear in dropdown and results

      // Check for the layer ID and features count
      const idElements = screen.getAllByText(/ID:/);
      expect(idElements.length).toBeGreaterThan(0);

      // Check for the layer ID text that might be broken up
      expect(screen.getByText(/boundary_ahupuaa_layer/)).toBeInTheDocument();
      expect(screen.getByText('2 features')).toBeInTheDocument();
    });
  });

  describe('Feature Search Mode', () => {
    it('should show features when a layer is selected', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={mockLayers[0]}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      expect(screen.getByText('Features (2)')).toBeInTheDocument();
      expect(screen.getByText('Test Ahupuaa 1')).toBeInTheDocument();
      expect(screen.getByText('Test Ahupuaa 2')).toBeInTheDocument();
    });

    it('should filter features when searching', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={mockLayers[0]}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search features...');
      fireEvent.change(searchInput, { target: { value: 'Test Ahupuaa 1' } });

      expect(screen.getByText('Features (1)')).toBeInTheDocument();

      // Check that the filtered feature appears (not just in suggestions)
      const featureElements = screen.getAllByText('Test Ahupuaa 1');
      expect(featureElements.length).toBeGreaterThan(1); // Should appear in suggestions and results

      expect(screen.queryByText('Test Ahupuaa 2')).not.toBeInTheDocument();
    });

    it('should handle feature selection', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={mockLayers[0]}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const feature = screen.getByText('Test Ahupuaa 1');
      fireEvent.click(feature);

      expect(mockOnFeatureSelect).toHaveBeenCalledWith(mockLayers[0].data.features[0]);
    });
  });

  describe('Global Search Mode', () => {
    it('should search across all layers and features', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      // Switch to all mode
      const allButton = screen.getByText('All');
      fireEvent.click(allButton);

      // Search for "Ahupuaa"
      const searchInput = screen.getByPlaceholderText('Search all...');
      fireEvent.change(searchInput, { target: { value: 'Ahupuaa' } });

      // Check that search results appear
      expect(screen.getByText('Search Results (3)')).toBeInTheDocument();

      // Check that we can see the layer and feature results
      const layerElements = screen.getAllByText('Ahupuaa Boundaries');
      expect(layerElements.length).toBeGreaterThan(1); // Should appear in multiple places

      const feature1Elements = screen.getAllByText('Test Ahupuaa 1');
      expect(feature1Elements.length).toBeGreaterThan(1); // Should appear in suggestions and results

      const feature2Elements = screen.getAllByText('Test Ahupuaa 2');
      expect(feature2Elements.length).toBeGreaterThan(1); // Should appear in suggestions and results
    });

    it('should show search results with type indicators', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      // Switch to all mode
      const allButton = screen.getByText('All');
      fireEvent.click(allButton);

      // Search for "Ahupuaa"
      const searchInput = screen.getByPlaceholderText('Search all...');
      fireEvent.change(searchInput, { target: { value: 'Ahupuaa' } });

      // Check for type indicators - use getAllByText since there are multiple
      const layerIndicators = screen.getAllByText('LAYER');
      const featureIndicators = screen.getAllByText('FEATURE');
      expect(layerIndicators.length).toBeGreaterThan(0);
      expect(featureIndicators.length).toBeGreaterThan(0);
    });

    it('should handle layer selection from global search', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      // Switch to all mode
      const allButton = screen.getByText('All');
      fireEvent.click(allButton);

      // Search for "Ahupuaa"
      const searchInput = screen.getByPlaceholderText('Search all...');
      fireEvent.change(searchInput, { target: { value: 'Ahupuaa' } });

      // Wait for search results to appear
      expect(screen.getByText('Search Results (3)')).toBeInTheDocument();

      // Click on the layer result in the search results (not in suggestions)
      // Look for the element with "LAYER" badge that contains "Ahupuaa Boundaries"
      const layerResult = screen.getByText('LAYER').closest('div');
      expect(layerResult).toBeInTheDocument();

      fireEvent.click(layerResult!);

      expect(mockOnLayerChange).toHaveBeenCalledWith(mockLayers[0]);
    });
  });

  describe('Search Suggestions', () => {
    it('should show search suggestions after typing', async () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={null}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search features...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.focus(searchInput);

      // Wait for suggestions to appear
      await waitFor(() => {
        const suggestions = screen.queryAllByText(/Test.*/);
        expect(suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should handle suggestion selection', async () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={mockLayers[0]}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search features...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.focus(searchInput);

      // Wait for suggestions to appear and click one
      await waitFor(() => {
        const suggestions = screen.queryAllByText(/Test.*/);
        if (suggestions.length > 0) {
          fireEvent.click(suggestions[0]);
        }
      });

      // The input value should be updated with the selected suggestion
      await waitFor(() => {
        expect(searchInput).toHaveValue('Test Ahupuaa 1');
      });
    });
  });

  describe('State Management', () => {
    it('should clear search when changing layers', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={mockLayers[0]}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search features...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      const layerSelect = screen.getByRole('combobox');
      fireEvent.change(layerSelect, { target: { value: 'complex_area_school_layer' } });

      expect(searchInput).toHaveValue('');
    });

    it('should clear search when selecting features', () => {
      renderWithProvider(
        <FeatureSearchPanel
          layers={mockLayers}
          activeLayer={mockLayers[0]}
          onLayerChange={mockOnLayerChange}
          onFeatureSelect={mockOnFeatureSelect}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search features...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      // Get the first feature element (not the suggestion)
      const features = screen.getAllByText('Test Ahupuaa 1');
      const feature = features[1]; // Skip the suggestion, get the feature in the list
      fireEvent.click(feature);

      expect(searchInput).toHaveValue('');
    });
  });
});
