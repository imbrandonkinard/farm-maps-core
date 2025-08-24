import '@testing-library/jest-dom';

// Mock Maplibre GL
jest.mock('maplibre-gl', () => ({
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    addControl: jest.fn(),
    removeControl: jest.fn(),
    getCanvas: jest.fn(() => ({
      style: { cursor: '' }
    })),
    isStyleLoaded: jest.fn(() => true),
    getStyle: jest.fn(() => ({ layers: [] })),
    getLayer: jest.fn(() => true),
    setLayoutProperty: jest.fn(),
    fitBounds: jest.fn(),
    getContainer: jest.fn(() => document.createElement('div')),
  })),
  NavigationControl: jest.fn(),
}));

// Mock React Map GL
jest.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ children, onLoad, ...props }) => {
    const mockMap = {
      on: jest.fn(),
      off: jest.fn(),
      addControl: jest.fn(),
      removeControl: jest.fn(),
      getCanvas: jest.fn(() => ({
        style: { cursor: '' }
      })),
      isStyleLoaded: jest.fn(() => true),
      getStyle: jest.fn(() => ({ layers: [] })),
      getLayer: jest.fn(() => true),
      setLayoutProperty: jest.fn(),
      fitBounds: jest.fn(),
      getContainer: jest.fn(() => document.createElement('div')),
    };

    // Call onLoad if provided
    if (onLoad) {
      setTimeout(() => onLoad({ target: mockMap }), 0);
    }

    return (
      <div data-testid="map-view" {...props}>
        {children}
      </div>
    );
  }),
  NavigationControl: jest.fn().mockImplementation((props) => (
    <div data-testid="navigation-control" {...props} />
  )),
}));





// Mock fetch for GeoJSON loading
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
