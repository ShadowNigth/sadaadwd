# Requires an imported converted map. Tests real physics, not just map loading.
extends SceneTree

func _initialize() -> void:
	call_deferred("run_test")

func fail(message: String) -> void:
	printerr("COLLISION TEST FAILED: ", message)
	quit(1)

func run_test() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	for i in range(4):
		await physics_frame
	if game.map_spawns.is_empty():
		fail("No converted map or spawn points loaded")
		return
	for fighter in game.fighters:
		if fighter != game.player:
			fighter.set_physics_process(false)
			fighter.collision_layer = 0
	game.round_active = false
	game.set_process(false)
	var space: PhysicsDirectSpaceState3D = game.get_world_3d().direct_space_state
	var failed := []
	for spawn in game.map_spawns:
		var query := PhysicsRayQueryParameters3D.create(spawn + Vector3.UP * 2.0, spawn + Vector3.DOWN * 5.0, 1)
		query.hit_back_faces = true
		var hit: Dictionary = space.intersect_ray(query)
		if hit.is_empty():
			failed.append(spawn)
	if not failed.is_empty():
		fail("No collision below %d / %d spawns: %s" % [failed.size(), game.map_spawns.size(), failed])
		return
	# Check actual CharacterBody motion at all spawns; raycasts alone do not
	# establish that one-sided triangles block a falling character.
	for spawn in game.map_spawns:
		game.player.place_at(spawn)
		for i in range(30):
			await physics_frame
		if game.player.global_position.y < spawn.y - 1.2:
			failed.append(spawn)
	if not failed.is_empty():
		fail("Player fell through the floor at %d spawns: %s" % [failed.size(), failed])
		return
	var safe: Vector3 = game.player.last_safe_position
	game.player.global_position = safe + Vector3.DOWN * 13.0
	await physics_frame
	await physics_frame
	if game.player.global_position.distance_to(safe) > 1.0:
		fail("Fall recovery did not return the player to a safe position")
		return
	print("Collision test passed: %s, %d spawn points and fall recovery" % [game.map_name, game.map_spawns.size()])
	game.queue_free()
	quit(0)
