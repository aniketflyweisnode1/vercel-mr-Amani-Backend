# SocketChat API Documentation

This module provides both REST API endpoints and real-time Socket.io chat functionality for one-to-one messaging.

## Table of Contents

- [Features](#features)
- [Setup](#setup)
- [REST API Endpoints](#rest-api-endpoints)
- [Socket.io Events](#socketio-events)
- [Authentication](#authentication)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)

## Features

- ✅ Real-time one-to-one messaging via Socket.io
- ✅ Typing indicators
- ✅ Chat history retrieval
- ✅ Online/offline user status
- ✅ Image/file sharing support
- ✅ Emoji support
- ✅ REST API for chat management
- ✅ JWT-based authentication

## Setup

### 1. Initialize Socket.io Server

In your main server file (e.g., `src/index.js`), initialize the Socket.io server:

```javascript
const http = require('http');
const express = require('express');
const socketChatRoutes = require('./routes/Chat/SocketChat.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketChatRoutes.initializeSocket(server);

// Mount REST API routes
app.use('/api/v2/socketchat', socketChatRoutes);

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. Client-Side Setup

Install Socket.io client library:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

## REST API Endpoints

Base URL: `/api/v2/socketchat`

### 1. Create Chat Message

**POST** `/create`

Create a new chat message via REST API.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "UserName": "John Doe",
  "User_id": 55,
  "TextMessage": "Hello, how are you?",
  "fileImage": "https://example.com/image.jpg",
  "emozi": "😊",
  "Status": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat message created successfully",
  "data": {
    "Chat_id": 1,
    "UserName": "John Doe",
    "User_id": 55,
    "TextMessage": "Hello, how are you?",
    "fileImage": "https://example.com/image.jpg",
    "emozi": "😊",
    "Status": true,
    "created_at": "2025-01-19T12:00:00.000Z"
  }
}
```

### 2. Get All Chats

**GET** `/getAll`

Retrieve all chat messages with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `status` (optional): Filter by status (true/false)
- `User_id` (optional): Filter by user ID

**Example:**
```
GET /api/v2/socketchat/getAll?page=1&limit=20&status=true
```

### 3. Get Chat by ID

**GET** `/getById/:id`

Retrieve a specific chat message by ID.

**Parameters:**
- `id`: Chat ID (MongoDB ObjectId or numeric Chat_id)

**Example:**
```
GET /api/v2/socketchat/getById/1
```

### 4. Update Chat Message

**PUT** `/update/:id`

Update an existing chat message.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "TextMessage": "Updated message",
  "Status": true
}
```

### 5. Delete Chat Message

**DELETE** `/delete/:id`

Soft delete a chat message (sets Status to false).

**Headers:**
```
Authorization: Bearer <token>
```

### 6. Get Chats by Authenticated User

**GET** `/getByAuth`

Get all chat messages for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `status` (optional): Filter by status

### 7. Get Chats by User ID

**GET** `/getByUserId/:User_id`

Get all chat messages for a specific user.

**Parameters:**
- `User_id`: User ID (number)

**Example:**
```
GET /api/v2/socketchat/getByUserId/55
```

## Socket.io Events

### Client → Server Events

#### 1. Connect to Server

**Event:** `connection` (automatic)

**Authentication:**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

**Alternative (using headers):**
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
});
```

#### 2. Send Message

**Event:** `send_message`

**Payload:**
```javascript
socket.emit('send_message', {
  receiverId: 56,              // Required: Receiver user ID
  message: 'Hello!',            // Required: Message text (or fileImage)
  fileImage: 'https://...',     // Optional: Image/file URL
  emozi: '😊'                   // Optional: Emoji
});
```

**Response Events:**
- `message_sent` - Confirmation to sender
- `receive_message` - Message received by receiver (if online)
- `error` - Error occurred

#### 3. Typing Indicator

**Event:** `typing`

**Payload:**
```javascript
socket.emit('typing', {
  receiverId: 56,    // Required: Receiver user ID
  isTyping: true     // Required: Typing status
});
```

**Response Event:**
- `user_typing` - Sent to receiver

#### 4. Get Chat History

**Event:** `get_chat_history`

**Payload:**
```javascript
socket.emit('get_chat_history', {
  otherUserId: 56,   // Required: Other user ID
  page: 1,           // Optional: Page number (default: 1)
  limit: 50          // Optional: Messages per page (default: 50)
});
```

**Response Event:**
- `chat_history` - Chat history data

### Server → Client Events

#### 1. Connection Success

**Event:** `connected`

**Payload:**
```json
{
  "success": true,
  "message": "Connected to chat server",
  "userId": 55,
  "userName": "John Doe",
  "socketId": "socket-id-123"
}
```

#### 2. Receive Message

**Event:** `receive_message`

**Payload:**
```json
{
  "Chat_id": 1,
  "UserName": "John Doe",
  "User_id": 55,
  "TextMessage": "Hello!",
  "fileImage": null,
  "emozi": "😊",
  "created_at": "2025-01-19T12:00:00.000Z",
  "timestamp": "2025-01-19T12:00:00.000Z"
}
```

#### 3. Message Sent Confirmation

**Event:** `message_sent`

**Payload:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "Chat_id": 1,
    "UserName": "John Doe",
    "User_id": 55,
    "TextMessage": "Hello!",
    "created_at": "2025-01-19T12:00:00.000Z"
  }
}
```

#### 4. User Typing

**Event:** `user_typing`

**Payload:**
```json
{
  "userId": 55,
  "userName": "John Doe",
  "isTyping": true
}
```

#### 5. Chat History

**Event:** `chat_history`

**Payload:**
```json
{
  "success": true,
  "data": [
    {
      "Chat_id": 1,
      "UserName": "John Doe",
      "User_id": 55,
      "TextMessage": "Hello!",
      "created_at": "2025-01-19T12:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 50
}
```

#### 6. User Connected

**Event:** `user_connected`

**Payload:**
```json
{
  "userId": 55,
  "userName": "John Doe",
  "socketId": "socket-id-123"
}
```

#### 7. User Disconnected

**Event:** `user_disconnected`

**Payload:**
```json
{
  "userId": 55,
  "userName": "John Doe"
}
```

#### 8. Error

**Event:** `error`

**Payload:**
```json
{
  "message": "Error message here"
}
```

## Authentication

### REST API Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Socket.io Authentication

Socket.io connections require authentication via:

1. **Auth object (recommended):**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

2. **Authorization header:**
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
});
```

**Token Format:**
- JWT token signed with secret: `'newuserToken'`
- Token must contain `userId` or `user_id` field
- User must exist and have `status: true`

## Usage Examples

### React/React Native Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ token, userId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connected', (data) => {
      console.log('Connected:', data);
    });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    newSocket.on('user_typing', (data) => {
      setIsTyping(data.isTyping);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const sendMessage = (receiverId, message) => {
    socket.emit('send_message', {
      receiverId,
      message
    });
  };

  const handleTyping = (receiverId, typing) => {
    socket.emit('typing', {
      receiverId,
      isTyping: typing
    });
  };

  const getChatHistory = (otherUserId) => {
    socket.emit('get_chat_history', {
      otherUserId,
      page: 1,
      limit: 50
    });

    socket.once('chat_history', (data) => {
      setMessages(data.data);
    });
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
}
```

### Node.js Client Example

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
  
  // Send a message
  socket.emit('send_message', {
    receiverId: 56,
    message: 'Hello from Node.js!',
    emozi: '👋'
  });
});

socket.on('receive_message', (message) => {
  console.log('Received message:', message);
});

socket.on('message_sent', (data) => {
  console.log('Message sent:', data);
});

socket.on('error', (error) => {
  console.error('Error:', error);
});
```

### JavaScript/HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket Chat</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <div id="messages"></div>
  <input type="text" id="messageInput" />
  <button onclick="sendMessage()">Send</button>

  <script>
    const token = 'your-jwt-token';
    const socket = io('http://localhost:3000', {
      auth: { token }
    });

    socket.on('connected', (data) => {
      console.log('Connected:', data);
    });

    socket.on('receive_message', (message) => {
      const messagesDiv = document.getElementById('messages');
      messagesDiv.innerHTML += `<p>${message.TextMessage}</p>`;
    });

    function sendMessage() {
      const input = document.getElementById('messageInput');
      socket.emit('send_message', {
        receiverId: 56,
        message: input.value
      });
      input.value = '';
    }
  </script>
</body>
</html>
```

## Error Handling

### Socket.io Errors

All errors are emitted via the `error` event:

```javascript
socket.on('error', (error) => {
  console.error('Error:', error.message);
  // Handle error (show notification, retry, etc.)
});
```

**Common Errors:**
- `"Authentication token required"` - No token provided
- `"User not found or inactive"` - User doesn't exist or is inactive
- `"Invalid authentication token"` - Token is invalid or expired
- `"Receiver ID is required"` - Missing receiver ID in message
- `"Message or file image is required"` - Empty message
- `"Receiver not found or inactive"` - Receiver user doesn't exist

### REST API Errors

REST API errors follow standard HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Utility Functions

The module exports utility functions for checking user status:

```javascript
const socketChatRoutes = require('./routes/Chat/SocketChat.routes');

// Get active users count
const activeCount = socketChatRoutes.getActiveUsersCount();

// Check if user is online
const isOnline = socketChatRoutes.isUserOnline(userId);

// Get socket ID for user
const socketId = socketChatRoutes.getUserSocketId(userId);
```

## Notes

- Messages are stored in the database automatically when sent via Socket.io
- Offline users will receive messages when they reconnect (if implemented)
- The `activeUsers` Map tracks online users by `userId`
- Each user joins a personal room: `user_${userId}`
- Typing indicators are real-time and don't persist
- Chat history is sorted by `created_at` in descending order (newest first)

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

