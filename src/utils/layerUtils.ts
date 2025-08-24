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
 * Advanced search across multiple layers
 * @param layers - Array of layers to search
 * @param searchQuery - Search query string
 * @param searchOptions - Search configuration options
 * @returns Search results with layer context
 */
export const searchAcrossLayers = (
  layers: MapLayer[],
  searchQuery: string,
  searchOptions: {
    includeLayerNames?: boolean;
    includeFeatureNames?: boolean;
    includeFeatureIds?: boolean;
    fuzzyMatch?: boolean;
    caseSensitive?: boolean;
    maxResults?: number;
  } = {}
) => {
  const {
    includeLayerNames = true,
    includeFeatureNames = true,
    includeFeatureIds = true,
    fuzzyMatch = false,
    caseSensitive = false,
    maxResults = 100
  } = searchOptions;

  if (!searchQuery.trim()) {
    return [];
  }

  const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();
  const results: Array<{
    type: 'layer' | 'feature';
    layer: MapLayer;
    feature?: GeoJSONFeature;
    name: string;
    id: string;
    relevance: number;
    matchType: 'exact' | 'contains' | 'fuzzy';
  }> = [];

  // Search through layers
  if (includeLayerNames) {
    layers.forEach(layer => {
      const layerName = caseSensitive ? layer.name : layer.name.toLowerCase();
      const layerId = caseSensitive ? layer.id : layer.id.toLowerCase();

      let matchType: 'exact' | 'contains' | 'fuzzy' = 'contains';
      let relevance = 0;

      if (layerName === query || layerId === query) {
        matchType = 'exact';
        relevance = 100;
      } else if (layerName.includes(query) || layerId.includes(query)) {
        matchType = 'contains';
        relevance = 50;
      } else if (fuzzyMatch && (layerName.includes(query.slice(0, 3)) || layerId.includes(query.slice(0, 3)))) {
        matchType = 'fuzzy';
        relevance = 25;
      }

      if (relevance > 0) {
        results.push({
          type: 'layer',
          layer,
          name: layer.name,
          id: layer.id,
          relevance,
          matchType
        });
      }
    });
  }

  // Search through features
  if (includeFeatureNames || includeFeatureIds) {
    layers.forEach(layer => {
      if (!layer.data?.features) return;

      layer.data.features.forEach(feature => {
        const featureName = feature.properties?.[layer.nameProperty] || 'Unnamed Feature';
        const featureId = feature.properties?.objectid || feature.properties?.id || feature.id || '';

        let matchType: 'exact' | 'contains' | 'fuzzy' = 'contains';
        let relevance = 0;
        let matched = false;

        // Check feature names
        if (includeFeatureNames) {
          const name = caseSensitive ? featureName : featureName.toLowerCase();
          if (name === query) {
            matchType = 'exact';
            relevance = 90;
            matched = true;
          } else if (name.includes(query)) {
            matchType = 'contains';
            relevance = 40;
            matched = true;
          } else if (fuzzyMatch && name.includes(query.slice(0, 3))) {
            matchType = 'fuzzy';
            relevance = 20;
            matched = true;
          }
        }

        // Check feature IDs
        if (includeFeatureIds && !matched) {
          const id = caseSensitive ? featureId : featureId.toLowerCase();
          if (id === query) {
            matchType = 'exact';
            relevance = 80;
            matched = true;
          } else if (id.includes(query)) {
            matchType = 'contains';
            relevance = 30;
            matched = true;
          } else if (fuzzyMatch && id.includes(query.slice(0, 3))) {
            matchType = 'fuzzy';
            relevance = 15;
            matched = true;
          }
        }

        if (matched) {
          results.push({
            type: 'feature',
            layer,
            feature,
            name: featureName,
            id: featureId,
            relevance,
            matchType
          });
        }
      });
    });
  }

  // Sort by relevance and limit results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxResults);
};

/**
 * Get search suggestions based on partial input
 * @param layers - Array of layers to search
 * @param partialQuery - Partial search query
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of search suggestions
 */
export const getSearchSuggestions = (
  layers: MapLayer[],
  partialQuery: string,
  maxSuggestions: number = 10
): string[] => {
  if (!partialQuery.trim() || partialQuery.length < 2) {
    return [];
  }

  const suggestions = new Set<string>();
  const query = partialQuery.toLowerCase();

  // Add layer name suggestions
  layers.forEach(layer => {
    if (layer.name.toLowerCase().includes(query)) {
      suggestions.add(layer.name);
    }
    if (layer.id.toLowerCase().includes(query)) {
      suggestions.add(layer.id);
    }
  });

  // Add feature name suggestions
  layers.forEach(layer => {
    if (!layer.data?.features) return;

    layer.data.features.forEach(feature => {
      const featureName = feature.properties?.[layer.nameProperty];
      if (featureName && featureName.toLowerCase().includes(query)) {
        suggestions.add(featureName);
      }
    });
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
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
