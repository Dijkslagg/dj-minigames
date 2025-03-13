(function() {
    games.matching = {
        init: function(container, options, completeCallback) {
            container.innerHTML = '';
            
            const gameOptions = {
                gridSize: options.gridSize || 4, 
                timeLimit: options.timeLimit || 60000,
                maxMistakes: options.maxMistakes || 5, 
                ...options
            };
            
            const gapSize = Math.max(4, 10 - gameOptions.gridSize);
            
            container.innerHTML = `
            <div style="padding: 15px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <h2 style="text-align: center; margin-bottom: 8px; margin-top: 0;">Matching Pairs</h2>
                <div id="matching-info" style="text-align: center; font-size: 18px; margin-bottom: 8px;">Find all matching pairs</div>
                
                <div style="margin-bottom: 5px; display: flex; width: 85%; justify-content: space-between;">
                    <div>Pairs: <span id="pairs-counter">0</span>/<span id="total-pairs"></span></div>
                    <div>Mistakes: <span id="mistakes-counter">0</span>/<span id="max-mistakes"></span></div>
                </div>
                
                <div style="display: flex; justify-content: center; align-items: center; flex: 1; width: 100%;">
                    <div id="matching-grid" style="display: grid; 
                        grid-template-columns: repeat(${gameOptions.gridSize}, 1fr); 
                        grid-template-rows: repeat(${gameOptions.gridSize}, 1fr);
                        gap: ${gapSize}px;
                        width: 90%;
                        max-width: ${Math.min(550, 400 + (gameOptions.gridSize * 15))}px;
                        margin: 0 auto;
                        aspect-ratio: 1/1;"></div>
                </div>
                
                <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px;">
                    <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                </div>
            </div>
            `;
            
            const grid = document.getElementById('matching-grid');
            const info = document.getElementById('matching-info');
            const pairsCounter = document.getElementById('pairs-counter');
            const totalPairs = document.getElementById('total-pairs');
            const mistakesCounter = document.getElementById('mistakes-counter');
            const maxMistakes = document.getElementById('max-mistakes');
            const timerBar = document.getElementById('timer-bar');
            
            const icons = [
                'fa-heart', 'fa-star', 'fa-music', 'fa-car', 'fa-home', 'fa-key',
                'fa-bell', 'fa-gift', 'fa-trophy', 'fa-camera', 'fa-moon', 'fa-sun',
                'fa-tree', 'fa-fire', 'fa-diamond', 'fa-anchor', 'fa-flask', 'fa-rocket'
            ];
            
            const totalPairsCount = Math.floor(gameOptions.gridSize * gameOptions.gridSize / 2);
            totalPairs.textContent = totalPairsCount;
            maxMistakes.textContent = gameOptions.maxMistakes;
            
            if (!document.getElementById('fontawesome-css')) {
                const fontAwesomeLink = document.createElement('link');
                fontAwesomeLink.id = 'fontawesome-css';
                fontAwesomeLink.rel = 'stylesheet';
                fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
                document.head.appendChild(fontAwesomeLink);
            }
            
            const game = {
                cards: [],
                flippedCards: [],
                matchedPairs: 0,
                mistakes: 0,
                isProcessing: false,
                timer: null,
                startTime: null,
                gameOver: false,
                
                init: function() {
                    this.setupCards();
                    this.startTime = Date.now();
                    this.startTimer();
                },
                
                setupCards: function() {
                    if (window.soundManager && window.soundManager.sounds && window.soundManager.sounds.click) {
                        try {
                            window.soundManager.sounds.click.play();
                            window.soundManager.sounds.click.stop();
                        } catch (e) {
                            console.log("Sound priming failed, will try again on first click");
                        }
                    }
                    
                    const pairs = [];
                    for (let i = 0; i < totalPairsCount; i++) {
                        const iconIndex = i % icons.length;
                        pairs.push(icons[iconIndex]);
                        pairs.push(icons[iconIndex]);
                    }
                    
                    this.shuffleArray(pairs);
                    
                    grid.innerHTML = '';
                    this.cards = [];
                    
                    for (let i = 0; i < pairs.length; i++) {
                        const card = document.createElement('div');
                        card.className = 'matching-card';
                        card.dataset.index = i;
                        card.dataset.icon = pairs[i];
                        card.dataset.matched = 'false';
                        card.dataset.flipped = 'false';
                        
                        card.style.width = '100%';
                        card.style.height = '100%';
                        card.style.borderRadius = '4px';
                        card.style.backgroundColor = '#65737e';
                        card.style.cursor = 'pointer';
                        card.style.position = 'relative';
                        card.style.transition = 'transform 0.3s, background-color 0.2s';
                        card.style.transformStyle = 'preserve-3d';
                        
                        const cardFront = document.createElement('div');
                        cardFront.className = 'card-face card-front';
                        cardFront.innerHTML = '<i class="fas fa-question"></i>';
                        
                        cardFront.style.position = 'absolute';
                        cardFront.style.width = '100%';
                        cardFront.style.height = '100%';
                        cardFront.style.display = 'flex';
                        cardFront.style.justifyContent = 'center';
                        cardFront.style.alignItems = 'center';
                        cardFront.style.fontSize = `${Math.max(16, Math.min(30, 30 - gameOptions.gridSize * 2))}px`;
                        cardFront.style.color = '#c0c5ce';
                        cardFront.style.backfaceVisibility = 'hidden';
                        
                        const cardBack = document.createElement('div');
                        cardBack.className = 'card-face card-back';
                        cardBack.innerHTML = `<i class="fas ${pairs[i]}"></i>`;
                        
                        cardBack.style.position = 'absolute';
                        cardBack.style.width = '100%';
                        cardBack.style.height = '100%';
                        cardBack.style.display = 'flex';
                        cardBack.style.justifyContent = 'center';
                        cardBack.style.alignItems = 'center';
                        cardBack.style.fontSize = `${Math.max(16, Math.min(30, 30 - gameOptions.gridSize * 2))}px`;
                        cardBack.style.color = '#c0c5ce';
                        cardBack.style.backfaceVisibility = 'hidden';
                        cardBack.style.transform = 'rotateY(180deg)';
                        
                        card.appendChild(cardFront);
                        card.appendChild(cardBack);
                        
                        card.addEventListener('click', () => {
                            if (
                                !this.isProcessing && 
                                !this.gameOver && 
                                card.dataset.flipped === 'false' && 
                                card.dataset.matched === 'false' &&
                                this.flippedCards.length < 2
                            ) {
                                if (window.soundManager) {
                                    soundManager.play('click', 0.3);
                                }
                                
                                this.flipCard(card);
                            }
                        });
                        
                        grid.appendChild(card);
                        this.cards.push(card);
                    }
                },
                
                flipCard: function(card) {
                    card.style.transform = 'rotateY(180deg)';
                    card.dataset.flipped = 'true';
                    this.flippedCards.push(card);
                    
                    if (this.flippedCards.length === 2) {
                        this.checkForMatch();
                    }
                },
                
                unflipCard: function(card) {
                    card.style.transform = 'rotateY(0deg)';
                    card.dataset.flipped = 'false';
                },
                
                checkForMatch: function() {
                    this.isProcessing = true;
                    const card1 = this.flippedCards[0];
                    const card2 = this.flippedCards[1];
                    
                    if (card1.dataset.icon === card2.dataset.icon) {
                        setTimeout(() => {
                            card1.style.backgroundColor = '#2ecc71';
                            card2.style.backgroundColor = '#2ecc71';
                            
                            card1.dataset.matched = 'true';
                            card2.dataset.matched = 'true';
                            
                            this.matchedPairs++;
                            pairsCounter.textContent = this.matchedPairs;
                            
                            this.flippedCards = [];
                            this.isProcessing = false;
                            
                            if (this.matchedPairs === totalPairsCount) {
                                this.endGame(true);
                            }
                        }, 500);
                    } else {
                        setTimeout(() => {
                            card1.style.backgroundColor = '#e74c3c';
                            card2.style.backgroundColor = '#e74c3c';
                            
                            setTimeout(() => {
                                this.unflipCard(card1);
                                this.unflipCard(card2);
                                card1.style.backgroundColor = '#65737e';
                                card2.style.backgroundColor = '#65737e';
                                
                                this.flippedCards = [];
                                this.isProcessing = false;
                                
                                this.mistakes++;
                                mistakesCounter.textContent = this.mistakes;
                                
                                if (this.mistakes >= gameOptions.maxMistakes) {
                                    this.endGame(false);
                                }
                            }, 800);
                        }, 500);
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
                        
                        if (remaining <= 0 && !this.gameOver) {
                            this.endGame(false, 'Time\'s up!');
                        }
                    }, 100);
                },
                
                stopTimer: function() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                endGame: function(success, message) {
                    this.gameOver = true;
                    this.stopTimer();
                    
                    if (success) {
                        const timeUsed = (Date.now() - this.startTime) / 1000;
                        info.textContent = `Great job! All pairs found!`;
                        info.style.color = '#2ecc71';
                        
                        const baseScore = 100;
                        const timePercentLeft = Math.max(0, (gameOptions.timeLimit - (Date.now() - this.startTime)) / gameOptions.timeLimit);
                        const mistakesPenalty = (this.mistakes / gameOptions.maxMistakes) * 0.5;
                        const finalScore = Math.round(baseScore * (timePercentLeft + 0.5) * (1 - mistakesPenalty));
                        
                        setTimeout(() => {
                            completeCallback(true, finalScore, {
                                timeUsed: timeUsed,
                                mistakes: this.mistakes,
                                pairs: this.matchedPairs
                            });
                        }, 1500);
                    } else {
                        info.textContent = message || 'Game over!';
                        info.style.color = '#e74c3c';
                        
                        setTimeout(() => {
                            completeCallback(false, 0, {
                                mistakes: this.mistakes,
                                pairs: this.matchedPairs
                            });
                        }, 1500);
                    }
                },
                
                shuffleArray: function(array) {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
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
