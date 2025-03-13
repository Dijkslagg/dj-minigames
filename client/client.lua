local isPlaying = false
local currentCallback = nil

-- RegisterCommand('testminigame', function(source, args)
    -- local success = exports['dj-minigames']:SlidingPuzzle(2, 2, 30)
--     -- local succes = exports['dj-minigames']:MemoryGame(4, 3, 15)
--     -- local success = exports['dj-minigames']:MatchingGame(5, 15, 10)
--     -- local success = exports['dj-minigames']:NumberRecallGame(5, 3, 10, 1, "normal")
--     -- local success = exports['dj-minigames']:TetrisGame("easy", 5, 120)
--     -- local success = exports['dj-minigames']:MazeGame("easy", 50, 45)
--     -- local success = exports['dj-minigames']:MathGame("hard", 5, 30)
--     if success then
--         print("Minigame passed!")
--     else
--         print("Minigame failed!")
--     end
-- end, false)



RegisterNUICallback('gameResult', function(data, cb)
    if currentCallback then
        currentCallback(data.success, data.score, data.gameData)
    end
    isPlaying = false
    SetNuiFocus(false, false)
    cb('ok')
end)

function StartMinigame(gameName, options, callback)
    if isPlaying then return false end
    
    isPlaying = true
    currentCallback = callback
    
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "startGame",
        game = gameName,
        options = options
    })
    
    return true
end


---@param difficulty number|string 1=easy, 2=normal, 3=hard or "easy", "normal", "hard"
---@param size number Grid size (3-6)
---@param timeLimit number Time limit in seconds (default: 30)
---@return boolean success True if player solved the puzzle
exports('SlidingPuzzle', function(difficulty, size, timeLimit)
    local p = promise.new()
    
    local difficultyText = "normal"
    if type(difficulty) == "number" then
        if difficulty == 1 then difficultyText = "easy"
        elseif difficulty == 3 then difficultyText = "hard"
        end
    elseif type(difficulty) == "string" then
        difficultyText = difficulty
    end
    
    size = math.min(6, math.max(2, size or 3)) 
    timeLimit = math.min(3600, math.max(5, timeLimit or 30)) 
    
    StartMinigame('slidingpuzzle', {
        gridSize = size,
        timeLimit = timeLimit * 1000,
        difficulty = difficultyText,
    }, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)



---@param gridSize number Grid size (2-8, default: 4)
---@param attempts number Maximum attempts allowed (1-5, default: 3)
---@param timeLimit number Time limit in seconds (5-60, default: 15)
---@return boolean success True if player completed the memory game
exports('MemoryGame', function(gridSize, attempts, timeLimit)
    local p = promise.new()
    
    gridSize = math.min(8, math.max(2, gridSize or 4))  
    attempts = math.min(5, math.max(1, attempts or 3)) 
    timeLimit = math.min(60, math.max(5, timeLimit or 15))
    
    StartMinigame('memory', {
        gridSize = gridSize, 
        maxAttempts = attempts,
        gameTime = timeLimit * 1000,  
        showTime = math.min(5000, timeLimit * 1000 / 4) 
    }, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)



---@param gridSize number Grid size (even numbers: 2-8, default: 4)
---@param maxMistakes number Maximum mistakes allowed (default: 5)
---@param timeLimit number Time limit in seconds (default: 60)
---@return boolean success True if player found all pairs
exports('MatchingGame', function(gridSize, maxMistakes, timeLimit)
    local p = promise.new()
    
    gridSize = math.floor(gridSize or 4)
    if gridSize % 2 ~= 0 then gridSize = gridSize + 1 end
    gridSize = math.min(8, math.max(2, gridSize))
    
    maxMistakes = math.min(30, math.max(1, maxMistakes or 5))
    timeLimit = math.min(3600, math.max(10, timeLimit or 60))
    
    StartMinigame('matching', {
        gridSize = gridSize,
        maxMistakes = maxMistakes,
        timeLimit = timeLimit * 1000
    }, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)




---@param length number Length of number sequence to recall (2-15, default: 6)
---@param memorizeTime number Time to memorize in seconds (default: 3)
---@param timeLimit number Time limit to input answer in seconds (default: 10)
---@param attemptsAllowed number Number of attempts allowed (default: 1)
---@param difficulty number|string 1=easy, 2=normal, 3=hard or "easy", "normal", "hard"
---@return boolean success True if player correctly recalled the number
exports('NumberRecallGame', function(length, memorizeTime, timeLimit, attemptsAllowed, difficulty)
    local p = promise.new()
    
    local difficultyText = "normal"
    if type(difficulty) == "number" then
        if difficulty == 1 then difficultyText = "easy"
        elseif difficulty == 3 then difficultyText = "hard"
        end
    elseif type(difficulty) == "string" then
        difficultyText = difficulty
    end
    
    length = math.min(15, math.max(2, length or 6))
    memorizeTime = math.min(10, math.max(1, memorizeTime or 3))
    timeLimit = math.min(3600, math.max(3, timeLimit or 10))
    attemptsAllowed = math.min(5, math.max(1, attemptsAllowed or 1))
    
    StartMinigame('numberrecall', {
        length = length,
        memorizeTime = memorizeTime * 1000,
        timeLimit = timeLimit * 1000,
        attemptsAllowed = attemptsAllowed,
        difficulty = difficultyText
    }, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)



---@param difficulty number|string 1=easy, 2=normal, 3=hard or "easy", "normal", "hard"
---@param targetScore number Lines needed to win (default: 5)
---@param timeLimit number Time limit in seconds (default: 60)
---@return boolean success True if player completes the target score
exports('TetrisGame', function(difficulty, targetScore, timeLimit)
    local p = promise.new()
    
    local difficultyText = "normal"
    if type(difficulty) == "number" then
        if difficulty == 1 then difficultyText = "easy"
        elseif difficulty == 3 then difficultyText = "hard"
        end
    elseif type(difficulty) == "string" then
        difficultyText = difficulty
    end
    
    targetScore = math.min(20, math.max(1, targetScore or 5))
    timeLimit = math.min(3600, math.max(30, timeLimit or 60))
    
    StartMinigame('tetris', {
        targetScore = targetScore,
        timeLimit = timeLimit * 1000,
        difficulty = difficultyText
    }, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)

---@param difficulty number|string 1=easy, 2=normal, 3=hard or "easy", "normal", "hard"
---@param size number Maze size (5-20, default: 10)
---@param timeLimit number Time limit in seconds (default: 45)
---@return boolean success True if player completes the maze
exports('MazeGame', function(difficulty, size, timeLimit)
    local p = promise.new()
    
    local difficultyText = "normal"
    if type(difficulty) == "number" then
        if difficulty == 1 then difficultyText = "easy"
        elseif difficulty == 3 then difficultyText = "hard"
        end
    elseif type(difficulty) == "string" then
        difficultyText = difficulty
    end
    
    size = math.min(50, math.max(5, size or 10))
    timeLimit = math.min(3600, math.max(15, timeLimit or 45))
    
    StartMinigame('maze', {
        size = size,
        timeLimit = timeLimit * 1000,
        difficulty = difficultyText
    }, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)

---@param difficulty number|string 1=easy, 2=normal, 3=hard or "easy", "normal", "hard"
---@param problemCount number Number of math problems to solve (default: 5)
---@param timeLimit number Time limit in seconds (default: 30)
---@param operationTypes table Optional table of operation types: {"addition", "subtraction", "multiplication", "division"}
---@param allowMistakes boolean Whether to allow mistakes (default: false)
---@return boolean success True if player completes the math game successfully
exports('MathGame', function(difficulty, problemCount, timeLimit, operationTypes, allowMistakes)
    local p = promise.new()
    
    local difficultyText = "normal"
    if type(difficulty) == "number" then
        if difficulty == 1 then difficultyText = "easy"
        elseif difficulty == 3 then difficultyText = "hard"
        end
    elseif type(difficulty) == "string" then
        difficultyText = difficulty
    end
    
    problemCount = math.min(20, math.max(1, problemCount or 5))
    timeLimit = math.min(3600, math.max(10, timeLimit or 30))
    
    local options = {
        problemCount = problemCount,
        timeLimit = timeLimit * 1000,
        difficulty = difficultyText,
        allowMistakes = allowMistakes or false
    }
    
    if operationTypes then
        options.operationTypes = operationTypes
    end
    
    StartMinigame('math', options, function(success)
        p:resolve(success)
    end)
    
    return Citizen.Await(p)
end)