const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for menu items (in production, this would be a database)
let menuItems = [
  {
    id: 1,
    name: "E1 - Spring Rolls",
    img: "/resources/img/spring-rolls.jpg",
    cookingTime1: 4,
    cookingTime2: 5,
    cookingTime3: 6,
    description: "Fresh spring rolls",
    batchSizeLunchRush: 3,
    batchSizeDinnerRush: 3,
    batchSizeDownTime: 2
  },
  {
    id: 2,
    name: "E2 - Egg Roll",
    img: "/resources/img/egg-roll.jpg",
    cookingTime1: 5,
    cookingTime2: 6,
    cookingTime3: 7,
    description: "Crispy egg rolls",
    batchSizeLunchRush: 3,
    batchSizeDinnerRush: 3,
    batchSizeDownTime: 1
  },
  {
    id: 3,
    name: "E3 - Cream Cheese Ragoons",
    img: "/resources/img/cream-cheese-ragoons.jpg",
    cookingTime1: 4,
    cookingTime2: 5,
    cookingTime3: 6,
    description: "Creamy cheese ragoons",
    batchSizeLunchRush: 3,
    batchSizeDinnerRush: 3,
    batchSizeDownTime: 3
  },
  {
    id: 4,
    name: "CB5 - Sweetfire Chicken",
    img: "/resources/img/sweetfire-chicken.jpg",
    cookingTime1: 6,
    cookingTime2: 7,
    cookingTime3: 8,
    description: "Spicy sweetfire chicken",
    batchSizeLunchRush: 3,
    batchSizeDinnerRush: 3,
    batchSizeDownTime: 1
  },
  {
    id: 5,
    name: "C4 - Teriyaki Chicken",
    img: "/resources/img/teriyaki-chicken.jpg",
    cookingTime1: 5,
    cookingTime2: 6,
    cookingTime3: 7,
    description: "Teriyaki glazed chicken",
    batchSizeLunchRush: 3,
    batchSizeDinnerRush: 3,
    batchSizeDownTime: 1
  }
];

let nextId = 6; // For generating new IDs

// In-memory storage for selections (in production, this would be a database)
let selections = [];
let nextSelectionId = 1;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  // Send current selections to new client
  socket.emit('selections-updated', {
    success: true,
    data: selections.filter(sel => sel.active),
    count: selections.filter(sel => sel.active).length
  });

  // Handle new selection
  socket.on('add-selection', (data) => {
    const { itemId, batchType, userId = 'anonymous' } = data;
    
    // Find the menu item
    const menuItem = menuItems.find(item => item.id === itemId);
    if (!menuItem) {
      socket.emit('selection-error', { error: 'Menu item not found' });
      return;
    }

    // Create new selection
    const newSelection = {
      id: nextSelectionId++,
      itemId: parseInt(itemId),
      itemName: menuItem.name,
      batchType,
      userId,
      selectedAt: new Date().toISOString(),
      active: true
    };

    // Add to selections
    selections.push(newSelection);

    // Broadcast to all connected clients
    io.emit('selections-updated', {
      success: true,
      data: selections.filter(sel => sel.active),
      count: selections.filter(sel => sel.active).length
    });

    console.log(`✅ New selection: ${menuItem.name} - ${batchType} by ${userId}`);
  });

  // Handle selection removal
  socket.on('remove-selection', (data) => {
    const { itemId, batchType, userId = 'anonymous' } = data;
    
    // Find and remove the selection
    const selectionIndex = selections.findIndex(sel => 
      sel.itemId === parseInt(itemId) && 
      sel.batchType === batchType && 
      sel.userId === userId &&
      sel.active
    );

    if (selectionIndex !== -1) {
      selections[selectionIndex].active = false;
      selections[selectionIndex].removedAt = new Date().toISOString();

      // Broadcast to all connected clients
      io.emit('selections-updated', {
        success: true,
        data: selections.filter(sel => sel.active),
        count: selections.filter(sel => sel.active).length
      });

      console.log(`❌ Selection removed: ${selections[selectionIndex].itemName} - ${batchType}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Backend API!',
    timestamp: new Date().toISOString(),
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// GET /api/menu-items - Get all menu items
app.get('/api/menu-items', (req, res) => {
  res.json({
    success: true,
    data: menuItems,
    count: menuItems.length
  });
});

// GET /api/menu-items/:id - Get single menu item
app.get('/api/menu-items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
});

// GET /api/selections - Get all active selections
app.get('/api/selections', (req, res) => {
  res.json({
    success: true,
    data: selections.filter(sel => sel.active),
    count: selections.filter(sel => sel.active).length
  });
});

// POST /api/selections - Add new selection (alternative to WebSocket)
app.post('/api/selections', (req, res) => {
  const { itemId, batchType, userId = 'anonymous' } = req.body;
  
  // Validation
  if (!itemId || !batchType) {
    return res.status(400).json({
      success: false,
      error: 'Item ID and batch type are required'
    });
  }

  // Find the menu item
  const menuItem = menuItems.find(item => item.id === parseInt(itemId));
  if (!menuItem) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found'
    });
  }

  // Create new selection
  const newSelection = {
    id: nextSelectionId++,
    itemId: parseInt(itemId),
    itemName: menuItem.name,
    batchType,
    userId,
    selectedAt: new Date().toISOString(),
    active: true
  };

  // Add to selections
  selections.push(newSelection);

  // Broadcast to all WebSocket clients
  io.emit('selections-updated', {
    success: true,
    data: selections.filter(sel => sel.active),
    count: selections.filter(sel => sel.active).length
  });

  res.status(201).json({
    success: true,
    data: newSelection,
    message: 'Selection added successfully'
  });
});

// DELETE /api/selections/:id - Remove selection
app.delete('/api/selections/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const selectionIndex = selections.findIndex(sel => sel.id === id && sel.active);

  if (selectionIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Selection not found'
    });
  }

  selections[selectionIndex].active = false;
  selections[selectionIndex].removedAt = new Date().toISOString();

  // Broadcast to all WebSocket clients
  io.emit('selections-updated', {
    success: true,
    data: selections.filter(sel => sel.active),
    count: selections.filter(sel => sel.active).length
  });

  res.json({
    success: true,
    data: selections[selectionIndex],
    message: 'Selection removed successfully'
  });
});

// POST /api/menu-items - Create new menu item
app.post('/api/menu-items', (req, res) => {
  const { name, img, cookingTime1, cookingTime2, cookingTime3, description, batchSizeLunchRush, batchSizeDinnerRush, batchSizeDownTime } = req.body;
  
  // Validation
  if (!name || !description) {
    return res.status(400).json({
      success: false,
      error: 'Name and description are required'
    });
  }
  
  const newItem = {
    id: nextId++,
    name,
    img: img || '/resources/img/default.jpg',
    cookingTime1: cookingTime1 || 5,
    cookingTime2: cookingTime2 || 6,
    cookingTime3: cookingTime3 || 7,
    description,
    batchSizeLunchRush: batchSizeLunchRush || 3,
    batchSizeDinnerRush: batchSizeDinnerRush || 3,
    batchSizeDownTime: batchSizeDownTime || 2
  };
  
  menuItems.push(newItem);
  
  res.status(201).json({
    success: true,
    data: newItem,
    message: 'Menu item created successfully'
  });
});

// PUT /api/menu-items/:id - Update menu item
app.put('/api/menu-items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = menuItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found'
    });
  }
  
  const updatedItem = { ...menuItems[itemIndex], ...req.body };
  menuItems[itemIndex] = updatedItem;
  
  res.json({
    success: true,
    data: updatedItem,
    message: 'Menu item updated successfully'
  });
});

// DELETE /api/menu-items/:id - Delete menu item
app.delete('/api/menu-items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = menuItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found'
    });
  }
  
  const deletedItem = menuItems.splice(itemIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedItem,
    message: 'Menu item deleted successfully'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/api/hello`);
  console.log(`🍽️ Menu items API: http://localhost:${PORT}/api/menu-items`);
  console.log(`🎯 Selections API: http://localhost:${PORT}/api/selections`);
  console.log(`🔌 WebSocket enabled for real-time updates`);
});
