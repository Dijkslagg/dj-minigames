const config = {
    colors: {
        backgroundDark: "#343d46",
        backgroundMedium: "#4f5b66",
        backgroundLight: "#65737e",
        textLight: "#a7adba",
        textLightest: "#c0c5ce"
    },
    font: "'Roboto Condensed', sans-serif"
};

function ensureFontStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .game-content-wrapper * {
            font-family: ${config.font};
        }
    `;
    document.head.appendChild(style);
    
    const gameContent = document.getElementById('game-content');
    if (gameContent) {
        gameContent.classList.add('game-content-wrapper');
    }
}

window.addEventListener('DOMContentLoaded', ensureFontStyles);

const games = {};

function initGameApp() {
    const app = Vue.createApp({
        data() {
            return {
                gameActive: false,
                currentGame: null,
                gameOptions: {},
                containerStyle: {
                    width: '600px',
                    height: '400px'
                }
            }
        },
        methods: {
            startGame(gameName, options) {
                if (!games[gameName]) {
                    console.error(`Game ${gameName} not found!`);
                    return;
                }
                
                this.gameActive = true;
                this.currentGame = gameName;
                this.gameOptions = options || {};
                
                if (gameName === 'matching' && options.gridSize) {
                    const gridSize = options.gridSize;
                    
                    if (gridSize > 5) {
                        this.containerStyle.width = `${Math.min(800, 500 + (gridSize * 25))}px`;
                        this.containerStyle.height = `${Math.min(800, 500 + (gridSize * 25))}px`;
                    } else {
                        this.containerStyle.width = '650px';
                        this.containerStyle.height = '650px';
                    }
                }
                if (gameName === 'memory' && options.gridSize) {
                    const gridSize = options.gridSize;
                    if (gridSize > 5) {
                        this.containerStyle.width = `${Math.min(800, 500 + (gridSize * 25))}px`;
                        this.containerStyle.height = `${Math.min(800, 500 + (gridSize * 25))}px`;
                    } else {
                        this.containerStyle.width = '650px';
                        this.containerStyle.height = '600px';
                    }
                }
                if (gameName === 'numberrecall') {
                    if (options.length > 10) {
                        this.containerStyle.width = '600px';
                        this.containerStyle.height = '650px';
                    } else {
                        this.containerStyle.width = '550px';
                        this.containerStyle.height = '550px';
                    }
                }
                if (gameName === 'tetris') {
                    this.containerStyle.width = '650px';
                    this.containerStyle.height = '750px'; 
                }
                if (gameName === 'maze') {
                    this.containerStyle.width = '650px'; 
                    this.containerStyle.height = '750px'; 
                    
                    if (options.size) {
                        const size = options.size;
                        if (size > 15) {
                            this.containerStyle.width = '700px';
                            this.containerStyle.height = '800px';
                        } else if (size < 8) {
                            this.containerStyle.width = '600px';
                            this.containerStyle.height = '700px';
                        }
                    }
                }
                if (gameName === 'slidingpuzzle' && options.gridSize) {
                    const gridSize = options.gridSize;
                    
                    if (gridSize >= 4) {
                        this.containerStyle.width = `${Math.min(800, 500 + (gridSize * 30))}px`;
                        this.containerStyle.height = `${Math.min(800, 500 + (gridSize * 30))}px`;
                    } else {
                        this.containerStyle.width = '600px';
                        this.containerStyle.height = '600px';
                    }
                }
                
                if (options.width) this.containerStyle.width = options.width;
                if (options.height) this.containerStyle.height = options.height;
                
                document.body.style.display = 'block';
                
                setTimeout(() => {
                    games[gameName].init(
                        document.getElementById('game-content'),
                        options,
                        this.completeGame
                    );
                }, 100);
            },
            
            completeGame(success, score, gameData) {
                this.gameActive = false;
                document.body.style.display = 'none';
                
                fetch('https://dj-minigames/gameResult', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ success, score, gameData })
                });
            }
        },
        
        mounted() {
            window.addEventListener('message', (event) => {
                const data = event.data;
                
                if (data.action === 'startGame') {
                    this.startGame(data.game, data.options);
                }
            });
        }
    });
    
    window.addEventListener('DOMContentLoaded', () => {
        app.mount('#app');
    });
    
    window.games = games;
    
    return app;
}

const gameApp = initGameApp();

window.gameApp = gameApp;