import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, RotateCcw, Lightbulb, ChevronRight, 
  ArrowLeft, Flame, Eye,
  Trophy, ShieldCheck, Layers
} from 'lucide-react';


import masterVocabulary from './vocabularyData.json';

// --- LOGIC UTILS ---
const normalize = (str) => {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/[—\-\’]/g, '') 
    .replace(/[^a-z0-9]/g, '') 
    .trim();
};

const getLevenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[b.length][a.length];
};

export default function App() {
  const [view, setView] = useState('menu');
  const [starredTerms, setStarredTerms] = useState(() => {
    const localData = localStorage.getItem('starredTerms');
    return localData ? JSON.parse(localData) : [];
  });

  // --- NEW & MODIFIED STATE ---
  const [selectedDayKey, setSelectedDayKey] = useState(null);
  const [weakWords, setWeakWords] = useState([]);
  const [streak, setStreak] = useState(0);

  // --- MEMOIZATION ---
  const vocabulary = useMemo(() => masterVocabulary, []);
  
  const allWords = useMemo(() => Object.values(vocabulary).flat(), [vocabulary]);

  const starredWords = useMemo(() => 
    allWords.filter(item => starredTerms.includes(item.term)),
    [allWords, starredTerms]
  );

  useEffect(() => {
    localStorage.setItem('starredTerms', JSON.stringify(starredTerms));
  }, [starredTerms]);
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  
  // Hint State
  const [hintCount, setHintCount] = useState(0);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'test' || showSummary || e.target.tagName === 'INPUT') return;

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        provideHint();
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        revealAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, showSummary, quizList, currentIndex, userInput, hintCount]); // Dependencies ensure handlers have fresh state

  const toggleStar = (term) => {
    setStarredTerms(prev => prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]);
  };

  const startQuiz = (dayKey, wordList = null) => {
    let list;
    if (wordList) {
      list = [...wordList];
    } else if (dayKey === 'all') {
      list = allWords.sort(() => Math.random() - 0.5).slice(0, 30);
    } else if (dayKey === 'starred') {
      list = [...starredWords];
    } else {
      list = [...vocabulary[dayKey]];
    }

    setQuizList(list.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
    setResults([]);
    setShowSummary(false);
    setHintCount(0);
    setWeakWords([]);
    setStreak(0);
    setSelectedDayKey(dayKey);
    setView('test');
  };

  const handleCheckSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Rule: If feedback is already showing, Enter key triggers next question
    if (feedback) { 
      nextQuestion(); 
      return; 
    }

    const current = quizList[currentIndex];
    const target = normalize(current.term);
    const attempt = normalize(userInput);
    
    // Empty submission acts as a skip/reveal
    if (!attempt && !feedback) {
        revealAnswer();
        return;
    }

    const dist = getLevenshteinDistance(target, attempt);

    let status = 'wrong';
    let msg = "Not quite. Check the term below.";
    let isCorrect = false;

    if (attempt === target) {
      status = 'correct';
      msg = ["Perfect Recall! ✨", "Spot on! 🎯", "Impressive work! 🚀"][Math.floor(Math.random() * 3)];
      isCorrect = true;
      setStreak(prev => prev + 1);
    } else if (dist <= 2 && target.length > 3) {
      status = 'close';
      msg = "Almost! Tiny spelling error ✍️";
      isCorrect = true;
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      setWeakWords(prev => [...prev, current]);
    }

    setFeedback({ status, msg });
    // Prevent duplicate result entries
    setResults(prev => {
      if (prev.some(r => r.item.term === current.term)) return prev;
      return [...prev, { item: current, correct: isCorrect, hinted: hintCount > 0 }];
    });
  };

  const revealAnswer = () => {
    // Guard against multiple reveals for the same question
    if (feedback) return;

    const current = quizList[currentIndex];
    setUserInput(current.term);
    setFeedback({ status: 'wrong', msg: "Revealed. Try to remember it for next time!" });
    setStreak(0);
    setWeakWords(prev => [...prev, current]);
    
    // Prevent duplicate result entries
    setResults(prev => {
      if (prev.some(r => r.item.term === current.term)) return prev;
      return [...prev, { item: current, correct: false, hinted: true }];
    });
  };

  const provideHint = () => {
    // Guard against hints after an answer is submitted/revealed
    if (feedback) return;
    
    setStreak(0); // Reset streak when a hint is used
    const term = quizList[currentIndex].term;
    const newHintCount = hintCount + 1;
    if (newHintCount > term.length) return;

    setHintCount(newHintCount);
    const hintText = term.substring(0, newHintCount);

    // Improved logic: Don't overwrite correct user input, but correct wrong input.
    if (!term.toLowerCase().startsWith(userInput.toLowerCase())) {
      setUserInput(hintText);
    } else if (userInput.length < newHintCount) {
      setUserInput(hintText);
    }
  };

  const nextQuestion = () => {
    // Re-insert one weak word near the end of the quiz
    if (weakWords.length > 0 && currentIndex === Math.floor(quizList.length * 0.75)) {
      const wordToReinsert = weakWords[0];
      setQuizList(prev => [...prev, wordToReinsert]);
      setWeakWords(prev => prev.slice(1));
    }

    if (currentIndex < quizList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
      setHintCount(0);
    } else {
      setShowSummary(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 font-black text-indigo-600 tracking-tighter text-xl cursor-pointer" onClick={() => setView('menu')}>
          <ShieldCheck size={28} />
          <span>VOCAB MASTER</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('menu')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${view === 'menu' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Arena</button>
          <button onClick={() => setView('vault')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${view === 'vault' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>The Ledger</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-6 pb-24">
        
        {view === 'menu' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block">Knowledge Verified</span>
                <h1 className="text-4xl font-black mb-2 tracking-tight">The Mastery Arena</h1>
                <p className="opacity-70 font-medium text-slate-300 max-w-md">Practice retrieval from your entire knowledge base.</p>
              </div>
              <Flame size={160} className="absolute -right-8 -bottom-8 text-indigo-500/20 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button onClick={() => startQuiz('all')} className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 flex items-center justify-between group hover:scale-[1.02] transition-all col-span-1 md:col-span-2">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/10 rounded-2xl"><Trophy size={32}/></div>
                   <div className="text-left">
                     <span className="font-black text-xl block">Full Simulation (Mixed)</span>
                     <span className="text-sm opacity-80">Random Selection from All 13 Days</span>
                   </div>
                </div>
                <ChevronRight size={24}/>
              </button>

              <button onClick={() => startQuiz('starred')} className="bg-amber-500 p-6 rounded-3xl text-white shadow-xl shadow-amber-100 flex items-center justify-between group hover:scale-[1.02] transition-all col-span-1 md:col-span-2">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/10 rounded-2xl"><Star size={32}/></div>
                   <div className="text-left">
                     <span className="font-black text-xl block">Starred Terms Review</span>
                     <span className="text-sm opacity-80">{starredWords.length} starred items</span>
                   </div>
                </div>
                <ChevronRight size={24}/>
              </button>

              {Object.keys(vocabulary).reverse().map(day => (
                <button key={day} onClick={() => startQuiz(day)} className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {day.split(' ')[1]}
                    </div>
                    <div>
                      <span className="font-bold text-lg text-slate-800">{day}</span>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{vocabulary[day].length} items</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500"/>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'test' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300">
             {showSummary ? (
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center">
                <div className="mb-6 inline-flex p-5 bg-indigo-50 rounded-full text-indigo-600">
                  <Trophy size={48} />
                </div>
                <h2 className="text-3xl font-black mb-2">Quiz Complete!</h2>
                <div className="text-7xl font-black text-indigo-600 mb-10 tracking-tighter">
                  {results.filter(r => r.correct).length}<span className="text-slate-200">/</span>{results.length}
                </div>
                <div className="space-y-3">
                  <button onClick={() => startQuiz(selectedDayKey)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                    <RotateCcw size={20} /> Try Again
                  </button>
                  {results.filter(r => !r.correct).length > 0 && (
                     <button 
                        onClick={() => startQuiz('retry-wrong', results.filter(r => !r.correct).map(r => r.item))} 
                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                      >
                       <Layers size={20} /> Retry {results.filter(r => !r.correct).length} Wrong Words
                     </button>
                  )}
                  <button onClick={() => setView('menu')} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600">Exit Arena</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <div className="flex items-center gap-4">
                    {streak > 1 && (
                      <div className="flex items-center gap-1 text-amber-500 font-bold animate-in fade-in">
                        <Flame size={14} /> {streak}
                      </div>
                    )}
                    <div className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">{currentIndex + 1} OF {quizList.length}</div>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-indigo-500 transition-all duration-700 ease-out" style={{ width: `${((currentIndex + 1) / quizList.length) * 100}%` }} />
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white relative min-h-[450px] flex flex-col justify-between">
                  <button onClick={() => toggleStar(quizList[currentIndex].term)} className={`absolute top-8 right-8 p-3 rounded-xl transition-all ${starredTerms.includes(quizList[currentIndex].term) ? 'text-amber-500 bg-amber-50' : 'text-slate-100 hover:text-slate-200'}`}>
                    <Star size={24} fill={starredTerms.includes(quizList[currentIndex].term) ? "currentColor" : "none"} />
                  </button>

                  <div className="space-y-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                      {quizList[currentIndex].type}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight">
                      {quizList[currentIndex].definition}
                    </h2>
                  </div>

                  <form onSubmit={handleCheckSubmit} className="mt-8 space-y-4">
                    <div className="relative group">
                      <input
                        autoFocus
                        autoComplete="off"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type answer..."
                        className={`w-full p-6 text-2xl rounded-2xl border-4 transition-all outline-none font-bold ${ 
                          feedback?.status === 'correct' || feedback?.status === 'close' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                          feedback?.status === 'wrong' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-50 bg-slate-50 focus:border-indigo-400 focus:bg-white'
                        }`}
                      />
                      {!feedback && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                           <button type="button" onClick={provideHint} className="p-2 text-slate-300 hover:text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all" title="Get a hint">
                             <Lightbulb size={24} />
                           </button>
                           <button type="button" onClick={revealAnswer} className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-all" title="Reveal Answer">
                             <Eye size={24} />
                           </button>
                        </div>
                      )}
                    </div>

                    {feedback ? (
                      <div className={`p-6 rounded-2xl animate-in slide-in-from-top-2 flex items-center justify-between ${feedback.status === 'wrong' ? 'bg-rose-100/50 text-rose-700' : 'bg-emerald-100/50 text-emerald-700'}`}>
                        <div className="flex-1">
                          <p className="font-black text-[10px] uppercase tracking-widest opacity-60 mb-1">{feedback.msg}</p>
                          <p className="text-3xl font-black break-words">{quizList[currentIndex].term}</p>
                        </div>
                        <button onClick={nextQuestion} type="button" className="bg-white p-4 rounded-xl shadow-lg hover:scale-105 transition-transform text-slate-800 shrink-0 ml-4">
                          <ChevronRight size={28} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <span className="text-xs font-bold uppercase tracking-widest">Enter to Check • Enter twice to Skip</span>
                      </div>
                    )}
                    {/* Hidden submit button to ensure form submission works via Enter key */}
                    <button type="submit" className="hidden" aria-hidden="true" />
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'vault' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">The Ledger</h2>
                <p className="text-slate-500 font-medium">Full Knowledge Base (Days 1–{Object.keys(vocabulary).length})</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-2xl font-black text-indigo-600">{allWords.length}</span>
              </div>
            </div>

            <div className="space-y-10">
              {Object.keys(vocabulary).map(day => (
                <div key={day} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-black text-slate-800 bg-white px-5 py-1.5 rounded-xl border border-slate-200">{day}</h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vocabulary[day].map((item, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800">{item.term}</span>
                              <button onClick={() => toggleStar(item.term)} className={starredTerms.includes(item.term) ? "text-amber-500" : "text-slate-100"}>
                                <Star size={14} fill={starredTerms.includes(item.term) ? "currentColor" : "none"}/>
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.definition}</p>
                         </div>
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
