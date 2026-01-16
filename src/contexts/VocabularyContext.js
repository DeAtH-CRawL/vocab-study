import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { validateVocabularyData, transformToLegacyFormat, logValidationResult } from '../lib/vocabularySchema';

const VocabularyContext = createContext();

// Fallback data URL and bundled fallback
const VOCABULARY_DATA_URL = './data/vocabulary.json';

// Minimal fallback in case fetch completely fails
const MINIMAL_FALLBACK = {
    version: 1,
    lastUpdated: '2026-01-01',
    days: []
};

export function VocabularyProvider({ children }) {
    // SSR-SAFE: Initialize without accessing localStorage during render
    const [starredTerms, setStarredTerms] = useState([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Dynamic vocabulary state
    const [vocabularyData, setVocabularyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // Fetch vocabulary data on mount
    useEffect(() => {
        async function fetchVocabulary() {
            try {
                setIsLoading(true);
                setLoadError(null);

                const response = await fetch(VOCABULARY_DATA_URL);

                if (!response.ok) {
                    throw new Error(`Failed to fetch vocabulary: ${response.status}`);
                }

                const data = await response.json();

                // Validate the fetched data
                const validationResult = validateVocabularyData(data);
                logValidationResult(validationResult);

                if (!validationResult.valid && process.env.NODE_ENV === 'development') {
                    // In dev, log errors but still try to use data
                    console.error('Vocabulary data has validation errors. Check your data file.');
                }

                setVocabularyData(data);
            } catch (error) {
                console.error('Failed to load vocabulary data:', error);
                setLoadError(error.message);

                // Fall back to minimal data
                setVocabularyData(MINIMAL_FALLBACK);
            } finally {
                setIsLoading(false);
            }
        }

        fetchVocabulary();
    }, []);

    // Load starred terms from localStorage only after mount (client-side only)
    useEffect(() => {
        try {
            const localData = localStorage.getItem('starredTerms');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed)) {
                    setStarredTerms(parsed);
                }
            }
        } catch (error) {
            console.error('VocabularyContext: Failed to load starred terms', error);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Transform to legacy format for backward compatibility
    const vocabulary = useMemo(() => {
        if (!vocabularyData) return {};
        return transformToLegacyFormat(vocabularyData);
    }, [vocabularyData]);

    // Memoize allWords - FROZEN to prevent mutation by consumers
    const allWords = useMemo(() => {
        const words = Object.values(vocabulary).flat();
        // Return frozen array to prevent consumer components from mutating
        return Object.freeze([...words]);
    }, [vocabulary]);

    // Persist to localStorage on change (client-side only)
    useEffect(() => {
        if (!isHydrated) return; // Don't persist during initial hydration

        try {
            localStorage.setItem('starredTerms', JSON.stringify(starredTerms));
        } catch (error) {
            console.error('VocabularyContext: Failed to save starred terms', error);
        }
    }, [starredTerms, isHydrated]);

    const toggleStar = (term) => {
        if (!term) return;

        setStarredTerms(prev =>
            prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
        );
    };

    const isStarred = (term) => {
        if (!term) return false;
        return starredTerms.includes(term);
    };

    // Return FROZEN copy to prevent mutation
    const getStarredWords = () => {
        const starred = allWords.filter(item => item?.term && starredTerms.includes(item.term));
        return Object.freeze([...starred]);
    };

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        vocabulary,
        allWords,
        starredTerms,
        toggleStar,
        isStarred,
        getStarredWords,
        // Expose loading states for UI feedback
        isLoading,
        loadError,
        // Metadata from new schema
        totalDays: vocabularyData?.days?.length || 0,
        lastUpdated: vocabularyData?.lastUpdated || null
    }), [vocabulary, allWords, starredTerms, isLoading, loadError, vocabularyData]);

    return (
        <VocabularyContext.Provider value={value}>
            {children}
        </VocabularyContext.Provider>
    );
}

export function useVocabulary() {
    const context = useContext(VocabularyContext);
    if (!context) {
        throw new Error('useVocabulary must be used within a VocabularyProvider');
    }
    return context;
}
