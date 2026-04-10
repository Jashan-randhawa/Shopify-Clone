# Chat Application Backend

This is the backend for a real-time chat application built with Node.js, Express, Socket.io, and MongoDB.

## Features

- Real-time messaging using Socket.io
- User authentication with JWT
- Friend management (add, accept, reject, remove)
- Group chat functionality
- File sharing (images, videos, documents, etc.)
- Message read receipts
- Online/offline status
- Typing indicators

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
UPLOAD_PATH=./uploads
```

## Running the Server

### Development Mode

#### Using npm script:
```bash
npm run dev
```

#### Windows users:
You can use the provided batch file or PowerShell script:
```
# Using batch file
start-dev.bat

# Using PowerShell script
.\start-dev.ps1
```

### Debug Mode
```bash
npm run debug
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/search` - Search users
- `POST /api/users/friend-request/send/:userId` - Send friend request
- `POST /api/users/friend-request/accept/:userId` - Accept friend request
- `POST /api/users/friend-request/reject/:userId` - Reject friend request
- `POST /api/users/friend/remove/:userId` - Remove friend
- `GET /api/users/friends` - Get all friends
- `GET /api/users/friend-requests` - Get friend requests

### Chats

- `GET /api/chats` - Get all chats for a user
- `POST /api/chats/direct/:userId` - Create or access one-on-one chat
- `POST /api/chats/group` - Create group chat
- `PUT /api/chats/group/rename/:chatId` - Rename group
- `PUT /api/chats/group/add/:chatId/:userId` - Add member to group
- `PUT /api/chats/group/remove/:chatId/:userId` - Remove member from group
- `PUT /api/chats/group/leave/:chatId` - Leave group
- `DELETE /api/chats/:chatId` - Delete chat

### Messages

- `GET /api/messages/:chatId` - Get all messages for a chat
- `POST /api/messages` - Send a message
- `POST /api/messages/with-attachment` - Send a message with attachment
- `DELETE /api/messages/:messageId` - Delete a message
- `PUT /api/messages/read/:chatId` - Mark messages as read

## Socket.io Events

### Client to Server

- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `read_messages` - Mark messages as read

### Server to Client

- `receive_message` - Receive a new message
- `typing` - Someone is typing
- `stop_typing` - Someone stopped typing
- `messages_read` - Messages have been read
- `friend_status` - Friend online/offline status
- `new_message_notification` - Notification for new message

## Troubleshooting

### Windows PowerShell Users
If you encounter issues with command chaining using `&&`, use the PowerShell syntax with semicolons `;` instead:
```powershell
cd server; npm run dev
```

Or use the provided scripts:
```powershell
.\start-dev.ps1
```

## File Structure

```
server/
├── models/             # Database models
├── routes/             # API routes
├── middleware/         # Middleware functions
├── socket/             # Socket.io handlers
├── uploads/            # Uploaded files
├── .env                # Environment variables
├── package.json        # Dependencies
├── server.js           # Entry point
├── start-dev.bat       # Windows batch file for development
├── start-dev.ps1       # PowerShell script for development
└── README.md           # Documentation
```

## License

MIT 