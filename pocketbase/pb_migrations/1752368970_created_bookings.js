/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_bookings",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "bookings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "bookings_booking_number",
        "name": "booking_number",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "min": 5,
          "max": 20,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "bookings_client_id",
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
        "id": "bookings_user_id",
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
        "id": "bookings_room_id",
        "name": "room_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_rooms",
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
        "id": "bookings_service_id",
        "name": "service_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_services",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": null,
          "displayFields": [
            "name"
          ]
        }
      },
      {
        "system": false,
        "id": "bookings_date",
        "name": "date",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "bookings_start_time",
        "name": "start_time",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 5,
          "max": 5,
          "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
        }
      },
      {
        "system": false,
        "id": "bookings_end_time",
        "name": "end_time",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 5,
          "max": 5,
          "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
        }
      },
      {
        "system": false,
        "id": "bookings_duration_minutes",
        "name": "duration_minutes",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 15,
          "max": 480,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "bookings_is_confirmed",
        "name": "is_confirmed",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "bookings_pin_code",
        "name": "pin_code",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 4,
          "max": 6,
          "pattern": "^[0-9]+$"
        }
      },
      {
        "system": false,
        "id": "bookings_pin_used_at",
        "name": "pin_used_at",
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
        "id": "bookings_special_requests",
        "name": "special_requests",
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
        "id": "bookings_cancellation_reason",
        "name": "cancellation_reason",
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
        "id": "bookings_cancelled_at",
        "name": "cancelled_at",
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
        "id": "bookings_cancelled_by",
        "name": "cancelled_by",
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
        "id": "bookings_created_by",
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
      },
      {
        "system": false,
        "id": "bookings_confirmed_at",
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
        "id": "bookings_confirmed_by",
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
      }
    ],
    "indexes": [],
    "listRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "viewRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "createRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "updateRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "deleteRule": "@request.auth.role = 'administrator'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_bookings");

  return dao.deleteCollection(collection);
})
