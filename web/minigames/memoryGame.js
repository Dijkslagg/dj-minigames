(function() {
    games.memory = {
        init: function(container, options, completeCallback) {
            container.innerHTML = '';
            
            const gameOptions = {
                gridSize: options.gridSize || 4, 
                showTime: options.showTime || 3000, 
                maxAttempts: options.maxAttempts || 3,
                gameTime: options.gameTime || 15000, 
                ...options
            };
            
            const baseTileSize = Math.max(30, Math.min(60, 350 / gameOptions.gridSize));

            const gapSize = Math.max(2, Math.min(4, 6 - gameOptions.gridSize * 0.4));
            
            container.innerHTML = `
            <div style="padding: 15px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <h2 style="text-align: center; margin-bottom: 8px; margin-top: 0;">Memory Game</h2>
                <div id="memory-info" style="text-align: center; font-size: 18px; margin-bottom: 12px;">Memorize the pattern...</div>
                
                <div style="display: flex; justify-content: center; align-items: center; flex: 1; width: 100%;">
                    <div id="memory-grid" style="display: grid; 
                        grid-template-columns: repeat(${gameOptions.gridSize}, 1fr); 
                        grid-template-rows: repeat(${gameOptions.gridSize}, 1fr);
                        gap: ${gapSize}px;
                        width: 90%;
                        max-width: ${Math.min(550, 400 + (gameOptions.gridSize * 15))}px;
                        margin: 0 auto;
                        aspect-ratio: 1/1;"></div>
                </div>
                
                <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px; margin-bottom: 10px;">
                    <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                </div>
            </div>
            `;
            
            const grid = document.getElementById('memory-grid');
            const info = document.getElementById('memory-info');
            const timerBar = document.getElementById('timer-bar');
            
            const tiles = [];
            const pattern = [];
            
            for (let i = 0; i < gameOptions.gridSize; i++) {
                pattern.push(Math.floor(Math.random() * (gameOptions.gridSize * gameOptions.gridSize)));
            }
            
            for (let i = 0; i < gameOptions.gridSize * gameOptions.gridSize; i++) {
                const tile = document.createElement('div');
                tile.className = 'memory-tile';
                tile.dataset.index = i;
                tile.style.backgroundColor = "#65737e";
                
                tile.style.width = "100%";
                tile.style.height = "100%";
                tile.style.borderRadius = '4px';
                tile.style.cursor = 'pointer';
                tile.style.transition = 'background-color 0.2s';
                
                grid.appendChild(tile);
                tiles.push(tile);
                
                let lastClickTime = 0;
                const CLICK_COOLDOWN = 300; 
                
                tile.addEventListener('click', function() {
                    const now = Date.now();
                    if (now - lastClickTime < CLICK_COOLDOWN) return;
                    
                    if (game.phase === 'playing' && !game.processingClick) {
                        lastClickTime = now;
                        
                        if (window.soundManager && window.soundManager.sounds && window.soundManager.sounds.click) {
                            soundManager.play('click', 0.3);
                        }
                        
                        game.checkTile(i);
                    }
                });
            }
            
            const game = {
                phase: 'memorize',
                currentStep: 0,
                attempts: 0,
                timer: null,
                startTime: null,
                processingClick: false,
                
                start: function() {
                    info.textContent = 'Memorize the pattern...';
                    
                    this.showPattern();
                    
                    setTimeout(() => {
                        info.textContent = 'Ready...';
                        
                        if (window.soundManager) soundManager.play('start', 0.1);
                        
                        setTimeout(() => {
                            this.phase = 'playing';
                            info.textContent = 'Now repeat the pattern!';
                            
                            let tileResetTimeout = null;
                            
                            tiles.forEach(tile => {
                                tile.style.transition = 'background-color 0.3s';
                                tile.style.boxShadow = '0 0 5px rgba(255,255,255,0.2)';
                                tile.style.backgroundColor = '#76848f';
                            });
                            
                            tileResetTimeout = setTimeout(() => {
                                if (this.phase === 'playing' && !this.processingClick) {
                                    tiles.forEach(tile => {
                                        tile.style.backgroundColor = '#65737e';
                                    });
                                }
                            }, 300);
                            
                            this.tileResetTimeout = tileResetTimeout;
                            
                            this.startTime = Date.now();
                            this.startTimer();
                        }, 500); 
                    }, gameOptions.showTime);
                },
                
                startTimer: function() {
                    if (this.timer) clearInterval(this.timer);
                    
                    this.timer = setInterval(() => {
                        const elapsed = Date.now() - this.startTime;
                        const remaining = Math.max(0, gameOptions.gameTime - elapsed);
                        const percent = (remaining / gameOptions.gameTime) * 100;
                        
                        timerBar.style.width = `${percent}%`;
                        
                        if (percent < 20) {
                            timerBar.style.backgroundColor = '#e74c3c'; 
                        } else if (percent < 50) {
                            timerBar.style.backgroundColor = '#f39c12'; 
                        }
                        
                        if (remaining <= 0) {
                            clearInterval(this.timer);
                            info.textContent = 'Time\'s up! Game over.';
                            setTimeout(() => {
                                completeCallback(false, 0, { attempts: this.attempts, timeOut: true });
                            }, 1000);
                        }
                    }, 100); 
                },
                
                stopTimer: function() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                showPattern: function() {
                    pattern.forEach((tileIndex, i) => {
                        setTimeout(() => {
                            tiles[tileIndex].style.backgroundColor = '#f39c12';
                            
                            setTimeout(() => {
                                tiles[tileIndex].style.backgroundColor = "#65737e";
                            }, 500);
                        }, i * 600);
                    });
                },
                
                checkTile: function(index) {
                    this.processingClick = true;
                    
                    if (this.tileResetTimeout) {
                        clearTimeout(this.tileResetTimeout);
                        this.tileResetTimeout = null;
                    }
                    
                    tiles[index].style.backgroundColor = '#76848f';
                    
                    setTimeout(() => {
                        if (pattern[this.currentStep] === index) {
                            tiles[index].style.backgroundColor = '#2ecc71';
                            this.currentStep++;
                            
                            if (this.currentStep >= pattern.length) {
                                this.stopTimer();
                                info.textContent = 'Great job! Pattern completed!';
                                this.phase = 'completed';
                                
                                setTimeout(() => {
                                    completeCallback(true, 100, { attempts: this.attempts });
                                }, 1000);
                            } else {
                                setTimeout(() => {
                                    if (this.phase === 'playing') {
                                        tiles[index].style.backgroundColor = '#65737e';
                                    }
                                }, 300);
                                
                                setTimeout(() => {
                                    this.processingClick = false;
                                }, 200);
                            }
                        } else {
                            tiles[index].style.backgroundColor = '#e74c3c';
                            this.attempts++;
                            
                            if (this.attempts >= gameOptions.maxAttempts) {
                                this.stopTimer();
                                info.textContent = 'Too many mistakes! Game over.';
                                this.phase = 'failed';
                                
                                setTimeout(() => {
                                    completeCallback(false, 0, { attempts: this.attempts });
                                }, 1000);
                            } else {
                                info.textContent = `Wrong! Try again. Attempts: ${this.attempts}/${gameOptions.maxAttempts}`;
                                this.currentStep = 0;
                                
                                this.processingClick = true;
                                
                                setTimeout(() => {
                                    tiles.forEach((tile, tileIndex) => {
                                        if (tileIndex !== index) {
                                            tile.style.backgroundColor = "#65737e";
                                        }
                                    });
                                }, 1000);
                                
                                setTimeout(() => {
                                    tiles[index].style.backgroundColor = "#65737e";
                                    this.processingClick = false;
                                }, 1500);
                            }
                        }
                    }, 100);
                }
            };
            
            setTimeout(() => game.start(), 500);
            
            return () => {
                if (game.timer) {
                    clearInterval(game.timer);
                }
            };
        }
    };
})();