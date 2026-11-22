-- ak47.lua — Definición de arma en Wisk3D (propiedades expuestas en el Editor)
weapon = {
  id = "ak47",
  name = "AK-47",
  class = "rifle",
  introduced = "csbeta20", -- Beta 2.0
  price = 2500,
  ammo = "7.62mm",
  mag = 30,
  damage = 34,
  spread = 0.015, -- GoldSrc spread
  recoil = 0.025,
  rate = 0.095, -- s entre disparos
  sounds = { fire="events/ak47.sc", empty="weapons/empty.wav" },
  anims = { idle="ak47_idle", fire="ak47_fire", reload="ak47_reload" },
  model = "models/v_ak47.mdl",
  wModel = "models/w_ak47.mdl",
  leftHand = false, -- Beta 6.0 agregó switch
}

function weapon:onFire(player)
  w3d.Play("events/ak47.sc")
  w3d.SpawnBullet(player.pos, player.dir, self.spread, self.damage)
  w3d.ApplyRecoil(player, self.recoil)
end
