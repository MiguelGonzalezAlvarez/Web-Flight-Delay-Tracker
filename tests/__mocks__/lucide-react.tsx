import React from 'react';

const createMockIcon = (name: string) => {
  const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { 'data-testid': name, ...props })
  );
  MockIcon.displayName = name;
  return MockIcon;
};

export const Plane = createMockIcon('Plane');
export const ChevronDown = createMockIcon('ChevronDown');
export const Search = createMockIcon('Search');
export const X = createMockIcon('X');
export const RefreshCw = createMockIcon('RefreshCw');
export const Info = createMockIcon('Info');
export const AlertTriangle = createMockIcon('AlertTriangle');
export const AlertCircle = createMockIcon('AlertCircle');
export const CheckCircle = createMockIcon('CheckCircle');
export const Minus = createMockIcon('Minus');
export const Clock = createMockIcon('Clock');
export const MapPin = createMockIcon('MapPin');
export const ArrowRight = createMockIcon('ArrowRight');
export const Loader2 = createMockIcon('Loader2');
