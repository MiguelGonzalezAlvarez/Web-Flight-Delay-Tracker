import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlightSearch } from '@/components/FlightSearch';

describe('FlightSearch', () => {
  it('should render search input', () => {
    render(<FlightSearch onSearch={jest.fn()} loading={false} />);
    expect(screen.getByPlaceholderText(/Search flight/i)).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<FlightSearch onSearch={jest.fn()} loading={false} />);
    expect(screen.getByRole('button', { name: /Search Flight/i })).toBeInTheDocument();
  });

  it('should disable button when loading', () => {
    render(<FlightSearch onSearch={jest.fn()} loading={true} />);
    expect(screen.getByRole('button', { name: /Searching.../i })).toBeDisabled();
  });

  it('should enable button when input is provided', async () => {
    const onSearch = jest.fn();
    render(<FlightSearch onSearch={onSearch} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Search flight/i);
    await userEvent.type(input, 'IBE1234');
    
    const button = screen.getByRole('button', { name: /Search Flight/i });
    expect(button).not.toBeDisabled();
  });

  it('should convert input to uppercase', async () => {
    const onSearch = jest.fn();
    render(<FlightSearch onSearch={onSearch} loading={false} />);
    
    const input = screen.getByPlaceholderText(/Search flight/i);
    await userEvent.type(input, 'ibe1234');
    
    expect(input).toHaveValue('IBE1234');
  });
});
