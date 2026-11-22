-- game_logic.lua — Reglas globales GoldSrc (mp_roundtime, mp_c4timer, etc.)
mp_roundtime = 5
mp_c4timer = 30
mp_friendlyfire = 0
mp_limitteams = 1
mp_maxrounds = 0
mp_hostagepenalty = 3
mp_fadetoblack = 0

function onRoundStart()
  for _,p in ipairs(players) do p.money = p.money + (p.won and 3250 or 1400) end
end
function onBombPlanted(who) w3d.Broadcast("Bomba plantada!") end
function onBombDefused(who) w3d.Broadcast("¡Bomba desactivada por "..who.name.."!") end
