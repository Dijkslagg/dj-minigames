const MemoryGame = {
    gameConfig: null,
    timerInterval: null,
    currentSequence: [],
    playerSequence: [],
    currentRound: 0,
    totalRounds: 1,
    isMemorizingPhase: false,

    startGame(config) {
        this.gameConfig = config;
        this.currentRound = 1;
        this.totalRounds = config.rounds || 1;
        
        document.querySelector('#hacking-game h2').textContent = 'Memory Sequence';
        
        this.startNewRound();
    },

    startNewRound() {
        const statusText = document.getElementById('status-text');
        statusText.className = 'text-white text-xl text-center';
        
        this.currentSequence = this.generateLetterSequence(this.gameConfig.letters);
        this.playerSequence = [];
        this.isMemorizingPhase = true;
        
        this.createLetterGrid();
        this.startProgressBar(this.gameConfig.timeout);
        
        statusText.textContent = `Round ${this.currentRound}/${this.totalRounds} - Memorize the sequence!`;
        
        document.removeEventListener('keydown', (e) => this.handleKeyPress(e));
        
        setTimeout(() => {
            this.isMemorizingPhase = false;
            statusText.textContent = `Round ${this.currentRound}/${this.totalRounds} - Type the letters in order!`;
            document.querySelectorAll('.letter-btn').forEach(btn => {
                btn.textContent = '?';
            });
            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        }, 3000);
    },

    createLetterGrid() {
        const grid = document.getElementById('letters-grid');
        grid.innerHTML = '';
        grid.className = 'grid grid-cols-3 gap-2 mb-4';
        
        this.currentSequence.forEach(letter => {
            const button = document.createElement('button');
            button.className = 'letter-btn bg-gray-800 text-white font-bold py-4 px-6 rounded text-2xl transition-colors';
            button.textContent = letter;
            button.dataset.letter = letter;
            grid.appendChild(button);
        });
    },

    generateLetterSequence(size) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const sequence = [];
        while (sequence.length < size) {
            const letter = letters[Math.floor(Math.random() * letters.length)];
            if (!sequence.includes(letter)) sequence.push(letter);
        }
        return sequence;
    },

    startProgressBar(seconds) {
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = '100%';
        
        const interval = 100;
        const steps = (seconds * 1000) / interval;
        let currentStep = 0;
        
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            currentStep++;
            const progress = 100 - (currentStep / steps * 100);
            progressBar.style.width = `${progress}%`;
            
            if (currentStep >= steps) {
                clearInterval(this.timerInterval);
                if (!this.isMemorizingPhase) this.completeHacking(false);
            }
        }, interval);
    },

    handleKeyPress(e) {
        if (this.isMemorizingPhase) return;
        
        const pressedKey = e.key.toUpperCase();
        const expectedLetter = this.currentSequence[this.playerSequence.length];
        
        if (pressedKey === expectedLetter) {
            const buttons = document.querySelectorAll('.letter-btn');
            const targetButton = buttons[this.playerSequence.length];
            this.playerSequence.push(pressedKey);
            targetButton.textContent = pressedKey;
            targetButton.classList.remove('bg-gray-800');
            targetButton.classList.add('bg-green-600');
            
            if (this.playerSequence.length === this.currentSequence.length) {
                this.completeHacking(true);
            }
        } else {
            document.querySelectorAll('.letter-btn').forEach((btn, index) => {
                btn.classList.remove('bg-gray-800');
                btn.classList.add('bg-red-600');
                btn.textContent = this.currentSequence[index];
            });
            this.completeHacking(false);
        }
    },

    completeHacking(success) {
        if (success && this.currentRound < this.totalRounds) {
            this.currentRound++;
            const statusText = document.getElementById('status-text');
            statusText.textContent = 'Round Complete!';
            statusText.className = 'text-green-500 text-2xl text-center font-bold';
            
            setTimeout(() => {
                this.startNewRound();
            }, 1500);
            return;
        }

        document.removeEventListener('keydown', (e) => this.handleKeyPress(e));
        clearInterval(this.timerInterval);
        
        const statusText = document.getElementById('status-text');
        statusText.textContent = success ? 'HACK SUCCESSFUL!' : 'HACK FAILED!';
        statusText.className = success ? 
            'text-green-500 text-2xl text-center font-bold' : 
            'text-red-500 text-2xl text-center font-bold';
        
        fetch(`https://${GetParentResourceName()}/hackingComplete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: success
            })
        });
        
        setTimeout(() => {
            document.body.classList.add('hidden');
            this.playerSequence = [];
            this.currentSequence = [];
            this.currentRound = 0;
            statusText.className = 'text-white text-xl text-center';
        }, 1500);
    }
};

window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.action === "startHack" && data.type === "memory") {
        document.body.classList.remove('hidden');
        MemoryGame.startGame(data);
    }
});