# SCST - Menu Management System

A full-stack web application for managing restaurant menu items with real-time selection tracking and WebSocket communication.

## 🚀 Features

- **Dual Views**: Table view for overview and Detail view for comprehensive item information
- **Interactive Batch Selection**: Click batch size buttons to select items
- **Real-time Updates**: WebSocket integration for live selection broadcasting
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-friendly interface with Chakra UI v3
- **RESTful API**: Complete CRUD operations for menu items and selections

## 🏗️ Architecture

- **Frontend**: React with Chakra UI v3, Socket.IO client
- **Backend**: Node.js/Express with Socket.IO server
- **State Management**: React hooks with shared state between views
- **Real-time**: WebSocket communication for multi-client synchronization

## 📁 Project Structure

```
SCST/
├── backend/                 # Express.js server
│   ├── server.js           # Main server file with WebSocket
│   ├── package.json        # Backend dependencies
│   └── nodemon.json        # Development configuration
├── frontend/               # React application
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main application
│   │   └── index.jsx       # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── ecosystem.config.js      # PM2 production configuration
├── deploy.sh               # Deployment script
└── README.md               # This file
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/olegkuftyrev/blimp1.git
   cd blimp1
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../backend
   npm start
   # Server runs on http://localhost:5001
   ```

5. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm start
   # App runs on http://localhost:3000
   ```

## 🚀 Production Deployment

### DigitalOcean Droplet Deployment

1. **SSH to your droplet**
   ```bash
   ssh root@64.23.145.29
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/olegkuftyrev/blimp1.git
   cd blimp1
   ```

3. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

4. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && npm run build
   cd ..
   ```

5. **Start the application**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

6. **Save PM2 configuration**
   ```bash
   pm2 save
   pm2 startup
   ```

### Environment Variables

Create a `.env` file in the backend directory:
```env
NODE_ENV=production
PORT=5001
```

## 🔌 API Endpoints

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/:id` - Get specific menu item
- `POST /api/menu-items` - Create new menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item

### Selections
- `GET /api/selections` - Get all active selections
- `POST /api/selections` - Add new selection
- `DELETE /api/selections/:id` - Remove selection

### WebSocket Events
- `add-selection` - Add item selection
- `remove-selection` - Remove item selection
- `selections-updated` - Broadcast selection updates

## 🎨 UI Components

- **TableView**: Displays menu items in a table format with filtering
- **DetailView**: Shows detailed item properties with interactive batch selection
- **ViewNavigation**: Switches between table and detail views
- **ThemeToggle**: Light/dark mode switching
- **Provider**: Chakra UI and theme context provider

## 🔧 Development

### Available Scripts

**Backend:**
- `npm start` - Start development server with nodemon
- `npm run dev` - Start development server

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style
- JSX files (no TypeScript)
- Chakra UI v3 components
- Functional components with hooks
- No icons (use emojis instead)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and Chakra UI**
