import * as turf from '@turf/turf';
import { GeoJSONFeature } from '../types';

/**
 * Calculate the convex hull of a set of features
 * @param features - Array of features
 * @returns Convex hull polygon feature
 */
export const calculateConvexHull = (features: GeoJSONFeature[]): GeoJSONFeature => {
  const convexHull = turf.convex(features as any);
  return convexHull as any;
};

/**
 * Calculate the minimum bounding circle of a feature
 * @param feature - The feature to analyze
 * @returns Circle feature representing the minimum bounding circle
 */
export const calculateMinimumBoundingCircle = (feature: GeoJSONFeature): GeoJSONFeature => {
  const circle = turf.circle(turf.center(feature as any) as any, turf.area(feature as any) / Math.PI, { units: 'meters' });
  return circle as any;
};

/**
 * Calculate the center of mass of a feature
 * @param feature - The feature to analyze
 * @returns Center of mass point feature
 */
export const calculateCenterOfMass = (feature: GeoJSONFeature): GeoJSONFeature => {
  const centerOfMass = turf.centerOfMass(feature as any);
  return centerOfMass as any;
};

/**
 * Calculate the envelope (bounding rectangle) of a feature
 * @param feature - The feature to analyze
 * @returns Envelope polygon feature
 */
export const calculateEnvelope = (feature: GeoJSONFeature): GeoJSONFeature => {
  const envelope = turf.envelope(feature as any);
  return envelope as any;
};

/**
 * Calculate the minimum bounding rectangle of a feature (using envelope as approximation)
 * @param feature - The feature to analyze
 * @returns Minimum bounding rectangle polygon feature
 */
export const calculateMinimumBoundingRectangle = (feature: GeoJSONFeature): GeoJSONFeature => {
  // Use envelope as an approximation since minimumRotatedRectangle doesn't exist in turf
  const envelope = turf.envelope(feature as any);
  return envelope as any;
};

/**
 * Calculate the nearest point on a line to a given point
 * @param point - The point feature
 * @param line - The line feature
 * @returns Nearest point on the line
 */
export const calculateNearestPointOnLine = (point: GeoJSONFeature, line: GeoJSONFeature): GeoJSONFeature => {
  const nearestPoint = turf.nearestPointOnLine(line as any, point as any);
  return nearestPoint as any;
};

/**
 * Calculate the nearest point to a given point from a set of points
 * @param targetPoint - The target point
 * @param points - Array of candidate points
 * @returns Nearest point from the array
 */
export const findNearestPoint = (targetPoint: GeoJSONFeature, points: GeoJSONFeature[]): GeoJSONFeature => {
  const nearestPoint = turf.nearestPoint(targetPoint as any, turf.featureCollection(points as any));
  return nearestPoint as any;
};

/**
 * Calculate the bearing between two points
 * @param point1 - First point feature
 * @param point2 - Second point feature
 * @returns Bearing in degrees
 */
export const calculateBearing = (point1: GeoJSONFeature, point2: GeoJSONFeature): number => {
  return turf.bearing(point1 as any, point2 as any);
};

/**
 * Calculate the destination point given a starting point, distance, and bearing
 * @param startPoint - Starting point feature
 * @param distance - Distance in meters
 * @param bearing - Bearing in degrees
 * @returns Destination point feature
 */
export const calculateDestinationPoint = (
  startPoint: GeoJSONFeature,
  distance: number,
  bearing: number
): GeoJSONFeature => {
  const destination = turf.destination(startPoint as any, distance, bearing, { units: 'meters' });
  return destination as any;
};

/**
 * Calculate the midpoint between two points
 * @param point1 - First point feature
 * @param point2 - Second point feature
 * @returns Midpoint feature
 */
export const calculateMidpoint = (point1: GeoJSONFeature, point2: GeoJSONFeature): GeoJSONFeature => {
  const midpoint = turf.midpoint(point1 as any, point2 as any);
  return midpoint as any;
};

/**
 * Calculate the great circle distance between two points
 * @param point1 - First point feature
 * @param point2 - Second point feature
 * @param units - Units for distance (default: 'meters')
 * @returns Great circle distance
 */
export const calculateGreatCircleDistance = (
  point1: GeoJSONFeature,
  point2: GeoJSONFeature,
  units: 'meters' | 'kilometers' | 'miles' | 'feet' = 'meters'
): number => {
  return turf.greatCircle(point1 as any, point2 as any).properties?.distance || 0;
};

/**
 * Calculate the area of a polygon in square feet
 * @param polygon - The polygon feature
 * @returns Area in square feet
 */
export const calculateAreaInSquareFeet = (polygon: GeoJSONFeature): number => {
  const areaInSquareMeters = turf.area(polygon as any);
  return areaInSquareMeters * 10.763910417;
};

/**
 * Calculate the area of a polygon in hectares
 * @param polygon - The polygon feature
 * @returns Area in hectares
 */
export const calculateAreaInHectares = (polygon: GeoJSONFeature): number => {
  const areaInSquareMeters = turf.area(polygon as any);
  return areaInSquareMeters * 0.0001;
};

/**
 * Calculate the area of a polygon in square kilometers
 * @param polygon - The polygon feature
 * @returns Area in square kilometers
 */
export const calculateAreaInSquareKilometers = (polygon: GeoJSONFeature): number => {
  const areaInSquareMeters = turf.area(polygon as any);
  return areaInSquareMeters * 0.000001;
};

/**
 * Calculate the perimeter of a polygon in feet
 * @param polygon - The polygon feature
 * @returns Perimeter in feet
 */
export const calculatePerimeterInFeet = (polygon: GeoJSONFeature): number => {
  return turf.length(polygon as any, { units: 'feet' });
};

/**
 * Calculate the perimeter of a polygon in miles
 * @param polygon - The polygon feature
 * @returns Perimeter in miles
 */
export const calculatePerimeterInMiles = (polygon: GeoJSONFeature): number => {
  return turf.length(polygon as any, { units: 'miles' });
};

/**
 * Check if a line intersects with a polygon
 * @param line - The line feature
 * @param polygon - The polygon feature
 * @returns True if line intersects polygon
 */
export const doesLineIntersectPolygon = (line: GeoJSONFeature, polygon: GeoJSONFeature): boolean => {
  return turf.booleanIntersects(line as any, polygon as any);
};

/**
 * Calculate the length of a line feature
 * @param line - The line feature
 * @param units - Units for length (default: 'meters')
 * @returns Length in specified units
 */
export const calculateLineLength = (
  line: GeoJSONFeature,
  units: 'meters' | 'kilometers' | 'miles' | 'feet' = 'meters'
): number => {
  return turf.length(line as any, { units });
};

/**
 * Create a buffer around a line feature
 * @param line - The line feature
 * @param distance - Buffer distance in meters
 * @returns Buffered polygon feature
 */
export const bufferLine = (line: GeoJSONFeature, distance: number): GeoJSONFeature => {
  const buffered = turf.buffer(line as any, distance, { units: 'meters' });
  return buffered as any;
};

/**
 * Simplify a line feature to reduce complexity
 * @param line - The line feature
 * @param tolerance - Simplification tolerance
 * @returns Simplified line feature
 */
export const simplifyLine = (line: GeoJSONFeature, tolerance: number = 0.01): GeoJSONFeature => {
  const simplified = turf.simplify(line as any, { tolerance, highQuality: true });
  return simplified as any;
};
