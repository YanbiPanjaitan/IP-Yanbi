# Individual Project Phase 2

# API Documentation (Server)

## Endpoints

List of available endpoints:

- `POST /register`
- `POST /login`
- `POST /auth/google`
- `GET /countries`
- `GET /countries/:id`
- `GET /countries/:id/summary`
- `GET /countries/:id/unsplash`
- `GET /countries/:id/googleMaps`
- `GET /countries/:id/reviews`

Routes below need authentication (Bearer token):

- `POST /countries/:id/reviews`
- `PUT /reviews/:id`
- `DELETE /reviews/:id`

---

## 1. POST /register

**Description:**

- Register user baru.

**Request:**

- Body:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**_Response (201 - Created)_**

```json
{
  "id": "integer",
  "username": "string",
  "email": "string"
}
```

**_Response (400 - Bad Request)_**

```json
{"message": "Email is required"}
```

```json
{"message": "Password is required"}
```

```json
{"message": "Email already exists"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 2. POST /login

**Description:**

- Login user.

**Request:**

- Body:

```json
{
  "email": "string",
  "password": "string"
}
```

**_Response (200 - OK)_**

```json
{
  "access_token": "string",
  "email": "string"
}
```

**_Response (400 - Bad Request)_**

```json
{"message": "Email is required"}
```

```json
{"message": "Password is required"}
```

**_Response (401 - Unauthorized)_**

```json
{"message": "Invalid email/password"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 3. POST /auth/google

**Description:**

- Login/register dengan Google OAuth.

**Request:**

- Body:

```json
{
  "googleToken": "string"
}
```

**_Response (200 - OK)_**

```json
{"access_token": "string"}
```

**_Response (400 - Bad Request)_**

```json
{"message": "Google token is required"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 4. GET /countries

**Description:**

- Mendapatkan daftar negara (dengan filter, search, pagination).

**Request:**

- Query Parameters:

```json
{
  "search": "string (optional, search by name)",
  "filter": "string (optional, filter by region)",
  "page": "integer (optional, default: 1)",
  "limit": "integer (optional, default: 20)"
}
```

**_Response (200 - OK)_**

```json
{
  "page": 1,
  "data": [
    {
      "id": "integer",
      "name": "string",
      "capital": "string",
      "region": "string",
      "population": "integer",
      "flagUrl": "string",
      "latitude": "float",
      "longitude": "float"
    }
  ],
  "totalData": "integer",
  "totalPage": "integer",
  "dataPerPage": "integer"
}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 5. GET /countries/:id

**Description:**

- Mendapatkan detail negara berdasarkan ID.

**Request:**

- Params:

```json
{"id": "integer (required, country ID)"}
```

**_Response (200 - OK)_**

```json
{
  "id": "integer",
  "name": "string",
  "capital": "string",
  "region": "string",
  "population": "integer",
  "flagUrl": "string",
  "latitude": "float",
  "longitude": "float"
}
```

**_Response (404 - Not Found)_**

```json
{"message": "Country with id {id} not found"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 6. GET /countries/:id/summary

**Description:**

- Mendapatkan ringkasan review negara (menggunakan AI).

**Request:**

- Params:

```json
{"id": "integer (required, country ID)"}
```

**_Response (200 - OK)_**

```json
{
  "country": "string",
  "summary": "string"
}
```

**_Response (404 - Not Found)_**

```json
{"message": "Country with id {id} not found"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 7. GET /countries/:id/unsplash

**Description:**

- Mendapatkan foto negara dari Unsplash.

**Request:**

- Params:

```json
{"id": "integer (required, country ID)"}
```

**_Response (200 - OK)_**

```json
{
  "country": "string",
  "photos": [
    /* array of Unsplash photo objects */
  ]
}
```

**_Response (404 - Not Found)_**

```json
{"message": "Country with id {id} not found"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 8. GET /countries/:id/googleMaps

**Description:**

- Mendapatkan koordinat & embed Google Maps negara.

**Request:**

- Params:

```json
{"id": "integer (required, country ID)"}
```

**_Response (200 - OK)_**

```json
{
  "country": "string",
  "coordinates": {"lat": "float", "lng": "float"},
  "mapUrl": "string"
}
```

**_Response (404 - Not Found)_**

```json
{"message": "Country not found in database."}
```

```json
{"message": "Coordinates not found."}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 9. GET /countries/:id/reviews

**Description:**

- Mendapatkan semua review untuk negara tertentu.

**Request:**

- Params:

```json
{"id": "integer (required, country ID)"}
```

**_Response (200 - OK)_**

```json
[
  {
    "id": "integer",
    "userId": "integer",
    "countryId": "integer",
    "rating": "integer",
    "comment": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "User": {
      "username": "string",
      "email": "string"
    }
  }
]
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 10. POST /countries/:id/reviews

**Description:**

- Membuat review baru (auth required).

**Request:**

- Headers:

```json
{"Authorization": "Bearer <access_token>"}
```

- Params:

```json
{"id": "integer (required, country ID)"}
```

- Body:

```json
{
  "rating": "integer (1-5)",
  "comment": "string"
}
```

**_Response (201 - Created)_**

```json
{
  "id": "integer",
  "userId": "integer",
  "countryId": "integer",
  "rating": "integer",
  "comment": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "User": {
    "username": "string",
    "email": "string"
  }
}
```

**_Response (400 - Bad Request)_**

```json
{"message": "All fields are required"}
```

**_Response (401 - Unauthorized)_**

```json
{"message": "Unauthorized"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 11. PUT /reviews/:id

**Description:**

- Update review (hanya owner, auth required).

**Request:**

- Headers:

```json
{"Authorization": "Bearer <access_token>"}
```

- Params:

```json
{"id": "integer (required, review ID)"}
```

- Body:

```json
{
  "rating": "integer (1-5)",
  "comment": "string"
}
```

**_Response (200 - OK)_**

```json
{
  "id": "integer",
  "userId": "integer",
  "countryId": "integer",
  "rating": "integer",
  "comment": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "User": {
    "username": "string",
    "email": "string"
  }
}
```

**_Response (400 - Bad Request)_**

```json
{"message": "All fields are required"}
```

```json
{"message": "At least one field must be provided for update"}
```

**_Response (401 - Unauthorized)_**

```json
{"message": "Unauthorized"}
```

**_Response (403 - Forbidden)_**

```json
{"message": "You are not authorized"}
```

**_Response (404 - Not Found)_**

```json
{"message": "Review not found"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

## 12. DELETE /reviews/:id

**Description:**

- Hapus review (hanya owner, auth required).

**Request:**

- Headers:

```json
{"Authorization": "Bearer <access_token>"}
```

- Params:

```json
{"id": "integer (required, review ID)"}
```

**_Response (204 - No Content)_**
(no body)

**_Response (401 - Unauthorized)_**

```json
{"message": "Unauthorized"}
```

**_Response (403 - Forbidden)_**

```json
{"message": "You are not authorized"}
```

**_Response (404 - Not Found)_**

```json
{"message": "Review not found"}
```

**_Response (500 - Internal Server Error)_**

```json
{"message": "Internal Server Error"}
```

---

# P2-Challenge-2 (Client Side)

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

Authentication is required for review endpoints using Bearer Token.

```
Authorization: Bearer <access_token>
```

## Public Endpoints

### 1. Get All Countries

Retrieve a list of countries with optional filtering, searching, and pagination.

- **URL**: `/countries`
- **Method**: `GET`
- **Query Parameters**:

  - `page`: Page number for pagination
  - `limit`: Items per page
  - `search`: Search by country name
  - `filter`: Filter by region

- **Success Response**:
  ```json
  {
    "page": 1,
    "data": [
      {
        "id": 1,
        "name": "Indonesia",
        "capital": "Jakarta",
        "region": "Asia",
        "population": 273523621,
        "flagUrl": "https://example.com/flag.png",
        "latitude": -6.2,
        "longitude": 106.8
      }
    ],
    "totalData": 1,
    "totalPage": 1,
    "dataPerPage": 20
  }
  ```

### 2. Get Country Detail

Retrieve detailed information about a specific country.

- **URL**: `/countries/:id`
- **Method**: `GET`
- **URL Parameters**:

  - `id`: Country ID

- **Success Response**:
  ```json
  {
    "id": 1,
    "name": "Indonesia",
    "capital": "Jakarta",
    "region": "Asia",
    "population": 273523621,
    "flagUrl": "https://example.com/flag.png",
    "latitude": -6.2,
    "longitude": 106.8
  }
  ```

### 3. Get Country Summary (AI)

Retrieve an AI-generated summary of reviews for a country.

- **URL**: `/countries/:id/summary`
- **Method**: `GET`
- **URL Parameters**:

  - `id`: Country ID

- **Success Response**:
  ```json
  {
    "country": "Indonesia",
    "summary": "Ringkasan review untuk Indonesia ..."
  }
  ```

### 4. Get Country Photos (Unsplash)

Retrieve Unsplash photos for a country.

- **URL**: `/countries/:id/unsplash`
- **Method**: `GET`
- **URL Parameters**:

  - `id`: Country ID

- **Success Response**:
  ```json
  {
    "country": "Indonesia",
    "photos": [
      {
        "id": "photo_id",
        "urls": {"small": "https://..."},
        "alt_description": "..."
      }
    ]
  }
  ```

### 5. Get Country Google Maps

Retrieve Google Maps coordinates and embed URL for a country.

- **URL**: `/countries/:id/googleMaps`
- **Method**: `GET`
- **URL Parameters**:

  - `id`: Country ID

- **Success Response**:
  ```json
  {
    "country": "Indonesia",
    "coordinates": {"lat": -6.2, "lng": 106.8},
    "mapUrl": "https://www.google.com/maps/embed/v1/view?..."
  }
  ```

### 6. Get All Reviews for a Country

Retrieve all reviews for a specific country.

- **URL**: `/countries/:id/reviews`
- **Method**: `GET`
- **URL Parameters**:

  - `id`: Country ID

- **Success Response**:
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "countryId": 1,
      "rating": 5,
      "comment": "Great place!",
      "createdAt": "2025-05-02T00:00:00.000Z",
      "updatedAt": "2025-05-02T00:00:00.000Z",
      "User": {
        "username": "reviewer",
        "email": "reviewer@mail.com"
      }
    }
  ]
  ```

## Review Endpoints (Requires Authentication)

### 1. Register

- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "user1",
    "email": "user1@mail.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": 1,
    "username": "user1",
    "email": "user1@mail.com"
  }
  ```

### 2. Login

- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user1@mail.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  ```json
  {
    "access_token": "...jwt...",
    "email": "user1@mail.com"
  }
  ```

### 3. Google Login

- **URL**: `/auth/google`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "googleToken": "..."
  }
  ```
- **Success Response**:
  ```json
  {
    "access_token": "...jwt..."
  }
  ```

### 4. Create Review

- **URL**: `/countries/:id/reviews`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Amazing!"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": 2,
    "userId": 1,
    "countryId": 1,
    "rating": 5,
    "comment": "Amazing!",
    "createdAt": "2025-05-02T00:00:00.000Z",
    "updatedAt": "2025-05-02T00:00:00.000Z",
    "User": {
      "username": "user1",
      "email": "user1@mail.com"
    }
  }
  ```

### 5. Update Review

- **URL**: `/reviews/:id`
- **Method**: `PUT`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "rating": 4,
    "comment": "Updated review."
  }
  ```
- **Success Response**:
  ```json
  {
    "id": 2,
    "userId": 1,
    "countryId": 1,
    "rating": 4,
    "comment": "Updated review.",
    "createdAt": "2025-05-02T00:00:00.000Z",
    "updatedAt": "2025-05-02T00:00:00.000Z",
    "User": {
      "username": "user1",
      "email": "user1@mail.com"
    }
  }
  ```

### 6. Delete Review

- **URL**: `/reviews/:id`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Success Response**:
  - Status: `204 No Content`

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Not authorized to perform the action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Example error response:

```json
{
  "message": "Detailed error message"
}
```

**Deployment**

```
server: http://localhost:3000

frontend: Jalankan di http://localhost:5173
```

**Login Account contoh:**

```
email: reviewer@mail.com
password: password123
```

---

Silakan sesuaikan base URL dan akun login sesuai environment Anda.
