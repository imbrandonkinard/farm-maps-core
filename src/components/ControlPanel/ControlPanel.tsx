import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateFeatureProperties } from '../../store/mapSlice';
import { calculateAreaInAcres } from '../../utils/geometry';

export interface ControlPanelProps {
  polygons: any[];
  onPolygonClick?: (polygon: any) => void;
  onDelete: (event: any) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  polygons,
  onPolygonClick,
  onDelete
}) => {
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const calculateArea = (polygon: any) => {
    return calculateAreaInAcres(polygon).toFixed(2);
  };

  const handleEditClick = (polygon: any) => {
    setEditingId(polygon.id);
    setEditingName(polygon.properties?.name || `Field ${polygon.id.slice(0, 6)}`);
  };

  const handleSaveName = (polygon: any) => {
    dispatch(updateFeatureProperties({
      id: polygon.id,
      properties: {
        ...polygon.properties,
        name: editingName
      }
    }));

    onDelete({
      type: 'save',
      features: [{
        ...polygon,
        properties: {
          ...polygon.properties,
          name: editingName
        }
      }]
    });

    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, polygon: any) => {
    if (e.key === 'Enter') {
      handleSaveName(polygon);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div>
      {polygons.map(polygon => (
        <div
          key={polygon.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #eee'
          }}
        >
          <div
            style={{
              flex: 1,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
            onClick={() => onPolygonClick?.(polygon)}
          >
            {editingId === polygon.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleSaveName(polygon)}
                onKeyDown={(e) => handleKeyPress(e, polygon)}
                autoFocus
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ) : (
              <>
                <div style={{ fontWeight: '500' }}>
                  {polygon.properties?.name || `Field ${polygon.id.slice(0, 6)}`}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {calculateArea(polygon)} acres
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <button
              onClick={() => handleEditClick(polygon)}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete({ type: 'delete', features: [polygon] })}
              style={{
                padding: '4px 8px',
                border: '1px solid #dc3545',
                borderRadius: '4px',
                backgroundColor: '#dc3545',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
