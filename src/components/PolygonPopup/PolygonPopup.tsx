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

  const defaultContent = (
    <div style={{ padding: '8px 0' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
        {feature.properties?.name || `Field ${feature.id.slice(0, 6)}`}
      </h4>
      {feature.properties?.area && (
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
          Area: {feature.properties.area} acres
        </p>
      )}
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

  return (
    <div
      className={`polygon-popup ${className}`}
      style={{
        position: 'absolute',
        left: position.x + 10,
        top: position.y - 10,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '200px',
        maxWidth: '300px',
        ...style
      }}
    >
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Field Information</span>
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
