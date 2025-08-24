import React, { useState, useRef, useCallback } from 'react';
import { MapLayer } from '../../types';

export interface UploadGISLayerProps {
  onUpload: (layer: MapLayer) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const UploadGISLayer: React.FC<UploadGISLayerProps> = ({
  onUpload,
  onClose,
  isOpen
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    '.csv',
    '.shp',
    '.shx',
    '.dbf',
    '.prj',
    '.geojson',
    '.json',
    '.kml',
    '.kmz'
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!acceptedFileTypes.includes(fileExtension)) {
        throw new Error(`Unsupported file type: ${fileExtension}. Supported types: ${acceptedFileTypes.join(', ')}`);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Process the file based on type
      const layer = await processFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        onUpload(layer);
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUpload]);

  const processFile = async (file: File): Promise<MapLayer> => {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    switch (fileExtension) {
      case '.csv':
        return await processCSV(file);
      case '.geojson':
      case '.json':
        return await processGeoJSON(file);
      case '.kml':
      case '.kmz':
        return await processKML(file);
      case '.shp':
        return await processShapefile(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  };

  const processCSV = async (file: File): Promise<MapLayer> => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Look for common coordinate column names
    const latIndex = headers.findIndex(h =>
      ['lat', 'latitude', 'y', 'ycoord'].includes(h.toLowerCase())
    );
    const lngIndex = headers.findIndex(h =>
      ['lng', 'longitude', 'x', 'xcoord'].includes(h.toLowerCase())
    );

    if (latIndex === -1 || lngIndex === -1) {
      throw new Error('CSV must contain latitude and longitude columns');
    }

    const features = lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const lat = parseFloat(values[latIndex]);
      const lng = parseFloat(values[lngIndex]);

      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        },
        properties: headers.reduce((props, header, i) => {
          props[header] = values[i];
          return props;
        }, {} as Record<string, any>)
      };
    }).filter((feature): feature is NonNullable<typeof feature> => feature !== null);

    return {
      id: `uploaded_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      data: {
        type: 'FeatureCollection',
        features
      },
      nameProperty: headers[0],
      style: {
        fill: {
          color: '#ff6b6b',
          opacity: 0.6
        },
        line: {
          color: '#ff6b6b',
          width: 2
        }
      }
    };
  };

  const processGeoJSON = async (file: File): Promise<MapLayer> => {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
      throw new Error('Invalid GeoJSON file');
    }

    const features = data.type === 'FeatureCollection' ? data.features : [data];

    return {
      id: `uploaded_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      data: {
        type: 'FeatureCollection',
        features
      },
      nameProperty: 'name',
      style: {
        fill: {
          color: '#4ecdc4',
          opacity: 0.6
        },
        line: {
          color: '#4ecdc4',
          width: 2
        }
      }
    };
  };

  const processKML = async (file: File): Promise<MapLayer> => {
    const text = await file.text();

    // Simple KML parsing - in production, you'd want a proper KML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const features: any[] = [];

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const name = placemark.getElementsByTagName('name')[0]?.textContent || `Placemark ${i + 1}`;
      const coordinates = placemark.getElementsByTagName('coordinates')[0]?.textContent;

      if (coordinates) {
        const coords = coordinates.trim().split(/\s+/).map(coord => {
          const [lng, lat] = coord.split(',').map(Number);
          return [lng, lat];
        });

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          },
          properties: { name }
        });
      }
    }

    return {
      id: `uploaded_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      data: {
        type: 'FeatureCollection',
        features
      },
      nameProperty: 'name',
      style: {
        fill: {
          color: '#45b7d1',
          opacity: 0.6
        },
        line: {
          color: '#45b7d1',
          width: 2
        }
      }
    };
  };

  const processShapefile = async (file: File): Promise<MapLayer> => {
    // Shapefile processing requires additional libraries like shpjs
    // For now, we'll show an error message
    throw new Error('Shapefile support requires additional libraries. Please convert to GeoJSON or KML format.');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Upload GIS Layer</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0 0 16px 0', color: '#666' }}>
            Upload GIS data files to add new layers to your map. Supported formats:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {['CSV', 'GeoJSON', 'KML', 'Shapefile'].map(format => (
              <span key={format} style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {format}
              </span>
            ))}
          </div>
        </div>

        {!uploading ? (
          <div
            style={{
              border: `2px dashed ${dragActive ? '#1976d2' : '#ddd'}`,
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: dragActive ? '#f3f8ff' : '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: '#333' }}>
              {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Supports CSV, GeoJSON, KML, and Shapefile formats
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px', color: '#333' }}>
              Processing {uploadProgress}%
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#1976d2',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
