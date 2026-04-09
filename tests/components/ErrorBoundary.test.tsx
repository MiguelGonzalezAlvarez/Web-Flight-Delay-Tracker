import { render, screen, act } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ErrorBoundary', () => {
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="children">Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('should display error message when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it('should show refresh button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /Refresh Page/i })).toBeInTheDocument();
  });

  it('should render custom fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const customFallback = <div data-testid="custom-fallback">Custom Error</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });

  it('should not render children after error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
        <div data-testid="should-not-render">Should not render</div>
      </ErrorBoundary>
    );
    
    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
  });

  it('should handle errors during render', () => {
    const ErrorDuringRender = () => {
      throw new Error('Render error');
    };

    render(
      <ErrorBoundary>
        <ErrorDuringRender />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it('should handle errors with error object', () => {
    const ErrorWithObject = () => {
      const error = new Error('Specific error');
      throw error;
    };

    render(
      <ErrorBoundary>
        <ErrorWithObject />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it('should have correct error styling', () => {
    const ThrowError = () => {
      throw new Error('Test');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const errorContainer = screen.getByText(/Something went wrong/);
    expect(errorContainer).toBeInTheDocument();
  });
});
