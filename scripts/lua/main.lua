-- Wisk3D — main.lua (entry point, igual que en Whisk3D Runtime)
-- El juego compilado comparte el MISMO camino de render y el MISMO tick que el editor.

project = {
  name = "counterstrike-betas",
  title = "Counter-Strike Betas — Museo Wisk3D",
  engine = "wisk3D",
  version = "1.0.0",
}

-- Estado global (expuesto en el Editor como propiedades)
GameState = {
  currentBeta = "csbeta40",
  hlVersion = "1.0.1.6",
  gravity = 800, -- GoldSrc
  maxSpeed = 320,
  roundTime = 5, -- mp_roundtime
  c4timer = 30, -- mp_c4timer
}

function onLoad()
  w3d.Log("main", "Cargando museo — %d versiones", 23)
  -- Stream de páginas (ver W3DScene.streamPage)
  w3d.LoadTexture("res/texture/concrete")
  w3d.LoadTexture("res/texture/metal")
  w3d.SetFog(true, 0x0a0a0f, 60, 220)
end

function onUpdate(dt)
  -- Tick determinístico (como en Wish Engine pero en Wisk3D)
  -- dt en segundos
  player:update(dt)
  museum:update(dt)
end

function onRender()
  w3d.Clear()
  museum:render()
  hud:render()
end
