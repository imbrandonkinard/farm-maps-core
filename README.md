# Farm Maps Core

A modular, reusable mapping and drawing system for farm management applications built with React, TypeScript, and MapLibre GL.

## Features

- 🗺️ **Interactive Map View** - Built on MapLibre GL for open-source mapping
- ✏️ **Drawing Tools** - Polygon drawing with MapboxDraw integration
- 🔍 **Feature Search** - Search and filter map layers and features
- 📊 **Control Panel** - Manage drawn features with area calculations
- 🎯 **Feature Selection** - Interactive feature selection and editing
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔧 **Customizable** - Configurable drawing styles and controls
- 📦 **Modular** - Use individual components or the full system

## Installation

```bash
npm install @farm-maps/core
# or
yarn add @farm-maps/core
```

## Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "@reduxjs/toolkit": ">=1.9.0",
  "react-redux": ">=8.0.0"
}
```

## Quick Start

### Basic Map with Drawing

```tsx
import React from 'react';
import { MapView, DrawControl, ControlPanel, useMapFeatures } from '@farm-maps/core';

function MyMap() {
  const { features, addFeature, removeFeature } = useMapFeatures();

  const handleCreate = (event) => {
    addFeature(event.features[0]);
  };

  const handleDelete = (event) => {
    event.features.forEach(feature => removeFeature(feature.id));
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapView>
        <DrawControl
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      </MapView>
      <ControlPanel
        polygons={features}
        onPolygonClick={(polygon) => console.log('Clicked:', polygon)}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### With Redux Store

```tsx
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice } from '@farm-maps/core';

const store = configureStore({
  reducer: {
    farmMaps: mapSlice.reducer
  }
});

function App() {
  return (
    <Provider store={store}>
      <MyMap />
    </Provider>
  );
}
```

## Components

### MapView

The main map container component.

```tsx
<MapView
  initialViewState={{
    longitude: -156.3319,
    latitude: 20.7967,
    zoom: 7
  }}
  mapStyle="your-map-style-url"
  onMapLoad={(map) => console.log('Map loaded:', map)}
>
  {/* Map controls and overlays go here */}
</MapView>
```

### DrawControl

Provides drawing tools for creating polygons, points, and lines.

```tsx
<DrawControl
  onCreate={handleCreate}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  onModeChange={handleModeChange}
  controls={{
    polygon: true,
    point: false,
    line: false,
    trash: true
  }}
  defaultMode="simple_select"
  enableAdvancedFeatures={false}
/>
```

### ControlPanel

Displays and manages drawn features.

```tsx
<ControlPanel
  polygons={features}
  onPolygonClick={handlePolygonClick}
  onDelete={handleDelete}
/>
```

### FeatureSearchPanel

Search and filter map layers and features.

```tsx
<FeatureSearchPanel
  layers={layers}
  activeLayer={activeLayer}
  onLayerChange={setActiveLayer}
  onFeatureSelect={handleFeatureSelect}
/>
```

### FeatureSelectPopup

Interactive popup for feature selection.

```tsx
<FeatureSelectPopup
  features={features}
  position={{ x: 100, y: 100 }}
  onSelect={handleFeatureSelect}
  onClose={() => setPopupInfo(null)}
/>
```

## Hooks

### useMapFeatures

Hook for managing map features with Redux.

```tsx
const {
  features,
  addFeature,
  updateFeature,
  removeFeature,
  clearAllFeatures,
  getTotalArea,
  updateFeatureName
} = useMapFeatures();
```

### useMapLayers

Hook for managing map layers.

```tsx
const {
  layers,
  activeLayer,
  addLayer,
  removeLayer,
  setActiveLayer,
  loadLayerFromGeoJSON
} = useMapLayers();
```

## Utilities

### Geometry Utilities

```tsx
import { 
  calculateAreaInAcres,
  calculateAreaInMultipleUnits,
  isPointInPolygon,
  getPolygonCentroid
} from '@farm-maps/core';

const area = calculateAreaInAcres(polygon);
const centroid = getPolygonCentroid(polygon);
```

### Layer Utilities

```tsx
import {
  createDefaultLayer,
  filterLayerFeatures,
  validateLayer
} from '@farm-maps/core';

const layer = createDefaultLayer('id', 'name', data, 'nameProperty');
const isValid = validateLayer(layer).isValid;
```

### Mapbox Utilities

```tsx
import {
  createMapboxDraw,
  getDefaultDrawingStyles,
  updateMapboxDrawConstants
} from '@farm-maps/core';

const draw = createMapboxDraw({
  controls: { polygon: true, trash: true }
});
```

## Configuration

### Default Configuration

```tsx
import { defaultConfig } from '@farm-maps/core';

const config = {
  ...defaultConfig,
  mapStyle: 'your-custom-style-url',
  controls: {
    polygon: true,
    point: true,
    line: true,
    trash: true
  },
  enableAdvancedFeatures: true
};
```

### Custom Drawing Styles

```tsx
const customStyles = [
  {
    'id': 'custom-polygon-fill',
    'type': 'fill',
    'filter': ['==', '$type', 'Polygon'],
    'paint': {
      'fill-color': '#ff0000',
      'fill-opacity': 0.5
    }
  }
];

<DrawControl styles={customStyles} />
```

## Examples

See the `examples/` directory for complete working examples:

- Basic drawing and editing
- Layer management
- Feature search and selection
- Custom styling
- Integration with external data sources

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

## 🚀 Development & Publishing Workflow

### **Local Development**

1. **Make changes** to the source code in `src/`
2. **Test locally** by building the package:
   ```bash
   npm run build
   npm run type-check
   ```

3. **Link locally** for testing in other projects:
   ```bash
   npm link
   cd ../your-test-project
   npm link @farm-maps/core
   ```

### **Publishing Updates**

1. **Ensure clean git working directory**:
   ```bash
   git status
   git add .
   git commit -m "Description of changes"
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Bump version** (choose one):
   ```bash
   npm version patch    # 1.0.0 → 1.0.1 (bug fixes)
   npm version minor    # 1.0.0 → 1.1.0 (new features)
   npm version major    # 1.0.0 → 2.0.0 (breaking changes)
   ```

4. **Publish to npm**:
   ```bash
   npm publish
   ```

### **Troubleshooting Publishing Issues**

#### **Git Working Directory Not Clean**
```bash
# Commit all changes first
git add .
git commit -m "Update package configuration"
npm version patch
```

#### **Version Already Exists**
```bash
# Bump to a new version
npm version patch
npm publish
```

#### **Wrong Directory Publishing**
```bash
# Ensure you're in farm-maps-core directory
pwd  # Should show: .../farm_management/farm-maps-core
npm publish
```

### **Dependency Management**

#### **Updating Peer Dependencies**
When updating peer dependencies, ensure compatibility:

```json
"peerDependencies": {
  "@reduxjs/toolkit": "^1.9.0 || ^2.0.0",
  "react": "^18.2.0",
  "react-redux": "^8.0.0 || ^9.0.0",
  "react-map-gl": "^7.0.0 || ^8.0.0"
}
```

#### **Testing Compatibility**
After updating dependencies:
1. **Build locally** to check for TypeScript errors
2. **Test in a sample project** with different dependency versions
3. **Update examples** if needed
4. **Publish new version** when stable

### **Version Strategy**

- **Patch (1.0.x)**: Bug fixes, minor improvements
- **Minor (1.x.0)**: New features, backward compatible
- **Major (x.0.0)**: Breaking changes, major refactoring

### **Quality Assurance**

Before publishing:
- [ ] All tests pass
- [ ] TypeScript compilation successful
- [ ] Examples work correctly
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped appropriately

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Create an issue on GitHub
- Check the documentation
- Review the examples

## Roadmap

- [ ] Additional drawing tools (circles, rectangles)
- [ ] Advanced styling options
- [ ] Layer opacity controls
- [ ] Export/import functionality
- [ ] Performance optimizations
- [ ] Additional map projections
- [ ] Mobile gesture support
