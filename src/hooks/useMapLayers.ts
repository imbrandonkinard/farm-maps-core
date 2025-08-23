import { useState, useCallback } from 'react';
import { MapLayer } from '../types';
import { createDefaultLayer, validateLayer } from '../utils/layerUtils';

export const useMapLayers = (initialLayers: MapLayer[] = []) => {
  const [layers, setLayers] = useState<MapLayer[]>(initialLayers);
  const [activeLayer, setActiveLayer] = useState<MapLayer | null>(
    initialLayers.length > 0 ? initialLayers[0] : null
  );

  const addLayer = useCallback((layer: MapLayer) => {
    const validation = validateLayer(layer);
    if (!validation.isValid) {
      console.error('Invalid layer:', validation.errors);
      return false;
    }

    setLayers(prevLayers => {
      // Check if layer already exists
      const exists = prevLayers.some(l => l.id === layer.id);
      if (exists) {
        console.warn(`Layer with ID ${layer.id} already exists`);
        return prevLayers;
      }
      return [...prevLayers, layer];
    });

    // Set as active layer if it's the first one
    if (layers.length === 0) {
      setActiveLayer(layer);
    }

    return true;
  }, [layers.length]);

  const removeLayer = useCallback((layerId: string) => {
    setLayers(prevLayers => {
      const newLayers = prevLayers.filter(l => l.id !== layerId);

      // If we're removing the active layer, set a new active layer
      if (activeLayer?.id === layerId) {
        setActiveLayer(newLayers.length > 0 ? newLayers[0] : null);
      }

      return newLayers;
    });
  }, [activeLayer]);

  const updateLayer = useCallback((layerId: string, updates: Partial<MapLayer>) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    );

    // Update active layer if it's the one being updated
    if (activeLayer?.id === layerId) {
      setActiveLayer(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeLayer]);

  const setActiveLayerById = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      setActiveLayer(layer);
    }
  }, [layers]);

  const loadLayerFromGeoJSON = useCallback((
    id: string,
    name: string,
    data: any,
    nameProperty: string = 'name'
  ) => {
    const layer = createDefaultLayer(id, name, data, nameProperty);
    return addLayer(layer);
  }, [addLayer]);

  const getLayerById = useCallback((layerId: string) => {
    return layers.find(l => l.id === layerId);
  }, [layers]);

  const getLayerFeatures = useCallback((layerId: string) => {
    const layer = getLayerById(layerId);
    return layer?.data.features || [];
  }, [getLayerById]);

  const getActiveLayerFeatures = useCallback(() => {
    return activeLayer?.data.features || [];
  }, [activeLayer]);

  const clearLayers = useCallback(() => {
    setLayers([]);
    setActiveLayer(null);
  }, []);

  return {
    layers,
    activeLayer,
    addLayer,
    removeLayer,
    updateLayer,
    setActiveLayer,
    setActiveLayerById,
    loadLayerFromGeoJSON,
    getLayerById,
    getLayerFeatures,
    getActiveLayerFeatures,
    clearLayers,
    layerCount: layers.length
  };
};
