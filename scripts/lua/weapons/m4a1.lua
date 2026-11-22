weapon={id="m4a1",name="M4A1",class="rifle",introduced="csbeta10",price=3100,ammo="5.56mm",mag=30,damage=32,spread=0.012,recoil=0.018,rate=0.085,silencer=true,model="models/v_m4a1.mdl"}
function weapon:onFire(p) w3d.Play(p.silenced and "weapons/m4a1-1.wav" or "events/m4a1.sc") end
