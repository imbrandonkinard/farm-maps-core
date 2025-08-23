import React from 'react';
import { FeatureSearchPanelProps } from '../../types';
import { filterLayerFeatures, getLayerFeatureNames } from '../../utils/layerUtils';

// React component without hooks
export const FeatureSearchPanel: React.FC<FeatureSearchPanelProps> = (props) => {
  const { layers, activeLayer, onLayerChange, onFeatureSelect } = props;

  if (layers.length === 0) {
    return React.createElement('div', {
      style: {
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
      }
    }, 'No layers available');
  }

  // Get features for the active layer
  let filteredFeatures: Array<{ name: string; id: string; feature: any }> = [];
  if (activeLayer?.data?.features) {
    filteredFeatures = getLayerFeatureNames(activeLayer);
  }

  return React.createElement('div', {
    style: {
      width: '250px',
      height: '100%',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      marginRight: '10px'
    }
  }, [
    React.createElement('div', {
      key: 'header-section',
      style: {
        padding: '15px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f8f8'
      }
    }, [
      React.createElement('div', {
        key: 'layer-controls',
        style: { marginBottom: '15px' }
      }, [
        React.createElement('label', {
          key: 'layer-label',
          htmlFor: 'layer-select',
          style: {
            display: 'block',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '5px'
          }
        }, 'Select Layer'),
        React.createElement('select', {
          key: 'layer-select',
          id: 'layer-select',
          value: activeLayer?.id || '',
          onChange: (e: any) => onLayerChange(layers.find(l => l.id === e.target.value) || null),
          style: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            fontSize: '14px'
          }
        }, [
          React.createElement('option', { key: 'default-option', value: '' }, 'Select a layer...'),
          ...layers.map((layer, index) =>
            React.createElement('option', {
              key: `layer-${layer.id}-${index}`,
              value: layer.id
            }, layer.name)
          )
        ])
      ])
    ]),
    React.createElement('div', {
      key: 'content-section',
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '15px'
      }
    }, !activeLayer ?
      React.createElement('div', {
        key: 'no-layer-selected',
        style: {
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
          padding: '20px 0'
        }
      }, 'Select a layer to view features')
      : filteredFeatures.length === 0 ?
        React.createElement('div', {
          key: 'no-features',
          style: {
            textAlign: 'center',
            color: '#666',
            fontStyle: 'italic',
            padding: '20px 0'
          }
        }, 'No features in this layer')
        :
        filteredFeatures.map((item, index) =>
          React.createElement('div', {
            key: `${item.id}_${index}`,
            onClick: () => onFeatureSelect(item.feature),
            style: {
              padding: '12px',
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: '#fff',
              border: '1px solid #eee',
              marginBottom: '8px'
            }
          }, [
            React.createElement('div', {
              key: `feature-name-${item.id}`,
              style: { fontWeight: '500', marginBottom: '4px' }
            }, item.name),
            React.createElement('div', {
              key: `feature-id-${item.id}`,
              style: { fontSize: '12px', color: '#666' }
            }, `ID: ${item.id}`)
          ])
        )
    )
  ]);
};

export default FeatureSearchPanel;
