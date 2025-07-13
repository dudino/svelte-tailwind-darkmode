/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pbc_clients")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "clients_phone_number",
    "name": "phone_number",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": true,
    "options": {
      "min": 5,
      "max": 20,
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
    "id": "clients_phone_number",
    "name": "phone_number",
    "type": "text",
    "required": true,
    "presentable": true,
    "unique": true,
    "options": {
      "min": 5,
      "max": 20,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
