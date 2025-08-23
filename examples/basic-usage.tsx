import React, { useState } from 'react';
import {
  MapView,
  DrawControl,
  ControlPanel,
  FeatureSearchPanel,
  useMapFeatures,
  useMapLayers,
  createDefaultLayer
} from '@farm-maps/core';

// Example GeoJSON data
const sampleLayerData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-156.3, 20.8],
          [-156.2, 20.8],
          [-156.2, 20.9],
          [-156.3, 20.9],
          [-156.3, 20.8]
        ]]
      },
      properties: {
        name: 'Sample Field 1',
        id: 'field1'
      }
    }
  ]
};

function BasicUsageExample() {
  const { features, addFeature, removeFeature, updateFeature } = useMapFeatures();
  const { layers, addLayer, activeLayer, setActiveLayer } = useMapLayers();
  const [showSearchPanel, setShowSearchPanel] = useState(true);

  // Initialize with sample layer
  React.useEffect(() => {
    if (layers.length === 0) {
      const sampleLayer = createDefaultLayer(
        'sample-layer',
        'Sample Fields',
        sampleLayerData,
        'name'
      );
      addLayer(sampleLayer);
    }
  }, [layers.length, addLayer]);

  const handleCreate = (event: any) => {
    console.log('Feature created:', event);
    if (event.features && event.features.length > 0) {
      addFeature(event.features[0]);
    }
  };

  const handleUpdate = (event: any) => {
    console.log('Feature updated:', event);
    if (event.features && event.features.length > 0) {
      updateFeature(event.features[0]);
    }
  };

  const handleDelete = (event: any) => {
    console.log('Feature deleted:', event);
    if (event.features && event.features.length > 0) {
      event.features.forEach((feature: any) => removeFeature(feature.id));
    }
  };

  const handleFeatureSelect = (feature: any) => {
    console.log('Feature selected:', feature);
  };

  const handlePolygonClick = (polygon: any) => {
    console.log('Polygon clicked:', polygon);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Left Panel - Feature Search */}
      {showSearchPanel && (
        <FeatureSearchPanel
          layers={layers}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          onFeatureSelect={handleFeatureSelect}
        />
      )}

      {/* Main Map Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setShowSearchPanel(!showSearchPanel)}
          style={{
            position: 'absolute',
            top: '10px',
            left: showSearchPanel ? '260px' : '10px',
            zIndex: 1000,
            padding: '8px 12px',
            backgroundColor: '#007cbf',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {showSearchPanel ? 'Hide' : 'Show'} Search Panel
        </button>

        {/* Map */}
        <MapView
          initialViewState={{
            longitude: -156.3319,
            latitude: 20.7967,
            zoom: 10
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <DrawControl
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            controls={{
              polygon: true,
              point: false,
              line: false,
              trash: true
            }}
            defaultMode="simple_select"
          />
        </MapView>

        {/* Area Display */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '4px',
          width: '200px',
          textAlign: 'center',
          fontSize: '13px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            Drawing Tools
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px' }}>
            Use the drawing tools to create fields
          </p>
          {features.length > 0 && (
            <p style={{ margin: '5px 0', fontSize: '12px' }}>
              {features.length} field{features.length !== 1 ? 's' : ''} drawn
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Control Panel */}
      <div style={{
        width: '300px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #eee',
          fontWeight: 'bold',
          fontSize: '16px',
          backgroundColor: '#f8f9fa'
        }}>
          Drawn Fields
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          <ControlPanel
            polygons={features}
            onPolygonClick={handlePolygonClick}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default BasicUsageExample;
