import * as turf from '@turf/turf';
import { GeoJSONFeature } from '../types';

/**
 * Calculate the total area of all features in a collection
 * @param features - Array of features
 * @param unit - Unit for area calculation (default: 'acres')
 * @returns Total area in specified unit
 */
export const calculateTotalAreaInUnit = (
  features: GeoJSONFeature[], 
  unit: 'acres' | 'hectares' | 'squareMeters' | 'squareFeet' | 'squareKilometers' = 'acres'
): number => {
  const totalAreaInSquareMeters = features.reduce((total, feature) => {
    return total + turf.area(feature as any);
  }, 0);

  switch (unit) {
    case 'acres':
      return totalAreaInSquareMeters * 0.000247105;
    case 'hectares':
      return totalAreaInSquareMeters * 0.0001;
    case 'squareFeet':
      return totalAreaInSquareMeters * 10.763910417;
    case 'squareKilometers':
      return totalAreaInSquareMeters * 0.000001;
    default:
      return totalAreaInSquareMeters;
  }
};

/**
 * Calculate the average area of features
 * @param features - Array of features
 * @param unit - Unit for area calculation (default: 'acres')
 * @returns Average area in specified unit
 */
export const calculateAverageArea = (
  features: GeoJSONFeature[], 
  unit: 'acres' | 'hectares' | 'squareMeters' | 'squareFeet' | 'squareKilometers' = 'acres'
): number => {
  if (features.length === 0) return 0;
  
  const totalArea = calculateTotalAreaInUnit(features, unit);
  return totalArea / features.length;
};

/**
 * Find the largest feature by area
 * @param features - Array of features
 * @returns The feature with the largest area
 */
export const findLargestFeature = (features: GeoJSONFeature[]): GeoJSONFeature | null => {
  if (features.length === 0) return null;
  
  return features.reduce((largest, current) => {
    const largestArea = turf.area(largest as any);
    const currentArea = turf.area(current as any);
    return currentArea > largestArea ? current : largest;
  });
};

/**
 * Find the smallest feature by area
 * @param features - Array of features
 * @returns The feature with the smallest area
 */
export const findSmallestFeature = (features: GeoJSONFeature[]): GeoJSONFeature | null => {
  if (features.length === 0) return null;
  
  return features.reduce((smallest, current) => {
    const smallestArea = turf.area(smallest as any);
    const currentArea = turf.area(current as any);
    return currentArea < smallestArea ? current : smallest;
  });
};

/**
 * Calculate the density of features in a given area
 * @param features - Array of features
 * @param boundaryArea - Total boundary area in square meters
 * @returns Feature density (features per square meter)
 */
export const calculateFeatureDensity = (features: GeoJSONFeature[], boundaryArea: number): number => {
  if (boundaryArea <= 0) return 0;
  return features.length / boundaryArea;
};

/**
 * Calculate the total perimeter of all features
 * @param features - Array of features
 * @param unit - Unit for perimeter calculation (default: 'meters')
 * @returns Total perimeter in specified unit
 */
export const calculateTotalPerimeter = (
  features: GeoJSONFeature[], 
  unit: 'meters' | 'kilometers' | 'miles' | 'feet' = 'meters'
): number => {
  return features.reduce((total, feature) => {
    return total + turf.length(feature as any, { units: unit });
  }, 0);
};

/**
 * Calculate the compactness ratio of a polygon (area to perimeter ratio)
 * @param polygon - The polygon feature
 * @returns Compactness ratio (higher = more compact)
 */
export const calculateCompactnessRatio = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (perimeter === 0) return 0;
  
  // Compactness ratio = 4π * area / (perimeter²)
  return (4 * Math.PI * area) / (perimeter * perimeter);
};

/**
 * Calculate the elongation ratio of a polygon
 * @param polygon - The polygon feature
 * @returns Elongation ratio (1 = perfect circle, higher = more elongated)
 */
export const calculateElongationRatio = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (perimeter === 0) return 0;
  
  // Elongation ratio = perimeter² / (4π * area)
  return (perimeter * perimeter) / (4 * Math.PI * area);
};

/**
 * Calculate the aspect ratio of a polygon's bounding box
 * @param polygon - The polygon feature
 * @returns Aspect ratio (width / height)
 */
export const calculateAspectRatio = (polygon: GeoJSONFeature): number => {
  const bbox = turf.bbox(polygon as any);
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  
  if (height === 0) return 0;
  return width / height;
};

/**
 * Calculate the circularity of a polygon
 * @param polygon - The polygon feature
 * @returns Circularity (1 = perfect circle, 0 = very irregular)
 */
export const calculateCircularity = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (perimeter === 0) return 0;
  
  // Circularity = 4π * area / (perimeter²)
  return (4 * Math.PI * area) / (perimeter * perimeter);
};

/**
 * Calculate the fractal dimension of a polygon (complexity measure)
 * @param polygon - The polygon feature
 * @returns Fractal dimension (higher = more complex)
 */
export const calculateFractalDimension = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (area <= 0 || perimeter <= 0) return 0;
  
  // Fractal dimension = 2 * log(perimeter) / log(area)
  return 2 * Math.log(perimeter) / Math.log(area);
};

/**
 * Calculate the efficiency of a polygon (how close to a circle)
 * @param polygon - The polygon feature
 * @returns Efficiency ratio (1 = perfect circle, lower = less efficient)
 */
export const calculateEfficiency = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (perimeter === 0) return 0;
  
  // Efficiency = 4π * area / (perimeter²)
  return (4 * Math.PI * area) / (perimeter * perimeter);
};

/**
 * Calculate the shape index of a polygon
 * @param polygon - The polygon feature
 * @returns Shape index (1 = perfect circle, higher = more irregular)
 */
export const calculateShapeIndex = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (area <= 0 || perimeter <= 0) return 0;
  
  // Shape index = perimeter / (2 * √(π * area))
  return perimeter / (2 * Math.sqrt(Math.PI * area));
};

/**
 * Calculate the roundness of a polygon
 * @param polygon - The polygon feature
 * @returns Roundness (1 = perfect circle, 0 = very angular)
 */
export const calculateRoundness = (polygon: GeoJSONFeature): number => {
  const area = turf.area(polygon as any);
  const perimeter = turf.length(polygon as any, { units: 'meters' });
  
  if (perimeter === 0) return 0;
  
  // Roundness = 4π * area / (perimeter²)
  return (4 * Math.PI * area) / (perimeter * perimeter);
};
