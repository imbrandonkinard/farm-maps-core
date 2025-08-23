import React from 'react';
import { GeoJSONFeature, ControlPanelProps } from '../../types';
import { calculateAreaInAcres } from '../../utils/geometry';

// React component without hooks
export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { polygons, onPolygonClick, onDelete } = props;

  if (!polygons || polygons.length === 0) {
    return React.createElement('div', {
      style: {
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic'
      }
    }, 'No fields drawn yet. Use the drawing tools to create fields.');
  }

  return React.createElement('div', {},
    polygons.map((polygon: GeoJSONFeature) =>
      React.createElement('div', {
        key: polygon.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #eee'
        }
      }, [
        React.createElement('div', {
          style: {
            flex: 1,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          onClick: () => onPolygonClick(polygon)
        }, [
          React.createElement('div', {
            style: { fontWeight: '500' }
          }, polygon.properties?.name || `Field ${typeof polygon.id === 'string' ? polygon.id.slice(0, 6) : String(polygon.id).slice(0, 6)}`),
          React.createElement('div', {
            style: { fontSize: '13px', color: '#666' }
          }, `${calculateAreaInAcres(polygon)} acres`)
        ]),
        React.createElement('div', {
          style: { display: 'flex', gap: '8px', marginLeft: '8px' }
        }, [
          React.createElement('button', {
            onClick: () => onDelete({ type: 'delete', features: [polygon] }),
            style: {
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#dc3545'
            },
            title: 'Delete field'
          }, '🗑️')
        ])
      ])
    )
  );
};

export default ControlPanel;
