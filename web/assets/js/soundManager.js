const soundManager = {
    sounds: {},
    categories: {
        ui: ['click'],
        gameplay: ['start']
    },
    muted: false,
    globalVolume: 0.4,
    categoryVolumes: {
        ui: 0.4,
        gameplay: 0.4
    },
    
    loadingCount: 0,
    loadedCount: 0,
    initialized: false,

    getCategory: function(soundName) {
        for (const category in this.categories) {
            if (this.categories[category].includes(soundName)) {
                return category;
            }
        }
        return 'default';
    },

    loadSound: function(name, url) {
        const fullUrl = `nui://dj-minigames/web/${url}`;
        this.sounds[name] = new Howl({
            src: [fullUrl],
            volume: 0.7,
            preload: true,
            onload: () => {
                this.loadedCount++;
                
                if (this.loadedCount === this.loadingCount) {
                    this.initialized = true;
                    document.dispatchEvent(new Event('soundsLoaded'));
                }
            },
            onloaderror: (id, error) => {
                console.error(`Error loading sound: ${name}`, error);
                this.loadedCount++;
            }
        });
        return this.sounds[name];
    },

    play: function(name, volume = null) {
        if (this.muted) return;
        
        if (this.sounds[name]) {
            try {
                const category = this.getCategory(name);
                const categoryVol = this.categoryVolumes[category] || 1;
                const finalVolume = volume !== null ? volume : (categoryVol * this.globalVolume);
                
                this.sounds[name].volume(finalVolume);
                this.sounds[name].play();
            } catch (e) {
                console.error("Error playing sound:", e);
            }
        } else {
            console.warn(`Sound not found: ${name}`);
        }
    },

    setGlobalVolume: function(volume) {
        this.globalVolume = Math.max(0, Math.min(1, volume));
        for (const name in this.sounds) {
            const category = this.getCategory(name);
            const categoryVol = this.categoryVolumes[category] || 1;
            this.sounds[name].volume(this.globalVolume * categoryVol);
        }
    },
    
    setCategoryVolume: function(category, volume) {
        if (this.categoryVolumes[category] !== undefined) {
            this.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
            
            if (this.categories[category]) {
                this.categories[category].forEach(soundName => {
                    if (this.sounds[soundName]) {
                        this.sounds[soundName].volume(this.globalVolume * this.categoryVolumes[category]);
                    }
                });
            }
        }
    },
    
    toggleMute: function() {
        this.muted = !this.muted;
        for (const name in this.sounds) {
            this.sounds[name].mute(this.muted);
        }
        return this.muted;
    },
    
    setMute: function(state) {
        this.muted = !!state;
        for (const name in this.sounds) {
            this.sounds[name].mute(this.muted);
        }
    },

    init: function() {
        const soundsToLoad = [
            { name: 'click', url: 'assets/sounds/click.mp3' },
            { name: 'start', url: 'assets/sounds/start.mp3' }
        ];
        
        this.loadingCount = soundsToLoad.length;
        soundsToLoad.forEach(sound => {
            this.loadSound(sound.name, sound.url);
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    soundManager.init();
});

window.soundManager = soundManager;