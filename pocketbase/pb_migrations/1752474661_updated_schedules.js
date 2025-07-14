/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pbc_schedules")

  collection.deleteRule = "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pbc_schedules")

  collection.deleteRule = "user_id = @request.auth.id || @request.auth.role = 'administrator'"

  return dao.saveCollection(collection)
})
