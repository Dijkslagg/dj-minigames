Config = {
    MemorySequence = {
        MaxLetters = 30,
        MinLetters = 1,
        DefaultLetters = 6,
        
        MinRounds = 1,
        DefaultRounds = 1,
        
        MinTime = 1000,
        DefaultTime = 10000
    },
    VoltageMatch = {
        MaxVoltages = 8,
        MinVoltages = 2,
        DefaultVoltages = 4,
        
        MinRounds = 1,
        DefaultRounds = 1,
        
        MinTime = 1000,
        DefaultTime = 10000,
        Tolerance = 0 -- how close the player needs to be to the correct voltage
    }
}