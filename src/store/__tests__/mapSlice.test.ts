import { configureStore } from '@reduxjs/toolkit';
import { mapSlice, updateFeatures, deleteFeatures, updateCurrentArea, updateFeatureProperties, clearFeatures, setFeatures, selectFeatures, selectCurrentArea, selectGeoJSON, selectFeatureById } from '../mapSlice';
import { MapState } from '../../types';

describe('Map Slice', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        farmMaps: mapSlice.reducer,
      },
    });
  };

  // Type the store state
  type RootState = {
    farmMaps: MapState;
  };

  beforeEach(() => {
    store = setupStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = (store.getState() as RootState).farmMaps;
      expect(state.features).toEqual({});
      expect(state.currentArea).toBeNull();
      expect(state.geojson).toEqual({
        type: 'FeatureCollection',
        features: []
      });
    });
  });

  describe('updateFeatures', () => {
    it('should add new features to the store', () => {
      const newFeatures = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Test Field 1' }
        },
        {
          id: '2',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]
          },
          properties: { name: 'Test Field 2' }
        }
      ];

      store.dispatch(updateFeatures(newFeatures));

      const state = (store.getState() as RootState).farmMaps;
      expect(Object.keys(state.features)).toHaveLength(2);
      expect(state.features['1']).toEqual(newFeatures[0]);
      expect(state.features['2']).toEqual(newFeatures[1]);
      expect(state.geojson.features).toHaveLength(2);
    });

    it('should update existing features', () => {
      const initialFeature = {
        id: '1',
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: { name: 'Original Name' }
      };

      store.dispatch(updateFeatures([initialFeature]));

      const updatedFeature = {
        ...initialFeature,
        properties: { name: 'Updated Name' }
      };

      store.dispatch(updateFeatures([updatedFeature]));

      const state = (store.getState() as RootState).farmMaps;
      expect(state.features['1'].properties.name).toBe('Updated Name');
    });

    it('should handle empty features array', () => {
      store.dispatch(updateFeatures([]));
      const state = (store.getState() as RootState).farmMaps;
      expect(Object.keys(state.features)).toHaveLength(0);
      expect(state.geojson.features).toHaveLength(0);
    });
  });

  describe('deleteFeatures', () => {
    it('should remove features from the store', () => {
      const features = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Test Field 1' }
        },
        {
          id: '2',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]
          },
          properties: { name: 'Test Field 2' }
        }
      ];

      store.dispatch(updateFeatures(features));
      expect(Object.keys((store.getState() as RootState).farmMaps.features)).toHaveLength(2);

      store.dispatch(deleteFeatures([features[0]]));

      const state = (store.getState() as RootState).farmMaps;
      expect(Object.keys(state.features)).toHaveLength(1);
      expect(state.features['2']).toBeDefined();
      expect(state.features['1']).toBeUndefined();
      expect(state.geojson.features).toHaveLength(1);
    });

    it('should handle deleting non-existent features gracefully', () => {
      const nonExistentFeature = {
        id: '999',
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: { name: 'Non-existent' }
      };

      expect(() => {
        store.dispatch(deleteFeatures([nonExistentFeature]));
      }).not.toThrow();
    });
  });

  describe('updateCurrentArea', () => {
    it('should update current area', () => {
      const area = 25.5;
      store.dispatch(updateCurrentArea(area));

      const state = (store.getState() as RootState).farmMaps;
      expect(state.currentArea).toBe(area);
    });

    it('should handle zero area', () => {
      store.dispatch(updateCurrentArea(0));

      const state = (store.getState() as RootState).farmMaps;
      expect(state.currentArea).toBe(0);
    });
  });

  describe('updateFeatureProperties', () => {
    it('should update feature properties', () => {
      const feature = {
        id: '1',
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: { name: 'Original Name', area: 10 }
      };

      store.dispatch(updateFeatures([feature]));

      const updatedProperties = {
        id: '1',
        properties: {
          name: 'Updated Name',
          area: 15,
          newProperty: 'New Value'
        }
      };

      store.dispatch(updateFeatureProperties(updatedProperties));

      const state = (store.getState() as RootState).farmMaps;
      expect(state.features['1'].properties.name).toBe('Updated Name');
      expect(state.features['1'].properties.area).toBe(15);
      expect(state.features['1'].properties.newProperty).toBe('New Value');
    });

    it('should handle updating non-existent feature gracefully', () => {
      const updatePayload = {
        id: '999',
        properties: { name: 'Updated' }
      };

      expect(() => {
        store.dispatch(updateFeatureProperties(updatePayload));
      }).not.toThrow();
    });
  });

  describe('clearFeatures', () => {
    it('should clear all features', () => {
      const features = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Test Field' }
        }
      ];

      store.dispatch(updateFeatures(features));
      expect(Object.keys((store.getState() as RootState).farmMaps.features)).toHaveLength(1);

      store.dispatch(clearFeatures());

      const state = (store.getState() as RootState).farmMaps;
      expect(Object.keys(state.features)).toHaveLength(0);
      expect(state.geojson.features).toHaveLength(0);
    });
  });

  describe('setFeatures', () => {
    it('should replace all features with new ones', () => {
      const initialFeatures = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Initial Field' }
        }
      ];

      store.dispatch(updateFeatures(initialFeatures));

      const newFeatures = [
        {
          id: '2',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]
          },
          properties: { name: 'New Field' }
        }
      ];

      store.dispatch(setFeatures(newFeatures));

      const state = (store.getState() as RootState).farmMaps;
      expect(Object.keys(state.features)).toHaveLength(1);
      expect(state.features['2']).toBeDefined();
      expect(state.features['1']).toBeUndefined();
      expect(state.geojson.features).toHaveLength(1);
    });
  });

  describe('Selectors', () => {
    it('should select features correctly', () => {
      const features = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Test Field' }
        }
      ];

      store.dispatch(updateFeatures(features));

      const selectedFeatures = selectFeatures(store.getState() as RootState);
      expect(selectedFeatures).toHaveLength(1);
      expect(selectedFeatures[0]).toEqual(features[0]);
    });

    it('should select current area correctly', () => {
      const area = 30.0;
      store.dispatch(updateCurrentArea(area));

      const selectedArea = selectCurrentArea(store.getState() as RootState);
      expect(selectedArea).toBe(area);
    });

    it('should select GeoJSON correctly', () => {
      const features = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Test Field' }
        }
      ];

      store.dispatch(updateFeatures(features));

      const selectedGeoJSON = selectGeoJSON(store.getState() as RootState);
      expect(selectedGeoJSON.type).toBe('FeatureCollection');
      expect(selectedGeoJSON.features).toHaveLength(1);
    });

    it('should select feature by ID correctly', () => {
      const features = [
        {
          id: '1',
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { name: 'Test Field' }
        }
      ];

      store.dispatch(updateFeatures(features));

      const selectedFeature = selectFeatureById(store.getState() as RootState, '1');
      expect(selectedFeature).toEqual(features[0]);
    });

    it('should return undefined for non-existent feature ID', () => {
      const selectedFeature = selectFeatureById(store.getState() as RootState, '999');
      expect(selectedFeature).toBeUndefined();
    });
  });
});
