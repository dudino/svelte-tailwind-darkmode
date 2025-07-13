/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_services",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "services",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "services_name",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "services_description",
        "name": "description",
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
        "id": "services_duration_minutes",
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
        "id": "services_price",
        "name": "price",
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
        "id": "services_category",
        "name": "category",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "massage",
            "therapy",
            "relaxation",
            "beauty",
            "wellness",
            "special"
          ]
        }
      },
      {
        "system": false,
        "id": "services_is_active",
        "name": "is_active",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "services_created_by",
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
  const collection = dao.findCollectionByNameOrId("pbc_services");

  return dao.deleteCollection(collection);
})
