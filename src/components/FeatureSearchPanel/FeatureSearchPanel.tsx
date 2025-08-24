import React, { useState, useMemo, useCallback } from 'react';
import { FeatureSearchPanelProps } from '../../types';
import {
  filterLayerFeatures,
  getLayerFeatureNames,
  searchAcrossLayers,
  getSearchSuggestions
} from '../../utils/layerUtils';
import { UploadGISLayer } from '../UploadGISLayer/UploadGISLayer';

export const FeatureSearchPanel: React.FC<FeatureSearchPanelProps> = (props) => {
  const { layers, activeLayer, onLayerChange, onFeatureSelect, onLayerUpload } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'layers' | 'features' | 'all'>('features');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Advanced search across all layers and features
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim() || searchType !== 'all') return [];

    return searchAcrossLayers(layers, searchQuery, {
      includeLayerNames: true,
      includeFeatureNames: true,
      includeFeatureIds: true,
      fuzzyMatch: true,
      caseSensitive: false,
      maxResults: 50
    });
  }, [layers, searchQuery, searchType]);

  // Filter layers based on search query
  const filteredLayers = useMemo(() => {
    if (!searchQuery.trim() || searchType === 'all') return layers;

    return layers.filter(layer => {
      // Ensure id is a string before calling toLowerCase()
      const layerId = String(layer.id || '');
      return layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layerId.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [layers, searchQuery, searchType]);

  // Filter features based on search query
  const filteredFeatures = useMemo(() => {
    if (!activeLayer?.data?.features || searchType === 'all') return [];

    const allFeatures = getLayerFeatureNames(activeLayer);

    if (!searchQuery.trim()) return allFeatures;

    return allFeatures.filter(item => {
      // Ensure id is a string before calling toLowerCase()
      const itemId = String(item.id || '');
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemId.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [activeLayer, searchQuery, searchType]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];

    // Show suggestions when we have a query and are not showing filtered results
    if (searchType === 'layers' && searchQuery.trim()) {
      return getSearchSuggestions(layers, searchQuery, 8);
    }

    if (searchType === 'features' && searchQuery.trim()) {
      return getSearchSuggestions(layers, searchQuery, 8);
    }

    if (searchType === 'all' && searchQuery.trim()) {
      return getSearchSuggestions(layers, searchQuery, 8);
    }

    return [];
  }, [layers, searchQuery, searchType]);

  // Handle layer selection
  const handleLayerChange = useCallback((layerId: string) => {
    const selectedLayer = layers.find(l => l.id === layerId);
    onLayerChange(selectedLayer || null);
    // Reset search when changing layers
    setSearchQuery('');
    setShowSuggestions(false);
  }, [layers, onLayerChange]);

  // Handle feature selection
  const handleFeatureSelect = useCallback((feature: any) => {
    onFeatureSelect(feature);
    // Clear search after selection
    setSearchQuery('');
    setShowSuggestions(false);
  }, [onFeatureSelect]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
  }, []);

  // Handle search type change
  const handleSearchTypeChange = useCallback((type: 'layers' | 'features' | 'all') => {
    setSearchType(type);
    setSearchQuery('');
    setShowSuggestions(false);
  }, []);

  if (layers.length === 0) {
    return (
      <div style={{
        width: '250px',
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        marginRight: '10px',
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        No layers available
      </div>
    );
  }

  return (
    <div style={{
      width: '250px',
      height: '100%',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      marginRight: '10px',
      position: 'relative'
    }}>
      {/* Header Section */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f8f8'
      }}>
        {/* Panel Title */}
        <div style={{
          marginBottom: '15px',
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          🔍 Search & Layers
        </div>

        {/* Search Type Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '10px'
          }}>
            <button
              type="button"
              onClick={() => handleSearchTypeChange('layers')}
              style={{
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: searchType === 'layers' ? '#007bff' : '#fff',
                color: searchType === 'layers' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '11px',
                flex: 1
              }}
            >
              Layers
            </button>
            <button
              type="button"
              onClick={() => handleSearchTypeChange('features')}
              style={{
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: searchType === 'features' ? '#007bff' : '#fff',
                color: searchType === 'features' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '11px',
                flex: 1
              }}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleSearchTypeChange('all')}
              style={{
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: searchType === 'all' ? '#007bff' : '#fff',
                color: searchType === 'all' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '11px',
                flex: 1
              }}
            >
              All
            </button>
          </div>
        </div>

        {/* Upload GIS Layer Button */}
        {onLayerUpload && (
          <div style={{ marginBottom: '15px' }}>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#218838';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
              }}
            >
              <span style={{ fontSize: '16px' }}>📁</span>
              Upload GIS Layer
            </button>
          </div>
        )}

        {/* Search Input - Enhanced and More Prominent */}
        <div style={{ marginBottom: '15px', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #007bff',
            borderRadius: '6px',
            backgroundColor: '#fff',
            padding: '2px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,123,255,0.1)'
          }}>
            <div style={{
              padding: '8px 12px',
              color: '#007bff',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🔍
            </div>
            <input
              type="text"
              placeholder={`Search ${searchType}...`}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#333',
                minWidth: '120px'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                style={{
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'color 0.2s ease'
                }}
                title="Clear search"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999';
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '2px solid #007bff',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
              marginTop: '4px'
            }}>
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: index < searchSuggestions.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: '#f9f9f9',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}

          {/* Search Status Indicator */}
          {searchQuery.trim() && (
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🔍</span>
              <span>
                {searchType === 'layers' && `Found ${filteredLayers.length} layer${filteredLayers.length !== 1 ? 's' : ''}`}
                {searchType === 'features' && `Found ${filteredFeatures.length} feature${filteredFeatures.length !== 1 ? 's' : ''}`}
                {searchType === 'all' && `Found ${globalSearchResults.length} result${globalSearchResults.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {/* No Results Indicator */}
          {searchQuery.trim() && (
            (searchType === 'layers' && filteredLayers.length === 0) ||
            (searchType === 'features' && filteredFeatures.length === 0) ||
            (searchType === 'all' && globalSearchResults.length === 0)
          ) && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#856404',
                textAlign: 'center'
              }}>
                <span>🔍</span> No results found for "{searchQuery}"
              </div>
            )}

          {/* Help Text */}
          <div style={{
            marginTop: '8px',
            padding: '6px 8px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            💡 Type to search {searchType === 'layers' ? 'layer names' : searchType === 'features' ? 'feature names' : 'layers and features'}
          </div>
        </div>

        {/* Layer Selection */}
        <div>
          <label
            htmlFor="layer-select"
            style={{
              display: 'block',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '5px',
              color: '#333'
            }}
          >
            Select Layer
          </label>
          <select
            id="layer-select"
            value={activeLayer?.id || ''}
            onChange={(e) => handleLayerChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">Select a layer...</option>
            {filteredLayers.map((layer, index) => (
              <option key={`layer-${layer.id}-${index}`} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px'
      }}>
        {!activeLayer && searchType !== 'all' && searchType !== 'layers' && !searchQuery.trim() ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontStyle: 'italic',
            padding: '20px 0'
          }}>
            Select a layer to view features
          </div>
        ) : searchType === 'all' ? (
          // Show global search results
          <div>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#333' }}>
              Search Results ({globalSearchResults.length})
            </h4>
            {globalSearchResults.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic',
                padding: '20px 0'
              }}>
                {searchQuery ? 'No results found' : 'Enter a search term to begin'}
              </div>
            ) : (
              globalSearchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}-${index}`}
                  onClick={() => {
                    if (result.type === 'layer') {
                      handleLayerChange(result.layer.id);
                    } else if (result.feature) {
                      handleFeatureSelect(result.feature);
                    }
                  }}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontWeight: '500' }}>
                      {result.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: result.type === 'layer' ? '#e3f2fd' : '#f3e5f5',
                      color: result.type === 'layer' ? '#1976d2' : '#7b1fa2',
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {result.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    ID: {result.id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Layer: {result.layer.name}
                  </div>
                  {result.matchType !== 'exact' && (
                    <div style={{
                      fontSize: '10px',
                      color: '#999',
                      fontStyle: 'italic'
                    }}>
                      {result.matchType} match
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : searchType === 'layers' ? (
          // Show filtered layers
          <div>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#333' }}>
              Available Layers ({filteredLayers.length})
            </h4>
            {filteredLayers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic',
                padding: '20px 0'
              }}>
                No layers match your search
              </div>
            ) : (
              filteredLayers.map((layer, index) => (
                <div
                  key={`layer-${layer.id}-${index}`}
                  onClick={() => handleLayerChange(layer.id)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: activeLayer?.id === layer.id ? '#e3f2fd' : '#fff',
                    border: `1px solid ${activeLayer?.id === layer.id ? '#2196f3' : '#eee'}`,
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {layer.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    ID: {layer.id}
                  </div>
                  {layer.data?.features && (
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {layer.data.features.length} features
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Show filtered features
          <div>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#333' }}>
              Features ({filteredFeatures.length})
            </h4>
            {filteredFeatures.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontStyle: 'italic',
                padding: '20px 0'
              }}>
                {searchQuery ? 'No features match your search' : 'No features in this layer'}
              </div>
            ) : (
              filteredFeatures.map((item, index) => (
                <div
                  key={`${item.id}_${index}`}
                  onClick={() => handleFeatureSelect(item.feature)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    ID: {item.id}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Upload GIS Layer Modal */}
      {onLayerUpload && (
        <UploadGISLayer
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={(layer) => {
            onLayerUpload(layer);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
};

export default FeatureSearchPanel;
