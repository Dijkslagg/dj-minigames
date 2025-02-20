const VoltageGame = {
    gameConfig: null,
    timerInterval: null,
    currentRound: 0,
    totalRounds: 1,
    targetVoltages: [],
    playerVoltages: [],

    startGame(config) {
        this.gameConfig = config;
        this.currentRound = 1;
        this.totalRounds = config.rounds || 1;
        document.getElementById('game-title').textContent = 'Voltage Match';
        this.createVoltageGrid();
        this.startProgressBar(config.timeout);
        

    },

    createVoltageGrid() {
        const grid = document.getElementById('letters-grid');
        grid.innerHTML = '';
        grid.className = 'grid grid-cols-2 gap-4 mb-4';
        
        this.targetVoltages = [];
        this.playerVoltages = [];
        
        for (let i = 0; i < this.gameConfig.voltages; i++) {
            const voltage = Math.floor(Math.random() * 100);
            this.targetVoltages.push(voltage);
            this.playerVoltages.push(50); 
            
            const targetDiv = document.createElement('div');
            targetDiv.className = 'bg-gray-800 p-4 rounded text-center';
            targetDiv.innerHTML = `
                <div class="text-white mb-2">Target ${i + 1}</div>
                <div class="text-green-500 text-2xl">${voltage}v</div>
            `;
            
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'bg-gray-800 p-4 rounded';
            sliderContainer.innerHTML = `
                <div class="text-white mb-2">Match ${i + 1}</div>
                <input type="range" 
                       min="0" 
                       max="100" 
                       value="50"
                       class="w-full"
                       data-index="${i}"
                >
                <div class="text-blue-500 text-2xl voltage-value">50v</div>
            `;
            
            const slider = sliderContainer.querySelector('input');
            const valueDisplay = sliderContainer.querySelector('.voltage-value');
            
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                const index = parseInt(e.target.dataset.index);
                valueDisplay.textContent = `${value}v`;
                this.playerVoltages[index] = parseInt(value);
                this.checkVoltages();
            });
            
            grid.appendChild(targetDiv);
            grid.appendChild(sliderContainer);
        }
    },

    checkVoltages() {
        const allMatch = this.targetVoltages.every((target, index) => {
            return Math.abs(target - this.playerVoltages[index]) <= (this.gameConfig.tolerance || 0);
        });
        
        if (allMatch) {
            this.completeHacking(true);
        }
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
                this.completeHacking(false);
            }
        }, interval);
    },

    completeHacking(success) {
        clearInterval(this.timerInterval);
        
        const statusText = document.getElementById('status-text');
        statusText.textContent = success ? 'VOLTAGE MATCHED!' : 'TIME EXPIRED!';
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
            this.targetVoltages = [];
            this.playerVoltages = [];
            statusText.className = 'text-white text-xl text-center';
        }, 1500);
    }
};

window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.action === "startHack" && data.type === "voltage") {
        document.body.classList.remove('hidden');
        VoltageGame.startGame(data);
    }
});