import { MapLayer, GeoJSONFeature } from '../types';

/**
 * Create a default map layer with standard styling
 * @param id - Layer identifier
 * @param name - Layer display name
 * @param data - GeoJSON feature collection
 * @param nameProperty - Property to use for feature names
 * @returns Configured map layer
 */
export const createDefaultLayer = (
  id: string,
  name: string,
  data: any,
  nameProperty: string
): MapLayer => {
  return {
    id,
    name,
    data,
    nameProperty,
    style: {
      fill: {
        color: '#088',
        opacity: 0.2
      },
      line: {
        color: '#088',
        width: 2
      }
    }
  };
};

/**
 * Filter features in a layer by search term
 * @param layer - The map layer
 * @param searchTerm - Search term to filter by
 * @returns Filtered features
 */
export const filterLayerFeatures = (layer: MapLayer, searchTerm: string): GeoJSONFeature[] => {
  if (!searchTerm.trim() || !layer.data.features) {
    return layer.data.features || [];
  }

  return layer.data.features.filter((feature: GeoJSONFeature) => {
    const featureName = feature.properties?.[layer.nameProperty] || 'Unnamed Feature';
    return featureName.toLowerCase().includes(searchTerm.toLowerCase());
  });
};

/**
 * Get feature names from a layer
 * @param layer - The map layer
 * @returns Array of feature names with IDs
 */
export const getLayerFeatureNames = (layer: MapLayer): Array<{ name: string; id: string; feature: GeoJSONFeature }> => {
  if (!layer.data.features) {
    return [];
  }

  return layer.data.features.map((feature: GeoJSONFeature) => ({
    name: feature.properties?.[layer.nameProperty] || 'Unnamed Feature',
    id: feature.properties?.objectid || feature.properties?.id || feature.id || '',
    feature
  }));
};

/**
 * Validate layer data structure
 * @param layer - The map layer to validate
 * @returns Validation result
 */
export const validateLayer = (layer: MapLayer): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!layer.id) errors.push('Layer ID is required');
  if (!layer.name) errors.push('Layer name is required');
  if (!layer.data) errors.push('Layer data is required');
  if (!layer.nameProperty) errors.push('Name property is required');

  if (layer.data && layer.data.type !== 'FeatureCollection') {
    errors.push('Layer data must be a FeatureCollection');
  }

  if (layer.data && layer.data.features && !Array.isArray(layer.data.features)) {
    errors.push('Layer features must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge multiple layers into one
 * @param layers - Array of layers to merge
 * @param mergedId - ID for the merged layer
 * @param mergedName - Name for the merged layer
 * @returns Merged layer
 */
export const mergeLayers = (
  layers: MapLayer[],
  mergedId: string,
  mergedName: string
): MapLayer => {
  const allFeatures: GeoJSONFeature[] = [];

  layers.forEach(layer => {
    if (layer.data.features) {
      allFeatures.push(...layer.data.features);
    }
  });

  return {
    id: mergedId,
    name: mergedName,
    data: {
      type: 'FeatureCollection',
      features: allFeatures
    },
    nameProperty: 'name',
    style: {
      fill: {
        color: '#666',
        opacity: 0.3
      },
      line: {
        color: '#666',
        width: 1
      }
    }
  };
};
