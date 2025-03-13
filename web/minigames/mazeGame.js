(function() {
    games.maze = {
        init: function(container, options, completeCallback) {
            container.innerHTML = '';
            
            const gameOptions = {
                size: options.size || 10,  
                timeLimit: options.timeLimit || 45000,  
                difficulty: options.difficulty || 'normal',
                ...options
            };
            
            container.innerHTML = `
            <div style="padding: 15px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h2 style="text-align: center; margin-bottom: 8px; margin-top: 0;">Maze Escape</h2>
                <div style="text-align: center; font-size: 18px;">Generating maze...</div>
            </div>
            `;

            const game = {
                maze: [],
                playerPos: { x: 0, y: 0 },
                exitPos: { x: 0, y: 0 },
                cellSize: 0,
                timer: null,
                startTime: null,
                keyHandler: null,
                gameOver: false,
                
                init: function() {
                    this.generateMaze(gameOptions.size, complexity);
                    
                    renderUI();
                    
                    this.setupMazeDOM();
                    this.setupControls();
                    
                    this.startTime = Date.now();
                    this.startTimer();
                },
                
                generateMaze: function(size, complexity) {
                    this.maze = Array(size).fill().map(() => Array(size).fill(1));
                    
                    this.maze[0][0] = 0;
                    this.playerPos = { x: 0, y: 0 };
                    
                    const exitQuadrant = Math.max(Math.floor(size * 0.6), size - 5);
                    let exitX = Math.floor(Math.random() * (size - exitQuadrant)) + exitQuadrant;
                    let exitY = Math.floor(Math.random() * (size - exitQuadrant)) + exitQuadrant;
                    
                    const minDistance = size * 0.75; 
                    while ((exitX + exitY) < minDistance) {
                        exitX = Math.floor(Math.random() * (size - exitQuadrant)) + exitQuadrant;
                        exitY = Math.floor(Math.random() * (size - exitQuadrant)) + exitQuadrant;
                    }
                    
                    this.exitPos = { x: exitX, y: exitY };
                    this.maze[exitY][exitX] = 0;
                    
                    this.recursiveBacktrack(0, 0);
                    
                    this.createDirectPathIfNeeded();
                },
                
                recursiveBacktrack: function(x, y) {
                    this.maze[y][x] = 0;
                    
                    const directions = this.shuffleArray([[0, -2], [2, 0], [0, 2], [-2, 0]]);
                    
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < this.maze[0].length && ny >= 0 && ny < this.maze.length && this.maze[ny][nx] === 1) {
                            this.maze[y + dy/2][x + dx/2] = 0;
                            this.recursiveBacktrack(nx, ny);
                        }
                    }
                },
                
                createDirectPathIfNeeded: function() {
                    const visited = Array(this.maze.length).fill().map(() => Array(this.maze[0].length).fill(false));
                    let pathExists = false;
                    
                    const checkPath = (x, y) => {
                        if (x === this.exitPos.x && y === this.exitPos.y) {
                            pathExists = true;
                            return true;
                        }
                        
                        visited[y][x] = true;
                        
                        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                        for (const [dx, dy] of directions) {
                            const nx = x + dx;
                            const ny = y + dy;
                            
                            if (nx >= 0 && nx < this.maze[0].length && 
                                ny >= 0 && ny < this.maze.length && 
                                this.maze[ny][nx] === 0 && !visited[ny][nx]) {
                                if (checkPath(nx, ny)) return true;
                            }
                        }
                        
                        return false;
                    };
                    
                    checkPath(0, 0);
                    
                    if (!pathExists) {
                        const path = this.findPath(0, 0, this.exitPos.x, this.exitPos.y);
                        for (const {x, y} of path) {
                            this.maze[y][x] = 0;
                        }
                    }
                },
                
                findPath: function(startX, startY, endX, endY) {
                    const openSet = [{x: startX, y: startY, f: 0, g: 0, h: 0, parent: null}];
                    const closedSet = new Set();
                    const getKey = (x, y) => `${x},${y}`;
                    
                    while (openSet.length > 0) {
                        let currentIndex = 0;
                        for (let i = 0; i < openSet.length; i++) {
                            if (openSet[i].f < openSet[currentIndex].f) {
                                currentIndex = i;
                            }
                        }
                        
                        const current = openSet[currentIndex];
                        
                        if (current.x === endX && current.y === endY) {
                            const path = [];
                            let temp = current;
                            while (temp !== null) {
                                path.push({x: temp.x, y: temp.y});
                                temp = temp.parent;
                            }
                            return path.reverse();
                        }
                        
                        openSet.splice(currentIndex, 1);
                        closedSet.add(getKey(current.x, current.y));
                        
                        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                        for (const [dx, dy] of directions) {
                            const nx = current.x + dx;
                            const ny = current.y + dy;
                            
                            if (nx < 0 || nx >= this.maze[0].length || ny < 0 || ny >= this.maze.length) continue;
                            
                            if (closedSet.has(getKey(nx, ny))) continue;
                            
                            const g = current.g + 1;
                            const h = Math.abs(nx - endX) + Math.abs(ny - endY);
                            const f = g + h;
                            
                            const existingNode = openSet.find(node => node.x === nx && node.y === ny);
                            if (existingNode && g >= existingNode.g) continue;
                            
                            if (!existingNode) {
                                openSet.push({x: nx, y: ny, f, g, h, parent: current});
                            } else {
                                existingNode.f = f;
                                existingNode.g = g;
                                existingNode.parent = current;
                            }
                        }
                    }
                    
                    const path = [];
                    let x = startX;
                    let y = startY;
                    
                    while (x !== endX || y !== endY) {
                        path.push({x, y});
                        if (x < endX) x++;
                        else if (x > endX) x--;
                        
                        if (y < endY) y++;
                        else if (y > endY) y--;
                    }
                    
                    path.push({x: endX, y: endY});
                    return path;
                },
                
                setupMazeDOM: function() {
                    mazeContainer.innerHTML = '';
                    
                    const size = this.maze.length;
                    const containerWidth = mazeContainer.offsetWidth || 300;
                    const containerHeight = mazeContainer.offsetHeight || 300;
                    
                    this.cellSize = Math.floor(Math.min(containerWidth, containerHeight) / size);
                    
                    const gridContainer = document.createElement('div');
                    gridContainer.style.position = 'relative';
                    gridContainer.style.width = `${this.cellSize * size}px`;
                    gridContainer.style.height = `${this.cellSize * size}px`;
                    gridContainer.style.margin = '0 auto';
                    
                    mazeContainer.appendChild(gridContainer);
                    
                    for (let y = 0; y < size; y++) {
                        for (let x = 0; x < size; x++) {
                            const cell = document.createElement('div');
                            cell.id = `cell-${x}-${y}`;
                            cell.className = 'maze-cell';
                            cell.style.position = 'absolute';
                            cell.style.width = `${this.cellSize}px`;
                            cell.style.height = `${this.cellSize}px`;
                            cell.style.left = `${x * this.cellSize}px`;
                            cell.style.top = `${y * this.cellSize}px`;
                            
                            if (this.maze[y][x] === 1) {
                                cell.style.backgroundColor = '#65737e'; 
                            } else {
                                cell.style.backgroundColor = '#343d46'; 
                            }
                            
                            if (x === 0 && y === 0) {
                                cell.style.backgroundColor = '#3498db'; 
                                cell.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 10px;">START</div>';
                            }
                            
                            if (x === this.exitPos.x && y === this.exitPos.y) {
                                if (visibleExit) {
                                    cell.style.backgroundColor = '#2ecc71'; 
                                    cell.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 10px;">EXIT</div>';
                                }
                            }
                            
                            if (fogOfWar) {
                                cell.style.opacity = '0.1';
                            }
                            
                            gridContainer.appendChild(cell);
                        }
                    }
                    
                    const player = document.createElement('div');
                    player.id = 'player';
                    player.style.position = 'absolute';
                    player.style.width = `${this.cellSize - 4}px`;
                    player.style.height = `${this.cellSize - 4}px`;
                    player.style.left = `${this.playerPos.x * this.cellSize + 2}px`;
                    player.style.top = `${this.playerPos.y * this.cellSize + 2}px`;
                    player.style.backgroundColor = '#3498db';
                    player.style.borderRadius = '50%';
                    player.style.boxShadow = '0 0 5px rgba(255,255,255,0.5)';
                    player.style.zIndex = '10';
                    player.style.transition = 'left 0.2s, top 0.2s';
                    
                    gridContainer.appendChild(player);
                    
                    if (fogOfWar) {
                        this.updateVisibility();
                    }
                },
                
                updateVisibility: function() {
                    if (!fogOfWar) return;
                    
                    const size = this.maze.length;
                    
                    for (let y = 0; y < size; y++) {
                        for (let x = 0; x < size; x++) {
                            const distance = Math.abs(x - this.playerPos.x) + Math.abs(y - this.playerPos.y);
                            let opacity = 0.1;
                            
                            if (distance <= visibilityRadius) {
                                opacity = 1 - (distance / (visibilityRadius + 2));
                                if (opacity < 0.1) opacity = 0.1;
                                if (opacity > 1) opacity = 1;
                            }
                            
                            const cell = document.getElementById(`cell-${x}-${y}`);
                            if (cell) {
                                cell.style.opacity = opacity.toString();
                            }
                        }
                    }
                },
                
                movePlayer: function(dx, dy) {
                    if (this.gameOver) return false;
                    
                    const newX = this.playerPos.x + dx;
                    const newY = this.playerPos.y + dy;
                    
                    if (newX < 0 || newX >= this.maze[0].length || 
                        newY < 0 || newY >= this.maze.length ||
                        this.maze[newY][newX] === 1) {
                        this.failOnWrongMove();
                        return false;
                    }
                    
                    this.playerPos.x = newX;
                    this.playerPos.y = newY;
                    
                    const player = document.getElementById('player');
                    player.style.left = `${this.playerPos.x * this.cellSize + 2}px`;
                    player.style.top = `${this.playerPos.y * this.cellSize + 2}px`;
                    
                    if (window.soundManager) {
                        soundManager.play('click', 0.2);
                    }
                    
                    if (fogOfWar) {
                        this.updateVisibility();
                    }
                    
                    if (this.playerPos.x === this.exitPos.x && this.playerPos.y === this.exitPos.y) {
                        const exitCell = document.getElementById(`cell-${this.exitPos.x}-${this.exitPos.y}`);
                        if (exitCell) {
                            exitCell.style.opacity = '1';
                            exitCell.style.backgroundColor = '#2ecc71';
                            exitCell.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 10px;">EXIT</div>';
                        }
                        
                        setTimeout(() => {
                            this.levelComplete();
                        }, 100);
                    }
                    
                    
                    return true;
                },
                
                failOnWrongMove: function() {
                    const player = document.getElementById('player');
                    player.style.backgroundColor = '#e74c3c'; 
                    player.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.8)';
                    
                    if (window.soundManager) {
                        soundManager.play('click', 0.5);
                    }
                    
                    mazeInfo.textContent = 'You hit a wall! Failed!';
                    mazeInfo.style.color = '#e74c3c';
                    
                    this.gameOver = true;
                    this.stopTimer();
                    
                    if (fogOfWar) {
                        const size = this.maze.length;
                        for (let y = 0; y < size; y++) {
                            for (let x = 0; x < size; x++) {
                                const cell = document.getElementById(`cell-${x}-${y}`);
                                if (cell) {
                                    cell.style.opacity = '1';
                                }
                                
                                if (this.maze[y][x] === 0) {
                                    const isOnPath = this.isOnPath(x, y);
                                    if (isOnPath) {
                                        cell.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
                                    }
                                }
                            }
                        }
                        
                        const exitCell = document.getElementById(`cell-${this.exitPos.x}-${this.exitPos.y}`);
                        if (exitCell) {
                            exitCell.style.backgroundColor = '#2ecc71';
                            exitCell.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 10px;">EXIT</div>';
                        }
                    }
                    
                    setTimeout(() => {
                        completeCallback(false, 0, { 
                            reason: 'hit_wall',
                            timeUsed: (Date.now() - this.startTime) / 1000,
                            mazeSize: gameOptions.size
                        });
                    }, 2000);
                },
                
                isOnPath: function(x, y) {
                    if (x === 0 && y === 0) return true;
                    if (x === this.exitPos.x && y === this.exitPos.y) return true;
                    
                    const mazeCopy = this.maze.map(row => row.slice());
                    
                    const queue = [{x: 0, y: 0, path: []}];
                    const visited = new Set();
                    visited.add('0,0');
                    
                    while (queue.length > 0) {
                        const current = queue.shift();
                        const currentPath = [...current.path, {x: current.x, y: current.y}];
                        
                        if (current.x === this.exitPos.x && current.y === this.exitPos.y) {
                            return currentPath.some(point => point.x === x && point.y === y);
                        }
                        
                        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                        for (const [dx, dy] of directions) {
                            const nx = current.x + dx;
                            const ny = current.y + dy;
                            const key = `${nx},${ny}`;
                            
                            if (nx >= 0 && nx < mazeCopy[0].length && 
                                ny >= 0 && ny < mazeCopy.length && 
                                mazeCopy[ny][nx] === 0 && !visited.has(key)) {
                                
                                queue.push({x: nx, y: ny, path: currentPath});
                                visited.add(key);
                            }
                        }
                    }
                    
                    return false;
                },
                
                setupControls: function() {
                    this.keyHandler = (e) => {
                        if (this.gameOver) return;
                        
                        switch (e.key) {
                            case 'ArrowUp':
                                this.movePlayer(0, -1);
                                e.preventDefault();
                                break;
                            case 'ArrowRight':
                                this.movePlayer(1, 0);
                                e.preventDefault();
                                break;
                            case 'ArrowDown':
                                this.movePlayer(0, 1);
                                e.preventDefault();
                                break;
                            case 'ArrowLeft':
                                this.movePlayer(-1, 0);
                                e.preventDefault();
                                break;
                        }
                    };
                    
                    document.addEventListener('keydown', this.keyHandler);
                    
                    this.setupTouchControls();
                },
                
                setupTouchControls: function() {
                    const controlsContainer = document.createElement('div');
                    controlsContainer.style.display = 'grid';
                    controlsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
                    controlsContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
                    controlsContainer.style.gap = '3px';
                    controlsContainer.style.width = '130px';
                    controlsContainer.style.height = '130px';
                    controlsContainer.style.margin = '0 auto';
                    
                    const createButton = (text, x, y, dx, dy) => {
                        const btn = document.createElement('button');
                        btn.textContent = text;
                        btn.style.gridColumn = x;
                        btn.style.gridRow = y;
                        
                        btn.style.backgroundColor = '#65737e'; 
                        btn.style.border = 'none';
                        btn.style.borderRadius = '4px';
                        btn.style.color = '#fff';
                        btn.style.fontSize = '24px';
                        btn.style.cursor = 'pointer';
                        btn.style.width = '100%';
                        btn.style.height = '100%';
                        btn.style.transition = 'transform 0.1s';
                        
                        btn.addEventListener('mouseover', () => {
                            btn.style.opacity = '0.85';
                        });
                        
                        btn.addEventListener('mouseout', () => {
                            btn.style.opacity = '1';
                        });
                        
                        btn.addEventListener('mousedown', () => {
                            btn.style.transform = 'scale(0.95)';
                        });
                        
                        btn.addEventListener('mouseup', () => {
                            btn.style.transform = 'scale(1)';
                        });
                        
                        btn.addEventListener('click', () => {
                            this.movePlayer(dx, dy);
                        });
                        
                        return btn;
                    };
                    
                    const upBtn = createButton('↑', 2, 1, 0, -1);
                    const rightBtn = createButton('→', 3, 2, 1, 0);
                    const downBtn = createButton('↓', 2, 3, 0, 1);
                    const leftBtn = createButton('←', 1, 2, -1, 0);
                    const centerBtn = createButton('', 2, 2, 0, 0);
                    centerBtn.style.backgroundColor = 'transparent';
                    centerBtn.style.cursor = 'default';
                    
                    controlsContainer.appendChild(upBtn);
                    controlsContainer.appendChild(rightBtn);
                    controlsContainer.appendChild(downBtn);
                    controlsContainer.appendChild(leftBtn);
                    controlsContainer.appendChild(centerBtn);
                    
                    document.getElementById('maze-controls').innerHTML = '';
                    document.getElementById('maze-controls').appendChild(controlsContainer);
                    
                },
                
                isValidMove: function(dx, dy) {
                    const newX = this.playerPos.x + dx;
                    const newY = this.playerPos.y + dy;
                    
                    return !(newX < 0 || newX >= this.maze[0].length || 
                             newY < 0 || newY >= this.maze.length || 
                             this.maze[newY][newX] === 1);
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
                            this.gameOver = true;
                            this.stopTimer();
                            mazeInfo.textContent = 'Time\'s up!';
                            mazeInfo.style.color = '#e74c3c';
                            
                            setTimeout(() => {
                                completeCallback(false, 0, { 
                                    timeUsed: gameOptions.timeLimit / 1000,
                                    mazeSize: gameOptions.size
                                });
                            }, 2000);
                        }
                    }, 100);
                },
                
                stopTimer: function() {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                },
                
                levelComplete: function() {
                    this.gameOver = true;
                    this.stopTimer();
                    
                    const timeUsed = (Date.now() - this.startTime) / 1000;
                    mazeInfo.textContent = 'Maze Escaped! Well done!';
                    mazeInfo.style.color = '#2ecc71';
                    
                    if (fogOfWar) {
                        const size = this.maze.length;
                        for (let y = 0; y < size; y++) {
                            for (let x = 0; x < size; x++) {
                                const cell = document.getElementById(`cell-${x}-${y}`);
                                if (cell) {
                                    cell.style.opacity = '1';
                                    
                                    if (x === this.exitPos.x && y === this.exitPos.y) {
                                        cell.style.backgroundColor = '#2ecc71';
                                        cell.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 10px;">EXIT</div>';
                                    }
                                }
                            }
                        }
                    }
                    
                    const baseScore = 100;
                    const timeBonus = Math.max(0, (gameOptions.timeLimit / 1000 - timeUsed) / (gameOptions.timeLimit / 1000));
                    const score = Math.round(baseScore * (0.5 + (timeBonus * 0.5)));
                    
                    setTimeout(() => {
                        completeCallback(true, score, { 
                            timeUsed: timeUsed,
                            mazeSize: gameOptions.size
                        });
                    }, 1500);
                },
                
                shuffleArray: function(array) {
                    for (let i = array.length - 1; i > 0; i--) {  
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                }
            };

            let complexity = 0.7;
            let visibleExit = true;
            let fogOfWar = false;
            let visibilityRadius = 3;
            let mazeContainer; 
            let mazeInfo;     
            let timerBar;   

            if (gameOptions.difficulty === 'easy') {
                complexity = 0.6;
                visibleExit = true;
                fogOfWar = false;
            } else if (gameOptions.difficulty === 'normal') {
                complexity = 0.7;
                visibleExit = true;
                fogOfWar = true;
                visibilityRadius = 3;
            } else if (gameOptions.difficulty === 'hard') {
                complexity = 0.8;
                visibleExit = false;
                fogOfWar = true;
                visibilityRadius = 2;
            }
            
            function renderUI() {
                container.innerHTML = `
                <div style="padding: 15px; color: #c0c5ce; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                    <h2 style="text-align: center; margin-bottom: 8px; margin-top: 0;">Maze Escape</h2>
                    <div id="maze-info" style="text-align: center; font-size: 18px; margin-bottom: 12px;">Find your way to the exit! Don't hit walls!</div>
                    
                    <div style="display: flex; justify-content: center; align-items: center; flex: 1; width: 100%; margin-bottom: 5px;">
                        <div id="maze-container" style="position: relative; width: 85%; max-width: 450px; aspect-ratio: 1/1; background-color: #343d46; border: 2px solid #65737e; overflow: hidden;"></div>
                    </div>
                    
                    <div id="maze-controls" style="text-align: center; width: 100%; margin: 10px 0;">
                        <div style="margin-bottom: 5px; color: #e74c3c;">Warning: Hitting walls results in failure!</div>
                        Use arrow keys to move
                    </div>
                    
                    <div style="width: 85%; background-color: #343d46; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 20px; margin-bottom: 10px;">
                        <div id="timer-bar" style="width: 100%; height: 100%; background-color: #2ecc71; transition: width 0.1s linear;"></div>
                    </div>
                </div>
                `;
                
                mazeContainer = document.getElementById('maze-container');
                mazeInfo = document.getElementById('maze-info');
                timerBar = document.getElementById('timer-bar');
            }

            setTimeout(() => {
                if (window.soundManager && !window.soundManager.initialized) {
                    document.addEventListener('soundsLoaded', function soundsReadyHandler() {
                        requestAnimationFrame(() => game.init());
                        document.removeEventListener('soundsLoaded', soundsReadyHandler);
                    });
                } else {
                    requestAnimationFrame(() => game.init());
                }
            }, 300);
            
            return function cleanup() {
                if (game.timer) {
                    clearInterval(game.timer);
                }
                if (game.keyHandler) {
                    document.removeEventListener('keydown', game.keyHandler);
                }
            };
        }
    };
})();