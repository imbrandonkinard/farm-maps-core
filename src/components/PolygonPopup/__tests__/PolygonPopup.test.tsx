import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolygonPopup } from '../PolygonPopup';

const mockFeature = {
  id: 'test-feature-123',
  type: 'Feature' as const,
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
  },
  properties: {
    name: 'Test Field',
    area: 25.5
  }
};

const mockPosition = { x: 100, y: 200 };
const mockOnClose = jest.fn();
const mockOnNavigate = jest.fn();

describe('PolygonPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default content', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Field Information')).toBeInTheDocument();
    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('Area: 25.5 acres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  it('should render with navigation buttons when onNavigate is provided', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should not render navigation buttons when onNavigate is not provided', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onNavigate with correct parameters when navigation buttons are clicked', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const viewDetailsButton = screen.getByText('View Details');
    const editButton = screen.getByText('Edit');

    fireEvent.click(viewDetailsButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('/field-details', 'test-feature-123');

    fireEvent.click(editButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('/field-edit', 'test-feature-123');
  });

  it('should render custom content when provided', () => {
    const customContent = (
      <div data-testid="custom-content">
        <h3>Custom Field Info</h3>
        <p>This is custom content</p>
        <button>Custom Action</button>
      </div>
    );

    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
        customContent={customContent}
      />
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Field Info')).toBeInTheDocument();
    expect(screen.getByText('This is custom content')).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();

    // Default content should not be rendered
    expect(screen.queryByText('Test Field')).not.toBeInTheDocument();
    expect(screen.queryByText('Area: 25.5 acres')).not.toBeInTheDocument();
  });

  it('should render default content when showDefaultContent is true and no custom content', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
        showDefaultContent={true}
      />
    );

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('Area: 25.5 acres')).toBeInTheDocument();
  });

  it('should not render default content when showDefaultContent is false', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
        showDefaultContent={false}
      />
    );

    expect(screen.queryByText('Test Field')).not.toBeInTheDocument();
    expect(screen.queryByText('Area: 25.5 acres')).not.toBeInTheDocument();
  });

  it('should handle feature without name property', () => {
    const featureWithoutName = {
      ...mockFeature,
      properties: { area: 15.0 }
    };

    render(
      <PolygonPopup
        feature={featureWithoutName}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Field test-f')).toBeInTheDocument();
  });

  it('should handle feature without area property', () => {
    const featureWithoutArea = {
      ...mockFeature,
      properties: { name: 'Test Field' }
    };

    render(
      <PolygonPopup
        feature={featureWithoutArea}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.queryByText(/Area:/)).not.toBeInTheDocument();
  });

  it('should apply custom className and style', () => {
    const customClassName = 'custom-popup-class';
    const customStyle = { backgroundColor: 'red', color: 'white' };

    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
        className={customClassName}
        style={customStyle}
      />
    );

    const popup = screen.getByText('Field Information').closest('.polygon-popup');
    expect(popup).toHaveClass(customClassName);
    expect(popup).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(popup).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('should position popup correctly relative to mouse position', () => {
    render(
      <PolygonPopup
        feature={mockFeature}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    const popup = screen.getByText('Field Information').closest('.polygon-popup');
    expect(popup).toHaveStyle('left: 110px'); // position.x + 10
    expect(popup).toHaveStyle('top: 190px');  // position.y - 10
  });

  it('should handle feature with very long name', () => {
    const featureWithLongName = {
      ...mockFeature,
      properties: {
        name: 'This is a very long field name that might exceed normal display limits and should be handled gracefully by the component',
        area: 30.0
      }
    };

    render(
      <PolygonPopup
        feature={featureWithLongName}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(featureWithLongName.properties.name)).toBeInTheDocument();
  });

  it('should handle feature with special characters in name', () => {
    const featureWithSpecialChars = {
      ...mockFeature,
      properties: {
        name: 'Field with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        area: 20.0
      }
    };

    render(
      <PolygonPopup
        feature={featureWithSpecialChars}
        position={mockPosition}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(featureWithSpecialChars.properties.name)).toBeInTheDocument();
  });
});
