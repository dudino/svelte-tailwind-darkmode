/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pbc_clients")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "clients_nickname",
    "name": "nickname",
    "type": "text",
    "required": false,
    "presentable": true,
    "unique": false,
    "options": {
      "min": 0,
      "max": 50,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pbc_clients")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "clients_nickname",
    "name": "nickname",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 50,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
