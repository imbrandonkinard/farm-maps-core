import {
  updateMapboxDrawConstants,
  getDefaultDrawingStyles,
  createMapboxDraw,
  isMapReadyForDrawing
} from '../mapboxUtils';

describe('Mapbox Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateMapboxDrawConstants', () => {
    it('should update MapboxDraw constants', () => {
      expect(() => {
        updateMapboxDrawConstants();
      }).not.toThrow();
    });
  });

  describe('getDefaultDrawingStyles', () => {
    it('should return default drawing styles', () => {
      const styles = getDefaultDrawingStyles();

      expect(styles).toBeDefined();
      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);

      // Check that each style has required properties
      styles.forEach(style => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('type');
        expect(style).toHaveProperty('paint');
      });
    });

    it('should return consistent styles on multiple calls', () => {
      const styles1 = getDefaultDrawingStyles();
      const styles2 = getDefaultDrawingStyles();

      expect(styles1).toEqual(styles2);
    });
  });

  describe('createMapboxDraw', () => {
    it('should create MapboxDraw instance with default options', () => {
      const draw = createMapboxDraw();

      expect(draw).toBeDefined();
      expect(typeof draw.onAdd).toBe('function');
      expect(typeof draw.onRemove).toBe('function');
    });

    it('should create MapboxDraw instance with custom options', () => {
      const customOptions = {
        displayControlsDefault: true,
        controls: {
          polygon: true,
          point: true,
          line: true,
          trash: true
        },
        defaultMode: 'draw_polygon',
        userProperties: false
      };

      const draw = createMapboxDraw(customOptions);

      expect(draw).toBeDefined();
      expect(typeof draw.onAdd).toBe('function');
      expect(typeof draw.onRemove).toBe('function');
    });

    it('should handle empty options object', () => {
      const draw = createMapboxDraw({});

      expect(draw).toBeDefined();
      expect(typeof draw.onAdd).toBe('function');
    });

    it('should handle null options', () => {
      const draw = createMapboxDraw(null as any);

      expect(draw).toBeDefined();
      expect(typeof draw.onAdd).toBe('function');
    });
  });

  describe('isMapReadyForDrawing', () => {
    it('should return true for valid map', () => {
      const validMap = {
        isStyleLoaded: jest.fn(() => true),
        getStyle: jest.fn(() => ({ layers: [] })),
        getLayer: jest.fn(() => true),
        setLayoutProperty: jest.fn(),
        fitBounds: jest.fn(),
        getContainer: jest.fn(() => document.createElement('div')),
        on: jest.fn(),
        off: jest.fn(),
        addControl: jest.fn(),
        removeControl: jest.fn(),
        getCanvas: jest.fn(() => ({
          style: { cursor: '' }
        }))
      };

      const result = isMapReadyForDrawing(validMap as any);
      expect(result).toBe(true);
    });

    it('should return false for null map', () => {
      const result = isMapReadyForDrawing(null);
      expect(result).toBe(false);
    });

    it('should return false for undefined map', () => {
      const result = isMapReadyForDrawing(undefined);
      expect(result).toBe(false);
    });

    it('should return false for map without required methods', () => {
      const invalidMap = {
        // Missing required methods
      };

      const result = isMapReadyForDrawing(invalidMap as any);
      expect(result).toBe(false);
    });

    it('should return false when map style is not loaded', () => {
      const mapWithUnloadedStyle = {
        isStyleLoaded: jest.fn(() => false),
        getStyle: jest.fn(() => ({ layers: [] })),
        getLayer: jest.fn(() => true),
        setLayoutProperty: jest.fn(),
        fitBounds: jest.fn(),
        getContainer: jest.fn(() => document.createElement('div')),
        on: jest.fn(),
        off: jest.fn(),
        addControl: jest.fn(),
        removeControl: jest.fn(),
        getCanvas: jest.fn(() => ({
          style: { cursor: '' }
        }))
      };

      const result = isMapReadyForDrawing(mapWithUnloadedStyle as any);
      expect(result).toBe(false);
    });

    it('should return false when map style is null', () => {
      const mapWithNullStyle = {
        isStyleLoaded: jest.fn(() => true),
        getStyle: jest.fn(() => null),
        getLayer: jest.fn(() => true),
        setLayoutProperty: jest.fn(),
        fitBounds: jest.fn(),
        getContainer: jest.fn(() => document.createElement('div')),
        on: jest.fn(),
        off: jest.fn(),
        addControl: jest.fn(),
        removeControl: jest.fn(),
        getCanvas: jest.fn(() => ({
          style: { cursor: '' }
        }))
      };

      const result = isMapReadyForDrawing(mapWithNullStyle as any);
      expect(result).toBe(false);
    });
  });

  describe('MapboxDraw instance methods', () => {
    it('should have onAdd method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.onAdd).toBe('function');
    });

    it('should have onRemove method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.onRemove).toBe('function');
    });

    it('should have getAll method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.getAll).toBe('function');
    });

    it('should have add method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.add).toBe('function');
    });

    it('should have remove method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.remove).toBe('function');
    });

    it('should have delete method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.delete).toBe('function');
    });

    it('should have changeMode method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.changeMode).toBe('function');
    });

    it('should have getMode method', () => {
      const draw = createMapboxDraw();
      expect(typeof draw.getMode).toBe('function');
    });

    it('should return default mode from getMode', () => {
      const draw = createMapboxDraw();
      const mode = draw.getMode();
      expect(mode).toBe('simple_select');
    });

    it('should return empty features from getAll', () => {
      const draw = createMapboxDraw();
      const result = draw.getAll();
      expect(result).toEqual({ features: [] });
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully in createMapboxDraw', () => {
      expect(() => {
        createMapboxDraw({
          defaultMode: 123 as any
        });
      }).not.toThrow();
    });

    it('should handle edge cases in isMapReadyForDrawing', () => {
      const edgeCaseMap = {
        isStyleLoaded: jest.fn(() => true),
        getStyle: jest.fn(() => ({ layers: [] })),
        getLayer: jest.fn(() => true),
        setLayoutProperty: jest.fn(),
        fitBounds: jest.fn(),
        getContainer: jest.fn(() => document.createElement('div')),
        on: jest.fn(),
        off: jest.fn(),
        addControl: jest.fn(),
        removeControl: jest.fn(),
        getCanvas: jest.fn(() => ({
          style: { cursor: '' }
        }))
      };

      const result = isMapReadyForDrawing(edgeCaseMap as any);
      expect(result).toBe(true);
    });
  });
});
