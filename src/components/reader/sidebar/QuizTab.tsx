'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';

interface QuizTabProps {
  bookId: string;
  pageNumber: number;
}

export function QuizTab({ bookId, pageNumber }: QuizTabProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Reset state when page changes
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError('');
  }, [pageNumber]);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getQuiz(bookId, pageNumber);
      setQuestions(res.questions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (qIndex: number, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const checkScore = () => {
    setSubmitted(true);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Smart Quiz
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Test your comprehension of this page</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {questions.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-[var(--muted)] text-sm mb-4">Generate a quick quiz to verify your understanding.</p>
            <button 
              onClick={loadQuiz}
              className="px-4 py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg font-medium text-sm hover:opacity-90"
            >
              Generate Quiz
            </button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-[#292524] rounded w-3/4 mb-3"></div>
                <div className="space-y-2 pl-4">
                  <div className="h-3 bg-[#292524] rounded w-full"></div>
                  <div className="h-3 bg-[#292524] rounded w-5/6"></div>
                  <div className="h-3 bg-[#292524] rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {questions.length > 0 && (
          <div className="space-y-8">
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correct_answer;
              return (
                <div key={idx} className="bg-[#1C1917] p-4 rounded-xl border border-[var(--border)]">
                  <p className="text-[var(--foreground)] font-medium mb-3 text-sm">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt: string) => {
                      const isSelected = answers[idx] === opt;
                      const isActuallyCorrect = submitted && opt === q.correct_answer;
                      const isWrongChoice = submitted && isSelected && !isCorrect;
                      
                      let btnClass = "w-full text-left p-3 rounded-lg text-sm border transition-colors ";
                      
                      if (!submitted) {
                        btnClass += isSelected 
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[#0C0A09] font-medium" 
                          : "border-[var(--border)] bg-[#0C0A09] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--foreground)]";
                      } else {
                        if (isActuallyCorrect) {
                          btnClass += "border-green-500 bg-green-500/20 text-green-400 font-medium";
                        } else if (isWrongChoice) {
                          btnClass += "border-red-500 bg-red-500/20 text-red-400";
                        } else {
                          btnClass += "border-[var(--border)] bg-[#0C0A09] text-[var(--muted)] opacity-50";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelect(idx, opt)}
                          disabled={submitted}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {submitted && (
                    <div className="mt-3 text-xs">
                      {isCorrect ? (
                        <span className="text-green-400 flex items-center gap-1">✅ Correct!</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">❌ Incorrect.</span>
                      )}
                      {q.explanation && (
                        <p className="mt-2 text-[var(--muted)] italic">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted && Object.keys(answers).length === questions.length && (
              <button
                onClick={checkScore}
                className="w-full py-3 bg-[var(--accent)] text-[#0C0A09] rounded-xl font-bold hover:opacity-90"
              >
                Check Answers
              </button>
            )}
            
            {submitted && (
              <div className="text-center p-4 bg-[#1C1917] rounded-xl border border-[var(--border)]">
                <p className="font-bold text-[var(--foreground)] mb-1">
                  You scored {Object.values(answers).filter((a, i) => a === questions[i].correct_answer).length} / {questions.length}
                </p>
                <p className="text-xs text-[var(--muted)] mb-3">Wisdom score updated!</p>
                <button
                  onClick={loadQuiz}
                  className="px-4 py-2 bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg text-sm"
                >
                  Regenerate Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
