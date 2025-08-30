import React from 'react';
import { FeatureSelectPopupProps } from '../../types';

// React component without hooks
export const FeatureSelectPopup: React.FC<FeatureSelectPopupProps> = (props) => {
  const { features, position, onSelect, onClose } = props;

  if (features.length === 0) {
    return null;
  }

  return React.createElement('div', {
    style: {
      position: 'absolute',
      left: position.x,
      top: position.y,
      backgroundColor: 'white',
      padding: '8px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      zIndex: 100,
      maxWidth: '200px',
      maxHeight: '300px',
      overflowY: 'auto',
      pointerEvents: 'auto',
      border: '1px solid #ddd'
    }
  }, [
    React.createElement('div', {
      style: {
        borderBottom: '1px solid #eee',
        paddingBottom: '8px',
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    }, 'Select Field'),
    ...features.map((feature, index) => {
      // Ensure we have a unique key for each feature
      const featureKey = feature.id || feature.feature?.id || `feature-${index}-${Date.now()}`;
      const featureName = feature.name || feature.feature?.name || `Field ${feature.id?.slice(0, 6) || 'Unknown'}`;
      
      return React.createElement('div', {
        key: featureKey,
        onClick: () => onSelect(feature.feature || feature),
        style: {
          padding: '8px',
          cursor: 'pointer',
          borderRadius: '4px',
          backgroundColor: '#fff',
          marginBottom: index < features.length - 1 ? '4px' : 0
        }
      }, featureName);
    }),
    React.createElement('button', {
      onClick: onClose,
      style: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        fontSize: '14px',
        color: '#666',
        borderRadius: '2px'
      },
      title: 'Close'
    }, '✕')
  ]);
};

export default FeatureSelectPopup;
