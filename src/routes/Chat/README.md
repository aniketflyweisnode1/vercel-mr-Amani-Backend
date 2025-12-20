
# ws://localhost:3030/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzkzNjg0NTE5OTg4YzhhYmYxYzQ3ZiIsInVzZXJfaWQiOjQzLCJwaG9uZU5vIjoiOTY0NTI5OTcwNyIsImZpcnN0TmFtZSI6InNhbGFoIHVwZGF0ZSIsImxhc3ROYW1lIjoiYSIsInJvbGVfaWQiOjMsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjYxMjQ2MDMsImV4cCI6MTc2NjcyOTQwM30.qXPNK2xq87mv2-3BcH3WVR5qkd3ThgcdbkD47fJLcnk

add Event : connected

# Socket.IO Chat Documentation

Real-time chat system using Socket.IO for one-to-one messaging with authentication, typing indicators, and chat history.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Connection](#connection)
- [Authentication](#authentication)
- [Events](#events)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Server-Side Functions](#server-side-functions)

## Overview

This Socket.IO chat implementation provides real-time messaging capabilities with:
- JWT-based authentication
- One-to-one messaging
- Typing indicators
- Chat history retrieval
- Online user tracking
- Message persistence in database

## Features

✅ Real-time one-to-one messaging  
✅ JWT token authentication  
✅ Typing indicators  
✅ Chat history with pagination  
✅ Online/offline user status  
✅ Image/file sharing support  
✅ Emoji support  
✅ Message persistence in MongoDB  
✅ User presence tracking  

## Connection

### Full WebSocket URL

```
http://localhost:3030/
```

**Connection Details:**
- **Protocol:** `http://` (Socket.IO handles WebSocket upgrade)
- **Host:** `localhost`
- **Port:** `3030`
- **Path:** `/` (root path)
- **WebSocket:** `ws://localhost:3030/` (handled automatically)

### Basic Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3030', {
  path: '/',
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  },
  transports: ['websocket', 'polling']
});
```

## Authentication

The Socket.IO server requires JWT token authentication. The token can be provided in three ways:

### Method 1: Auth Object (Recommended)

```javascript
const socket = io('http://localhost:3030', {
  path: '/',
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### Method 2: Authorization Header

```javascript
const socket = io('http://localhost:3030', {
  path: '/',
  extraHeaders: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
```

### Method 3: Query Parameter

```javascript
const socket = io('http://localhost:3030?token=YOUR_JWT_TOKEN', {
  path: '/'
});
```

**Token Requirements:**
- Valid JWT token signed with `JWT_SECRET` (default: `'newuserToken'`)
- Token must contain `userId` or `user_id` in payload
- User must exist in database with `status: true`

## Events

### Client → Server Events

#### `send_message`
Send a chat message to another user.

**Payload:**
```javascript
{
  receiverId: 123,        // Required: Number - Receiver's user_id
  message: 'Hello!',      // Optional: String - Text message (max 5000 chars)
  fileImage: null,       // Optional: String - Image file URL (max 500 chars)
  emozi: null            // Optional: String - Emoji (max 10 chars)
}
```

**Example:**
```javascript
socket.emit('send_message', {
  receiverId: 123,
  message: 'Hello, how are you?',
  fileImage: null,
  emozi: null
});
```

#### `typing`
Send typing indicator to receiver.

**Payload:**
```javascript
{
  receiverId: 123,        // Required: Number - Receiver's user_id
  isTyping: true         // Required: Boolean - Typing status
}
```

**Example:**
```javascript
socket.emit('typing', {
  receiverId: 123,
  isTyping: true
});
```

#### `get_chat_history`
Get chat history between current user and another user.

**Payload:**
```javascript
{
  otherUserId: 123,      // Required: Number - Other user's user_id
  page: 1,              // Optional: Number - Page number (default: 1)
  limit: 50             // Optional: Number - Messages per page (default: 50, max: 100)
}
```

**Example:**
```javascript
socket.emit('get_chat_history', {
  otherUserId: 123,
  page: 1,
  limit: 50
});
```

#### `get_online_users`
Get list of all currently online users.

**Payload:** None

**Example:**
```javascript
socket.emit('get_online_users');
```

#### `check_user_online`
Check if a specific user is currently online.

**Payload:**
```javascript
{
  userId: 123           // Required: Number - User ID to check
}
```

**Example:**
```javascript
socket.emit('check_user_online', {
  userId: 123
});
```

### Server → Client Events

#### `connected`
Emitted when connection is successfully established and authenticated.

**Payload:**
```javascript
{
  success: true,
  message: 'Connected to chat server',
  userId: 55,
  userName: 'John Doe',
  socketId: 'abc123',
  timestamp: '2025-01-20T12:00:00.000Z'
}
```

#### `receive_message`
Emitted when receiving a new message from another user.

**Payload:**
```javascript
{
  Chat_id: 1,
  UserName: 'John Doe',
  User_id: 55,
  TextMessage: 'Hello!',
  fileImage: null,
  emozi: null,
  receiverId: 123,
  created_at: '2025-01-20T12:00:00.000Z',
  timestamp: '2025-01-20T12:00:00.000Z'
}
```

#### `message_sent`
Emitted when message is successfully sent and saved to database.

**Payload:**
```javascript
{
  success: true,
  message: 'Message sent successfully',
  data: {
    Chat_id: 1,
    UserName: 'John Doe',
    User_id: 55,
    TextMessage: 'Hello!',
    fileImage: null,
    emozi: null,
    receiverId: 123,
    created_at: '2025-01-20T12:00:00.000Z',
    timestamp: '2025-01-20T12:00:00.000Z'
  }
}
```

#### `user_typing`
Emitted when another user is typing.

**Payload:**
```javascript
{
  userId: 123,
  userName: 'Jane Doe',
  isTyping: true,
  timestamp: '2025-01-20T12:00:00.000Z'
}
```

#### `chat_history`
Emitted in response to `get_chat_history` event.

**Payload:**
```javascript
{
  success: true,
  data: [
    {
      Chat_id: 1,
      UserName: 'John Doe',
      User_id: 55,
      TextMessage: 'Hello!',
      fileImage: null,
      emozi: null,
      created_at: '2025-01-20T12:00:00.000Z'
    }
  ],
  page: 1,
  limit: 50,
  total: 1
}
```

#### `online_users`
Emitted in response to `get_online_users` event.

**Payload:**
```javascript
{
  success: true,
  data: [
    {
      user_id: 55,
      firstName: 'John',
      lastName: 'Doe',
      BusinessName: 'John\'s Business'
    }
  ],
  count: 1
}
```

#### `user_online_status`
Emitted in response to `check_user_online` event.

**Payload:**
```javascript
{
  userId: 123,
  isOnline: true,
  socketId: 'abc123'  // null if offline
}
```

#### `user_connected`
Emitted when another user connects to the chat server.

**Payload:**
```javascript
{
  userId: 123,
  userName: 'Jane Doe',
  socketId: 'abc123',
  timestamp: '2025-01-20T12:00:00.000Z'
}
```

#### `user_disconnected`
Emitted when another user disconnects from the chat server.

**Payload:**
```javascript
{
  userId: 123,
  userName: 'Jane Doe',
  timestamp: '2025-01-20T12:00:00.000Z'
}
```

#### `error`
Emitted when an error occurs.

**Payload:**
```javascript
{
  message: 'Error message here'
}
```

## Usage Examples

### Complete Chat Implementation

```javascript
import io from 'socket.io-client';

// Connect to server
const socket = io('http://localhost:3030', {
  path: '/',
  auth: {
    token: localStorage.getItem('jwt_token')
  },
  transports: ['websocket', 'polling']
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
});

socket.on('connected', (data) => {
  console.log('✅ Server confirmed:', data);
  // Now you can send messages
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
});

// Send a text message
function sendTextMessage(receiverId, message) {
  socket.emit('send_message', {
    receiverId: receiverId,
    message: message,
    fileImage: null,
    emozi: null
  });
}

// Send message with image
function sendImageMessage(receiverId, message, imageUrl) {
  socket.emit('send_message', {
    receiverId: receiverId,
    message: message,
    fileImage: imageUrl,
    emozi: null
  });
}

// Send message with emoji
function sendEmojiMessage(receiverId, message, emoji) {
  socket.emit('send_message', {
    receiverId: receiverId,
    message: message,
    fileImage: null,
    emozi: emoji
  });
}

// Listen for incoming messages
socket.on('receive_message', (data) => {
  console.log('📨 New message from', data.UserName, ':', data.TextMessage);
  // Display message in UI
  displayMessage(data);
});

// Listen for message confirmation
socket.on('message_sent', (data) => {
  console.log('✅ Message sent:', data.data.TextMessage);
});

// Typing indicator
let typingTimeout;
function handleTyping(receiverId, isTyping) {
  socket.emit('typing', {
    receiverId: receiverId,
    isTyping: isTyping
  });

  if (isTyping) {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('typing', {
        receiverId: receiverId,
        isTyping: false
      });
    }, 3000);
  }
}

// Listen for typing indicator
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    console.log(data.userName, 'is typing...');
  } else {
    console.log(data.userName, 'stopped typing');
  }
});

// Get chat history
function getChatHistory(otherUserId, page = 1, limit = 50) {
  socket.emit('get_chat_history', {
    otherUserId: otherUserId,
    page: page,
    limit: limit
  });
}

socket.on('chat_history', (data) => {
  console.log('Chat history:', data.data);
  // Display messages in UI
  displayChatHistory(data.data);
});

// Get online users
function getOnlineUsers() {
  socket.emit('get_online_users');
}

socket.on('online_users', (data) => {
  console.log('Online users:', data.data);
  // Update online users list in UI
  updateOnlineUsersList(data.data);
});

// Check if user is online
function checkUserOnline(userId) {
  socket.emit('check_user_online', {
    userId: userId
  });
}

socket.on('user_online_status', (data) => {
  console.log('User', data.userId, 'is', data.isOnline ? 'online' : 'offline');
});

// User presence events
socket.on('user_connected', (data) => {
  console.log('👤 User', data.userName, 'connected');
});

socket.on('user_disconnected', (data) => {
  console.log('👤 User', data.userName, 'disconnected');
});

// Error handling
socket.on('error', (error) => {
  console.error('❌ Error:', error.message);
  // Display error to user
  showError(error.message);
});

// Disconnect
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function useSocketChat(token) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3030', {
      path: '/',
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('connected', (data) => {
      console.log('Connected as:', data.userName);
    });

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const sendMessage = (receiverId, message, fileImage = null, emozi = null) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        receiverId,
        message,
        fileImage,
        emozi
      });
    }
  };

  return { socket, messages, isConnected, sendMessage };
}
```

## Error Handling

All errors are emitted via the `error` event:

```javascript
socket.on('error', (error) => {
  console.error('Error:', error.message);
  
  // Common errors:
  // - "Authentication token required"
  // - "Invalid authentication token"
  // - "User not found or inactive"
  // - "Receiver ID is required"
  // - "Message, file image, or emoji is required"
  // - "Receiver not found or inactive"
  // - "Failed to send message"
});
```

## Server-Side Functions

The module exports several utility functions for server-side use:

### `getIO()`
Get the Socket.IO instance.

```javascript
const { getIO } = require('./src/routes/Chat/SocketChat.routes');
const io = getIO();
```

### `getActiveUsersCount()`
Get the number of currently active users.

```javascript
const { getActiveUsersCount } = require('./src/routes/Chat/SocketChat.routes');
const count = getActiveUsersCount();
```

### `isUserOnline(userId)`
Check if a user is currently online.

```javascript
const { isUserOnline } = require('./src/routes/Chat/SocketChat.routes');
const online = isUserOnline(123);
```

### `getUserSocketId(userId)`
Get the socket ID for a specific user.

```javascript
const { getUserSocketId } = require('./src/routes/Chat/SocketChat.routes');
const socketId = getUserSocketId(123);
```

### `sendToUser(userId, event, data)`
Send a message to a specific user from server-side.

```javascript
const { sendToUser } = require('./src/routes/Chat/SocketChat.routes');
sendToUser(123, 'custom_event', { message: 'Hello from server!' });
```

### `broadcast(event, data)`
Broadcast a message to all connected users.

```javascript
const { broadcast } = require('./src/routes/Chat/SocketChat.routes');
broadcast('announcement', { message: 'Server maintenance in 5 minutes' });
```

## Database Schema

Messages are stored in the `SocketChat` collection with the following schema:

```javascript
{
  Chat_id: Number,           // Auto-incremented ID
  UserName: String,          // Sender's name
  User_id: Number,           // Sender's user_id
  TextMessage: String,        // Message text (max 5000 chars)
  fileImage: String,         // Image URL (max 500 chars, optional)
  emozi: String,            // Emoji (max 10 chars, optional)
  Status: Boolean,          // Active status (default: true)
  created_by: Number,       // Creator's user_id
  created_at: Date,         // Creation timestamp
  updated_by: Number,       // Last updater's user_id
  updated_at: Date          // Last update timestamp
}
```

## Notes

- Messages are persisted to MongoDB automatically when sent
- Receiver must be online to receive real-time messages (messages are still saved to database)
- Chat history query returns messages where current user is either sender or receiver
- Typing indicators are real-time only (not persisted)
- User presence (online/offline) is tracked in memory and reset on server restart
- Maximum message length: 5000 characters
- Maximum image URL length: 500 characters
- Maximum emoji length: 10 characters

## Troubleshooting

### Connection Issues

1. **"Authentication token required"**
   - Ensure JWT token is provided in `auth.token`, `Authorization` header, or query parameter
   - Verify token is valid and not expired

2. **"Invalid authentication token"**
   - Check token signature matches `JWT_SECRET` (default: `'newuserToken'`)
   - Verify token contains `userId` or `user_id` in payload

3. **"User not found or inactive"**
   - Ensure user exists in database
   - Verify user has `status: true`

4. **Connecting to `/socket.io/` instead of `/`**
   - Ensure `path: '/'` is set in client configuration
   - Check server is configured with `path: '/'`

### Message Issues

1. **Messages not received**
   - Verify receiver is online (use `check_user_online`)
   - Check receiver's `user_id` is correct
   - Ensure receiver has valid connection

2. **"Receiver not found or inactive"**
   - Verify receiver's `user_id` exists in database
   - Check receiver has `status: true`

## License

MIT

