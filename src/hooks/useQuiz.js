import { useState, useCallback, useMemo } from 'react';
import { normalize, getSimilarity } from '../lib/logic';

// Configuration constants for production safety
const MAX_WEAK_WORDS = 20; // Cap weak words to prevent infinite growth
const MAX_RESULTS = 100; // Cap results array for large quizzes
const MAX_REINSERTIONS_PER_WORD = 2; // Prevent infinite quiz loops
const SIMILARITY_THRESHOLD_CLOSE = 85; // 85% similarity = "Almost!"
const SIMILARITY_THRESHOLD_CORRECT = 100; // Perfect match required

export function useQuiz() {
    const [quizList, setQuizList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [results, setResults] = useState([]);
    const [streak, setStreak] = useState(0);
    const [weakWords, setWeakWords] = useState([]);
    const [reinsertionCount, setReinsertionCount] = useState(new Map()); // Track reinsertion attempts
    const [hintCount, setHintCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const startQuiz = useCallback((words) => {
        if (!words || !Array.isArray(words) || words.length === 0) {
            console.warn('useQuiz: Invalid words array provided to startQuiz');
            return;
        }

        setQuizList([...words].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setUserInput('');
        setFeedback(null);
        setResults([]);
        setStreak(0);
        setWeakWords([]);
        setReinsertionCount(new Map());
        setHintCount(0);
        setIsFinished(false);
    }, []);

    // Memoize currentWord to prevent unnecessary recalculations
    const currentWord = useMemo(() => quizList[currentIndex], [quizList, currentIndex]);

    const submitAnswer = () => {
        if (!currentWord || feedback) return;

        const target = normalize(currentWord.term);
        const attempt = normalize(userInput);

        // Empty submission = reveal
        if (!attempt) {
            revealAnswer();
            return;
        }

        // Use proportional similarity instead of absolute distance
        const similarity = getSimilarity(target, attempt);
        let status = 'wrong';
        let msg = "Not quite.";
        let isCorrect = false;

        if (similarity === SIMILARITY_THRESHOLD_CORRECT) {
            status = 'correct';
            msg = "Perfect!";
            isCorrect = true;
            setStreak(p => p + 1);
        } else if (similarity >= SIMILARITY_THRESHOLD_CLOSE) {
            // Close enough (85%+ similarity)
            status = 'close';
            msg = "Almost!";
            isCorrect = true;
            setStreak(p => p + 1);
        } else {
            // Wrong answer
            setStreak(0);

            // Add to weak words if not already present and under cap
            setWeakWords(prev => {
                const alreadyWeak = prev.some(w => w?.term === currentWord?.term);
                if (!alreadyWeak && prev.length < MAX_WEAK_WORDS) {
                    return [...prev, currentWord];
                }
                return prev;
            });
        }

        setFeedback({ status, msg });

        // Add to results with cap to prevent excessive memory usage
        setResults(prev => {
            // Prevent duplicate results for the same term
            if (prev.some(r => r?.item?.term === currentWord?.term)) return prev;

            const newResult = { item: currentWord, correct: isCorrect, hinted: hintCount > 0 };

            // Cap results array for very large quizzes
            if (prev.length >= MAX_RESULTS) {
                // Keep first MAX_RESULTS items (don't add more)
                return prev;
            }

            return [...prev, newResult];
        });
    };

    const revealAnswer = () => {
        if (feedback) return;

        setUserInput(currentWord?.term || '');
        setFeedback({ status: 'wrong', msg: "Revealed." });
        setStreak(0);

        // Add to weak words if not already present
        setWeakWords(prev => {
            const alreadyWeak = prev.some(w => w?.term === currentWord?.term);
            if (!alreadyWeak && prev.length < MAX_WEAK_WORDS) {
                return [...prev, currentWord];
            }
            return prev;
        });

        setResults(prev => {
            if (prev.some(r => r?.item?.term === currentWord?.term)) return prev;

            const newResult = { item: currentWord, correct: false, hinted: true };

            if (prev.length >= MAX_RESULTS) {
                return prev;
            }

            return [...prev, newResult];
        });
    };

    const nextQuestion = () => {
        // Re-insert weak words logic with cap to prevent infinite loops
        if (weakWords.length > 0 && currentIndex === Math.floor(quizList.length * 0.75)) {
            const wordToReinsert = weakWords[0];
            const termKey = wordToReinsert?.term;

            if (termKey) {
                const currentCount = reinsertionCount.get(termKey) || 0;

                // Only reinsert if under maximum attempts
                if (currentCount < MAX_REINSERTIONS_PER_WORD) {
                    setQuizList(prev => [...prev, wordToReinsert]);
                    setReinsertionCount(prev => new Map(prev).set(termKey, currentCount + 1));
                    setWeakWords(prev => prev.slice(1)); // Remove first item
                } else {
                    // Max attempts reached, remove from weak words without reinserting
                    setWeakWords(prev => prev.slice(1));
                }
            }
        }

        if (currentIndex < quizList.length - 1) {
            setCurrentIndex(p => p + 1);
            setUserInput('');
            setFeedback(null);
            setHintCount(0);
        } else {
            setIsFinished(true);
        }
    };

    const provideHint = () => {
        if (feedback || !currentWord?.term) return;

        setStreak(0); // Using hint breaks streak
        const term = currentWord.term;
        const newHintCount = hintCount + 1;

        if (newHintCount > term.length) return;

        setHintCount(newHintCount);
        const hintText = term.substring(0, newHintCount);
        setUserInput(hintText);
    };

    return {
        quizList,
        currentIndex,
        currentWord,
        userInput,
        setUserInput,
        feedback,
        results,
        streak,
        hintCount,
        isFinished,
        startQuiz,
        submitAnswer,
        revealAnswer,
        nextQuestion,
        provideHint
    };
}
