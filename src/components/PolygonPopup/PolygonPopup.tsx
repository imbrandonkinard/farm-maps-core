import React, { useState } from 'react';
import { getColorInfo } from '../../utils/colorPalette';

export interface PolygonPopupProps {
  feature: any;
  position: { x: number; y: number };
  onClose: () => void;
  onNavigate?: (route: string, featureId: string) => void;
  customContent?: React.ReactNode;
  showDefaultContent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PolygonPopup: React.FC<PolygonPopupProps> = ({
  feature,
  position,
  onClose,
  onNavigate,
  customContent,
  showDefaultContent = true,
  className = '',
  style = {}
}) => {
  const [showDetails, setShowDetails] = useState(false);
  // Debug logging
  console.log('🎨 PolygonPopup component rendering with:', {
    feature: feature,
    position: position,
    showDefaultContent,
    customContent: !!customContent
  });

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      try {
        onNavigate(route, feature.id);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: show feature details instead of navigating
        console.log('Showing feature details instead of navigating');
      }
    } else {
      // No navigation function provided, feature details are shown instead
      console.log('No navigation function provided, showing feature details');
    }
  };

  // Determine feature type and corresponding colors
  const getFeatureTypeInfo = () => {
    const properties = feature.properties || {};
    const isWICLocation = properties.type === 'WIC Location' || feature.id?.startsWith('wic_') || feature.layerId === 'wic_locations_layer';
    const isLayerFeature = feature.source === 'layer';
    const isDrawnFeature = feature.source === 'drawn' || !isLayerFeature;

    // Get the layer's actual color from the feature or layer data
    let layerColor = '#666666'; // Default gray
    let layerName = 'Unknown Layer';

    // Try to get color from feature's layer information
    if (feature.layerColor) {
      layerColor = feature.layerColor;
    } else if (feature.layerStyle?.fill?.color) {
      layerColor = feature.layerStyle.fill.color;
    } else if (feature.layerStyle?.line?.color) {
      layerColor = feature.layerStyle.line.color;
    }

    // Try to get layer name
    if (feature.layerName) {
      layerName = feature.layerName;
    }

    // Get color information
    const colorInfo = getColorInfo(layerColor);

    // Check layer ID to determine specific type
    if (isWICLocation) {
      return {
        type: 'WIC Location',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '🏪',
        description: 'WIC (Women, Infants, and Children) nutrition program location',
        layerName: layerName
      };
    } else if (feature.layerId === 'boundary_ahupuaa_layer') {
      return {
        type: 'Ahupuaa Boundary',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '🏔️',
        description: 'Traditional Hawaiian land division boundary',
        layerName: layerName
      };
    } else if (feature.layerId === 'complex_area_school_layer') {
      return {
        type: 'School Complex Area',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '🏫',
        description: 'School complex administrative area',
        layerName: layerName
      };
    } else if (feature.layerId === 'district_school_layer') {
      return {
        type: 'School District',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '🎓',
        description: 'School district boundary',
        layerName: layerName
      };
    } else if (isLayerFeature) {
      return {
        type: 'GIS Layer Feature',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '📍',
        description: 'Feature from uploaded GIS data',
        layerName: layerName
      };
    } else if (isDrawnFeature) {
      return {
        type: 'Drawn Feature',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '✏️',
        description: 'User-drawn feature on the map',
        layerName: 'Drawn Features'
      };
    } else {
      return {
        type: 'Unknown Feature',
        color: layerColor,
        colorName: colorInfo.name,
        icon: '❓',
        description: 'Feature type not determined',
        layerName: layerName
      };
    }
  };

  const featureTypeInfo = getFeatureTypeInfo();

  // Render comprehensive feature details
  const renderFeatureDetails = () => {
    const properties = feature.properties || {};

    return (
      <div style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: `1px solid ${featureTypeInfo.color}20`
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          fontWeight: 'bold',
          color: featureTypeInfo.color
        }}>
          📋 Feature Details
        </h5>

        <div style={{ fontSize: '11px', color: '#666' }}>
          <p style={{ margin: '2px 0' }}>
            <strong>Feature ID:</strong> {feature.id}
          </p>
          <p style={{ margin: '2px 0' }}>
            <strong>Feature Name:</strong> {feature.name || 'Unnamed'}
          </p>
          <p style={{ margin: '2px 0' }}>
            <strong>Layer:</strong> {featureTypeInfo.layerName}
          </p>
          <p style={{ margin: '2px 0' }}>
            <strong>Layer ID:</strong> {feature.layerId || 'Unknown'}
          </p>
          <p style={{ margin: '2px 0' }}>
            <strong>Geometry Type:</strong> {feature.geometry?.type || 'Unknown'}
          </p>
          <p style={{ margin: '2px 0' }}>
            <strong>Source:</strong> {feature.source || 'Unknown'}
          </p>

          {/* Display all available properties */}
          {Object.keys(properties).length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ margin: '4px 0 2px 0', fontWeight: 'bold' }}>
                Properties ({Object.keys(properties).length}):
              </p>
              {Object.entries(properties).slice(0, 8).map(([key, value]) => (
                <p key={key} style={{ margin: '1px 0', fontFamily: 'monospace', fontSize: '10px' }}>
                  <strong>{key}:</strong> {String(value)}
                </p>
              ))}
              {Object.keys(properties).length > 8 && (
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
                  ... and {Object.keys(properties).length - 8} more properties
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Determine feature type and render appropriate content
  const renderFeatureContent = () => {
    const properties = feature.properties || {};
    const isWICLocation = featureTypeInfo.type === 'WIC Location';
    const isLayerFeature = feature.source === 'layer';
    const isPoint = feature.geometry?.type === 'Point';

    if (isWICLocation && isPoint) {
      // WIC Location specific content
      return (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: featureTypeInfo.color }}>
            {featureTypeInfo.icon} {properties.name || 'WIC Location'}
          </h4>

          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              📍 {properties.address}
            </p>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              🏙️ {properties.city}, {properties.island}
            </p>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              📮 {properties.zip}
            </p>
          </div>

          {properties.latitude && properties.longitude && (
            <div style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
                🌐 Lat: {properties.latitude.toFixed(6)}
              </p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
                🌐 Lng: {properties.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Details button to navigate to feature details */}
          <button
            onClick={() => {
              if (onNavigate) {
                // Pass feature data to client for navigation
                onNavigate('/feature-details', feature);
              } else {
                // Fallback: show details directly if no navigation handler
                setShowDetails(!showDetails);
              }
            }}
            style={{
              backgroundColor: featureTypeInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 'bold'
            }}
          >
            Details
          </button>

          {/* Show details directly only if no navigation handler and details are toggled */}
          {!onNavigate && showDetails && renderFeatureDetails()}
        </div>
      );
    } else if (isLayerFeature) {
      // Layer feature content (from uploaded GIS data)
      return (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: featureTypeInfo.color }}>
            {featureTypeInfo.icon} {feature.name || 'Layer Feature'}
          </h4>

          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              <strong>Type:</strong> {feature.geometry?.type || 'Unknown'}
            </p>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              <strong>Layer:</strong> {feature.layerId || 'Unknown'}
            </p>
          </div>

          {/* Display all available properties */}
          {Object.keys(properties).length > 0 && (
            <div style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                Properties:
              </p>
              {Object.entries(properties).slice(0, 5).map(([key, value]) => (
                <p key={key} style={{ margin: '2px 0', fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
                  {key}: {String(value)}
                </p>
              ))}
              {Object.keys(properties).length > 5 && (
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                  ... and {Object.keys(properties).length - 5} more properties
                </p>
              )}
            </div>
          )}

          {/* Details button to navigate to feature details */}
          <button
            onClick={() => {
              if (onNavigate) {
                // Pass feature data to client for navigation
                onNavigate('/feature-details', feature);
              } else {
                // Fallback: show details directly if no navigation handler
                setShowDetails(!showDetails);
              }
            }}
            style={{
              backgroundColor: featureTypeInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 'bold'
            }}
          >
            Details
          </button>

          {/* Show details directly only if no navigation handler and details are toggled */}
          {!onNavigate && showDetails && renderFeatureDetails()}
        </div>
      );
    } else if (properties.area) {
      // Farm field content (existing logic)
      return (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: featureTypeInfo.color }}>
            {featureTypeInfo.icon} {properties.name || `Field ${feature.id.slice(0, 6)}`}
          </h4>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
            Area: {properties.area} acres
          </p>
          {/* Details button to navigate to feature details */}
          <button
            onClick={() => {
              if (onNavigate) {
                // Pass feature data to client for navigation
                onNavigate('/feature-details', feature);
              } else {
                // Fallback: show details directly if no navigation handler
                setShowDetails(!showDetails);
              }
            }}
            style={{
              backgroundColor: featureTypeInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 'bold'
            }}
          >
            Details
          </button>

          {/* Show details directly only if no navigation handler and details are toggled */}
          {!onNavigate && showDetails && renderFeatureDetails()}
        </div>
      );
    } else {
      // Generic feature content
      return (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: featureTypeInfo.color }}>
            {featureTypeInfo.icon} {properties.name || `Feature ${feature.id?.slice(0, 6) || 'Unknown'}`}
          </h4>
          {properties.description && (
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
              {properties.description}
            </p>
          )}
          {/* Details button to navigate to feature details */}
          <button
            onClick={() => {
              if (onNavigate) {
                // Pass feature data to client for navigation
                onNavigate('/feature-details', feature);
              } else {
                // Fallback: show details directly if no navigation handler
                setShowDetails(!showDetails);
              }
            }}
            style={{
              backgroundColor: featureTypeInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 'bold'
            }}
          >
            Details
          </button>

          {/* Show details directly only if no navigation handler and details are toggled */}
          {!onNavigate && showDetails && renderFeatureDetails()}
        </div>
      );
    }
  };

  const defaultContent = renderFeatureContent();

  console.log('🎨 PolygonPopup rendering content:', {
    defaultContent: !!defaultContent,
    customContent: !!customContent,
    showDefaultContent,
    finalContent: customContent || (showDefaultContent ? defaultContent : null)
  });

  return (
    <div
      className={`polygon-popup ${className}`}
      style={{
        position: 'absolute',
        left: position.x + 10,
        top: position.y - 10,
        backgroundColor: 'white',
        border: `3px solid ${featureTypeInfo.color}`, // Dynamic border color based on feature type
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000, // Higher z-index
        minWidth: '220px',
        maxWidth: '320px',
        opacity: 1, // Ensure it's visible
        ...style
      }}
    >
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: featureTypeInfo.color, fontWeight: 'bold' }}>
              {featureTypeInfo.icon} {featureTypeInfo.type}
            </span>
            <span style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
              {featureTypeInfo.description}
            </span>
            <span style={{ fontSize: '9px', color: featureTypeInfo.color, fontWeight: '500' }}>
              Layer: {featureTypeInfo.layerName} • Color: {featureTypeInfo.colorName}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {customContent || (showDefaultContent ? defaultContent : null)}
      </div>
    </div>
  );
};
