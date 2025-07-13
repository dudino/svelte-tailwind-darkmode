/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_rooms",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "rooms",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rooms_location_id",
        "name": "location_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_locations",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": [
            "name"
          ]
        }
      },
      {
        "system": false,
        "id": "rooms_name",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 50,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "rooms_type",
        "name": "type",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "regular",
            "dynamic"
          ]
        }
      },
      {
        "system": false,
        "id": "rooms_capacity",
        "name": "capacity",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 10,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "rooms_amenities",
        "name": "amenities",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 10,
          "values": [
            "shower",
            "sauna",
            "jacuzzi",
            "private_bathroom",
            "air_conditioning",
            "heating",
            "music_system",
            "tv",
            "mini_bar",
            "wifi"
          ]
        }
      },
      {
        "system": false,
        "id": "rooms_hourly_rate",
        "name": "hourly_rate",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "rooms_is_active",
        "name": "is_active",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "rooms_created_by",
        "name": "created_by",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": [
            "name"
          ]
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "updateRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "deleteRule": "@request.auth.role = 'administrator'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_rooms");

  return dao.deleteCollection(collection);
})
