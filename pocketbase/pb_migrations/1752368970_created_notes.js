/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_notes",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "notes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "notes_client_id",
        "name": "client_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_clients",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": [
            "phone_number",
            "nickname"
          ]
        }
      },
      {
        "system": false,
        "id": "notes_user_id",
        "name": "user_id",
        "type": "relation",
        "required": true,
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
      },
      {
        "system": false,
        "id": "notes_booking_id",
        "name": "booking_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_bookings",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": [
            "booking_number"
          ]
        }
      },
      {
        "system": false,
        "id": "notes_type",
        "name": "type",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "general",
            "complaint",
            "compliment"
          ]
        }
      },
      {
        "system": false,
        "id": "notes_content",
        "name": "content",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 2000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "notes_is_private",
        "name": "is_private",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || (@request.auth.role = 'operator' && is_private = false)",
    "viewRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || (@request.auth.role = 'operator' && is_private = false)",
    "createRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator' || @request.auth.role = 'user'",
    "updateRule": "user_id = @request.auth.id || @request.auth.role = 'administrator'",
    "deleteRule": "user_id = @request.auth.id || @request.auth.role = 'administrator'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_notes");

  return dao.deleteCollection(collection);
})
