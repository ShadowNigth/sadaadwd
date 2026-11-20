# Check that center- and edge-anchored HUD labels remain inside the viewport.
extends SceneTree

func _initialize() -> void:
	call_deferred("run_test")

func run_test() -> void:
	var scene = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	await process_frame
	await process_frame
	var view := root.get_visible_rect().size
	for label in [scene.banner, scene.crosshair, scene.timer_label, scene.status_label, scene.ammo_label, scene.help_label]:
		var rect: Rect2 = label.get_global_rect()
		if rect.position.x < -0.1 or rect.position.y < -0.1 or rect.end.x > view.x + 0.1 or rect.end.y > view.y + 0.1:
			printerr("HUD TEST FAILED: ", label.text, " ", rect, " viewport ", view)
			quit(1)
			return
	print("HUD test passed: labels inside viewport ", view)
	scene.queue_free()
	quit(0)
