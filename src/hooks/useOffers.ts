import { useCallback, useEffect, useState } from 'react';
import { OfferTile } from '@/schemas/productsSchemas';
import { OfferTileSchema } from '@/schemas/offerTileSchema';
import { z } from 'zod';
import { fetchOfferById } from '@/api/products';

const OFFERS_STORAGE_KEY = 'offers';
const offersSchema = z.array(OfferTileSchema);

export function useOffers() {
  const [offers, setOffersState] = useState<OfferTile[]>([]);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedOffers = localStorage.getItem(OFFERS_STORAGE_KEY);
      if (storedOffers) {
        const parsed = JSON.parse(storedOffers);
        const result = offersSchema.safeParse(parsed);
        if (result.success) {
          setOffersState(result.data);
        } else {
          console.warn('Invalid offers data in localStorage:', result.error);
        }
      }
    } catch (error) {
      console.warn('Error loading offers from localStorage:', error);
    }
  }, []);

  // Get all offers
  const get = useCallback(() => {
    return offers;
  }, [offers]);

  // Set offers - saves new offers to state and localStorage
  const set = useCallback((newOffers: OfferTile[]) => {
    // Update state
    setOffersState(newOffers);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(newOffers));
      } catch (error) {
        console.warn('Error saving offers to localStorage:', error);
      }
    }
  }, []);

  // Get offer by id - checks localStorage first, then state, and fetches from API if not found
  const getById = useCallback(
    async (id: string): Promise<OfferTile | undefined> => {
      // First check localStorage (source of truth, especially if state hasn't loaded yet)
      if (typeof window !== 'undefined') {
        try {
          const storedOffers = localStorage.getItem(OFFERS_STORAGE_KEY);
          if (storedOffers) {
            const parsed = JSON.parse(storedOffers);
            const result = offersSchema.safeParse(parsed);
            if (result.success) {
              if (offers.length === 0 && result.data.length > 0) {
                setOffersState(result.data);
              }
              
              const offerFromStorage = result.data.find((offer) => offer.id === id);
              if (offerFromStorage) {
                return offerFromStorage;
              }
            }
          }
        } catch (error) {
          console.warn('Error reading from localStorage in getById:', error);
        }
      }

      // If not found in localStorage, check state
      const offerFromState = offers.find((offer) => offer.id === id);
      if (offerFromState) {
        return offerFromState;
      }

      // If not found in localStorage or state, fetch from API
      try {
        const fetchedOffer = await fetchOfferById(id);
        // Add the fetched offer to the offers array and save to localStorage
        const currentOffers = offers.length > 0 ? offers : 
          (typeof window !== 'undefined' ? 
            (() => {
              try {
                const stored = localStorage.getItem(OFFERS_STORAGE_KEY);
                if (stored) {
                  const parsed = JSON.parse(stored);
                  const result = offersSchema.safeParse(parsed);
                  return result.success ? result.data : [];
                }
              } catch {
                return [];
              }
              return [];
            })() : []);
        
        const updatedOffers = [...currentOffers, fetchedOffer];
        set(updatedOffers);
        return fetchedOffer;
      } catch (error) {
        console.warn('Error fetching offer by id:', error);
        return undefined;
      }
    },
    [offers, set]
  );

  return {
    offers,
    get,
    set,
    getById,
  };
}

