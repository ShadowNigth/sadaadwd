extends Node3D

const FighterScript = preload("res://scripts/fighter.gd")
var fighters: Array[Fighter] = []
var player: Fighter
var round_active := false
var phase := "preparacion"
var phase_time := 0.0
var round_number := 0
var title_label: Label
var timer_label: Label
var status_label: Label
var ammo_label: Label
var help_label: Label
var banner: Label
var crosshair: Label
var sound: AudioStreamPlayer
var original_sounds := {}
var map_spawns: Array[Vector3] = []
var map_names: Array[String] = []
var map_name := "arena de prueba"

func _ready() -> void:
	randomize()
	build_arena()
	build_ui()
	sound = AudioStreamPlayer.new()
	sound.volume_db = -9.0
	add_child(sound)
	for filename in ["ak47-1.wav", "generic_reload.wav", "knife_slash1.wav"]:
		var path: String = "res://assets/original/cstrike/sound/weapons/" + filename
		if not ResourceLoader.exists(path):
			path = "res://assets/generated/sounds/" + filename
		if ResourceLoader.exists(path):
			original_sounds[filename] = load(path)
	spawn_fighters()
	start_round()
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_F2:
		if map_names.size() < 2:
			return
		var current := map_names.find(map_name)
		var next := (current + 1) % map_names.size()
		var settings := ConfigFile.new()
		settings.set_value("game", "map", map_names[next])
		settings.save("user://map_settings.cfg")
		get_tree().reload_current_scene()

func build_arena() -> void:
	var environment := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("60717b")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("c1d5dc")
	env.ambient_light_energy = 0.75
	environment.environment = env
	add_child(environment)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -35, 0)
	sun.light_energy = 0.8
	sun.shadow_enabled = true
	add_child(sun)
	if load_original_map():
		return
	add_block(Vector3(0, -0.5, 0), Vector3(30, 1, 30), Color("626c65"))
	add_block(Vector3(0, 2, -15), Vector3(30, 4, 1), Color("57615c"))
	add_block(Vector3(0, 2, 15), Vector3(30, 4, 1), Color("57615c"))
	add_block(Vector3(-15, 2, 0), Vector3(1, 4, 30), Color("57615c"))
	add_block(Vector3(15, 2, 0), Vector3(1, 4, 30), Color("57615c"))
	for pos in [Vector3(-6, 0.8, -5), Vector3(6, 0.8, -5), Vector3(-6, 0.8, 5), Vector3(6, 0.8, 5)]:
		add_block(pos, Vector3(2.5, 1.6, 2.5), Color("8a7459"))
	add_block(Vector3(0, 0.55, 0), Vector3(3, 1.1, 2), Color("87735c"))

# The generated map is optional; without it the project uses the built-in arena.
func load_original_map() -> bool:
	var map_path := "res://assets/generated/map/map.gltf"
	var spawn_path := "res://assets/generated/map/spawns.json"
	var catalog_path := "res://assets/generated/catalog.json"
	if FileAccess.file_exists(catalog_path):
		var catalog = JSON.parse_string(FileAccess.get_file_as_string(catalog_path))
		if catalog is Dictionary and catalog.has("maps") and catalog.maps is Array:
			for entry in catalog.maps:
				if entry is Dictionary and entry.has("name") and int(entry.get("spawns", 0)) >= 8:
					map_names.append(str(entry.name))
		if not map_names.is_empty():
			var settings := ConfigFile.new()
			settings.load("user://map_settings.cfg")
			var default_name := "de_dust2" if map_names.has("de_dust2") else map_names[0]
			map_name = str(settings.get_value("game", "map", default_name))
			if not map_names.has(map_name):
				map_name = default_name
			map_path = "res://assets/generated/maps/" + map_name + "/map.gltf"
			spawn_path = "res://assets/generated/maps/" + map_name + "/spawns.json"
	if not ResourceLoader.exists(map_path) or not FileAccess.file_exists(spawn_path):
		return false
	var metadata = JSON.parse_string(FileAccess.get_file_as_string(spawn_path))
	if not metadata is Dictionary or not metadata.has("spawns") or not metadata.spawns is Array:
		push_warning("Los puntos de aparición del mapa no son válidos; usando arena de prueba.")
		return false
	var valid_spawns: Array[Vector3] = []
	for point in metadata.spawns:
		if point is Array and point.size() == 3:
			valid_spawns.append(Vector3(float(point[0]), float(point[1]), float(point[2])))
	if valid_spawns.size() < 8:
		push_warning("El mapa necesita al menos 8 puntos de aparición; usando arena de prueba.")
		return false
	var packed = load(map_path)
	if not packed is PackedScene:
		push_warning("No se pudo cargar el mapa convertido; usando arena de prueba.")
		return false
	var map: Node = packed.instantiate()
	add_child(map)
	add_map_collision(map)
	map_spawns = valid_spawns
	map_name = str(metadata.get("map", map_name))
	return true

func add_map_collision(node: Node) -> void:
	if node is MeshInstance3D and node.mesh:
		node.create_trimesh_collision()
	for child in node.get_children():
		# Collision nodes created above are leaves, so this recursion terminates.
		add_map_collision(child)

func add_block(at: Vector3, size: Vector3, color: Color) -> void:
	var block := StaticBody3D.new()
	block.position = at
	block.collision_layer = 1
	block.collision_mask = 0
	var collision := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = size
	collision.shape = box
	block.add_child(collision)
	var instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	instance.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1.0
	instance.material_override = mat
	block.add_child(instance)
	add_child(block)

func spawn_fighters() -> void:
	for i in range(8):
		var fighter: Fighter = FighterScript.new()
		add_child(fighter)
		fighter.setup(self, i == 0)
		fighters.append(fighter)
		if i == 0:
			player = fighter

func start_round() -> void:
	round_number += 1
	round_active = false
	phase = "preparacion"
	phase_time = 8.0
	var positions := [Vector3(0, 0.1, 10), Vector3(-10, 0.1, 10), Vector3(10, 0.1, 10), Vector3(-10, 0.1, 0), Vector3(10, 0.1, 0), Vector3(-10, 0.1, -10), Vector3(10, 0.1, -10), Vector3(0, 0.1, -10)]
	if not map_spawns.is_empty():
		positions = map_spawns.duplicate()
	positions.shuffle()
	for i in range(fighters.size()):
		var fighter := fighters[i]
		fighter.global_position = positions[i]
		fighter.velocity = Vector3.ZERO
		fighter.set_team(false)
		if not fighter.is_player:
			fighter.visual.visible = true
	banner.text = "PREPARATE · La infección comienza en 8 segundos"

func begin_infection() -> void:
	phase = "activa"
	phase_time = 120.0
	round_active = true
	# The initial infected is a bot, so the player can always start defending.
	var first: Fighter = fighters[randi_range(1, fighters.size() - 1)]
	first.set_team(true)
	banner.text = "¡INFECCIÓN! Los humanos deben sobrevivir"

func finish_round(message: String) -> void:
	round_active = false
	phase = "fin"
	phase_time = 5.0
	banner.text = message + " · Nueva ronda en 5 segundos"

func _process(delta: float) -> void:
	phase_time -= delta
	if phase == "preparacion" and phase_time <= 0:
		begin_infection()
	elif phase == "activa":
		var humans := 0
		var zombies := 0
		for fighter in fighters:
			if fighter.alive:
				if fighter.is_zombie:
					zombies += 1
				else:
					humans += 1
		if humans == 0:
			finish_round("GANARON LOS ZOMBIS")
		elif zombies == 0 or phase_time <= 0:
			finish_round("GANARON LOS HUMANOS")
	elif phase == "fin" and phase_time <= 0:
		start_round()
	update_ui()

func nearest_enemy(source: Fighter) -> Fighter:
	var nearest: Fighter = null
	var best := INF
	for fighter in fighters:
		if fighter != source and fighter.alive and fighter.is_zombie != source.is_zombie:
			var distance := source.global_position.distance_squared_to(fighter.global_position)
			if distance < best:
				best = distance
				nearest = fighter
	return nearest

func on_infection(fighter: Fighter) -> void:
	if fighter == player:
		banner.text = "¡TE INFECTARON! Atacá a los humanos con clic izquierdo"
	else:
		banner.text = "Un humano fue infectado"

func on_death(fighter: Fighter) -> void:
	if fighter == player:
		banner.text = "ELIMINADO · Esperando la próxima ronda"

func play_original_sound(filename: String) -> void:
	if original_sounds.has(filename):
		sound.stream = original_sounds[filename]
		sound.play()

func build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	var top := ColorRect.new()
	top.color = Color(0.05, 0.08, 0.09, 0.8)
	top.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	top.offset_bottom = 66
	root.add_child(top)
	title_label = make_label(root, 24, Color("e3eddb"))
	title_label.position = Vector2(25, 12)
	title_label.text = "INFECCIÓN  /  " + map_name.to_upper()
	timer_label = make_label(root, 24, Color("ffdf95"))
	timer_label.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	timer_label.position = Vector2(-220, 12)
	timer_label.size = Vector2(195, 35)
	timer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	banner = make_label(root, 19, Color("f6e5ad"))
	banner.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	banner.position = Vector2(-350, 78)
	banner.size = Vector2(700, 35)
	banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	crosshair = make_label(root, 26, Color.WHITE)
	crosshair.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	crosshair.position = Vector2(-12, -18)
	crosshair.text = "+"
	status_label = make_label(root, 22, Color("e4f0e8"))
	status_label.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	status_label.position = Vector2(24, -82)
	ammo_label = make_label(root, 22, Color("f9e2a5"))
	ammo_label.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
	ammo_label.position = Vector2(-265, -82)
	ammo_label.size = Vector2(240, 36)
	ammo_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	help_label = make_label(root, 14, Color("d1ded9"))
	help_label.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	help_label.position = Vector2(24, -38)
	help_label.text = "WASD mover  ·  Espacio saltar  ·  Clic atacar  ·  R recargar  ·  F2 cambiar mapa  ·  Esc cursor"

func make_label(parent: Node, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	label.add_theme_color_override("font_shadow_color", Color.BLACK)
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 2)
	parent.add_child(label)
	return label

func update_ui() -> void:
	var humans := 0
	var zombies := 0
	for fighter in fighters:
		if fighter.alive:
			if fighter.is_zombie:
				zombies += 1
			else:
				humans += 1
	timer_label.text = "RONDA %d   %02d:%02d" % [round_number, int(maxf(phase_time, 0)) / 60, int(maxf(phase_time, 0)) % 60]
	status_label.text = "%s  ·  VIDA %d  |  H %d  Z %d" % ["ZOMBI" if player.is_zombie else "HUMANO", maxi(0, int(player.health)), humans, zombies]
	if not player.alive:
		ammo_label.text = "ELIMINADO"
	elif player.is_zombie:
		ammo_label.text = "ATAQUE CUERPO A CUERPO"
	elif player.reload_time > 0:
		ammo_label.text = "RECARGANDO..."
	else:
		ammo_label.text = "MUNICIÓN  %d / %d" % [player.ammo, player.reserve]
