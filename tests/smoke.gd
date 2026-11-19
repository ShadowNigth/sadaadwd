# Run after importing the project: godot --headless --path . --script res://tests/smoke.gd
extends SceneTree

func _initialize() -> void:
	call_deferred("run_test")

func run_test() -> void:
	var scene = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	await process_frame
	assert(scene.fighters.size() == 8)
	assert(scene.phase == "preparacion")
	scene.begin_infection()
	assert(scene.round_active)
	var zombie: Fighter = null
	for fighter in scene.fighters:
		if fighter.is_zombie:
			zombie = fighter
	assert(zombie != null)
	scene.player.receive_damage(100.0, zombie)
	assert(scene.player.is_zombie and scene.player.alive)
	assert(scene.player.health == 200.0)
	for fighter in scene.fighters:
		if not fighter.is_zombie:
			fighter.receive_damage(100.0, zombie)
	scene._process(0.0)
	assert(scene.phase == "fin" and not scene.round_active)
	scene.start_round()
	assert(scene.player.alive and not scene.player.is_zombie)
	assert(scene.phase == "preparacion")
	print("Smoke test passed: infection, round end and reset")
	scene.queue_free()
	quit()
