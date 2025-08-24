import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadGISLayer } from '../UploadGISLayer';
import { MapLayer } from '../../../types';

// Mock DOMParser for KML testing
const mockDOMParser = {
  parseFromString: jest.fn()
};

global.DOMParser = jest.fn(() => mockDOMParser) as any;

// Mock File.text() method
Object.defineProperty(File.prototype, 'text', {
  value: function() {
    return Promise.resolve(this.content || '');
  },
  writable: true
});

describe('UploadGISLayer', () => {
  const mockOnUpload = jest.fn();
  const mockOnClose = jest.fn();
  const defaultProps = {
    onUpload: mockOnUpload,
    onClose: mockOnClose,
    isOpen: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDOMParser.parseFromString.mockClear();
  });

  it('renders when open', () => {
    render(<UploadGISLayer {...defaultProps} />);
    
    expect(screen.getByText('Upload GIS Layer')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('GeoJSON')).toBeInTheDocument();
    expect(screen.getByText('KML')).toBeInTheDocument();
    expect(screen.getByText('Shapefile')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<UploadGISLayer {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Upload GIS Layer')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<UploadGISLayer {...defaultProps} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes when cancel button is clicked', () => {
    render(<UploadGISLayer {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  describe('File Upload', () => {
    it('handles drag and drop events', () => {
      render(<UploadGISLayer {...defaultProps} />);
      
      const uploadArea = screen.getByText('Click to upload or drag and drop');
      
      // Test drag enter
      fireEvent.dragEnter(uploadArea);
      expect(screen.getByText('Drop files here')).toBeInTheDocument();
      
      // Test drag leave
      fireEvent.dragLeave(uploadArea);
      expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    });
  });

  describe('CSV Processing', () => {
    it('processes valid CSV with latitude and longitude columns', async () => {
      const csvContent = 'name,lat,lng\nGolf Course 1,21.3069,-157.8583\nGolf Course 2,21.3000,-157.8500';
      const csvFile = new File([csvContent], 'golf_courses.csv', { type: 'text/csv' });
      (csvFile as any).content = csvContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.stringContaining('uploaded_'),
            name: 'golf_courses',
            data: {
              type: 'FeatureCollection',
              features: expect.arrayContaining([
                expect.objectContaining({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [-157.8583, 21.3069]
                  },
                  properties: {
                    name: 'Golf Course 1',
                    lat: '21.3069',
                    lng: '-157.8583'
                  }
                })
              ])
            }
          })
        );
      });
    });

    it('detects various coordinate column names', async () => {
      const csvContent = 'name,latitude,longitude\nGolf Course 1,21.3069,-157.8583';
      const csvFile = new File([csvContent], 'golf_courses.csv', { type: 'text/csv' });
      (csvFile as any).content = csvContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });
    });

    it('throws error for CSV without coordinate columns', async () => {
      const csvContent = 'name,description\nGolf Course 1,Nice course';
      const csvFile = new File([csvContent], 'golf_courses.csv', { type: 'text/csv' });
      (csvFile as any).content = csvContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('CSV must contain latitude and longitude columns')).toBeInTheDocument();
      });
    });

    it('filters out rows with invalid coordinates', async () => {
      const csvContent = 'name,lat,lng\nGolf Course 1,21.3069,-157.8583\nInvalid Course,invalid,invalid\nGolf Course 2,21.3000,-157.8500';
      const csvFile = new File([csvContent], 'golf_courses.csv', { type: 'text/csv' });
      (csvFile as any).content = csvContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });
    });
  });

  describe('GeoJSON Processing', () => {
    it('processes valid GeoJSON FeatureCollection', async () => {
      const geojsonContent = JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-157.8583, 21.3069], [-157.8500, 21.3000], [-157.8583, 21.3069]]]
            },
            properties: { name: 'Golf Course Area' }
          }
        ]
      });
      const geojsonFile = new File([geojsonContent], 'golf_courses.geojson', { type: 'application/geo+json' });
      (geojsonFile as any).content = geojsonContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [geojsonFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'golf_courses',
            data: {
              type: 'FeatureCollection',
              features: expect.arrayContaining([
                expect.objectContaining({
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: expect.any(Array)
                  }
                })
              ])
            }
          })
        );
      });
    });

    it('processes valid GeoJSON Feature', async () => {
      const geojsonContent = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-157.8583, 21.3069]
        },
        properties: { name: 'Golf Course' }
      });
      const geojsonFile = new File([geojsonContent], 'golf_course.geojson', { type: 'application/geo+json' });
      (geojsonFile as any).content = geojsonContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [geojsonFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              type: 'FeatureCollection',
              features: expect.arrayContaining([
                expect.objectContaining({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [-157.8583, 21.3069]
                  }
                })
              ])
            }
          })
        );
      });
    });

    it('throws error for invalid GeoJSON', async () => {
      const geojsonContent = '{"type": "Invalid", "data": "invalid"}';
      const geojsonFile = new File([geojsonContent], 'invalid.geojson', { type: 'application/geo+json' });
      (geojsonFile as any).content = geojsonContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [geojsonFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid GeoJSON file')).toBeInTheDocument();
      });
    });
  });

  describe('KML Processing', () => {
    it('processes valid KML with placemarks', async () => {
      const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
          <Document>
            <Placemark>
              <name>Golf Course 1</name>
              <Polygon>
                <outerBoundaryIs>
                  <LinearRing>
                    <coordinates>-157.8583,21.3069 -157.8500,21.3000 -157.8583,21.3069</coordinates>
                  </LinearRing>
                </outerBoundaryIs>
              </Polygon>
            </Placemark>
          </Document>
        </kml>`;
      
      const kmlFile = new File([kmlContent], 'golf_courses.kml', { type: 'application/vnd.google-earth.kml+xml' });
      (kmlFile as any).content = kmlContent;
      
      // Mock DOMParser response
      const mockXmlDoc = {
        getElementsByTagName: jest.fn().mockReturnValue([
          {
            getElementsByTagName: jest.fn().mockImplementation((tagName: string) => {
              if (tagName === 'name') {
                return [{ textContent: 'Golf Course 1' }];
              } else if (tagName === 'coordinates') {
                return [{ textContent: '-157.8583,21.3069 -157.8500,21.3000 -157.8583,21.3069' }];
              }
              return [];
            })
          }
        ])
      };
      
      mockDOMParser.parseFromString.mockReturnValue(mockXmlDoc);
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [kmlFile] } });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'golf_courses',
            data: {
              type: 'FeatureCollection',
              features: expect.arrayContaining([
                expect.objectContaining({
                  type: 'Feature',
                  properties: { name: 'Golf Course 1' }
                })
              ])
            }
          })
        );
      });
    });
  });

  describe('Shapefile Processing', () => {
    it('shows error for shapefile uploads', async () => {
      const shpFile = new File(['fake shapefile content'], 'golf_courses.shp', { type: 'application/octet-stream' });
      (shpFile as any).content = 'fake shapefile content';
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [shpFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Shapefile support requires additional libraries/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error for unsupported file types', async () => {
      const unsupportedFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      (unsupportedFile as any).content = 'content';
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      });
    });

    it('clears error when new file is uploaded', async () => {
      // First upload with error
      const unsupportedFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      (unsupportedFile as any).content = 'content';
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      });
      
      // Then upload valid file
      const csvContent = 'name,lat,lng\nGolf Course 1,21.3069,-157.8583';
      const csvFile = new File([csvContent], 'golf_courses.csv', { type: 'text/csv' });
      (csvFile as any).content = csvContent;
      
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
      
      await waitFor(() => {
        expect(screen.queryByText(/Unsupported file type/)).not.toBeInTheDocument();
        expect(mockOnUpload).toHaveBeenCalled();
      });
    });
  });

  describe('Upload Progress', () => {
    it('shows upload progress during file processing', async () => {
      const csvContent = 'name,lat,lng\nGolf Course 1,21.3069,-157.8583';
      const csvFile = new File([csvContent], 'golf_courses.csv', { type: 'text/csv' });
      (csvFile as any).content = csvContent;
      
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [csvFile] } });
      
      // Should show progress indicator
      expect(screen.getByText(/Processing/)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });
    });
  });

  describe('File Input', () => {
    it('accepts supported file types', () => {
      render(<UploadGISLayer {...defaultProps} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      const acceptAttribute = fileInput.accept;
      
      expect(acceptAttribute).toContain('.csv');
      expect(acceptAttribute).toContain('.geojson');
      expect(acceptAttribute).toContain('.json');
      expect(acceptAttribute).toContain('.kml');
      expect(acceptAttribute).toContain('.kmz');
      expect(acceptAttribute).toContain('.shp');
    });
  });
});
