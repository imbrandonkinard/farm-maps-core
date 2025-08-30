/**
 * Color palette utilities for map layers
 * Ensures each layer gets a unique, visually distinct color
 */

export interface ColorInfo {
  color: string;
  name: string;
  description: string;
}

// Predefined color palette for map layers
export const LAYER_COLORS: ColorInfo[] = [
  { color: '#FF6B35', name: 'Orange', description: 'WIC Locations' },
  { color: '#088', name: 'Teal', description: 'Ahupuaa Boundaries' },
  { color: '#800080', name: 'Purple', description: 'School Complex Areas' },
  { color: '#008000', name: 'Green', description: 'School Districts' },
  { color: '#6B46C1', name: 'Violet', description: 'GIS Layer Features' },
  { color: '#007cba', name: 'Blue', description: 'Drawn Features' },
  { color: '#DC2626', name: 'Red', description: 'Emergency Services' },
  { color: '#F59E0B', name: 'Amber', description: 'Transportation' },
  { color: '#10B981', name: 'Emerald', description: 'Parks & Recreation' },
  { color: '#8B5CF6', name: 'Indigo', description: 'Utilities' },
  { color: '#EF4444', name: 'Rose', description: 'Healthcare' },
  { color: '#06B6D4', name: 'Cyan', description: 'Water Features' },
  { color: '#84CC16', name: 'Lime', description: 'Agriculture' },
  { color: '#F97316', name: 'Orange Red', description: 'Commercial' },
  { color: '#EC4899', name: 'Pink', description: 'Residential' },
  { color: '#6366F1', name: 'Blue Violet', description: 'Government' },
  { color: '#14B8A6', name: 'Teal Green', description: 'Environmental' },
  { color: '#F59E0B', name: 'Yellow', description: 'Infrastructure' },
  { color: '#8B5A2B', name: 'Brown', description: 'Historical' },
  { color: '#6B7280', name: 'Gray', description: 'Other Features' }
];

// Color assignment tracking
const assignedColors = new Map<string, string>();

/**
 * Get a unique color for a layer
 * @param layerId - The layer identifier
 * @param layerName - The layer name (for fallback color selection)
 * @returns ColorInfo object with color, name, and description
 */
export const getLayerColor = (layerId: string, layerName?: string): ColorInfo => {
  // Check if this layer already has an assigned color
  if (assignedColors.has(layerId)) {
    const color = assignedColors.get(layerId)!;
    return LAYER_COLORS.find(c => c.color === color) || LAYER_COLORS[0];
  }

  // Find the first available color
  for (const colorInfo of LAYER_COLORS) {
    if (!Array.from(assignedColors.values()).includes(colorInfo.color)) {
      assignedColors.set(layerId, colorInfo.color);
      return colorInfo;
    }
  }

  // If all colors are used, cycle through them
  const index = assignedColors.size % LAYER_COLORS.length;
  const colorInfo = LAYER_COLORS[index];
  assignedColors.set(layerId, colorInfo.color);
  return colorInfo;
};

/**
 * Get color information by color code
 * @param color - The color code (e.g., '#FF6B35')
 * @returns ColorInfo object or default if not found
 */
export const getColorInfo = (color: string): ColorInfo => {
  return LAYER_COLORS.find(c => c.color === color) || {
    color: color,
    name: 'Custom',
    description: 'Custom color'
  };
};

/**
 * Reset color assignments (useful for testing or layer reloading)
 */
export const resetColorAssignments = (): void => {
  assignedColors.clear();
};

/**
 * Get all assigned colors
 * @returns Map of layerId to color
 */
export const getAssignedColors = (): Map<string, string> => {
  return new Map(assignedColors);
};

/**
 * Check if a color is available
 * @param color - The color code to check
 * @returns True if color is available, false if already assigned
 */
export const isColorAvailable = (color: string): boolean => {
  return !Array.from(assignedColors.values()).includes(color);
};
