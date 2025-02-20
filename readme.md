# DJ Minigames

Bundle of minigames for FiveM.

## Installation

1. Clone or download this repository.
2. Add the resource to your `server.cfg`:

```plaintext
ensure dj-minigames
```

3. Configure the minigames in `config.lua` if nee


## Minigames


#### Memory Sequence

![Image](https://github.com/user-attachments/assets/0ffded43-83b6-4da6-a202-779f9519b7b6)

```lua
    local success = exports['dj-minigames']:MemorySequence(letters, rounds, time in ms)
```

#### Voltage Match

![Image](https://github.com/user-attachments/assets/4f893e3b-f514-4b5f-bf12-ceb08b95866d)

```lua
    local success = exports['dj-minigames']:VoltageMatch(voltages, rounds, time in ms)
```





