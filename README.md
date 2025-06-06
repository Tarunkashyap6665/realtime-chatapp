# ChatApp - Modern Real-time Communication Platform

## Overview

ChatApp is a modern real-time communication platform built with cutting-edge technologies. It provides seamless, secure, and instant messaging capabilities for teams and individuals.

## Features

- **Real-time Messaging**: Instant message delivery with live typing indicators
- **Group Chats**: Create and manage group conversations
- **Multimedia Messaging**: Support for images, videos, audio messages, and file sharing
- **Audio Recording**: In-app voice message recording with pause/resume capability
- **Presence System**: Real-time online/offline status with last seen timestamps
- **Secure Authentication**: Email-based OTP verification system
- **Modern UI/UX**: Responsive design with smooth animations

## Tech Stack

### Frontend

- **Next.js 15**: React framework for production-grade applications
- **TailwindCSS**: Utility-first CSS framework for modern web applications
- **Framer Motion**: Production-ready animation library for React
- **Socket.io Client**: Real-time bidirectional event-based communication
- **React Hook Form**: Performant, flexible and extensible forms
- **Lucide React**: Beautiful and consistent icons
- **Shadcn/ui**: Pre-built components based on Radix UI, offering accessible and customizable UI elements

### Backend

- **Node.js**: JavaScript runtime for server-side development
- **Socket.io**: Real-time bidirectional event-based communication
- **MongoDB**: NoSQL database for flexible data storage
- **Nodemailer**: Module for sending emails
- **JSON Web Token**: Secure user authentication
- **TypeScript**: Static typing for enhanced development

### Development Tools

- **VS Code IDE**: Integrated development environment with TypeScript support
- **TypeScript**: For type-safe code
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB instance
- Email service credentials (for OTP)

### Installation

1. Clone the repository

```bash
git clone [repository-url]
cd realtime-chat-app
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features in Detail

### Real-time Communication

- Instant message delivery
- Live typing indicators
- Enhanced presence system with online/offline status
- Last seen timestamps for offline users
- Message delivery status
- Real-time multimedia message support

### Authentication & Security

- Email-based OTP verification
- JWT-based session management
- Secure password handling

### User Experience

- Responsive design for all devices
- Smooth animations with Framer Motion
- Intuitive user interface
- Modern and clean design
- Rich media handling with preview
- Voice message recording interface
- Interactive multimedia playback controls

<!-- ## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. -->
