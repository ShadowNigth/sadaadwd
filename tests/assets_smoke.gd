# Requires at least one converted map, weapon and player.
extends SceneTree

func _initialize() -> void:
	call_deferred("run_test")

func run_test() -> void:
	var scene = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	await process_frame
	assert(scene.map_name in scene.map_names)
	assert(scene.map_spawns.size() >= 8)
	assert(scene.player.weapon.get_child_count() >= 1)
	assert(scene.fighters[1].human_model != null)
	print("Asset smoke test passed: converted map, spawns and original models loaded")
	scene.queue_free()
	quit()
