(function() {
    games.slidingpuzzle = {
        init: function(container, options, completeCallback) {
            const gameOptions = {
                gridSize: options.gridSize || 3,      
                timeLimit: options.timeLimit || 60000,  
                difficulty: options.difficulty || 'normal',
                ...options
            };
            
            let shuffleMoves = 30;
            if (gameOptions.difficulty === 'easy') {
                shuffleMoves = 15;
            } else if (gameOptions.difficulty === 'hard') {
                shuffleMoves = 60;
            }
            
            container.innerHTML = `
                <div style="padding: 20px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
                    <h2 style="text-align: center; margin-bottom: 10px; margin-top: 0;">Sliding Puzzle</h2>
                    <div id="puzzle-info" style="text-align: center; font-size: 18px; margin-bottom: 15px;">Arrange the tiles in order by sliding them into the empty space</div>
                    
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%;">
                        <div style="margin-bottom: 15px; display: flex; gap: 20px; align-items: center;">
                            <div>Moves: <span id="move-counter">0</span></div>
                        </div>
                        
                        <div id="puzzle-container" style="position: relative; margin: 0 auto; display: grid;"></div>
                    </div>
                    
                    <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px;">
                        <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                    </div>
                </div>
            `;
            
            const puzzleInfo = document.getElementById('puzzle-info');
            const moveCounter = document.getElementById('move-counter');
            const puzzleContainer = document.getElementById('puzzle-container');
            const timerBar = document.getElementById('timer-bar');
            
            const game = {
                grid: [],
                emptyCell: { row: 0, col: 0 },
                moves: 0,
                solved: false,
                timer: null,
                startTime: null,
                isAnimating: false,
                
                init: function() {
                    const size = Math.min(450, Math.max(280, 400 - (gameOptions.gridSize > 4 ? (gameOptions.gridSize - 4) * 20 : 0)));
                    
                    puzzleContainer.style.width = `${size}px`;
                    puzzleContainer.style.height = `${size}px`;
                    puzzleContainer.style.gridTemplateColumns = `repeat(${gameOptions.gridSize}, 1fr)`;
                    puzzleContainer.style.gridTemplateRows = `repeat(${gameOptions.gridSize}, 1fr)`;
                    puzzleContainer.style.gap = `${Math.max(2, 6 - gameOptions.gridSize)}px`;

                    
                    this.createTiles();
            
                    this.shufflePuzzle(shuffleMoves);
                    
                    this.startTime = Date.now();
                    this.startTimer();
                },
                
                createTiles: function() {                    
                    puzzleContainer.innerHTML = '';
                    this.grid = [];
                    
                    for (let row = 0; row < gameOptions.gridSize; row++) {
                        this.grid[row] = [];
                        for (let col = 0; col < gameOptions.gridSize; col++) {
                            this.grid[row][col] = row * gameOptions.gridSize + col + 1;
                        }
                    }
                    
                    this.grid[gameOptions.gridSize-1][gameOptions.gridSize-1] = 0;
                    this.emptyCell = { row: gameOptions.gridSize-1, col: gameOptions.gridSize-1 };
                    
                    this.renderTiles();
                },
                
                renderTiles: function() {
                    puzzleContainer.innerHTML = '';
                    
                    for (let row = 0; row < gameOptions.gridSize; row++) {
                        for (let col = 0; col < gameOptions.gridSize; col++) {
                            const value = this.grid[row][col];
                            
                            if (value !== 0) { 
                                const tile = document.createElement('div');
                                tile.className = 'puzzle-tile';
                                tile.dataset.row = row;
                                tile.dataset.col = col;
                                
                                const tileContent = document.createElement('div');
                                tileContent.textContent = value;
                                
                                tile.style.userSelect = 'none';
                                tile.style.cursor = 'pointer';
                                tile.style.display = 'flex';
                                tile.style.alignItems = 'center';
                                tile.style.justifyContent = 'center';
                                tile.style.backgroundColor = '#65737e';
                                tile.style.color = '#c0c5ce';
                                tile.style.fontSize = `${Math.max(16, Math.min(32, 26 - gameOptions.gridSize))}px`;
                                tile.style.fontWeight = 'bold';
                                tile.style.borderRadius = '4px';
                                tile.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.1)';
                                tile.style.transition = 'transform 0.15s ease-out, background-color 0.2s';
                                
                                tile.style.gridRow = `${row + 1}`;
                                tile.style.gridColumn = `${col + 1}`;
                                
                                const game = this;
                                
                                tile.onmouseenter = function() {
                                    if (!game.solved && this.canMove) {
                                        this.style.backgroundColor = '#76848f';
                                    }
                                };
                                
                                tile.onmouseleave = function() {
                                    if (!game.solved) {
                                        this.style.backgroundColor = '#65737e';
                                    }
                                };
                                
                                tile.appendChild(tileContent);
                                puzzleContainer.appendChild(tile);
                                
                                tile.addEventListener('click', () => {
                                    if (!this.solved && !this.isAnimating) {
                                        if (tile.canMove && window.soundManager) {
                                            soundManager.play('click', 0.3);
                                        }
                                        
                                        this.moveTile(row, col);
                                    }
                                });
                                
                                this.updateTileMoveability(tile, row, col);
                            }
                        }
                    }
                },
                
                updateTileMoveability: function(tile, row, col) {
                    const canMove = 
                        (row === this.emptyCell.row && Math.abs(col - this.emptyCell.col) === 1) ||
                        (col === this.emptyCell.col && Math.abs(row - this.emptyCell.row) === 1);
                    
                    tile.canMove = canMove;
                    
                    if (canMove) {
                        tile.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.4)';
                    } else {
                        tile.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.1)';
                    }
                },
                
                moveTile: function(row, col) {
                    if (
                        (row === this.emptyCell.row && Math.abs(col - this.emptyCell.col) === 1) ||
                        (col === this.emptyCell.col && Math.abs(row - this.emptyCell.row) === 1)
                    ) {
                        if (this.isAnimating) return;
                        this.isAnimating = true;
                                                
                        const tileElement = puzzleContainer.querySelector(`.puzzle-tile[data-row="${row}"][data-col="${col}"]`);
                        if (!tileElement) {
                            this.isAnimating = false;
                            return;
                        }
                        
                        const moveToRow = this.emptyCell.row;
                        const moveToCol = this.emptyCell.col;
                        
                        const value = this.grid[row][col];
                        this.grid[this.emptyCell.row][this.emptyCell.col] = value;
                        this.grid[row][col] = 0;
                        
                        this.emptyCell = { row, col };
                        
                        tileElement.dataset.row = moveToRow;
                        tileElement.dataset.col = moveToCol;
                        
                        tileElement.style.transition = 'grid-row 0.2s, grid-column 0.2s';
                        tileElement.style.gridRow = `${moveToRow + 1}`;
                        tileElement.style.gridColumn = `${moveToCol + 1}`;
                        
                        this.moves++;
                        moveCounter.textContent = this.moves;
                        
                        setTimeout(() => {
                            this.renderTiles();
                            
                            this.isAnimating = false;
                            
                            if (this.checkSolution()) {
                                this.puzzleSolved();
                            }
                        }, 210);
                    }
                },
                
                shufflePuzzle: function(moves) {
                    for (let i = 0; i < moves; i++) {
                        const possibleMoves = [];
                        if (this.emptyCell.row > 0) {
                            possibleMoves.push({ row: this.emptyCell.row - 1, col: this.emptyCell.col });
                        }
                        if (this.emptyCell.row < gameOptions.gridSize - 1) {
                            possibleMoves.push({ row: this.emptyCell.row + 1, col: this.emptyCell.col });
                        }
                        if (this.emptyCell.col > 0) {
                            possibleMoves.push({ row: this.emptyCell.row, col: this.emptyCell.col - 1 });
                        }
                        if (this.emptyCell.col < gameOptions.gridSize - 1) {
                            possibleMoves.push({ row: this.emptyCell.row, col: this.emptyCell.col + 1 });
                        }
                        
                        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                        
                        const value = this.grid[move.row][move.col];
                        this.grid[this.emptyCell.row][this.emptyCell.col] = value;
                        this.grid[move.row][move.col] = 0;
                        this.emptyCell = { row: move.row, col: move.col };
                    }
                    
                    this.renderTiles();
                },
                
                checkSolution: function() {
                    let correct = true;
                    
                    for (let row = 0; row < gameOptions.gridSize; row++) {
                        for (let col = 0; col < gameOptions.gridSize; col++) {
                            const expected = row * gameOptions.gridSize + col + 1;
                            if (row === gameOptions.gridSize - 1 && col === gameOptions.gridSize - 1) {
                                if (this.grid[row][col] !== 0) {
                                    correct = false;
                                }
                            } else if (this.grid[row][col] !== expected) {
                                correct = false;
                            }
                        }
                    }
                    
                    return correct;
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
                        
                        if (remaining <= 0 && !this.solved) {
                            this.gameOver(false, 'Time\'s up!');
                        }
                    }, 100);
                },
                
                stopTimer: function() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                puzzleSolved: function() {
                    this.solved = true;
                    this.stopTimer();
                    
                    puzzleInfo.textContent = 'Puzzle solved!';
                    puzzleInfo.style.color = '#2ecc71';
                    
                    document.querySelectorAll('.puzzle-tile').forEach(tile => {
                        tile.style.backgroundColor = '#2ecc71';
                        tile.style.transition = 'background-color 0.5s';
                    });
                    
                    const timeUsed = (Date.now() - this.startTime) / 1000;
                    
                    setTimeout(() => {
                        completeCallback(true, 100, {
                            moves: this.moves,
                            timeUsed: timeUsed
                        });
                    }, 1500);
                },
                
                gameOver: function(success, message) {
                    this.stopTimer();
                    
                    puzzleInfo.textContent = message || 'Game over!';
                    puzzleInfo.style.color = '#e74c3c';
                    
                    if (!success) {
                        document.querySelectorAll('.puzzle-tile').forEach(tile => {
                            tile.style.backgroundColor = '#e74c3c';
                            tile.style.transition = 'background-color 0.5s';
                        });
                    }
                    
                    setTimeout(() => {
                        completeCallback(false, 0, {
                            moves: this.moves,
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
            
            return () => {
                game.stopTimer();
            };
        }
    };
})();