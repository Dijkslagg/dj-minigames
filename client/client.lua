local Minigame = {
    active = false,
    result = nil
}

function Minigame:Start(data)
    if self.active then return false end
    
    self.active = true
    self.result = nil
    
    data.action = 'startHack'
    data.type = string.lower(data.Type)
    data.Type = nil

    if data.time then
        data.timeout = data.time / 1000
        data.time = nil
    end
    
    SendNUIMessage(data)
    SetNuiFocus(true, true)
    
    while self.active do
        SetPauseMenuActive(false)
        DisableControlAction(0, 1, true)
        DisableControlAction(0, 2, true)
        Wait(0)
    end
    return self.result
end

RegisterNUICallback('hackingComplete', function(data, cb)
    SetNuiFocus(false, false)
    Minigame.result = data.success
    Minigame.active = false
    cb('ok')
end)



function MemorySequence(letters, rounds, time)
    return Minigame:Start({
        Type = 'memory',
        letters = math.min(math.max(letters or Config.MemorySequence.DefaultLetters, Config.MemorySequence.MinLetters), Config.MemorySequence.MaxLetters),
        rounds = math.max(rounds or Config.MemorySequence.DefaultRounds, Config.MemorySequence.MinRounds),
        time = math.max(time or Config.MemorySequence.DefaultTime, Config.MemorySequence.MinTime)
    })
end

function VoltageMatch(voltages, rounds, time)
    return Minigame:Start({
        Type = 'voltage',
        voltages = math.min(math.max(voltages or Config.VoltageMatch.DefaultVoltages, Config.VoltageMatch.MinVoltages), Config.VoltageMatch.MaxVoltages),
        rounds = math.max(rounds or Config.VoltageMatch.DefaultRounds, Config.VoltageMatch.MinRounds),
        time = math.max(time or Config.VoltageMatch.DefaultTime, Config.VoltageMatch.MinTime),
        tolerance = Config.VoltageMatch.Tolerance
    })
end


-- exports
exports('MemorySequence', MemorySequence)
--local result = exports['dj-minigames']:MemorySequence(6, 2, 10000) -- letters, rounds, time

exports('VoltageMatch', VoltageMatch)
--local result = exports['dj-minigames']:VoltageMatch(4, 1, 10000) -- voltages, rounds, time


-- Test commands
RegisterCommand('testsequence', function()
    local success = MemorySequence(6, 3, 5000) -- letters, rounds, seconds in ms
    if success then
        print("success")
    else
        print("fail")
    end
end, false)

RegisterCommand('testvoltage', function()
    local success = VoltageMatch(4, 1, 15000)
    if success then
        print("Voltages matched successfully!")
    else
        print("Failed to match voltages!")
    end
end, false)