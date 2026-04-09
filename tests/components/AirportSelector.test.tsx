import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AirportSelector } from '@/components/AirportSelector';

describe('AirportSelector', () => {
  it('should render with label', () => {
    render(<AirportSelector value="" onChange={jest.fn()} label="Select Airport" />);
    expect(screen.getByText('Select Airport')).toBeInTheDocument();
  });

  it('should render selected airport when value is provided', () => {
    render(<AirportSelector value="LEMD" onChange={jest.fn()} />);
    expect(screen.getByText('MAD')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    render(<AirportSelector value="" onChange={jest.fn()} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should filter airports when searching', async () => {
    render(<AirportSelector value="" onChange={jest.fn()} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    const searchInput = screen.getByLabelText('Search airports');
    await userEvent.type(searchInput, 'Madrid');
    
    expect(screen.getByText('Adolfo Suárez Madrid-Barajas')).toBeInTheDocument();
  });

  it('should show "No airports found" for non-matching search', async () => {
    render(<AirportSelector value="" onChange={jest.fn()} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    const searchInput = screen.getByLabelText('Search airports');
    await userEvent.type(searchInput, 'xyz123');
    
    expect(screen.getByText('No airports found')).toBeInTheDocument();
  });

  it('should call onChange when airport is selected', async () => {
    const onChange = jest.fn();
    render(<AirportSelector value="" onChange={onChange} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    const barcelonaOption = screen.getByText('Barcelona').closest('button');
    if (barcelonaOption) {
      await userEvent.click(barcelonaOption);
    }
    
    expect(onChange).toHaveBeenCalledWith('LEBL');
  });

  it('should show "Select airport" when no value', () => {
    render(<AirportSelector value="" onChange={jest.fn()} />);
    expect(screen.getByText('Select airport')).toBeInTheDocument();
  });
});
