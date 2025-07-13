/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_schedules",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "schedules",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "schedules_user_id",
        "name": "user_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
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
        "id": "schedules_room_id",
        "name": "room_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_rooms",
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
        "id": "schedules_date",
        "name": "date",
        "type": "date",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "schedules_timeslot",
        "name": "timeslot",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "morning",
            "evening",
            "full_day",
            "custom"
          ]
        }
      },
      {
        "system": false,
        "id": "schedules_start_time",
        "name": "start_time",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 5,
          "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
        }
      },
      {
        "system": false,
        "id": "schedules_end_time",
        "name": "end_time",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 5,
          "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
        }
      },
      {
        "system": false,
        "id": "schedules_is_confirmed",
        "name": "is_confirmed",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "schedules_is_available",
        "name": "is_available",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "schedules_notes",
        "name": "notes",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "schedules_confirmed_at",
        "name": "confirmed_at",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "schedules_confirmed_by",
        "name": "confirmed_by",
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
      },
      {
        "system": false,
        "id": "schedules_created_by",
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
    "listRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "viewRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "createRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "updateRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "deleteRule": "user_id = @request.auth.id || @request.auth.role = 'administrator'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_schedules");

  return dao.deleteCollection(collection);
})
