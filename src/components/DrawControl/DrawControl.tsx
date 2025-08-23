import React, { forwardRef, useImperativeHandle } from 'react';
import { DrawControlProps, DrawControlRef } from '../../types';

// Simple DrawControl component that doesn't use useControl hook
const DrawControl = forwardRef<DrawControlRef, DrawControlProps>((props, ref) => {
  const {
    onCreate,
    onUpdate,
    onDelete,
    onModeChange,
    controls = {
      polygon: true,
      point: false,
      line: false,
      trash: true
    },
    defaultMode = 'simple_select',
    styles,
    position = 'top-left'
  } = props;

  // This component will be enhanced by the parent MapView component
  // to properly integrate with the map context
  useImperativeHandle(ref, () => ({
    getMode: () => 'simple_select',
    changeMode: (mode: string, options?: any) => {
      if (onModeChange) {
        onModeChange(mode);
      }
    },
    getAll: () => [],
    getSelected: () => [],
    delete: (ids: string[]) => {
      if (onDelete) {
        // Create mock features for deletion
        const mockFeatures = ids.map(id => ({
          id,
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [] },
          properties: {}
        }));
        onDelete({ type: 'delete', features: mockFeatures });
      }
    },
    add: (geojson: any) => {
      // This will be handled by the parent component
    }
  }), [onModeChange, onDelete]);

  // Return null since this component doesn't render anything
  // The actual drawing functionality will be handled by the parent MapView
  return null;
});

DrawControl.displayName = 'DrawControl';

export default DrawControl;
