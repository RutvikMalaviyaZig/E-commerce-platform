# E-commerce-platform

# 🛒 E-Commerce Platform Backend

A full-featured E-Commerce Backend built with **NestJS** and **PostgreSQL** using **TypeORM**. It provides a RESTful API for managing users, roles, products, categories, orders, addresses, and includes authentication and media storage with **Cloudinary**.

---

## 📌 Features

- 🔐 Authentication & Authorization (JWT-based, Role-based)
- 👤 User Management (Signup, Login, Profile)
- 🛡️ Role Management (Admin Only)
- 📦 Product & Category Management
- 📬 Order Management
- 🏠 Address Management
- ❤️ Like System
- ☁️ File Upload with Multer & Cloudinary
- 🐳 Docker Support

---

## 🛠️ Technologies Used

- **Node.js**
- **PostgreSQL** (Relational Database)
- **JWT** & **Bcrypt** (Authentication & Password Hashing)
- **Multer** & **Cloudinary** (File Upload & Storage)
- **Docker** (Containerization)


---

## 🚀 Installation

### ✅ Prerequisites

Ensure the following are installed:

- Node.js (v16+)
- PostgreSQL
- Docker (Optional, for containerized deployment)

### 📥 Clone the Repository

```bash
git clone https://github.com/RutvikMalaviyaZig/E-commerce-platform.git
cd e-commerce-platform
```

### 📦 Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Configuration

Create the following environment files in the root directory:

### `.env.development`

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ecommerce_dev
DB_PORT=5432

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password
```

### `.env.test`

```env
NODE_ENV=test
PORT=3001

DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ecommerce_test
DB_PORT=5432

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password
```

### `.env.production`

```env
NODE_ENV=production
PORT=3000

DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=ecommerce_prod
DB_PORT=5432

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password
```

---

## 🧱 Database Migration & Seeding

```bash
npm run migration:run
npm run seed:run
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run start:prod
```

### Docker (Recommended)

```bash
docker-compose up --build
```

---

## 📡 Endpoints Overview

### 🔐 Authentication

- `POST /auth/signup` - Register a new user  
- `POST /auth/login` - User login

### 👥 Users

- `POST /users` - Create a new user  
- `GET /users` - Get all users (Admin only)  
- `GET /users/id/{id}` - Get a user by ID  
- `GET /users/username/{username}` - Get a user by username  
- `PUT /users/{id}` - Update a user by ID  
- `DELETE /users/{id}` - Delete a user by ID

### 🛡️ Roles

- `POST /roles/{name}` - Create a new role (Admin only)  
- `GET /roles` - Get all roles  
- `GET /roles/name/{name}` - Get a role by name  
- `GET /roles/id/{id}` - Get a role by ID  
- `PUT /roles/{id}` - Update a role by ID (Admin only)  
- `DELETE /roles/{id}` - Delete a role by ID (Admin only)

### 🛒 Products

- `POST /products` - Create a new product  
- `GET /products` - Find all products  
- `GET /products/{id}` - Get a product by ID  
- `PUT /products/{id}` - Update a product (Admin only)  
- `DELETE /products/{id}` - Delete a product (Admin only)

### 🗂️ Categories

- `POST /categories` - Create a new category (Admin only)  
- `GET /categories` - Get all categories  
- `GET /categories/id/{id}` - Get a category by ID  
- `PUT /categories/{id}` - Update a category (Admin only)  
- `DELETE /categories/{id}` - Delete a category (Admin only)

### ❤️ Likes

- `POST /likes` - Create a like  
- `GET /likes` - Get all likes  
- `GET /likes/{id}` - Get a like by ID  
- `DELETE /likes/{id}` - Delete a like

### 📮 Addresses

- `POST /addresses` - Create a new address  
- `GET /addresses` - Get all addresses of the logged-in user  
- `GET /addresses/{id}` - Get an address by ID  
- `PUT /addresses/{id}` - Update an address by ID  
- `DELETE /addresses/{id}` - Delete an address by ID

### 📦 Orders

- `POST /orders` - Create a new order  
- `GET /orders` - Get all orders for the logged-in user  
- `GET /orders/all-users` - Get all orders (Admin only)  
- `GET /orders/{id}` - Get an order by ID  
- `DELETE /orders/{id}` - Delete an order  
- `PUT /orders/{id}/complete` - Complete an order (Admin only)  
- `PUT /orders/{id}/cancel` - Cancel an order (Admin only)

---

## 🤝 Contribution Guidelines

1. Fork the repository  
2. Create a feature branch  
   ```bash
   git checkout -b feature-branch
   ```
3. Commit your changes  
   ```bash
   git commit -m "feat: add new feature"
   ```
4. Push to your branch  
   ```bash
   git push origin feature-branch
   ```
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.