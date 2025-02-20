fx_version 'cerulean'
game 'gta5'

author 'Dijkslag'
description 'Hacking Minigames Resource'
version '1.0.0'

shared_script 'config.lua'
client_scripts {
    'client/client.lua'
}
-- server_scripts {
--     'server/server.lua'
-- }

ui_page 'web/index.html'

files {
    'web/index.html',
    'web/scripts/*.js'
}

exports {
    'MemorySequence',
    'voltageMatch'
}