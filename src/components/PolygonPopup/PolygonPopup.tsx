import React from 'react';
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
  // Debug logging
  console.log('🎨 PolygonPopup component rendering with:', {
    feature: feature,
    position: position,
    showDefaultContent,
    customContent: !!customContent
  });

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route, feature.id);
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

          {onNavigate && (
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => handleNavigate('/wic-details')}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: featureTypeInfo.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: 'bold'
                }}
              >
                🚀 View WIC Details
              </button>
            </div>
          )}
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

          {onNavigate && (
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => handleNavigate('/layer-feature-details')}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: featureTypeInfo.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: 'bold'
                }}
              >
                🔍 View Layer Details
              </button>
            </div>
          )}
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
          {onNavigate && (
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => handleNavigate('/field-details')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: featureTypeInfo.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginRight: '4px'
                }}
              >
                View Details
              </button>
              <button
                onClick={() => handleNavigate('/field-edit')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            </div>
          )}
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
          {onNavigate && (
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => handleNavigate('/feature-details')}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: featureTypeInfo.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </div>
          )}
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
