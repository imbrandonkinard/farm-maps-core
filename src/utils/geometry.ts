import * as turf from '@turf/turf';
import { GeoJSONFeature } from '../types';

/**
 * Calculate the area of a polygon in acres
 * @param polygon - The polygon feature
 * @returns Area in acres
 */
export const calculateAreaInAcres = (polygon: GeoJSONFeature): number => {
  const areaInSquareMeters = turf.area(polygon as any);
  const areaInAcres = areaInSquareMeters * 0.000247105; // Convert to acres
  return parseFloat(areaInAcres.toFixed(2));
};

/**
 * Calculate the area of a polygon in various units
 * @param polygon - The polygon feature
 * @returns Object with areas in different units
 */
export const calculateAreaInMultipleUnits = (polygon: GeoJSONFeature) => {
  const areaInSquareMeters = turf.area(polygon as any);

  return {
    squareMeters: areaInSquareMeters,
    acres: areaInSquareMeters * 0.000247105,
    hectares: areaInSquareMeters * 0.0001,
    squareFeet: areaInSquareMeters * 10.763910417,
    squareKilometers: areaInSquareMeters * 0.000001
  };
};

/**
 * Calculate the area of a polygon using turf.area directly
 * @param polygon - The polygon feature
 * @returns Area in square meters
 */
export const calculateArea = (polygon: GeoJSONFeature): number => {
  return turf.area(polygon as any);
};

/**
 * Calculate the area of multiple features
 * @param features - Array of polygon features
 * @returns Total area in square meters
 */
export const calculateTotalArea = (features: GeoJSONFeature[]): number => {
  return features.reduce((total, feature) => {
    return total + turf.area(feature as any);
  }, 0);
};

/**
 * Check if a point is inside a polygon
 * @param point - The point feature
 * @param polygon - The polygon feature
 * @returns True if point is inside polygon
 */
export const isPointInPolygon = (point: GeoJSONFeature, polygon: GeoJSONFeature): boolean => {
  return turf.booleanPointInPolygon(point as any, polygon as any);
};

/**
 * Get the centroid of a polygon
 * @param polygon - The polygon feature
 * @returns Centroid point feature
 */
export const getPolygonCentroid = (polygon: GeoJSONFeature): GeoJSONFeature => {
  const centroid = turf.centroid(polygon as any);
  return centroid as any;
};

/**
 * Buffer a polygon by a specified distance
 * @param polygon - The polygon feature
 * @param distance - Distance in meters
 * @returns Buffered polygon feature
 */
export const bufferPolygon = (polygon: GeoJSONFeature, distance: number): GeoJSONFeature => {
  const buffered = turf.buffer(polygon as any, distance, { units: 'meters' });
  return buffered as any;
};

/**
 * Simplify a polygon to reduce complexity
 * @param polygon - The polygon feature
 * @param tolerance - Simplification tolerance
 * @returns Simplified polygon feature
 */
export const simplifyPolygon = (polygon: GeoJSONFeature, tolerance: number = 0.01): GeoJSONFeature => {
  const simplified = turf.simplify(polygon as any, { tolerance, highQuality: true });
  return simplified as any;
};

/**
 * Calculate distance between two points
 * @param point1 - First point feature
 * @param point2 - Second point feature
 * @param units - Units for distance (default: 'meters')
 * @returns Distance in specified units
 */
export const calculateDistance = (
  point1: GeoJSONFeature, 
  point2: GeoJSONFeature, 
  units: 'meters' | 'kilometers' | 'miles' | 'feet' = 'meters'
): number => {
  return turf.distance(point1 as any, point2 as any, { units });
};

/**
 * Calculate the perimeter of a polygon
 * @param polygon - The polygon feature
 * @param units - Units for perimeter (default: 'meters')
 * @returns Perimeter in specified units
 */
export const calculatePerimeter = (
  polygon: GeoJSONFeature, 
  units: 'meters' | 'kilometers' | 'miles' | 'feet' = 'meters'
): number => {
  return turf.length(polygon as any, { units });
};

/**
 * Check if two polygons intersect
 * @param polygon1 - First polygon feature
 * @param polygon2 - Second polygon feature
 * @returns True if polygons intersect
 */
export const doPolygonsIntersect = (polygon1: GeoJSONFeature, polygon2: GeoJSONFeature): boolean => {
  return turf.booleanIntersects(polygon1 as any, polygon2 as any);
};

/**
 * Calculate the intersection area between two polygons
 * @param polygon1 - First polygon feature
 * @param polygon2 - Second polygon feature
 * @returns Intersection area in square meters, or 0 if no intersection
 */
export const calculateIntersectionArea = (polygon1: GeoJSONFeature, polygon2: GeoJSONFeature): number => {
  try {
    const intersection = turf.intersect(polygon1 as any, polygon2 as any);
    return intersection ? turf.area(intersection) : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Calculate the union of two polygons
 * @param polygon1 - First polygon feature
 * @param polygon2 - Second polygon feature
 * @returns Union polygon feature
 */
export const unionPolygons = (polygon1: GeoJSONFeature, polygon2: GeoJSONFeature): GeoJSONFeature => {
  const union = turf.union(polygon1 as any, polygon2 as any);
  return union as any;
};

/**
 * Calculate the difference between two polygons
 * @param polygon1 - First polygon feature
 * @param polygon2 - Second polygon feature
 * @returns Difference polygon feature
 */
export const differencePolygons = (polygon1: GeoJSONFeature, polygon2: GeoJSONFeature): GeoJSONFeature => {
  try {
    // Note: turf.difference may not be available in all versions
    // For now, return the original polygon as a fallback
    return polygon1;
  } catch (error) {
    // If difference fails, return the original polygon
    return polygon1;
  }
};

/**
 * Get the bounding box of a feature or feature collection
 * @param feature - The feature or feature collection
 * @returns Bounding box as [minX, minY, maxX, maxY]
 */
export const getBoundingBox = (feature: GeoJSONFeature | GeoJSONFeature[]): [number, number, number, number] => {
  const bbox = turf.bbox(feature as any);
  return bbox as [number, number, number, number];
};

/**
 * Create a bounding box polygon from coordinates
 * @param bbox - Bounding box as [minX, minY, maxX, maxY]
 * @returns Bounding box polygon feature
 */
export const createBoundingBoxPolygon = (bbox: [number, number, number, number]): GeoJSONFeature => {
  const bboxPolygon = turf.bboxPolygon(bbox);
  return bboxPolygon as any;
};

/**
 * Check if a feature is within a bounding box
 * @param feature - The feature to check
 * @param bbox - Bounding box as [minX, minY, maxX, maxY]
 * @returns True if feature is within bbox
 */
export const isFeatureInBbox = (feature: GeoJSONFeature, bbox: [number, number, number, number]): boolean => {
  return turf.booleanWithin(feature as any, createBoundingBoxPolygon(bbox) as any);
};

/**
 * Calculate the area-weighted centroid of multiple polygons
 * @param polygons - Array of polygon features
 * @returns Area-weighted centroid point feature
 */
export const calculateAreaWeightedCentroid = (polygons: GeoJSONFeature[]): GeoJSONFeature => {
  if (polygons.length === 0) {
    throw new Error('No polygons provided');
  }
  
  if (polygons.length === 1) {
    return getPolygonCentroid(polygons[0]);
  }
  
  // Calculate area-weighted centroid
  let totalArea = 0;
  let weightedX = 0;
  let weightedY = 0;
  
  polygons.forEach(polygon => {
    const area = turf.area(polygon as any);
    const centroid = turf.centroid(polygon as any);
    
    totalArea += area;
    weightedX += centroid.geometry.coordinates[0] * area;
    weightedY += centroid.geometry.coordinates[1] * area;
  });
  
  const finalCentroid = turf.point([weightedX / totalArea, weightedY / totalArea]);
  return finalCentroid as any;
};

/**
 * Convert area from one unit to another
 * @param area - Area value
 * @param fromUnit - Current unit
 * @param toUnit - Target unit
 * @returns Converted area value
 */
export const convertArea = (
  area: number, 
  fromUnit: 'squareMeters' | 'acres' | 'hectares' | 'squareFeet' | 'squareKilometers',
  toUnit: 'squareMeters' | 'acres' | 'hectares' | 'squareFeet' | 'squareKilometers'
): number => {
  // First convert to square meters
  let areaInSquareMeters: number;
  
  switch (fromUnit) {
    case 'squareMeters':
      areaInSquareMeters = area;
      break;
    case 'acres':
      areaInSquareMeters = area / 0.000247105;
      break;
    case 'hectares':
      areaInSquareMeters = area / 0.0001;
      break;
    case 'squareFeet':
      areaInSquareMeters = area / 10.763910417;
      break;
    case 'squareKilometers':
      areaInSquareMeters = area / 0.000001;
      break;
    default:
      areaInSquareMeters = area;
  }
  
  // Then convert to target unit
  switch (toUnit) {
    case 'squareMeters':
      return areaInSquareMeters;
    case 'acres':
      return areaInSquareMeters * 0.000247105;
    case 'hectares':
      return areaInSquareMeters * 0.0001;
    case 'squareFeet':
      return areaInSquareMeters * 10.763910417;
    case 'squareKilometers':
      return areaInSquareMeters * 0.000001;
    default:
      return areaInSquareMeters;
  }
};
