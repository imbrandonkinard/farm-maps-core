import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolygonPopup } from '../PolygonPopup';

describe('LayerFeaturePopup', () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();

  const defaultProps = {
    feature: {
      id: 'test_feature',
      name: 'Test Layer Feature',
      properties: {
        name: 'Test Layer Feature',
        type: 'Test Type',
        description: 'A test layer feature',
        area: 150,
        category: 'Test Category'
      },
      geometry: {
        type: 'Point',
        coordinates: [-156.3319, 20.7967]
      },
      source: 'layer',
      layerId: 'test_layer'
    },
    position: { x: 100, y: 100 },
    onClose: mockOnClose,
    onNavigate: mockOnNavigate
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render layer feature popup with correct title', () => {
    render(<PolygonPopup {...defaultProps} />);

    expect(screen.getByText('📍 Test Layer Feature')).toBeInTheDocument();
  });

  it('should display feature type and layer information', () => {
    render(<PolygonPopup {...defaultProps} />);

    expect(screen.getByText('Type: Point')).toBeInTheDocument();
    expect(screen.getByText('Layer: test_layer')).toBeInTheDocument();
  });

  it('should display feature properties', () => {
    render(<PolygonPopup {...defaultProps} />);

    expect(screen.getByText('Properties:')).toBeInTheDocument();
    expect(screen.getByText('name: Test Layer Feature')).toBeInTheDocument();
    expect(screen.getByText('type: Test Type')).toBeInTheDocument();
    expect(screen.getByText('description: A test layer feature')).toBeInTheDocument();
    expect(screen.getByText('area: 150')).toBeInTheDocument();
    expect(screen.getByText('category: Test Category')).toBeInTheDocument();
  });

  it('should limit displayed properties to 5 and show count for remaining', () => {
    const featureWithManyProperties = {
      ...defaultProps.feature,
      properties: {
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3',
        prop4: 'value4',
        prop5: 'value5',
        prop6: 'value6',
        prop7: 'value7'
      }
    };

    render(<PolygonPopup {...defaultProps} feature={featureWithManyProperties} />);

    expect(screen.getByText('prop1: value1')).toBeInTheDocument();
    expect(screen.getByText('prop2: value2')).toBeInTheDocument();
    expect(screen.getByText('prop3: value3')).toBeInTheDocument();
    expect(screen.getByText('prop4: value4')).toBeInTheDocument();
    expect(screen.getByText('prop5: value5')).toBeInTheDocument();
    expect(screen.getByText('... and 2 more properties')).toBeInTheDocument();
  });

  it('should render View Layer Details button when onNavigate is provided', () => {
    render(<PolygonPopup {...defaultProps} />);

    const button = screen.getByText('🔍 View Layer Details');
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      backgroundColor: '#6B46C1',
      color: 'white'
    });
  });

  it('should call onNavigate when View Layer Details button is clicked', () => {
    render(<PolygonPopup {...defaultProps} />);

    const button = screen.getByText('🔍 View Layer Details');
    fireEvent.click(button);

    expect(mockOnNavigate).toHaveBeenCalledWith('/layer-feature-details', 'test_feature');
  });

  it('should not render View Layer Details button when onNavigate is not provided', () => {
    render(<PolygonPopup {...defaultProps} onNavigate={undefined} />);

    expect(screen.queryByText('🔍 View Layer Details')).not.toBeInTheDocument();
  });

  it('should handle polygon layer features', () => {
    const polygonFeature = {
      ...defaultProps.feature,
      geometry: {
        type: 'Polygon',
        coordinates: [[[-156.4, 20.7], [-156.3, 20.7], [-156.3, 20.8], [-156.4, 20.8], [-156.4, 20.7]]]
      },
      properties: {
        name: 'Test Polygon',
        type: 'Polygon Feature',
        area: 200
      }
    };

    render(<PolygonPopup {...defaultProps} feature={polygonFeature} />);

    expect(screen.getByText('📍 Test Polygon')).toBeInTheDocument();
    expect(screen.getByText('Type: Polygon')).toBeInTheDocument();
    expect(screen.getByText('area: 200')).toBeInTheDocument();
  });

  it('should handle features with minimal properties', () => {
    const minimalFeature = {
      ...defaultProps.feature,
      properties: {}
    };

    render(<PolygonPopup {...defaultProps} feature={minimalFeature} />);

    expect(screen.getByText('📍 Test Layer Feature')).toBeInTheDocument();
    expect(screen.getByText('Type: Point')).toBeInTheDocument();
    expect(screen.getByText('Layer: test_layer')).toBeInTheDocument();
    expect(screen.queryByText('Properties:')).not.toBeInTheDocument();
  });

  it('should handle features without layerId', () => {
    const featureWithoutLayerId = {
      ...defaultProps.feature,
      layerId: undefined
    };

    render(<PolygonPopup {...defaultProps} feature={featureWithoutLayerId} />);

    expect(screen.getByText('Layer: Unknown')).toBeInTheDocument();
  });

  it('should handle features without geometry type', () => {
    const featureWithoutGeometry = {
      ...defaultProps.feature,
      geometry: {}
    };

    render(<PolygonPopup {...defaultProps} feature={featureWithoutGeometry} />);

    expect(screen.getByText('Type: Unknown')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<PolygonPopup {...defaultProps} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render with correct styling for layer features', () => {
    render(<PolygonPopup {...defaultProps} />);

    const popup = screen.getByText('📍 Test Layer Feature').closest('div');
    expect(popup).toHaveStyle({
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '1000',
      minWidth: '220px',
      maxWidth: '320px'
    });
  });

  it('should handle string and number property values correctly', () => {
    const featureWithMixedProperties = {
      ...defaultProps.feature,
      properties: {
        stringProp: 'string value',
        numberProp: 123,
        booleanProp: true,
        nullProp: null,
        undefinedProp: undefined
      }
    };

    render(<PolygonPopup {...defaultProps} feature={featureWithMixedProperties} />);

    expect(screen.getByText('stringProp: string value')).toBeInTheDocument();
    expect(screen.getByText('numberProp: 123')).toBeInTheDocument();
    expect(screen.getByText('booleanProp: true')).toBeInTheDocument();
    expect(screen.getByText('nullProp: null')).toBeInTheDocument();
    expect(screen.getByText('undefinedProp: undefined')).toBeInTheDocument();
  });
});
