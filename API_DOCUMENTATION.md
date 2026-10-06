# IndustrialFlow ERP — API Documentation

## 1. Overview

IndustrialFlow ERP provides REST APIs for managing the complete sales and dispatch workflow:

**Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch**

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt Password Hashing

### Base URL

```text
http://localhost:5000
```

For a deployed backend, replace the base URL with the deployed backend URL.

---

# 2. Authentication

Most APIs require a JWT access token.

Send the token using the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 2.1 Register User

### Endpoint

```http
POST /api/auth/register
```

### Authentication

Not required.

### Description

Registers a new sales user.

Public registration always creates the user with the `SALES_USER` role.

### Request Body

```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "123456"
}
```

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "USER_ID",
    "fullName": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "SALES_USER"
  }
}
```

### Possible Errors

```text
400 - Full name, email and password are required
400 - Password must be at least 6 characters
409 - User with this email already exists
500 - Failed to register user
```

---

# 3. Login

## 3.1 Login User

### Endpoint

```http
POST /api/auth/login
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "USER_ID",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Possible Errors

```text
400 - Email and password are required
401 - Invalid email or password
```

---

# 4. User Management

User management is restricted to administrators.

## 4.1 Get All Users

### Endpoint

```http
GET /api/users
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Success Response

**200 OK**

```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "_id": "USER_ID",
      "fullName": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    {
      "_id": "USER_ID",
      "fullName": "Sales User",
      "email": "sales@example.com",
      "role": "SALES_USER"
    }
  ]
}
```

---

## 4.2 Create Sales User

### Endpoint

```http
POST /api/users
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Request Body

```json
{
  "fullName": "Sales Executive",
  "email": "sales@example.com",
  "password": "123456"
}
```

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Sales user created successfully",
  "user": {
    "id": "USER_ID",
    "fullName": "Sales Executive",
    "email": "sales@example.com",
    "role": "SALES_USER"
  }
}
```

### Possible Errors

```text
400 - Required fields missing
400 - Password must be at least 6 characters
403 - You are not authorized to perform this action
409 - User with this email already exists
```

---

# 5. Customers

## 5.1 Create Customer

### Endpoint

```http
POST /api/customers
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Request Body

```json
{
  "companyName": "ABC Engineering Pvt. Ltd.",
  "contactPerson": "Rahul Sharma",
  "mobile": "9876543210",
  "email": "rahul@abcengineering.com",
  "city": "Bhubaneswar"
}
```

### Success

**201 Created**

Returns the created customer.

---

## 5.2 Get Customers

### Endpoint

```http
GET /api/customers
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Success

**200 OK**

Returns the list of customers.

---

# 6. Products

Products represent the items sold by the industrial business.

## Product Example

```json
{
  "productCode": "IND-004",
  "productName": "Control Panel",
  "category": "Electrical",
  "unit": "PCS",
  "basePrice": 18000
}
```

Product units supported:

```text
PCS
KG
MTR
LTR
BOX
```

---

# 7. Inventory

Inventory maintains physical stock and reserved stock.

Available stock is calculated as:

```text
Available Quantity =
Physical Quantity - Reserved Quantity
```

## 7.1 Get All Inventory

### Endpoint

```http
GET /api/inventory
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Success

**200 OK**

Returns inventory with populated product information.

---

## 7.2 Get Inventory By Product

### Endpoint

```http
GET /api/inventory/:productId
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Example

```http
GET /api/inventory/PRODUCT_ID
```

---

## 7.3 Update Physical Inventory

### Endpoint

```http
PATCH /api/inventory/:productId
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Request Body

```json
{
  "physicalQuantity": 100
}
```

### Validation

Physical quantity:

* must be a number
* cannot be negative
* cannot be less than the currently reserved quantity

### Example Error

```json
{
  "success": false,
  "message": "physicalQuantity cannot be negative"
}
```

---

# 8. Customer Enquiry

The enquiry is the first business stage of the ERP workflow.

## 8.1 Create Enquiry

### Endpoint

```http
POST /api/enquiries
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Workflow

```text
Customer
   ↓
Enquiry
```

An enquiry contains:

* enquiry number
* customer
* enquiry date
* required date
* notes
* products
* quantities
* status

Initial status:

```text
NEW
```

---

## 8.2 Get Enquiries

### Endpoint

```http
GET /api/enquiries
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

---

# 9. Quotation

A quotation is created from a customer enquiry.

## 9.1 Create Quotation

### Endpoint

```http
POST /api/quotations
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Main Rules

* Enquiry must exist.
* Enquiry cannot already be `WON` or `LOST`.
* Products must belong to the enquiry.
* Quoted quantity cannot exceed enquiry quantity.
* Unit price defaults to the product base price.
* Discount and GST are calculated by the backend.
* Total amount is calculated by the backend.

### Quotation Status

```text
DRAFT
SENT
ACCEPTED
REJECTED
```

---

## 9.2 Get Quotations

### Endpoint

```http
GET /api/quotations
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

---

## 9.3 Update Quotation Status

### Endpoint

```http
PATCH /api/quotations/:id/status
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Request Body

```json
{
  "status": "SENT"
}
```

Valid statuses:

```text
SENT
ACCEPTED
REJECTED
```

### Business Rules

Quotation status follows the workflow:

```text
DRAFT
  ↓
SENT
  ↓
ACCEPTED / REJECTED
```

When quotation becomes:

```text
ACCEPTED
```

the related enquiry becomes:

```text
WON
```

When quotation becomes:

```text
REJECTED
```

the related enquiry becomes:

```text
LOST
```

---

# 10. Sales Order

A sales order can only be created from an accepted quotation.

## 10.1 Create Sales Order

### Endpoint

```http
POST /api/sales-orders
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Request Body

```json
{
  "orderNumber": "SO-2026-001",
  "quotationId": "QUOTATION_ID"
}
```

### Business Rules

* Quotation must exist.
* Quotation must have `ACCEPTED` status.
* Only one sales order can be created for a quotation.
* Customer and order items are copied from the quotation.
* Initial status is `PENDING`.

### Success

**201 Created**

The API returns the created sales order and its items.

---

## 10.2 Get Sales Orders

### Endpoint

```http
GET /api/sales-orders
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Sales Order Status

```text
PENDING
CONFIRMED
DISPATCHED
CANCELLED
```

---

# 11. Inventory Reservation

Inventory reservation occurs when a pending sales order is confirmed.

## 11.1 Confirm Sales Order

### Endpoint

```http
PATCH /api/sales-orders/:id/confirm
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Workflow

```text
PENDING
   ↓
Inventory Availability Check
   ↓
Reserve Required Quantity
   ↓
CONFIRMED
```

### Reservation Formula

```text
Available Quantity =
Physical Quantity - Reserved Quantity
```

The order can only be confirmed when enough inventory is available.

### Example

```text
Physical Quantity = 100
Reserved Quantity = 20

Available Quantity = 100 - 20
                   = 80
```

If the order requires 30:

```text
Reserved Quantity = 20 + 30
                   = 50
```

Available quantity becomes:

```text
100 - 50 = 50
```

### Transaction Handling

The reservation operation uses a MongoDB transaction.

If any product does not have sufficient stock:

```text
Entire transaction is rolled back.
```

This prevents partial inventory reservations.

---

# 12. Dispatch

Dispatch is the final stage of the ERP workflow.

## 12.1 Create Dispatch

### Endpoint

```http
POST /api/dispatches/:id
```

Here `:id` is the Sales Order ID.

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

### Request Body

```json
{
  "dispatchNumber": "DISP-2026-001"
}
```

### Business Rules

The Sales Order must have:

```text
CONFIRMED
```

status.

During dispatch:

```text
Physical Quantity
        ↓
decreased

Reserved Quantity
        ↓
decreased
```

After successful dispatch:

```text
Sales Order → DISPATCHED
```

### Example

Before dispatch:

```text
Physical = 100
Reserved = 30
Available = 70
```

After dispatching 30:

```text
Physical = 70
Reserved = 0
Available = 70
```

---

## 12.2 Get Dispatches

### Endpoint

```http
GET /api/dispatches
```

### Authentication

Required.

### Roles

```text
ADMIN
SALES_USER
```

Returns all dispatch records with populated sales order information.

---

# 13. Complete ERP Workflow

The complete business workflow is:

```text
Customer
   ↓
Customer Enquiry
   ↓
Quotation
   ↓
Quotation Accepted
   ↓
Sales Order
   ↓
Inventory Availability Check
   ↓
Inventory Reservation
   ↓
Sales Order Confirmed
   ↓
Dispatch
   ↓
Sales Order Dispatched
```

---

# 14. Authentication and Authorization

The application uses JWT-based authentication.

### Authentication

Users first login:

```http
POST /api/auth/login
```

The server returns a JWT.

The frontend sends the token with protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Roles

The system contains two roles:

```text
ADMIN
SALES_USER
```

### ADMIN

Administrators can:

* Manage users
* Create sales users
* View users
* Update physical inventory
* Perform normal sales operations

### SALES_USER

Sales users can:

* View customers
* Create customers
* Create enquiries
* Create quotations
* Create sales orders
* Confirm orders
* Create dispatches
* View inventory

Sales users cannot perform administrator-only operations such as creating users or updating physical inventory.

---

# 15. Error Handling

The API returns JSON responses using a consistent structure.

### Success

```json
{
  "success": true,
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

| Status | Meaning                         |
| ------ | ------------------------------- |
| 200    | Successful request              |
| 201    | Resource created                |
| 400    | Invalid request/business rule   |
| 401    | Authentication required/invalid |
| 403    | Insufficient permissions        |
| 404    | Resource not found              |
| 409    | Duplicate/conflicting resource  |
| 500    | Server error                    |

---

# 16. API Testing

The backend contains automated Jest + Supertest tests.

Current test coverage includes:

1. Sales user registration
2. Sales user cannot create another user
3. Duplicate sales order protection
4. Authentication protection
5. Invalid inventory update protection

Run tests using:

```bash
npm test
```

Expected result:

```text
Test Suites: 1 passed
Tests: 5 passed
```

---

# 17. Security

The backend implements:

* JWT authentication
* Password hashing using bcrypt
* Role-based access control
* Protected routes
* Server-side validation
* Duplicate resource protection
* Inventory validation
* MongoDB transaction for inventory reservation and dispatch
* Client-supplied role is ignored during public registration

---

# 18. Notes

The current implementation uses:

```text
MongoDB + Mongoose
```

instead of the PostgreSQL requirement specified in the original case study.

The business workflow and REST API architecture remain relational-style and follow the required ERP process.
