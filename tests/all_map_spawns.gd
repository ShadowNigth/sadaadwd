# Check the converted collision mesh underneath every original-map spawn.
extends SceneTree

func _initialize() -> void:
	call_deferred("run_test")

func fail(message: String) -> void:
	printerr("MAP TEST FAILED: ", message)
	quit(1)

func run_test() -> void:
	var catalog_path := "res://assets/generated/catalog.json"
	if not FileAccess.file_exists(catalog_path):
		fail("Missing generated map catalog")
		return
	var catalog = JSON.parse_string(FileAccess.get_file_as_string(catalog_path))
	if not catalog is Dictionary or not catalog.has("maps") or catalog.maps.is_empty():
		fail("Empty or invalid map catalog")
		return
	var helper = load("res://scripts/main.gd").new()
	var failures := []
	var tested := 0
	for entry in catalog.maps:
		var map_name: String = entry.name
		var base := "res://assets/generated/maps/" + map_name + "/"
		var resource = load(base + "map.gltf")
		if not resource is PackedScene:
			failures.append(map_name + ": no map scene")
			continue
		var map = resource.instantiate()
		root.add_child(map)
		helper.add_map_collision(map)
		await physics_frame
		await physics_frame
		var metadata = JSON.parse_string(FileAccess.get_file_as_string(base + "spawns.json"))
		for values in metadata.spawns:
			var point := Vector3(values[0], values[1], values[2])
			var query := PhysicsRayQueryParameters3D.create(point + Vector3.UP * 2, point + Vector3.DOWN * 5, 1)
			query.hit_back_faces = true
			if map.get_world_3d().direct_space_state.intersect_ray(query).is_empty():
				failures.append("%s: %s" % [map_name, point])
			tested += 1
		map.queue_free()
		await process_frame
	helper.free()
	if not failures.is_empty():
		fail("No collision beneath %d spawns: %s" % [failures.size(), failures])
		return
	print("All-map collision test passed: %d maps, %d spawns" % [catalog.maps.size(), tested])
	quit(0)
