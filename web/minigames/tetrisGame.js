(function() {
    games.tetris = {
        init: function(container, options, completeCallback) {
            container.innerHTML = '';
            
            const gameOptions = {
                timeLimit: options.timeLimit || 60000,  
                targetScore: options.targetScore || 5,  
                difficulty: options.difficulty || 'normal',
                ...options
            };
            
            let dropSpeed = 800;  
            if (gameOptions.difficulty === 'easy') {
                dropSpeed = 1000;
            } else if (gameOptions.difficulty === 'hard') {
                dropSpeed = 600;
            }
            
            container.innerHTML = `
            <div style="padding: 15px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="text-align: center; margin-bottom: 5px; margin-top: 0;">Block Stacker</h2>
                    <div id="tetris-info" style="text-align: center; font-size: 18px; margin-bottom: 5px;">
                        Clear lines to win!
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: center;">
                            <div>Score: <span id="score-counter">0</span>/<span id="target-score">${gameOptions.targetScore}</span></div>
                        </div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; justify-content: center; align-items: center; width: 100%;">
                    <div style="display: flex; gap: 20px; align-items: center; justify-content: center;">
                        <div id="game-board" style="
                            width: 300px;
                            height: 560px;
                            background-color: #343d46;
                            border: 2px solid #65737e;
                            position: relative;
                            display: grid;
                            grid-template-columns: repeat(10, 1fr);
                            grid-template-rows: repeat(20, 1fr);
                            gap: 1px;
                        "></div>
                        
                        <div style="display: flex; flex-direction: column; gap: 20px; align-items: center; width: 140px;">
                            <div style="width: 100%">
                                <div style="text-align: center; margin-bottom: 5px;">Next</div>
                                <div id="next-piece" style="
                                    width: 100px;
                                    height: 100px;
                                    background-color: #343d46;
                                    border: 2px solid #65737e;
                                    display: grid;
                                    grid-template-columns: repeat(4, 1fr);
                                    grid-template-rows: repeat(4, 1fr);
                                    gap: 1px;
                                    margin: 0 auto;
                                "></div>
                            </div>
                            
                            <div id="controls" style="text-align: center; width: 100%;">
                                <div style="margin-bottom: 15px;">Controls:</div>
                                <div>← → : Move</div>
                                <div>↑ : Rotate</div>
                                <div>↓ : Drop</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px; margin-bottom: 10px;">
                    <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                </div>
            </div>
            `;
            
            const gameBoard = document.getElementById('game-board');
            const nextPieceDisplay = document.getElementById('next-piece');
            const scoreCounter = document.getElementById('score-counter');
            const targetScore = document.getElementById('target-score');
            const infoText = document.getElementById('tetris-info');
            const timerBar = document.getElementById('timer-bar');
            
            const tetrominoes = [
                { // I-piece
                    shape: [
                        [0, 0, 0, 0],
                        [1, 1, 1, 1],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    color: '#3498db' // Blue
                },
                { // J-piece
                    shape: [
                        [1, 0, 0],
                        [1, 1, 1],
                        [0, 0, 0]
                    ],
                    color: '#9b59b6' // Purple
                },
                { // L-piece
                    shape: [
                        [0, 0, 1],
                        [1, 1, 1],
                        [0, 0, 0]
                    ],
                    color: '#e67e22' // Orange
                },
                { // O-piece
                    shape: [
                        [1, 1],
                        [1, 1]
                    ],
                    color: '#f1c40f' // Yellow
                },
                { // S-piece
                    shape: [
                        [0, 1, 1],
                        [1, 1, 0],
                        [0, 0, 0]
                    ],
                    color: '#2ecc71' // Green
                },
                { // T-piece
                    shape: [
                        [0, 1, 0],
                        [1, 1, 1],
                        [0, 0, 0]
                    ],
                    color: '#e74c3c' // Red
                },
                { // Z-piece
                    shape: [
                        [1, 1, 0],
                        [0, 1, 1],
                        [0, 0, 0]
                    ],
                    color: '#1abc9c' // Teal
                }
            ];
            
            const game = {
                board: [],
                currentPiece: null,
                nextPiece: null,
                score: 0,
                timer: null,
                startTime: null,
                gameOver: false,
                dropInterval: null,
                dropSpeed: dropSpeed,
                keyHandler: null, 
                
                init: function() {
                    this.board = Array(20).fill().map(() => Array(10).fill(0));
                    
                    this.currentPiece = this.createPiece();
                    this.nextPiece = this.createPiece();
                    
                    this.renderBoard();
                    this.renderNextPiece();
                    
                    this.setupControls();
                    
                    this.startTime = Date.now();
                    this.startTimer();
                    this.startDropping();
                },
                
                createPiece: function() {
                    const index = Math.floor(Math.random() * tetrominoes.length);
                    const tetromino = tetrominoes[index];
                    
                    return {
                        shape: JSON.parse(JSON.stringify(tetromino.shape)),
                        color: tetromino.color,
                        x: Math.floor((10 - tetromino.shape[0].length) / 2),
                        y: 0
                    };
                },
                
                renderBoard: function() {
                    gameBoard.innerHTML = '';
                    
                    const virtualBoard = JSON.parse(JSON.stringify(this.board));
                    if (this.currentPiece && !this.gameOver) {
                        const shape = this.currentPiece.shape;
                        for (let y = 0; y < shape.length; y++) {
                            for (let x = 0; x < shape[y].length; x++) {
                                if (shape[y][x] && 
                                    this.currentPiece.y + y >= 0 && 
                                    this.currentPiece.y + y < virtualBoard.length && 
                                    this.currentPiece.x + x >= 0 && 
                                    this.currentPiece.x + x < virtualBoard[0].length) {
                                    virtualBoard[this.currentPiece.y + y][this.currentPiece.x + x] = 2; 
                                }
                            }
                        }
                    }
                    
                    for (let y = 0; y < virtualBoard.length; y++) {
                        for (let x = 0; x < virtualBoard[y].length; x++) {
                            const cell = document.createElement('div');
                            cell.style.gridRow = `${y + 1}`;
                            cell.style.gridColumn = `${x + 1}`;
                            
                            if (virtualBoard[y][x] === 1) {
                                cell.style.backgroundColor = '#65737e'; 
                            } else if (virtualBoard[y][x] === 2) {
                                cell.style.backgroundColor = this.currentPiece.color;
                                cell.style.boxShadow = 'inset 0 0 2px rgba(255,255,255,0.5)';
                            } else {
                                cell.style.backgroundColor = 'rgba(255,255,255,0.03)';
                            }
                            
                            gameBoard.appendChild(cell);
                        }
                    }
                },
                
                renderNextPiece: function() {
                    nextPieceDisplay.innerHTML = '';
                    
                    const shape = this.nextPiece.shape;
                    const color = this.nextPiece.color;
                    
                    const offset = (4 - shape.length) / 2;
                    
                    for (let y = 0; y < 4; y++) {
                        for (let x = 0; x < 4; x++) {
                            const cell = document.createElement('div');
                            cell.style.gridRow = `${y + 1}`;
                            cell.style.gridColumn = `${x + 1}`;
                            
                            const shapeX = Math.floor(x - offset);
                            const shapeY = Math.floor(y - offset);
                            
                            if (shape[shapeY] && shape[shapeY][shapeX] === 1) {
                                cell.style.backgroundColor = color;
                                cell.style.boxShadow = 'inset 0 0 2px rgba(255,255,255,0.5)';
                            } else {
                                cell.style.backgroundColor = 'rgba(255,255,255,0.03)';
                            }
                            
                            nextPieceDisplay.appendChild(cell);
                        }
                    }
                },
                
                movePiece: function(dx, dy) {
                    if (this.gameOver) return false;
                    
                    this.currentPiece.x += dx;
                    this.currentPiece.y += dy;
                    
                    if (this.collides()) {
                        this.currentPiece.x -= dx;
                        this.currentPiece.y -= dy;
                        
                        if (dy > 0) {
                            this.lockPiece();
                            return true;
                        }
                        
                        return false;
                    }
                    
                    if ((dx !== 0) && window.soundManager) {
                        soundManager.play('click', 0.1);
                    }
                    
                    this.renderBoard();
                    return true;
                },
                
                rotatePiece: function() {
                    if (this.gameOver) return;
                    
                    const originalX = this.currentPiece.x;
                    const originalY = this.currentPiece.y;
                    const originalShape = JSON.parse(JSON.stringify(this.currentPiece.shape));
                    const size = this.currentPiece.shape.length;
                    
                    const rotatedShape = Array(size).fill().map(() => Array(size).fill(0));
                    for (let y = 0; y < size; y++) {
                        for (let x = 0; x < size; x++) {
                            rotatedShape[x][size - 1 - y] = originalShape[y][x];
                        }
                    }
                    
                    this.currentPiece.shape = rotatedShape;
                    
                    if (this.collides()) {
                        if (this.currentPiece.x + size > 10) {
                            this.currentPiece.x = 10 - size;
                            if (!this.collides()) {
                                if (window.soundManager) {
                                    soundManager.play('click', 0.2);
                                }
                                this.renderBoard();
                                return;
                            }
                        }
                        
                        if (this.currentPiece.x < 0) {
                            this.currentPiece.x = 0;
                            if (!this.collides()) {
                                if (window.soundManager) {
                                    soundManager.play('click', 0.2);
                                }
                                this.renderBoard();
                                return;
                            }
                        }
                        
                        if (this.currentPiece.y + size > 20) {
                            this.currentPiece.y = 20 - size;
                            if (!this.collides()) {
                                if (window.soundManager) {
                                    soundManager.play('click', 0.2);
                                }
                                this.renderBoard();
                                return;
                            }
                        }
                        
                        this.currentPiece.x = originalX;
                        this.currentPiece.y = originalY;
                        this.currentPiece.shape = originalShape;
                        return;
                    }
                    
                    if (window.soundManager) {
                        soundManager.play('click', 0.2);
                    }
                    
                    this.renderBoard();
                },
                
                collides: function() {
                    const shape = this.currentPiece.shape;
                    const x = this.currentPiece.x;
                    const y = this.currentPiece.y;
                    
                    for (let i = 0; i < shape.length; i++) {
                        for (let j = 0; j < shape[i].length; j++) {
                            if (shape[i][j]) {
                                if (y + i >= 20 || x + j < 0 || x + j >= 10) {
                                    return true;
                                }
                                
                                if (y + i >= 0 && this.board[y + i][x + j] === 1) {
                                    return true;
                                }
                            }
                        }
                    }
                    
                    return false;
                },
                
                lockPiece: function() {
                    const shape = this.currentPiece.shape;
                    const x = this.currentPiece.x;
                    const y = this.currentPiece.y;
                    
                    for (let i = 0; i < shape.length; i++) {
                        for (let j = 0; j < shape[i].length; j++) {
                            if (shape[i][j] && y + i >= 0) {
                                if (y + i < 20 && x + j >= 0 && x + j < 10) {
                                    this.board[y + i][x + j] = 1;
                                }
                            }
                        }
                    }
                    
                    const completedLines = this.checkLines();
                    
                    if (completedLines > 0) {
                        this.score += completedLines;
                        scoreCounter.textContent = this.score;
                        
                        if (this.score >= gameOptions.targetScore) {
                            this.endGame(true);
                            return;
                        }
                    }
                    
                    this.currentPiece = this.nextPiece;
                    this.nextPiece = this.createPiece();
                    this.renderNextPiece();
                    
                    if (this.collides()) {
                        this.endGame(false);
                        return;
                    }
                    
                    if (this.dropInterval) {
                        clearInterval(this.dropInterval);
                    }
                    this.startDropping();
                    
                    this.renderBoard();
                },
                
                checkLines: function() {
                    let completedLines = 0;
                    
                    for (let y = this.board.length - 1; y >= 0; y--) {
                        if (this.board[y].every(cell => cell === 1)) {
                            this.board.splice(y, 1);
                            this.board.unshift(Array(10).fill(0));
                            y++;
                            completedLines++;
                            
                            if (window.soundManager) {
                                soundManager.play('click', 0.4);
                            }
                        }
                    }
                    
                    return completedLines;
                },
                
                setupControls: function() {
                    this.keyHandler = (e) => {
                        if (this.gameOver) return;
                        
                        switch (e.key) {
                            case 'ArrowLeft':
                                this.movePiece(-1, 0);
                                break;
                            case 'ArrowRight':
                                this.movePiece(1, 0);
                                break;
                            case 'ArrowDown':
                                this.movePiece(0, 1);
                                break;
                            case 'ArrowUp':
                                this.rotatePiece();
                                break;
                        }
                    };
                    
                    document.addEventListener('keydown', this.keyHandler);
                },
                
                startDropping: function() {
                    if (this.dropInterval) {
                        clearInterval(this.dropInterval);
                    }
                    
                    this.dropInterval = setInterval(() => {
                        this.movePiece(0, 1);
                    }, this.dropSpeed);
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
                    
                    if (this.dropInterval) {
                        clearInterval(this.dropInterval);
                        this.dropInterval = null;
                    }
                },
                
                endGame: function(success, message) {
                    this.gameOver = true;
                    this.stopTimer();
                    
                    if (success) {
                        const timeUsed = (Date.now() - this.startTime) / 1000;
                        infoText.textContent = `Victory! Lines cleared: ${this.score}`;
                        infoText.style.color = '#2ecc71';
                        
                        setTimeout(() => {
                            completeCallback(true, this.score * 10, {
                                timeUsed: timeUsed,
                                linesCleared: this.score
                            });
                        }, 1500);
                    } else {
                        infoText.textContent = message || 'Game Over!';
                        infoText.style.color = '#e74c3c';
                        
                        setTimeout(() => {
                            completeCallback(false, 0, {
                                linesCleared: this.score
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
                game.stopTimer();
                if (game.keyHandler) {
                    document.removeEventListener('keydown', game.keyHandler);
                }
            };
        }
    };
})();