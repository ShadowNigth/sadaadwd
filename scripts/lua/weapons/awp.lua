weapon = {
  id = "awp",
  name = "AWP",
  class = "sniper",
  introduced = "csbeta10",
  price = 4750,
  ammo = ".338 Magnum",
  mag = 10,
  damage = 100,
  spread = 0.001,
  recoil = 0.08,
  rate = 1.2,
  zoom = true,
  model = "models/v_awp.mdl",
}
function weapon:onFire(p) w3d.Play("events/awp.sc"); w3d.SpawnBullet(p.pos,p.dir,self.spread,self.damage) end
