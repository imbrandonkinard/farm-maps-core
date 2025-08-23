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
