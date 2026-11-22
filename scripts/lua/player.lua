-- player.lua — Controlador FPS GoldSrc en Wisk3D
-- Lógica idéntica en Editor y Runtime (mismo tick).

Player = {
  pos = {x=0, y=1.7, z=58},
  yaw = 0, pitch = 0,
  vel = {x=0, y=0, z=0},
  onGround = true,
  health = 100,
  armor = 0,
  money = 800,
}

function Player:update(dt)
  local input = w3d.GetInput()
  local speed = input.shift and 320*1.6 or 320
  -- Forward / right en plano XZ (GoldSrc)
  local fwd = {x=math.sin(self.yaw), z=math.cos(self.yaw)}
  local right = {x=math.cos(self.yaw), z=-math.sin(self.yaw)}
  local dir = {x=0, z=0}
  if input.w then dir.x=dir.x+fwd.x; dir.z=dir.z+fwd.z end
  if input.s then dir.x=dir.x-fwd.x; dir.z=dir.z-fwd.z end
  if input.d then dir.x=dir.x+right.x; dir.z=dir.z+right.z end
  if input.a then dir.x=dir.x-right.x; dir.z=dir.z-right.z end
  local len = math.sqrt(dir.x*dir.x + dir.z*dir.z)
  if len>0 then
    dir.x = dir.x/len * speed * dt
    dir.z = dir.z/len * speed * dt
    self.pos.x = self.pos.x + dir.x * 0.02
    self.pos.z = self.pos.z + dir.z * 0.02
  end
  -- Gravedad GoldSrc: 800 u/s²
  if not self.onGround then
    self.vel.y = self.vel.y - 800 * dt
    self.pos.y = self.pos.y + self.vel.y * dt * 0.02
    if self.pos.y <= 1.7 then self.pos.y=1.7; self.vel.y=0; self.onGround=true end
  end
  if input.space and self.onGround then
    self.vel.y = 270 -- salto GoldSrc
    self.onGround = false
  end
  -- Mouse look (plataforma lo provee)
  self.yaw = self.yaw + input.mouseDX * 0.0025
  self.pitch = math.max(-1.5, math.min(1.5, self.pitch - input.mouseDY * 0.0025))
end
