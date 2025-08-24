import {
  calculateAreaInAcres,
  calculateArea,
  calculateTotalArea,
  isPointInPolygon,
  getPolygonCentroid,
  bufferPolygon,
  simplifyPolygon,
  calculateDistance,
  calculatePerimeter,
  doPolygonsIntersect,
  calculateIntersectionArea,
  unionPolygons,
  differencePolygons,
  getBoundingBox,
  createBoundingBoxPolygon,
  isFeatureInBbox,
  calculateAreaWeightedCentroid,
  convertArea
} from '../geometry';

describe('Geometry Utilities', () => {
  const samplePolygon = {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    properties: { name: 'Test Polygon' }
  };

  const samplePoint = {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [0.5, 0.5]
    },
    properties: {}
  };

  describe('calculateAreaInAcres', () => {
    it('should calculate area in acres for a simple polygon', () => {
      const area = calculateAreaInAcres(samplePolygon);
      expect(area).toBeGreaterThan(0);
      expect(typeof area).toBe('number');
    });

    it('should handle single polygon', () => {
      const area = calculateAreaInAcres(samplePolygon);
      expect(area).toBeGreaterThan(0);
    });

    it('should handle polygon with different coordinates', () => {
      const polygon = {
        ...samplePolygon,
        geometry: {
          ...samplePolygon.geometry,
          coordinates: [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]]
        }
      };
      const area = calculateAreaInAcres(polygon);
      expect(area).toBeGreaterThan(0);
    });
  });

  describe('calculateArea', () => {
    it('should calculate area for a polygon', () => {
      const area = calculateArea(samplePolygon);
      expect(area).toBeGreaterThan(0);
      expect(typeof area).toBe('number');
    });

    it('should handle different coordinate systems', () => {
      const polygon = {
        ...samplePolygon,
        geometry: {
          ...samplePolygon.geometry,
          coordinates: [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]]
        }
      };
      const area = calculateArea(polygon);
      expect(area).toBeGreaterThan(0);
    });
  });

  describe('calculateTotalArea', () => {
    it('should calculate total area for multiple features', () => {
      const features = [samplePolygon, samplePolygon];
      const totalArea = calculateTotalArea(features);
      expect(totalArea).toBeGreaterThan(0);
    });

    it('should return 0 for empty array', () => {
      const totalArea = calculateTotalArea([]);
      expect(totalArea).toBe(0);
    });
  });

  describe('isPointInPolygon', () => {
    it('should return true for point inside polygon', () => {
      const result = isPointInPolygon(samplePoint, samplePolygon);
      expect(result).toBe(true);
    });

    it('should return false for point outside polygon', () => {
      const outsidePoint = {
        ...samplePoint,
        geometry: {
          ...samplePoint.geometry,
          coordinates: [2, 2]
        }
      };
      const result = isPointInPolygon(outsidePoint, samplePolygon);
      expect(result).toBe(false);
    });

    it('should handle point on polygon boundary', () => {
      const boundaryPoint = {
        ...samplePoint,
        geometry: {
          ...samplePoint.geometry,
          coordinates: [0, 0]
        }
      };
      const result = isPointInPolygon(boundaryPoint, samplePolygon);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getPolygonCentroid', () => {
    it('should calculate centroid for a polygon', () => {
      const centroid = getPolygonCentroid(samplePolygon);
      expect(centroid).toBeDefined();
      expect(centroid.geometry.type).toBe('Point');
      expect(centroid.geometry.coordinates).toHaveLength(2);
    });

    it('should handle complex polygons', () => {
      const complexPolygon = {
        ...samplePolygon,
        geometry: {
          ...samplePolygon.geometry,
          coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
        }
      };
      const centroid = getPolygonCentroid(complexPolygon);
      expect(centroid.geometry.coordinates).toEqual([1, 1]);
    });
  });

  describe('bufferPolygon', () => {
    it('should create a buffer around a polygon', () => {
      const buffer = bufferPolygon(samplePolygon, 0.1);
      expect(buffer).toBeDefined();
      expect(buffer.geometry.type).toBe('Polygon');
    });

    it('should handle different buffer distances', () => {
      const smallBuffer = bufferPolygon(samplePolygon, 0.01);
      const largeBuffer = bufferPolygon(samplePolygon, 1);
      expect(smallBuffer).toBeDefined();
      expect(largeBuffer).toBeDefined();
    });
  });

  describe('simplifyPolygon', () => {
    it('should simplify a polygon', () => {
      const simplified = simplifyPolygon(samplePolygon, 0.1);
      expect(simplified).toBeDefined();
      expect(simplified.geometry.type).toBe('Polygon');
    });

    it('should handle different tolerance values', () => {
      const highTolerance = simplifyPolygon(samplePolygon, 1);
      const lowTolerance = simplifyPolygon(samplePolygon, 0.01);
      expect(highTolerance).toBeDefined();
      expect(lowTolerance).toBeDefined();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const point1 = { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} };
      const point2 = { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 1] }, properties: {} };
      const distance = calculateDistance(point1, point2);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('should return 0 for same point', () => {
      const distance = calculateDistance(samplePoint, samplePoint);
      expect(distance).toBe(0);
    });
  });

  describe('calculatePerimeter', () => {
    it('should calculate perimeter of a polygon', () => {
      const perimeter = calculatePerimeter(samplePolygon);
      expect(perimeter).toBeGreaterThan(0);
      expect(typeof perimeter).toBe('number');
    });
  });

  describe('doPolygonsIntersect', () => {
    it('should detect intersection between overlapping polygons', () => {
      const polygon1 = samplePolygon;
      const polygon2 = {
        ...samplePolygon,
        geometry: {
          ...samplePolygon.geometry,
          coordinates: [[[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]]]
        }
      };
      const intersects = doPolygonsIntersect(polygon1, polygon2);
      expect(intersects).toBe(true);
    });

    it('should return false for non-overlapping polygons', () => {
      const polygon1 = samplePolygon;
      const polygon2 = {
        ...samplePolygon,
        geometry: {
          ...samplePolygon.geometry,
          coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]
        }
      };
      const intersects = doPolygonsIntersect(polygon1, polygon2);
      expect(intersects).toBe(false);
    });
  });

  describe('getBoundingBox', () => {
    it('should calculate bounding box for a polygon', () => {
      const bbox = getBoundingBox(samplePolygon);
      expect(bbox).toHaveLength(4);
      expect(bbox[0]).toBe(0); // minX
      expect(bbox[1]).toBe(0); // minY
      expect(bbox[2]).toBe(1); // maxX
      expect(bbox[3]).toBe(1); // maxY
    });
  });

  describe('createBoundingBoxPolygon', () => {
    it('should create a polygon from bounding box coordinates', () => {
      const bbox = [0, 0, 1, 1];
      const polygon = createBoundingBoxPolygon(bbox);
      expect(polygon.geometry.type).toBe('Polygon');
      expect(polygon.geometry.coordinates[0]).toHaveLength(5); // 4 corners + closing point
    });
  });

  describe('isFeatureInBbox', () => {
    it('should return true for feature inside bbox', () => {
      const bbox = [0, 0, 1, 1];
      const result = isFeatureInBbox(samplePoint, bbox);
      expect(result).toBe(true);
    });

    it('should return false for feature outside bbox', () => {
      const bbox = [0, 0, 1, 1];
      const outsidePoint = {
        ...samplePoint,
        geometry: {
          ...samplePoint.geometry,
          coordinates: [2, 2]
        }
      };
      const result = isFeatureInBbox(outsidePoint, bbox);
      expect(result).toBe(false);
    });
  });

  describe('convertArea', () => {
    it('should convert area between different units', () => {
      const areaInSquareMeters = 10000; // 1 hectare
      const areaInAcres = convertArea(areaInSquareMeters, 'sqm', 'acres');
      expect(areaInAcres).toBeGreaterThan(0);
      expect(typeof areaInAcres).toBe('number');
    });

    it('should handle same unit conversion', () => {
      const area = 100;
      const converted = convertArea(area, 'acres', 'acres');
      expect(converted).toBe(area);
    });
  });
});
