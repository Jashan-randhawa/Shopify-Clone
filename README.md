# 🛍️ Shopify Clone

A full-stack e-commerce web application inspired by Shopify, featuring a React + Vite frontend, a Node.js/Express backend, real-time chat via Socket.io, and MongoDB for data persistence.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Pages & Routes](#pages--routes)
- [API Endpoints](#api-endpoints)
- [Socket.io Events](#socketio-events)
- [Deployment](#deployment)
- [License](#license)

---

## ✨ Features

### 🛒 E-Commerce
- Product listing with search and filter functionality
- Product detail pages with images, ratings, and descriptions
- Shopping cart management (add, update, remove items)
- Checkout flow with order placement
- Order history and tracking
- User profile management

### 💬 Real-Time Chat
- Direct messaging between users
- Group chat creation and management
- File/media sharing (images, videos, documents)
- Typing indicators and read receipts
- Online/offline status indicators
- Push notifications for new messages

### 🔐 Authentication & Roles
- JWT-based user authentication
- Protected routes for authenticated users
- Admin role with access to a management dashboard
- Friend system (send, accept, reject, remove)

### 🛠️ Admin Dashboard
- Product and order management
- User analytics with charts (Chart.js)
- Overview of store metrics

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI development |
| Vite | Fast dev server & bundling |
| React Router v6 | Client-side routing |
| Material UI (MUI) | UI component library |
| Axios | HTTP client |
| Socket.io-client | Real-time communication |
| React Hot Toast | Notifications |
| Chart.js / react-chartjs-2 | Admin analytics charts |
| Moment.js | Date formatting |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time WebSocket events |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Multer | File upload handling |
| dotenv | Environment configuration |
| cors, cookie-parser | Middleware |

---

## 📁 Project Structure

```
Shopify-Clone-main/
├── client/
│   └── vite-project/
│       ├── public/
│       ├── src/
│       │   ├── component/
│       │   │   ├── auth/          # Route protection components
│       │   │   ├── dialogs/       # Modals (Add Member, Delete, Groups, File Menu)
│       │   │   ├── layout/        # App layout, Navbar, Header, Loaders
│       │   │   ├── shared/        # Reusable components (ProductCard, ChatItem, etc.)
│       │   │   ├── specific/      # Feature-specific (Search, Notification, Profile)
│       │   │   └── style/         # Styled components
│       │   ├── constants/         # Colors, sample data
│       │   ├── context/           # AuthContext, CartContext
│       │   ├── lib/               # Utility features/helpers
│       │   ├── pages/
│       │   │   ├── admin/         # AdminLogin, Dashboard
│       │   │   ├── Home.jsx
│       │   │   ├── Products.jsx
│       │   │   ├── ProductDetail.jsx
│       │   │   ├── Cart.jsx
│       │   │   ├── Checkout.jsx
│       │   │   ├── Orders.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Chat.jsx
│       │   │   ├── Group.jsx
│       │   │   └── Login.jsx
│       │   ├── utils/             # API config, validators, socket setup
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── index.html
│       └── vite.config.js
│
└── server/
    ├── middleware/
    │   ├── auth.js                # JWT verification
    │   └── upload.js              # Multer file upload config
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Cart.js
    │   ├── Order.js
    │   ├── Chat.js
    │   ├── Message.js
    │   └── Notification.js
    ├── routes/
    │   ├── auth.js
    │   ├── user.js
    │   ├── product.js
    │   ├── cart.js
    │   ├── order.js
    │   ├── chat.js
    │   └── message.js
    ├── socket/
    │   └── socketHandlers.js      # All Socket.io event logic
    ├── server.js                  # Entry point
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- **MongoDB** (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jashan-randhawa/Shopify-Clone.git
   cd Shopify-Clone
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client/vite-project
   npm install
   ```

### Environment Variables

#### Backend (`server/.env`)

Copy the example file and fill in your values:
```bash
cp server/.env.example server/.env
```

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopify-clone
JWT_SECRET=your_long_random_secret_here
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/vite-project/.env`)

Copy the example file:
```bash
cp client/vite-project/.env.example client/vite-project/.env
```

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### Running the App

**Start the backend server:**
```bash
cd server
npm run dev        # Development mode with nodemon
# or
npm start          # Production mode
```

> **Windows users** can use the included scripts:
> ```
> start-dev.bat        # Batch file
> .\start-dev.ps1      # PowerShell
> ```

**Start the frontend dev server (in a new terminal):**
```bash
cd client/vite-project
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The backend will auto-seed 100 products from [DummyJSON](https://dummyjson.com) on first startup if no products exist.

---

## 🗺️ Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page — featured products |
| `/products` | Public | All products with search & filter |
| `/products/:id` | Public | Product detail page |
| `/cart` | Public | Shopping cart |
| `/login` | Guest only | Login / Register |
| `/checkout` | Auth required | Checkout flow |
| `/orders` | Auth required | Order history |
| `/profile` | Auth required | User profile |
| `/admin` | Admin only | Admin dashboard |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:itemId` | Update cart item |
| DELETE | `/api/cart/:itemId` | Remove cart item |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Get user's orders |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/:id` | Get order details |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/search` | Search users |
| POST | `/api/users/friend-request/send/:userId` | Send friend request |
| POST | `/api/users/friend-request/accept/:userId` | Accept friend request |
| POST | `/api/users/friend-request/reject/:userId` | Reject friend request |
| POST | `/api/users/friend/remove/:userId` | Remove friend |
| GET | `/api/users/friends` | Get all friends |
| GET | `/api/users/friend-requests` | Get pending friend requests |

### Chats
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chats` | Get all chats |
| POST | `/api/chats/direct/:userId` | Create or open direct chat |
| POST | `/api/chats/group` | Create group chat |
| PUT | `/api/chats/group/rename/:chatId` | Rename group |
| PUT | `/api/chats/group/add/:chatId/:userId` | Add member |
| PUT | `/api/chats/group/remove/:chatId/:userId` | Remove member |
| PUT | `/api/chats/group/leave/:chatId` | Leave group |
| DELETE | `/api/chats/:chatId` | Delete chat |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:chatId` | Get chat messages |
| POST | `/api/messages` | Send a message |
| POST | `/api/messages/with-attachment` | Send message with file |
| DELETE | `/api/messages/:messageId` | Delete a message |
| PUT | `/api/messages/read/:chatId` | Mark messages as read |

---

## ⚡ Socket.io Events

### Client → Server
| Event | Description |
|---|---|
| `join_chat` | Join a chat room |
| `leave_chat` | Leave a chat room |
| `send_message` | Send a new message |
| `typing` | Notify others that user is typing |
| `stop_typing` | Notify others that user stopped typing |
| `read_messages` | Mark messages in a chat as read |

### Server → Client
| Event | Description |
|---|---|
| `receive_message` | Receive an incoming message |
| `typing` | Someone is typing in the chat |
| `stop_typing` | Someone stopped typing |
| `messages_read` | Messages were read by another user |
| `friend_status` | Friend online/offline status update |
| `new_message_notification` | New message notification |

---

## ☁️ Deployment

This project is configured for deployment on **Render**. See [DEPLOY.md](./DEPLOY.md) for a step-by-step guide covering:

1. Setting up MongoDB Atlas
2. Deploying the backend as a Web Service
3. Deploying the frontend as a Static Site
4. Configuring CORS and environment variables

A `render.yaml` file is also included for blueprint-based deployment.

---

## 📄 License

This project is licensed under the **MIT License**.
