import { useState, useCallback } from 'react';
import { normalize, getLevenshteinDistance } from '../lib/logic';

export function useQuiz() {
    const [quizList, setQuizList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [results, setResults] = useState([]);
    const [streak, setStreak] = useState(0);
    const [weakWords, setWeakWords] = useState([]);
    const [hintCount, setHintCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const startQuiz = useCallback((words) => {
        setQuizList([...words].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setUserInput('');
        setFeedback(null);
        setResults([]);
        setStreak(0);
        setWeakWords([]);
        setHintCount(0);
        setIsFinished(false);
    }, []);

    const currentWord = quizList[currentIndex];

    const submitAnswer = () => {
        if (!currentWord || feedback) return;

        const target = normalize(currentWord.term);
        const attempt = normalize(userInput);

        // Empty submission = reveal
        if (!attempt) {
            revealAnswer();
            return;
        }

        const dist = getLevenshteinDistance(target, attempt);
        let status = 'wrong';
        let msg = "Not quite.";
        let isCorrect = false;

        if (attempt === target) {
            status = 'correct';
            msg = "Perfect!";
            isCorrect = true;
            setStreak(p => p + 1);
        } else if (dist <= 2 && target.length > 3) {
            status = 'close';
            msg = "Almost!";
            isCorrect = true;
            setStreak(p => p + 1);
        } else {
            setStreak(0);
            setWeakWords(p => [...p, currentWord]);
        }

        setFeedback({ status, msg });
        setResults(prev => {
            if (prev.some(r => r.item.term === currentWord.term)) return prev;
            return [...prev, { item: currentWord, correct: isCorrect, hinted: hintCount > 0 }];
        });
    };

    const revealAnswer = () => {
        if (feedback) return;
        setUserInput(currentWord.term);
        setFeedback({ status: 'wrong', msg: "Revealed." });
        setStreak(0);
        setWeakWords(p => [...p, currentWord]);
        setResults(prev => {
            if (prev.some(r => r.item.term === currentWord.term)) return prev;
            return [...prev, { item: currentWord, correct: false, hinted: true }];
        });
    };

    const nextQuestion = () => {
        // Re-insert weak words logic
        if (weakWords.length > 0 && currentIndex === Math.floor(quizList.length * 0.75)) {
            const wordToReinsert = weakWords[0];
            setQuizList(prev => [...prev, wordToReinsert]);
            setWeakWords(prev => prev.slice(1));
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
        if (feedback) return;
        setStreak(0);
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
