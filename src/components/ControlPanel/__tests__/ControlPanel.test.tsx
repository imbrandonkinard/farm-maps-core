import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ControlPanel } from '../ControlPanel';
import { mapSlice } from '../../../store/mapSlice';

const mockStore = configureStore({
  reducer: {
    farmMaps: mapSlice.reducer,
  },
});

const mockPolygons = [
  {
    id: '1',
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    },
    properties: { name: 'Test Field 1' }
  },
  {
    id: '2',
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]
    },
    properties: { name: 'Test Field 2' }
  }
];

const mockOnDelete = jest.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('ControlPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all polygons', () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Field 1')).toBeInTheDocument();
    expect(screen.getByText('Test Field 2')).toBeInTheDocument();
  });

  it('should render polygon names correctly', () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    mockPolygons.forEach(polygon => {
      expect(screen.getByText(polygon.properties.name)).toBeInTheDocument();
    });
  });

  it('should handle polygons without names', () => {
    const polygonsWithoutNames = [
      {
        ...mockPolygons[0],
        properties: {}
      }
    ];

    renderWithProvider(
      <ControlPanel
        polygons={polygonsWithoutNames}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Field 1')).toBeInTheDocument();
  });

  it('should render edit button for each polygon', () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    expect(editButtons).toHaveLength(2);
  });

  it('should render delete button for each polygon', () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  it('should enter edit mode when edit button is clicked', async () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Field 1')).toBeInTheDocument();
    });
  });

  it('should save changes when Enter key is pressed', async () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Field 1');
      fireEvent.change(input, { target: { value: 'Updated Field Name' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Field Name')).toBeInTheDocument();
    });
  });

  it('should cancel editing when Escape key is pressed', async () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Field 1');
      fireEvent.change(input, { target: { value: 'Changed Name' } });
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(screen.getByText('Test Field 1')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Changed Name')).not.toBeInTheDocument();
    });
  });

  it('should save changes when input loses focus', async () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Field 1');
      fireEvent.change(input, { target: { value: 'Blur Saved Name' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(screen.getByText('Blur Saved Name')).toBeInTheDocument();
    });
  });

  it('should call onDelete when delete button is clicked', () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith({
      type: 'delete',
      features: [mockPolygons[0]]
    });
  });

  it('should handle empty polygons array', () => {
    renderWithProvider(
      <ControlPanel
        polygons={[]}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText(/Field/)).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should handle polygon with very long name', () => {
    const polygonWithLongName = [
      {
        ...mockPolygons[0],
        properties: {
          name: 'This is a very long field name that might exceed normal display limits and should be handled gracefully by the component'
        }
      }
    ];

    renderWithProvider(
      <ControlPanel
        polygons={polygonWithLongName}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(polygonWithLongName[0].properties.name)).toBeInTheDocument();
  });

  it('should handle polygon with special characters in name', () => {
    const polygonWithSpecialChars = [
      {
        ...mockPolygons[0],
        properties: {
          name: 'Field with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
        }
      }
    ];

    renderWithProvider(
      <ControlPanel
        polygons={polygonWithSpecialChars}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(polygonWithSpecialChars[0].properties.name)).toBeInTheDocument();
  });

  it('should maintain edit state for multiple polygons independently', async () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    // Edit first polygon
    const editButton1 = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton1);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Field 1')).toBeInTheDocument();
    });

    // Edit second polygon - this should exit edit mode for first polygon
    const editButton2 = screen.getAllByText('Edit')[1];
    fireEvent.click(editButton2);

    await waitFor(() => {
      // First polygon should no longer be in edit mode
      expect(screen.queryByDisplayValue('Test Field 1')).not.toBeInTheDocument();
      // Second polygon should be in edit mode
      expect(screen.getByDisplayValue('Test Field 2')).toBeInTheDocument();
      // First polygon should show as text again
      expect(screen.getByText('Test Field 1')).toBeInTheDocument();
    });
  });

  it('should handle rapid edit operations', async () => {
    renderWithProvider(
      <ControlPanel
        polygons={mockPolygons}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];

    // Click edit multiple times rapidly
    fireEvent.click(editButton);
    fireEvent.click(editButton);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Field 1')).toBeInTheDocument();
    });
  });
});
