(function() {
    games.numberrecall = {
        init: function(container, options, completeCallback) {
            container.innerHTML = '';
            
            const gameOptions = {
                length: options.length || 6,   
                memorizeTime: options.memorizeTime || 3000,
                timeLimit: options.timeLimit || 10000,    
                difficulty: options.difficulty || 'normal',
                attemptsAllowed: options.attemptsAllowed || 1,
                ...options
            };
            
            let showTime = gameOptions.memorizeTime;
            if (gameOptions.difficulty === 'easy') {
                showTime = Math.floor(gameOptions.memorizeTime * 1.5);
            } else if (gameOptions.difficulty === 'hard') {
                showTime = Math.floor(gameOptions.memorizeTime * 0.7);
            }
            
            container.innerHTML = `
            <div style="padding: 20px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
                <h2 style="text-align: center; margin-bottom: 10px; margin-top: 0;">Number Recall</h2>
                <div id="game-info" style="text-align: center; font-size: 18px; margin-bottom: 15px;">
                    Memorize the number sequence!
                </div>
                
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; position: relative;">
                    <div id="number-display" style="font-size: ${getFontSize(gameOptions.length)}px; text-align: center; font-weight: bold; letter-spacing: 2px; margin-bottom: 30px; min-height: 60px; display: flex; align-items: center; justify-content: center;">
                        ...
                    </div>
                    
                    <div id="input-container" style="display: none; width: 100%; max-width: 400px; margin: 0 auto; text-align: center;">
                        <input type="text" id="number-input" placeholder="Type the number sequence..." 
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
                    
                    <div id="attempts-display" style="margin-top: 20px; font-size: 16px; width: 100%; text-align: center;">
                        Attempts: <span id="attempts-counter">0</span>/${gameOptions.attemptsAllowed}
                    </div>
                </div>
                
                <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px;">
                    <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                </div>
            </div>
            `;
            
            function getFontSize(length) {
                if (length <= 5) return 72;
                if (length <= 8) return 60;
                if (length <= 10) return 50;
                if (length <= 12) return 42;
                return 36;
            }
            
            const gameInfo = document.getElementById('game-info');
            const numberDisplay = document.getElementById('number-display');
            const inputContainer = document.getElementById('input-container');
            const numberInput = document.getElementById('number-input');
            const submitBtn = document.getElementById('submit-btn');
            const attemptsCounter = document.getElementById('attempts-counter');
            const timerBar = document.getElementById('timer-bar');
            
            const game = {
                numberSequence: '',
                attempts: 0,
                timer: null,
                phase: 'memorize',
                startTime: null,
                
                init: function() {
                    this.generateNumberSequence();
                    this.showNumberSequence();
                    
                    submitBtn.addEventListener('click', () => {
                        if (window.soundManager) {
                            soundManager.play('click', 0.3);
                        }
                        this.checkAnswer();
                    });
                    
                    numberInput.addEventListener('keypress', (e) => {
                        const key = e.key;
                        if (!/[0-9]/.test(key)) {
                            e.preventDefault();
                        }
                        
                        if (e.key === 'Enter') {
                            if (window.soundManager) {
                                soundManager.play('click', 0.3);
                            }
                            this.checkAnswer();
                        }
                    });
                    
                    numberInput.addEventListener('paste', (e) => {
                        e.preventDefault();
                    });
                },
                
                generateNumberSequence: function() {
                    this.numberSequence = '';
                    for (let i = 0; i < gameOptions.length; i++) {
                        this.numberSequence += Math.floor(Math.random() * 10).toString();
                    }
                },
                
                showNumberSequence: function() {
                    numberDisplay.textContent = this.numberSequence;
                    gameInfo.textContent = 'Memorize this number!';
                    
                    const startTime = Date.now();
                    const memorizeTimer = setInterval(() => {
                        const elapsed = Date.now() - startTime;
                        const remaining = Math.max(0, showTime - elapsed);
                        const percent = (remaining / showTime) * 100;
                        
                        timerBar.style.width = `${percent}%`;
                        
                        if (remaining <= 0) {
                            clearInterval(memorizeTimer);
                            this.startInputPhase();
                        }
                    }, 50);
                },
                
                startInputPhase: function() {
                    this.phase = 'input';
                    numberDisplay.textContent = '?';
                    gameInfo.textContent = 'Now type the number from memory!';
                    
                    inputContainer.style.display = 'block';
                    numberInput.focus();
                    
                    this.startTime = Date.now();
                    this.startTimer();
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
                            this.checkAnswer(true); 
                        }
                    }, 50);
                },
                
                stopTimer: function() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                checkAnswer: function(timeExpired = false) {
                    if (this.phase !== 'input') return;
                    
                    const userInput = numberInput.value.trim();
                    
                    if (timeExpired && !userInput) {
                        this.processResult(false, "Time's up!");
                        return;
                    }
                    
                    if (!userInput) {
                        return;
                    }
                    
                    const isCorrect = userInput === this.numberSequence;
                    
                    this.attempts++;
                    attemptsCounter.textContent = this.attempts;
                    
                    if (isCorrect) {
                        this.processResult(true, 'Correct! Well done!');
                    } else if (this.attempts >= gameOptions.attemptsAllowed) {
                        this.processResult(false, `Incorrect! The number was: ${this.numberSequence}`);
                    } else {
                        gameInfo.textContent = `Incorrect! Try again. (${this.attempts}/${gameOptions.attemptsAllowed})`;
                        gameInfo.style.color = '#e74c3c';
                        numberInput.value = '';
                        numberInput.focus();
                    }
                },
                
                processResult: function(success, message) {
                    this.phase = 'complete';
                    this.stopTimer();
                    
                    gameInfo.textContent = message;
                    gameInfo.style.color = success ? '#2ecc71' : '#e74c3c';
                    
                    numberDisplay.textContent = this.numberSequence;
                    numberDisplay.style.color = success ? '#2ecc71' : '#e74c3c';
                    
                    submitBtn.disabled = true;
                    numberInput.disabled = true;
                    
                    let score = 0;
                    if (success) {
                        const baseScore = gameOptions.length * 10;
                        const timeBonus = Math.max(0, (gameOptions.timeLimit - (Date.now() - this.startTime)) / gameOptions.timeLimit);
                        score = Math.round(baseScore * (0.7 + (timeBonus * 0.3)));
                    }
                    
                    setTimeout(() => {
                        completeCallback(success, score, {
                            attempts: this.attempts,
                            sequenceLength: gameOptions.length,
                            timeUsed: (Date.now() - this.startTime) / 1000
                        });
                    }, 2000);
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