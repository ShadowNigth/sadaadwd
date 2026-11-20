extends CharacterBody3D
class_name Fighter

var game
var is_player := false
var is_zombie := false
var alive := true
var health := 100.0
var max_health := 100.0
var attack_cooldown := 0.0
var think_cooldown := 0.0
var target: Fighter
var camera: Camera3D
var visual: Node3D
var body_mesh: MeshInstance3D
var head_mesh: MeshInstance3D
var legs_mesh: MeshInstance3D
var human_model: Node3D
var weapon: Node3D
var ammo := 30
var reserve := 120
var reload_time := 0.0
var pitch := 0.0
var strafe_sign := 1.0
var move_speed := 5.5
var last_safe_position := Vector3.ZERO
var has_safe_position := false
const SHOT_DAMAGE := 34.0
const ZOMBIE_HEALTH := 200.0

func setup(owner_game: Node3D, player_controlled: bool) -> void:
	game = owner_game
	is_player = player_controlled
	collision_layer = 2
	collision_mask = 3
	var shape := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.35
	capsule.height = 1.8
	shape.shape = capsule
	shape.position.y = 0.9
	add_child(shape)
	if is_player:
		camera = Camera3D.new()
		camera.position.y = 1.55
		camera.current = true
		add_child(camera)
		weapon = Node3D.new()
		camera.add_child(weapon)
	else:
		visual = Node3D.new()
		add_child(visual)
		body_mesh = make_box(Vector3(0.65, 1.05, 0.38), Vector3(0, 0.83, 0))
		head_mesh = make_box(Vector3(0.42, 0.42, 0.42), Vector3(0, 1.57, 0))
		visual.add_child(body_mesh)
		visual.add_child(head_mesh)
		legs_mesh = make_box(Vector3(0.55, 0.5, 0.32), Vector3(0, 0.25, 0))
		legs_mesh.material_override = material(Color("25313c"))
		visual.add_child(legs_mesh)
		human_model = load_optional_model("res://assets/generated/player/model.gltf")
		if human_model:
			human_model.scale = Vector3.ONE * 0.82
			visual.add_child(human_model)
	set_team(false)

func material(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.9
	return mat

func make_box(size: Vector3, at: Vector3) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = size
	mesh_instance.mesh = box
	mesh_instance.position = at
	return mesh_instance

func set_team(zombie: bool) -> void:
	is_zombie = zombie
	alive = true
	max_health = ZOMBIE_HEALTH if zombie else 100.0
	health = max_health
	ammo = 30
	reserve = 120
	reload_time = 0.0
	attack_cooldown = 0.0
	target = null
	collision_layer = 2
	if is_player:
		for child in weapon.get_children():
			child.queue_free()
		var original_weapon: Node3D = null
		if not zombie:
			original_weapon = load_optional_model("res://assets/generated/weapon/model.gltf")
		if original_weapon:
			# Position is a first approximation for the original v_ak47 model.
			original_weapon.position = Vector3(0.22, -0.32, 0.0)
			original_weapon.rotation.y = PI
			weapon.add_child(original_weapon)
		else:
			var held := make_box(Vector3(0.16, 0.14, 0.62) if not zombie else Vector3(0.18, 0.18, 0.55), Vector3(0.30, -0.28, -0.50))
			held.material_override = material(Color("30383d") if not zombie else Color("77955d"))
			weapon.add_child(held)
			if not zombie:
				var barrel := make_box(Vector3(0.055, 0.055, 0.42), Vector3(0.30, -0.25, -0.98))
				barrel.material_override = material(Color("151b1d"))
				weapon.add_child(barrel)
	else:
		var show_original := human_model != null and not zombie
		if human_model:
			human_model.visible = show_original
		body_mesh.visible = not show_original
		head_mesh.visible = not show_original
		legs_mesh.visible = not show_original
		body_mesh.material_override = material(Color("72924e") if zombie else Color("547d94"))
		head_mesh.material_override = material(Color("a2bd71") if zombie else Color("e1b996"))

func load_optional_model(path: String) -> Node3D:
	if ResourceLoader.exists(path):
		var packed = load(path)
		if packed is PackedScene:
			var instance = packed.instantiate()
			if instance is Node3D:
				return instance
			instance.queue_free()
	return null

func _unhandled_input(event: InputEvent) -> void:
	if not is_player:
		return
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	elif event is InputEventMouseButton and event.pressed and Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED and alive:
		rotate_y(-event.relative.x * 0.0025)
		pitch = clampf(pitch - event.relative.y * 0.0025, -1.45, 1.45)
		camera.rotation.x = pitch
	elif event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_R:
		start_reload()

func place_at(spawn: Vector3) -> void:
	global_position = spawn
	velocity = Vector3.ZERO
	last_safe_position = spawn
	has_safe_position = true

func _physics_process(delta: float) -> void:
	if not alive:
		return
	# Recovery for gaps or unfinished converted collision: never keep falling forever.
	if has_safe_position and global_position.y < last_safe_position.y - 12.0:
		global_position = last_safe_position + Vector3.UP * 0.2
		velocity = Vector3.ZERO
	attack_cooldown = maxf(0.0, attack_cooldown - delta)
	if reload_time > 0.0:
		reload_time -= delta
		if reload_time <= 0.0:
			var amount := mini(30 - ammo, reserve)
			ammo += amount
			reserve -= amount
	if not is_on_floor():
		velocity.y -= 20.0 * delta
	elif velocity.y < 0.0:
		velocity.y = 0.0
	if is_player:
		player_tick(delta)
	else:
		bot_tick(delta)
	move_and_slide()
	if is_on_floor():
		last_safe_position = global_position
		has_safe_position = true

func player_tick(_delta: float) -> void:
	var direction := Vector3.ZERO
	if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		var x := int(Input.is_key_pressed(KEY_D)) - int(Input.is_key_pressed(KEY_A))
		var z := int(Input.is_key_pressed(KEY_S)) - int(Input.is_key_pressed(KEY_W))
		direction = (transform.basis * Vector3(x, 0, z)).normalized()
		if Input.is_key_pressed(KEY_SPACE) and is_on_floor():
			velocity.y = 6.5
		if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
			attack()
	velocity.x = direction.x * (6.3 if is_zombie else move_speed)
	velocity.z = direction.z * (6.3 if is_zombie else move_speed)

func start_reload() -> void:
	if alive and not is_zombie and reload_time <= 0.0 and ammo < 30 and reserve > 0:
		reload_time = 1.5
		game.play_original_sound("generic_reload.wav")

func attack() -> void:
	if attack_cooldown > 0.0 or not game.round_active:
		return
	if is_zombie:
		attack_cooldown = 0.65
		game.play_original_sound("knife_slash1.wav")
		var hit := ray(camera.global_position, camera.global_position - camera.global_transform.basis.z * 2.2)
		if hit and hit.collider is Fighter:
			var victim: Fighter = hit.collider
			if victim.alive and not victim.is_zombie:
				victim.receive_damage(100.0, self)
	else:
		if reload_time > 0.0:
			return
		if ammo <= 0:
			start_reload()
			return
		ammo -= 1
		attack_cooldown = 0.12
		game.play_original_sound("ak47-1.wav")
		var origin := camera.global_position
		var hit := ray(origin, origin - camera.global_transform.basis.z * 100.0)
		if hit and hit.collider is Fighter:
			var victim: Fighter = hit.collider
			if victim.alive and victim.is_zombie:
				victim.receive_damage(SHOT_DAMAGE, self)

func ray(from: Vector3, to: Vector3) -> Dictionary:
	var query := PhysicsRayQueryParameters3D.create(from, to, 3, [get_rid()])
	return get_world_3d().direct_space_state.intersect_ray(query)

func has_sight(other: Fighter) -> bool:
	var hit := ray(global_position + Vector3.UP * 1.0, other.global_position + Vector3.UP * 1.0)
	return not hit.is_empty() and hit.collider == other

func bot_tick(delta: float) -> void:
	if not game.round_active:
		velocity.x = 0
		velocity.z = 0
		return
	think_cooldown -= delta
	if think_cooldown <= 0.0:
		think_cooldown = 0.3
		target = game.nearest_enemy(self)
	if not is_instance_valid(target) or not target.alive or target.is_zombie == is_zombie:
		velocity.x = 0
		velocity.z = 0
		return
	var offset := target.global_position - global_position
	offset.y = 0
	var distance := offset.length()
	var direction := offset.normalized()
	var sees := has_sight(target)
	var movement := Vector3.ZERO
	if is_zombie:
		if distance > 1.5:
			movement = direction
		elif sees and attack_cooldown <= 0.0:
			attack_cooldown = 0.8
			target.receive_damage(100.0, self)
	else:
		if distance < 4.0:
			movement = -direction
		elif distance > 12.0 or not sees:
			movement = direction
		if sees and distance < 22.0 and attack_cooldown <= 0.0:
			attack_cooldown = randf_range(0.55, 0.9)
			if randf() < 0.7:
				target.receive_damage(22.0, self)
	if movement.length() > 0.1:
		var obstacle := ray(global_position + Vector3.UP * 0.6, global_position + Vector3.UP * 0.6 + movement * 1.2)
		if obstacle and not (obstacle.collider is Fighter):
			movement = Vector3(-movement.z, 0, movement.x) * strafe_sign
			if randf() < 0.02:
				strafe_sign *= -1.0
	velocity.x = movement.x * (4.4 if is_zombie else 3.4)
	velocity.z = movement.z * (4.4 if is_zombie else 3.4)
	if direction.length() > 0.1:
		visual.rotation.y = atan2(-direction.x, -direction.z)

func receive_damage(amount: float, attacker: Fighter) -> void:
	if not alive or not game.round_active:
		return
	health -= amount
	if health <= 0.0:
		if not is_zombie and attacker.is_zombie:
			set_team(true)
			game.on_infection(self)
		else:
			alive = false
			collision_layer = 0
			velocity = Vector3.ZERO
			if not is_player:
				visual.visible = false
			game.on_death(self)
