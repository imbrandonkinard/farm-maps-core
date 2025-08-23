import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GeoJSONFeature } from '../types';
import {
  updateFeatures,
  deleteFeatures,
  updateFeatureProperties,
  clearFeatures,
  setFeatures,
  selectFeatures,
  selectFeatureById
} from '../store/mapSlice';
import { calculateAreaInAcres } from '../utils/geometry';

export const useMapFeatures = () => {
  const dispatch = useDispatch();
  const features = useSelector(selectFeatures);

  const addFeature = useCallback((feature: GeoJSONFeature) => {
    dispatch(updateFeatures(feature));
  }, [dispatch]);

  const updateFeature = useCallback((feature: GeoJSONFeature) => {
    dispatch(updateFeatures(feature));
  }, [dispatch]);

  const removeFeature = useCallback((featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      dispatch(deleteFeatures(feature));
    }
  }, [dispatch, features]);

  const clearAllFeatures = useCallback(() => {
    dispatch(clearFeatures());
  }, [dispatch]);

  const setAllFeatures = useCallback((newFeatures: GeoJSONFeature[]) => {
    dispatch(setFeatures(newFeatures));
  }, [dispatch]);

  const getFeatureById = useCallback((id: string) => {
    return features.find(f => f.id === id);
  }, [features]);

  const getFeaturesByType = useCallback((type: string) => {
    return features.filter(f => f.geometry.type === type);
  }, [features]);

  const getFeaturesWithArea = useCallback(() => {
    return features.map(feature => ({
      ...feature,
      area: calculateAreaInAcres(feature as any)
    }));
  }, [features]);

  const getTotalArea = useCallback(() => {
    return features.reduce((total, feature) => {
      return total + calculateAreaInAcres(feature as any);
    }, 0);
  }, [features]);

  const updateFeatureName = useCallback((featureId: string, name: string) => {
    dispatch(updateFeatureProperties({
      id: featureId,
      properties: { name }
    }));
  }, [dispatch]);

  const updateFeatureMetadata = useCallback((featureId: string, metadata: any) => {
    dispatch(updateFeatureProperties({
      id: featureId,
      properties: metadata
    }));
  }, [dispatch]);

  return {
    features,
    addFeature,
    updateFeature,
    removeFeature,
    clearAllFeatures,
    setAllFeatures,
    getFeatureById,
    getFeaturesByType,
    getFeaturesWithArea,
    getTotalArea,
    updateFeatureName,
    updateFeatureMetadata,
    featureCount: features.length
  };
};
