(function() {
    games.math = {
        init: function(container, options, completeCallback) {
            container.innerHTML = '';
            
            const gameOptions = {
                problemCount: options.problemCount || 5,
                timeLimit: options.timeLimit || 30000,
                difficulty: options.difficulty || 'normal',
                operationTypes: options.operationTypes || ['addition', 'subtraction', 'multiplication'],
                ...options
            };
            
            let maxNumber = 10;
            let includeDivision = false;
            let includeNegatives = false;
            
            if (gameOptions.difficulty === 'easy') {
                maxNumber = 10;
                includeDivision = false;
                includeNegatives = false;
            } else if (gameOptions.difficulty === 'normal') {
                maxNumber = 25;
                includeDivision = true;
                includeNegatives = false;
            } else if (gameOptions.difficulty === 'hard') {
                maxNumber = 50;
                includeDivision = true;
                includeNegatives = true;
            }
            
            if (gameOptions.operationTypes.includes('division')) {
                includeDivision = true;
            }
            
            container.innerHTML = `
            <div style="padding: 20px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
                <h2 style="text-align: center; margin-bottom: 10px; margin-top: 0;">Math Challenge</h2>
                <div id="math-info" style="text-align: center; font-size: 18px; margin-bottom: 15px;">
                    Solve the math problems!
                </div>
                
                <div style="margin-bottom: 10px; text-align: center;">
                    Problem: <span id="problem-counter">1</span>/<span id="total-problems">${gameOptions.problemCount}</span>
                </div>
                
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
                    <div id="problem-display" style="font-size: 42px; text-align: center; font-weight: bold; margin-bottom: 30px;">
                        
                    </div>
                    
                    <div id="answer-container" style="width: 100%; max-width: 400px; margin: 0 auto; text-align: center;">
                        <input type="text" id="answer-input" placeholder="Enter your answer..." 
                            style="width: 100%; padding: 12px 15px; font-size: 18px; border: 2px solid #65737e; 
                            border-radius: 4px; background-color: rgba(255,255,255,0.1); color: #fff; 
                            text-align: center; letter-spacing: 1px; font-family: 'Roboto Condensed', sans-serif; box-sizing: border-box;">
                        
                        <div style="display: flex; justify-content: center; margin-top: 20px;">
                            <button id="submit-btn" 
                                style="padding: 10px 25px; background-color: #65737e; color: white; border: none; 
                                border-radius: 4px; font-size: 16px; cursor: pointer; font-family: 'Roboto Condensed', sans-serif;">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px;">
                    <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                </div>
            </div>
            `;
            
            const mathInfo = document.getElementById('math-info');
            const problemCounter = document.getElementById('problem-counter');
            const totalProblems = document.getElementById('total-problems');
            const problemDisplay = document.getElementById('problem-display');
            const answerInput = document.getElementById('answer-input');
            const submitBtn = document.getElementById('submit-btn');
            const timerBar = document.getElementById('timer-bar');
            
            const game = {
                problems: [],
                currentProblemIndex: 0,
                score: 0,
                timer: null,
                startTime: null,
                
                init: function() {
                    this.generateProblems(gameOptions.problemCount, maxNumber, includeDivision, includeNegatives);
                    this.displayCurrentProblem();
                    
                    submitBtn.addEventListener('click', () => {
                        if (window.soundManager) {
                            soundManager.play('click', 0.3);
                        }
                        this.checkAnswer();
                    });
                    
                    answerInput.addEventListener('keypress', (e) => {
                        const key = e.key;
                        if (!/[0-9\-\.]/.test(key) && key !== 'Enter') {
                            e.preventDefault();
                        }
                        
                        if (e.key === 'Enter') {
                            if (window.soundManager) {
                                soundManager.play('click', 0.3);
                            }
                            this.checkAnswer();
                        }
                    });
                    
                    answerInput.focus();
                    
                    this.startTime = Date.now();
                    this.startTimer();
                },
                
                generateProblems: function(count, maxNum, includeDivision, includeNegatives) {
                    this.problems = [];
                    
                    const operations = [];
                    if (gameOptions.operationTypes.includes('addition')) operations.push('+');
                    if (gameOptions.operationTypes.includes('subtraction')) operations.push('-');
                    if (gameOptions.operationTypes.includes('multiplication')) operations.push('*');
                    if (includeDivision && gameOptions.operationTypes.includes('division')) operations.push('/');
                    
                    if (operations.length === 0) operations.push('+');
                    
                    for (let i = 0; i < count; i++) {
                        let problem = this.generateSingleProblem(maxNum, operations, includeNegatives);
                        this.problems.push(problem);
                    }
                },
                
                generateSingleProblem: function(maxNum, operations, includeNegatives) {
                    const operation = operations[Math.floor(Math.random() * operations.length)];
                    let num1, num2, answer;
                    
                    switch (operation) {
                        case '+':
                            num1 = this.getRandomInt(1, maxNum);
                            num2 = this.getRandomInt(1, maxNum);
                            if (includeNegatives && Math.random() > 0.7) {
                                num1 = -num1;
                            }
                            if (includeNegatives && Math.random() > 0.7) {
                                num2 = -num2;
                            }
                            answer = num1 + num2;
                            break;
                            
                        case '-':
                            num1 = this.getRandomInt(1, maxNum);
                            num2 = this.getRandomInt(1, maxNum);
                            if (includeNegatives) {
                                if (Math.random() > 0.7) num1 = -num1;
                                if (Math.random() > 0.7) num2 = -num2;
                            } else {
                                if (num1 < num2) {
                                    [num1, num2] = [num2, num1]; 
                                }
                            }
                            answer = num1 - num2;
                            break;
                            
                        case '*':
                            num1 = this.getRandomInt(1, Math.min(12, maxNum));
                            num2 = this.getRandomInt(1, Math.min(12, maxNum));
                            if (includeNegatives && Math.random() > 0.7) {
                                num1 = -num1;
                            }
                            if (includeNegatives && Math.random() > 0.7) {
                                num2 = -num2;
                            }
                            answer = num1 * num2;
                            break;
                            
                        case '/':
                            num2 = this.getRandomInt(1, Math.min(10, maxNum));
                            answer = this.getRandomInt(1, Math.min(10, maxNum));
                            num1 = num2 * answer;
                            
                            if (includeNegatives && Math.random() > 0.7) {
                                num1 = -num1;
                                answer = -answer;
                            }
                            break;
                    }
                    
                    let displayStr = `${num1} ${this.getOperationSymbol(operation)} ${num2} = ?`;
                    
                    return {
                        display: displayStr,
                        answer: answer
                    };
                },
                
                getOperationSymbol: function(op) {
                    switch (op) {
                        case '+': return '+';
                        case '-': return '−';
                        case '*': return '×';
                        case '/': return '÷';
                        default: return op;
                    }
                },
                
                getRandomInt: function(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                },
                
                displayCurrentProblem: function() {
                    if (this.currentProblemIndex < this.problems.length) {
                        const problem = this.problems[this.currentProblemIndex];
                        problemDisplay.textContent = problem.display;
                        problemCounter.textContent = (this.currentProblemIndex + 1).toString();
                        answerInput.value = '';
                        answerInput.focus();
                    }
                },
                
                checkAnswer: function() {
                    const userAnswer = parseFloat(answerInput.value.trim());
                    
                    if (isNaN(userAnswer)) {
                        mathInfo.textContent = "Please enter a valid number!";
                        mathInfo.style.color = '#f39c12';
                        answerInput.focus();
                        return;
                    }
                    
                    const currentProblem = this.problems[this.currentProblemIndex];
                    const isCorrect = Math.abs(userAnswer - currentProblem.answer) < 0.001; 
                    
                    if (isCorrect) {
                        this.score++;
                        problemDisplay.style.color = '#2ecc71';
                        
                        problemDisplay.textContent = `${currentProblem.display.replace('= ?', `= ${currentProblem.answer}`)}`;
                        
                        setTimeout(() => {
                            this.currentProblemIndex++;
                            
                            if (this.currentProblemIndex >= this.problems.length) {
                                this.completeGame(true);
                            } else {
                                problemDisplay.style.color = '#c0c5ce';
                                this.displayCurrentProblem();
                            }
                        }, 500);
                    } else {
                        problemDisplay.style.color = '#e74c3c';
                        mathInfo.textContent = `Incorrect! The answer was ${currentProblem.answer}`;
                        mathInfo.style.color = '#e74c3c';
                        
                        if (!gameOptions.allowMistakes) {
                            setTimeout(() => {
                                this.completeGame(false, "Wrong answer!");
                            }, 1000);
                            return;
                        }
                        
                        setTimeout(() => {
                            this.currentProblemIndex++;
                            
                            if (this.currentProblemIndex >= this.problems.length) {
                                this.completeGame(this.score >= Math.ceil(gameOptions.problemCount / 2));
                            } else {
                                problemDisplay.style.color = '#c0c5ce';
                                mathInfo.textContent = 'Solve the math problems!';
                                mathInfo.style.color = '#c0c5ce';
                                this.displayCurrentProblem();
                            }
                        }, 1000);
                    }
                },
                
                startTimer: function() {
                    if (this.timer) clearInterval(this.timer);
                    
                    this.timer = setInterval(() => {
                        const elapsed = Date.now() - this.startTime;
                        const remaining = Math.max(0, gameOptions.timeLimit - elapsed);
                        const percent = (remaining / gameOptions.timeLimit) * 100;
                        
                        timerBar.style.width = `${percent}%`;
                        
                        if (percent < 20) {
                            timerBar.style.backgroundColor = '#e74c3c';
                        } else if (percent < 50) {
                            timerBar.style.backgroundColor = '#f39c12';
                        }
                        
                        if (remaining <= 0) {
                            clearInterval(this.timer);
                            this.completeGame(false, "Time's up!");
                        }
                    }, 50);
                },
                
                stopTimer: function() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                completeGame: function(success, message) {
                    this.stopTimer();
                    
                    answerInput.disabled = true;
                    submitBtn.disabled = true;
                    
                    if (success) {
                        const timeUsed = (Date.now() - this.startTime) / 1000;
                        mathInfo.textContent = message || `Great job! You solved ${this.score} out of ${gameOptions.problemCount} problems!`;
                        mathInfo.style.color = '#2ecc71';
                        
                        const baseScore = 100;
                        const accuracyBonus = this.score / gameOptions.problemCount;
                        const timeBonus = Math.max(0, (gameOptions.timeLimit - (Date.now() - this.startTime)) / gameOptions.timeLimit);
                        const finalScore = Math.round(baseScore * (0.6 * accuracyBonus + 0.4 * timeBonus));
                        
                        setTimeout(() => {
                            completeCallback(true, finalScore, {
                                correctAnswers: this.score,
                                totalProblems: gameOptions.problemCount,
                                timeUsed: timeUsed
                            });
                        }, 2000);
                    } else {
                        mathInfo.textContent = message || 'Game over!';
                        mathInfo.style.color = '#e74c3c';
                        
                        setTimeout(() => {
                            completeCallback(false, 0, {
                                correctAnswers: this.score,
                                totalProblems: gameOptions.problemCount,
                                timeUsed: (Date.now() - this.startTime) / 1000
                            });
                        }, 2000);
                    }
                }
            };
            
            setTimeout(() => {
                if (window.soundManager && !window.soundManager.initialized) {
                    document.addEventListener('soundsLoaded', function soundsReadyHandler() {
                        game.init();
                        document.removeEventListener('soundsLoaded', soundsReadyHandler);
                    });
                } else {
                    game.init();
                }
            }, 300);
            
            return function cleanup() {
                if (game.timer) {
                    clearInterval(game.timer);
                }
            };
        }
    };
})();