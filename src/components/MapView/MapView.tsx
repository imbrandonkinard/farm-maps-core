import React, { useRef, useEffect, useState } from 'react';
import { Map } from 'maplibre-gl';
import { MapViewProps } from '../../types';

export const MapView: React.FC<MapViewProps> = ({
  children,
  initialViewState = {
    longitude: -156.3319,
    latitude: 20.7967,
    zoom: 7
  },
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  onMapLoad,
  style = { width: '100%', height: '100%' }
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Dynamically import maplibre-gl to avoid SSR issues
    import('maplibre-gl').then((maplibregl) => {
      if (!mapContainer.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        attributionControl: true as any
      });

      map.on('load', () => {
        setMapLoaded(true);
        if (onMapLoad) {
          onMapLoad(map);
        }
      });

      mapRef.current = map;

      // Cleanup
      return () => {
        if (map) {
          map.remove();
        }
      };
    }).catch((error) => {
      console.error('Failed to load MapLibre GL:', error);
    });
  }, [mapStyle, initialViewState.longitude, initialViewState.latitude, initialViewState.zoom, onMapLoad]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={style}
      className="farm-maps-mapview"
    >
      {children && mapLoaded && mapRef.current &&
        React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pass the map instance to child components
            return React.cloneElement(child, { map: mapRef.current } as any);
          }
          return child;
        })
      }
    </div>
  );
};

export default MapView;
