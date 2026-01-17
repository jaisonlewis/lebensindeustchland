class FlashcardApp {
    constructor() {
        this.selectedState = null;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.score = 0;
        this.answered = 0;
        this.showingResult = false;
        this.init();
    }

    init() {
        this.render();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    selectState(stateId) {
        this.selectedState = stateId;
        const stateQuestions = STATE_QUESTIONS[stateId] || [];
        
        // Shuffle and select 30 random general questions
        const shuffledGeneral = this.shuffleArray([...GENERAL_QUESTIONS]);
        const selectedGeneral = shuffledGeneral.slice(0, 30);
        
        // Shuffle and select 3 random state questions
        const shuffledState = this.shuffleArray([...stateQuestions]);
        const selectedState = shuffledState.slice(0, 3);
        
        // Combine and shuffle final set
        const allQuestions = [...selectedGeneral, ...selectedState].map(q => ({
            ...q,
            answers: this.shuffleArray([...q.answers])
        }));
        this.questions = this.shuffleArray(allQuestions);
        
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answered = 0;
        this.showingResult = false;
        this.render();
    }

    selectAnswer(answerIndex) {
        if (this.showingResult) return;
        
        const question = this.questions[this.currentQuestionIndex];
        const selectedAnswer = question.answers[answerIndex];
        const correctAnswer = question.answers.find(a => a.correct);
        
        this.showingResult = true;
        this.answered++;
        
        if (selectedAnswer.correct) {
            this.score++;
        }
        
        this.renderQuestion(selectedAnswer, correctAnswer, answerIndex);
    }

    nextQuestion() {
        this.showingResult = false;
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.renderComplete();
        } else {
            this.render();
        }
    }

    restart() {
        this.selectedState = null;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.score = 0;
        this.answered = 0;
        this.showingResult = false;
        this.render();
    }

    render() {
        const app = document.getElementById('app');
        if (!this.selectedState) {
            app.innerHTML = this.renderStateSelection();
        } else {
            app.innerHTML = this.renderQuestionCard();
        }
        this.attachEventListeners();
    }

    renderStateSelection() {
        return `
            <div class="min-h-screen flex items-center justify-center p-6">
                <div class="max-w-5xl w-full">
                    <div class="bg-paper border-4 border-black shadow-neo p-8 md:p-12 mb-8 text-center rounded-xl relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-ger-black via-ger-red to-ger-gold"></div>
                        <h1 class="text-5xl md:text-6xl font-black text-black mb-4 tracking-tight mt-4">
                            LEBEN IN <span class="bg-black text-white px-2">DEUTSCHLAND</span>
                        </h1>
                        <p class="text-xl text-gray-600 font-bold font-mono">Select your Bundesland</p>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${STATES.map(state => `
                            <button 
                                class="state-btn group relative h-20 bg-white border-2 border-black rounded-lg shadow-neo transition-all duration-150 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-ger-gold"
                                data-state="${state}"
                            >
                                <span class="text-md md:text-lg font-bold text-black uppercase tracking-wide group-hover:underline decoration-2 underline-offset-2">
                                    ${state}
                                </span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuestionCard() {
        const question = this.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        const stateName = this.selectedState || '';
        
        // FIX: Check if questionEn exists before rendering
        const englishQuestion = question.questionEn 
            ? `<div class="bg-blue-50 border-l-4 border-black p-4 mb-6"><p class="text-gray-600 italic font-medium">${question.questionEn}</p></div>` 
            : '';

        const imageSection = question.image 
            ? `<div class="border-2 border-black shadow-neo-sm rounded-lg overflow-hidden bg-white mb-6 p-2"><img src="${question.image}" alt="Question" class="w-full h-auto rounded border border-gray-200" style="max-height: 300px; object-fit: contain;" /></div>` 
            : '';

        return `
            <div class="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
                <header class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <button class="back-btn flex items-center gap-2 font-bold text-black hover:text-ger-red transition-colors">
                            <span class="bg-white border-2 border-black px-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 transition-all">←</span>
                            <span class="uppercase tracking-widest text-sm">${stateName}</span>
                        </button>
                        <div class="font-mono font-bold text-lg bg-black text-white px-3 py-1 shadow-neo-sm transform rotate-1">
                            ${this.currentQuestionIndex + 1} / ${this.questions.length}
                        </div>
                    </div>
                    <div class="h-6 w-full bg-white border-2 border-black rounded-full p-1 shadow-neo-sm">
                        <div class="h-full bg-ger-gold border-r-2 border-black transition-all duration-500" style="width: ${progress}%"></div>
                    </div>
                </header>
                
                <main class="flex-1">
                    <div class="bg-paper border-4 border-black shadow-neo rounded-xl overflow-hidden relative">
                        <div class="p-6 md:p-10">
                            <div class="mb-8">
                                <h2 class="text-2xl md:text-3xl font-black text-black mb-4 leading-tight">
                                    ${question.questionDe}
                                </h2>
                                ${englishQuestion}
                                ${imageSection}
                            </div>
                            
                            <div class="grid gap-4" id="answers-container">
                                ${question.answers.map((answer, idx) => `
                                    <button 
                                        class="answer-btn group w-full text-left p-0 rounded-lg bg-white border-2 border-black shadow-neo transition-all duration-150 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-yellow-50"
                                        data-index="${idx}"
                                    >
                                        <div class="flex items-stretch min-h-[60px]">
                                            <div class="flex items-center justify-center w-14 border-r-2 border-black bg-gray-100 font-bold text-xl text-black group-hover:bg-ger-gold transition-colors">
                                                ${String.fromCharCode(65 + idx)}
                                            </div>
                                            <div class="p-4 flex-1 font-bold text-lg text-gray-800">
                                                ${answer.text}
                                            </div>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    renderQuestion(selectedAnswer, correctAnswer, selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedAnswer.correct;
        const answersContainer = document.getElementById('answers-container');
        
        const buttons = answersContainer.querySelectorAll('.answer-btn');
        buttons.forEach((btn, idx) => {
            const answer = question.answers[idx];
            btn.disabled = true;
            btn.classList.remove('hover:shadow-none', 'hover:translate-x-[4px]', 'hover:translate-y-[4px]', 'hover:bg-yellow-50');
            btn.classList.add('shadow-none', 'translate-x-[4px]', 'translate-y-[4px]', 'cursor-default');

            const textDiv = btn.querySelector('.p-4');
            const letterDiv = btn.querySelector('.w-14');

            // FIX: Only show translation if it exists
            if (answer.textEn && answer.textEn !== answer.text) {
                const englishSpan = document.createElement('div');
                englishSpan.className = 'text-gray-500 italic text-sm mt-1 border-t border-black/10 pt-1 font-normal';
                englishSpan.textContent = answer.textEn;
                textDiv.appendChild(englishSpan);
            }
            
            if (answer.correct) {
                btn.style.backgroundColor = '#dcfce7'; 
                letterDiv.style.backgroundColor = '#22c55e';
                letterDiv.style.color = 'white';
            } else if (idx === selectedIndex && !isCorrect) {
                btn.style.backgroundColor = '#fee2e2'; 
                letterDiv.style.backgroundColor = '#ef4444'; 
                letterDiv.style.color = 'white';
            } else {
                btn.style.opacity = '0.4';
            }
        });

        // EMOJI RESTORED: Uses the "Cool" emojis you liked
        const resultDiv = document.createElement('div');
        resultDiv.className = `mt-8 p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isCorrect ? 'bg-green-100' : 'bg-red-50'}`;
        
        // FIX: Check for missing correct answer translation
        const correctEnglish = correctAnswer.textEn ? `<p class="text-gray-500 italic text-sm">${correctAnswer.textEn}</p>` : '';

        resultDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="text-4xl border-2 border-black rounded-full w-16 h-16 flex items-center justify-center bg-white shadow-sm">
                    ${isCorrect ? '😎' : '😩'}
                </div>
                <div class="flex-1">
                    <h3 class="text-xl font-black uppercase ${isCorrect ? 'text-green-800' : 'text-red-800'} mb-2">
                        ${isCorrect ? 'Wunderbar!' : 'Leider falsch!'}
                    </h3>
                    ${!isCorrect ? `
                        <div class="bg-white border-2 border-black p-3 rounded-lg">
                            <p class="text-xs uppercase font-bold text-gray-500 mb-1">Correct Answer:</p>
                            <p class="font-bold text-black">${correctAnswer.text}</p>
                            ${correctEnglish}
                        </div>
                    ` : ''}
                </div>
            </div>
            <button class="next-btn mt-6 w-full py-4 text-xl font-black bg-blue-600 text-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                ${this.currentQuestionIndex + 1 >= this.questions.length ? 'FINISH EXAM →' : 'NEXT QUESTION →'}
            </button>
        `;
        
        answersContainer.parentElement.appendChild(resultDiv);
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.querySelector('.next-btn').addEventListener('click', () => this.nextQuestion());
    }

    renderComplete() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const passed = this.score >= 17;
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="max-w-xl w-full">
                    <div class="bg-white border-4 border-black shadow-neo rounded-2xl overflow-hidden text-center">
                        <div class="h-4 ${passed ? 'bg-green-500' : 'bg-red-500'} border-b-4 border-black"></div>
                        <div class="p-8">
                            <div class="inline-block text-6xl mb-6 p-4 rounded-full border-4 border-black shadow-neo bg-paper">
                                ${passed ? '🎉' : '📚'}
                            </div>
                            <h2 class="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                                ${passed ? 'Exam Passed!' : 'Try Again'}
                            </h2>
                            <div class="bg-gray-50 border-2 border-black p-6 rounded-xl my-8 relative">
                                <div class="text-5xl font-black ${passed ? 'text-green-600' : 'text-red-600'} mb-2">
                                    ${this.score}
                                    <span class="text-2xl text-black font-bold">/ ${this.questions.length}</span>
                                </div>
                                <p class="font-mono font-bold text-gray-500">${percentage}% Correct</p>
                            </div>
                            <div class="space-y-4">
                                <button class="new-questions-btn w-full py-4 text-lg font-bold bg-ger-gold text-black border-2 border-black rounded-xl shadow-neo hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
                                    Try Again with New Questions
                                </button>
                                <button class="restart-btn w-full py-4 text-lg font-bold bg-white text-black border-2 border-black rounded-xl shadow-neo hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
                                    Retry Same Questions
                                </button>
                                <button class="back-btn w-full py-4 text-lg font-bold bg-white text-black border-2 border-black rounded-xl shadow-neo hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
                                    Change Region
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.new-questions-btn').addEventListener('click', () => {
            this.selectState(this.selectedState);
        });
        document.querySelector('.restart-btn').addEventListener('click', () => {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.answered = 0;
            this.showingResult = false;
            this.render();
        });
        document.querySelector('.back-btn').addEventListener('click', () => this.restart());
    }

    attachEventListeners() {
        document.querySelectorAll('.state-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectState(btn.dataset.state);
            });
        });
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectAnswer(parseInt(btn.dataset.index));
            });
        });
        document.querySelector('.back-btn')?.addEventListener('click', () => this.restart());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});