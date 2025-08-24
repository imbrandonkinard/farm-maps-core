import React from 'react';

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
  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route, feature.id);
    }
  };

  // Determine feature type and render appropriate content
  const renderFeatureContent = () => {
    const properties = feature.properties || {};
    const isWICLocation = properties.type === 'WIC Location' || feature.id?.startsWith('wic_');
    const isPoint = feature.geometry?.type === 'Point';

    if (isWICLocation && isPoint) {
      // WIC Location specific content
      return (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#FF6B35' }}>
            🏪 {properties.name || 'WIC Location'}
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
                  backgroundColor: '#FF6B35',
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
    } else if (properties.area) {
      // Farm field content (existing logic)
      return (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            {properties.name || `Field ${feature.id.slice(0, 6)}`}
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
                  backgroundColor: '#007cba',
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
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            {properties.name || `Feature ${feature.id?.slice(0, 6) || 'Unknown'}`}
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
                  backgroundColor: '#007cba',
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

  return (
    <div
      className={`polygon-popup ${className}`}
      style={{
        position: 'absolute',
        left: position.x + 10,
        top: position.y - 10,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '220px',
        maxWidth: '320px',
        ...style
      }}
    >
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {feature.properties?.type || 'Feature Information'}
          </span>
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
