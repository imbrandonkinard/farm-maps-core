const mockMapboxDraw = jest.fn().mockImplementation(() => ({
  onAdd: jest.fn(),
  onRemove: jest.fn(),
  getAll: jest.fn(() => ({ features: [] })),
  get: jest.fn(),
  set: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  changeMode: jest.fn(),
  getMode: jest.fn(() => 'simple_select'),
  getFeatureIdsAt: jest.fn(() => []),
}));

// Add static constants property
mockMapboxDraw.constants = {
  classes: {
    CANVAS: 'maplibregl-canvas',
    CONTROL_BASE: 'maplibregl-ctrl',
    CONTROL_PREFIX: 'maplibregl-ctrl-',
    CONTROL_GROUP: 'maplibregl-ctrl-group',
    ATTRIBUTION: 'maplibregl-ctrl-attrib',
  }
};

export default mockMapboxDraw;
