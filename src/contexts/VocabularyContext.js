import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import masterVocabulary from '../vocabularyData.json';

const VocabularyContext = createContext();

export function VocabularyProvider({ children }) {
    const [starredTerms, setStarredTerms] = useState(() => {
        try {
            const localData = localStorage.getItem('starredTerms');
            return localData ? JSON.parse(localData) : [];
        } catch {
            return [];
        }
    });

    const vocabulary = useMemo(() => masterVocabulary, []);
    const allWords = useMemo(() => Object.values(vocabulary).flat(), [vocabulary]);

    useEffect(() => {
        localStorage.setItem('starredTerms', JSON.stringify(starredTerms));
    }, [starredTerms]);

    const toggleStar = (term) => {
        setStarredTerms(prev =>
            prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
        );
    };

    const isStarred = (term) => starredTerms.includes(term);

    const getStarredWords = () => allWords.filter(item => starredTerms.includes(item.term));

    const value = {
        vocabulary,
        allWords,
        starredTerms,
        toggleStar,
        isStarred,
        getStarredWords
    };

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
