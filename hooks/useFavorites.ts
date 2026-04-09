'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FavoriteFlight {
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  addedAt: number;
}

const STORAGE_KEY = 'flight-tracker-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteFlight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      console.error('Failed to load favorites from localStorage');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch {
        console.error('Failed to save favorites to localStorage');
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((flight: Omit<FavoriteFlight, 'addedAt'>) => {
    setFavorites(prev => {
      if (prev.some(f => f.callsign === flight.callsign)) {
        return prev;
      }
      return [...prev, { ...flight, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((callsign: string) => {
    setFavorites(prev => prev.filter(f => f.callsign !== callsign));
  }, []);

  const isFavorite = useCallback((callsign: string) => {
    return favorites.some(f => f.callsign === callsign);
  }, [favorites]);

  const toggleFavorite = useCallback((flight: Omit<FavoriteFlight, 'addedAt'>) => {
    if (isFavorite(flight.callsign)) {
      removeFavorite(flight.callsign);
    } else {
      addFavorite(flight);
    }
  }, [addFavorite, removeFavorite, isFavorite]);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
