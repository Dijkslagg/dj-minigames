# DJ-Minigames

A collection of minigames to enhance your gaming experience


## PREVIEW: [DJ-MINIGAMES v1.0.0](https://youtu.be/z5MtYoWPtyI)


## Features

- **7 Different Minigames** - Variety of skill-based challenges
- **Customizable Difficulty** - Easy, normal, and hard modes for each game
- **Adjustable Parameters** - Customize time limits, sizes, and other options
- **Simple Integration** - Easy to implement in your scripts with exports

## Installation

1. Download the resource
2. Place it in your FiveM resources folder
3. Add `ensure dj-minigames` to your server.cfg
4. Restart your server or start the resource

## Available Minigames

### Sliding Puzzle
Players must arrange tiles in numerical order by sliding them into the empty space.

```lua
exports['dj-minigames']:SlidingPuzzle(difficulty, size, timeLimit)
-- Example: local success = exports['dj-minigames']:SlidingPuzzle("normal", 4, 30)
```

### Memory Game
Players need to memorize and repeat a specific pattern.

```lua
exports['dj-minigames']:MemoryGame(gridSize, attempts, timeLimit)
-- Example: local success = exports['dj-minigames']:MemoryGame(4, 3, 15)
```

### Matching Game
Players find matching pairs of cards.

```lua
exports['dj-minigames']:MatchingGame(gridSize, maxMistakes, timeLimit)
-- Example: local success = exports['dj-minigames']:MatchingGame(4, 5, 60)
```

### Number Recall Game
Players memorize a sequence of numbers and input them from memory.

```lua
exports['dj-minigames']:NumberRecallGame(length, memorizeTime, timeLimit, attemptsAllowed, difficulty)
-- Example: local success = exports['dj-minigames']:NumberRecallGame(6, 3, 10, 1, "normal")
```

### Tetris Game
A classic tetris-style game where players need to complete lines.

```lua
exports['dj-minigames']:TetrisGame(difficulty, targetScore, timeLimit)
-- Example: local success = exports['dj-minigames']:TetrisGame("easy", 5, 120)
```

### Maze Game
Players navigate through a procedurally generated maze to reach the exit.

```lua
exports['dj-minigames']:MazeGame(difficulty, size, timeLimit)
-- Example: local success = exports['dj-minigames']:MazeGame("easy", 10, 45)
```

### Math Game
Players solve math problems within a time limit.

```lua
exports['dj-minigames']:MathGame(difficulty, problemCount, timeLimit, operationTypes, allowMistakes)
-- Example: local success = exports['dj-minigames']:MathGame("hard", 5, 30)
```

## Integration Example

```lua
-- In your client script:
RegisterCommand('hackcomputer', function()
    local success = exports['dj-minigames']:MathGame("normal", 5, 30)
    
    if success then
        -- Player completed the minigame successfully
        TriggerEvent('notification', 'Hack successful!')
    else
        -- Player failed the minigame
        TriggerEvent('notification', 'Hack failed!')
    end
end, false)
```

## Parameters

### Difficulty Options
- As string: `"easy"`, `"normal"`, `"hard"`
- As number: `1` (easy), `2` (normal), `3` (hard)

### Common Parameters
- `timeLimit` - Time limit in seconds
- `gridSize`/`size` - Size of the game grid
- `attempts`/`attemptsAllowed`/`maxMistakes` - Number of attempts or mistakes allowed

### Special Parameters
- For NumberRecallGame:
  - `length` - Length of number sequence (2-15)
  - `memorizeTime` - Time to view numbers in seconds (1-10)

- For TetrisGame:
  - `targetScore` - Lines needed to win (1-20)

- For MathGame:
  - `problemCount` - Number of problems to solve (1-20)
  - `operationTypes` - Optional table: `{"addition", "subtraction", "multiplication", "division"}`
  - `allowMistakes` - Whether to allow mistakes (default: false)

## Credits

Created by DJ Developments