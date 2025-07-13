/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_clients",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "clients",
    "type": "base",
    "system": false,
    "schema": [
      {
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
      },
      {
        "system": false,
        "id": "clients_channel",
        "name": "channel",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "whatsapp",
            "telegram",
            "phone",
            "walk_in"
          ]
        }
      },
      {
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
      },
      {
        "system": false,
        "id": "clients_first_name",
        "name": "first_name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 50,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "clients_last_name",
        "name": "last_name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 50,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "clients_email",
        "name": "email",
        "type": "email",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "clients_date_of_birth",
        "name": "date_of_birth",
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
        "id": "clients_preferred_language",
        "name": "preferred_language",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "cz",
            "en",
            "ru",
            "de",
            "sk"
          ]
        }
      },
      {
        "system": false,
        "id": "clients_description",
        "name": "description",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 1000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "clients_is_blocked",
        "name": "is_blocked",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "clients_blocked_reason",
        "name": "blocked_reason",
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
        "id": "clients_blocked_at",
        "name": "blocked_at",
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
        "id": "clients_blocked_by",
        "name": "blocked_by",
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
        "id": "clients_last_visit_at",
        "name": "last_visit_at",
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
        "id": "clients_total_visits",
        "name": "total_visits",
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
        "id": "clients_created_by",
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
    "listRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "viewRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "createRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "updateRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "deleteRule": "@request.auth.role = 'administrator'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_clients");

  return dao.deleteCollection(collection);
})
