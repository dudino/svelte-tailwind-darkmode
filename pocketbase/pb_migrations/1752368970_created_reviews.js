/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_reviews",
    "created": "2025-07-13 01:09:30.722Z",
    "updated": "2025-07-13 01:09:30.722Z",
    "name": "reviews",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "reviews_booking_id",
        "name": "booking_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": true,
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
        "id": "reviews_client_id",
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
        "id": "reviews_user_id",
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
        "id": "reviews_rating",
        "name": "rating",
        "type": "number",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 5,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "reviews_title",
        "name": "title",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "reviews_content",
        "name": "content",
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
        "id": "reviews_is_anonymous",
        "name": "is_anonymous",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "reviews_is_published",
        "name": "is_published",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "reviews_response",
        "name": "response",
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
        "id": "reviews_responded_at",
        "name": "responded_at",
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
        "id": "reviews_responded_by",
        "name": "responded_by",
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
    "listRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || (@request.auth.role = 'operator' && is_published = true)",
    "viewRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || (@request.auth.role = 'operator' && is_published = true)",
    "createRule": "@request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "updateRule": "user_id = @request.auth.id || @request.auth.role = 'administrator' || @request.auth.role = 'operator'",
    "deleteRule": "@request.auth.role = 'administrator'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_reviews");

  return dao.deleteCollection(collection);
})
