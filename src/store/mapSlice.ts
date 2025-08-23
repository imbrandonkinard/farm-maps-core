import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeoJSONFeature, GeoJSONFeatureCollection, MapState } from '../types';

const initialState: MapState = {
  features: {},
  currentArea: null,
  geojson: {
    type: 'FeatureCollection',
    features: []
  }
};

export const mapSlice = createSlice({
  name: 'farmMaps',
  initialState,
  reducers: {
    updateFeatures: (state, action: PayloadAction<GeoJSONFeature | GeoJSONFeature[]>) => {
      // Handle both single feature and multiple features
      const features = Array.isArray(action.payload) ? action.payload : [action.payload];
      features.forEach(feature => {
        if (feature.id) {
          state.features[feature.id as string] = feature;
        }
      });
      // Update the GeoJSON collection
      state.geojson.features = Object.values(state.features);
    },
    deleteFeatures: (state, action: PayloadAction<GeoJSONFeature | GeoJSONFeature[]>) => {
      // Handle both single feature and multiple features
      const features = Array.isArray(action.payload) ? action.payload : [action.payload];
      features.forEach(feature => {
        if (feature.id) {
          delete state.features[feature.id as string];
        }
      });
      // Update the GeoJSON collection
      state.geojson.features = Object.values(state.features);
    },
    updateCurrentArea: (state, action: PayloadAction<number>) => {
      state.currentArea = action.payload;
    },
    updateFeatureProperties: (state, action: PayloadAction<{ id: string; properties: any }>) => {
      const { id, properties } = action.payload;
      if (state.features[id]) {
        state.features[id].properties = {
          ...state.features[id].properties,
          ...properties
        };
        // Update the GeoJSON collection
        state.geojson.features = Object.values(state.features);
      }
    },
    clearFeatures: (state) => {
      state.features = {};
      state.geojson.features = [];
      state.currentArea = null;
    },
    setFeatures: (state, action: PayloadAction<GeoJSONFeature[]>) => {
      const features: Record<string, GeoJSONFeature> = {};
      action.payload.forEach(feature => {
        if (feature.id) {
          features[feature.id as string] = feature;
        }
      });
      state.features = features;
      state.geojson.features = action.payload;
    }
  }
});

export const {
  updateFeatures,
  deleteFeatures,
  updateCurrentArea,
  updateFeatureProperties,
  clearFeatures,
  setFeatures
} = mapSlice.actions;

export const selectFeatures = (state: { farmMaps: MapState }) => Object.values(state.farmMaps.features);
export const selectCurrentArea = (state: { farmMaps: MapState }) => state.farmMaps.currentArea;
export const selectGeoJSON = (state: { farmMaps: MapState }) => state.farmMaps.geojson;
export const selectFeatureById = (state: { farmMaps: MapState }, id: string) => state.farmMaps.features[id];

export default mapSlice.reducer;
