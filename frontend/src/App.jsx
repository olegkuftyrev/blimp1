import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Provider } from './components/ui/provider';
import { ThemeToggle } from './components/ui/theme-toggle';
import { ViewNavigation } from './components/navigation/ViewNavigation';
import { TableView } from './components/views/TableView';
import { DetailView } from './components/views/DetailView';
import { Box, HStack, Text, Spinner } from '@chakra-ui/react';

function AppContent() {
  const [currentView, setCurrentView] = useState('table');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedBatchSizes, setSelectedBatchSizes] = useState({});
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:5001');
    
    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('selections-updated', (data) => {
      console.log('📡 Received selections update:', data);
      // You can use this to sync with other clients if needed
    });

    newSocket.on('selection-error', (error) => {
      console.error('❌ Selection error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/menu-items');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch menu items');
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (selectedItemsList) => {
    setSelectedItems(selectedItemsList);
  };

  const handleBatchSizeClick = (itemId, batchType) => {
    setSelectedBatchSizes(prev => ({
      ...prev,
      [itemId]: batchType
    }));
    
    // Find the selected item and add it to the selection (don't replace existing selections)
    const selectedItem = menuItems.find(item => item.id === itemId);
    if (selectedItem) {
      setSelectedItems(prev => {
        // Check if item is already selected
        const isAlreadySelected = prev.some(item => item.id === itemId);
        if (isAlreadySelected) {
          // If already selected, remove it (toggle behavior)
          const updatedItems = prev.filter(item => item.id !== itemId);
          
          // Send removal to backend via WebSocket
          if (socket && isConnected) {
            socket.emit('remove-selection', {
              itemId,
              batchType,
              userId: 'user-' + Math.random().toString(36).substr(2, 9)
            });
          }
          
          return updatedItems;
        } else {
          // If not selected, add it to the existing selections
          const updatedItems = [...prev, selectedItem];
          
          // Send selection to backend via WebSocket
          if (socket && isConnected) {
            socket.emit('add-selection', {
              itemId,
              batchType,
              userId: 'user-' + Math.random().toString(36).substr(2, 9)
            });
          }
          
          return updatedItems;
        }
      });
    }
  };

  if (loading) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50" 
        color="gray.800" 
        _dark={{ bg: "gray.900", color: "gray.100" }} 
        p={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text fontSize="lg">Loading menu items...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50" 
        color="gray.800" 
        _dark={{ bg: "gray.900", color: "gray.100" }} 
        p={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box 
          p={6} 
          bg="red.50" 
          border="1px" 
          borderColor="red.200" 
          borderRadius="lg"
          maxW="500px"
          _dark={{ bg: "red.900", borderColor: "red.700" }}
        >
          <Text fontWeight="bold" color="red.800" _dark={{ color: "red.100" }} mb={2}>
            ❌ Error loading menu items
          </Text>
          <Text fontSize="sm" color="red.700" _dark={{ color: "red.200" }} mb={3}>
            {error}
          </Text>
          <Text fontSize="sm" color="red.600" _dark={{ color: "red.300" }}>
            Make sure your backend server is running on http://localhost:5001
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      bg="gray.50" 
      color="gray.800" 
      _dark={{ bg: "gray.900", color: "gray.100" }} 
      p={8}
    >
      <HStack justify="flex-end" mb={8}>
        <ThemeToggle />
        {/* WebSocket Connection Status */}
        <Box 
          px={3} 
          py={1} 
          borderRadius="md" 
          fontSize="sm"
          bg={isConnected ? "green.100" : "red.100"}
          color={isConnected ? "green.800" : "red.800"}
          _dark={{
            bg: isConnected ? "green.900" : "red.900",
            color: isConnected ? "green.100" : "red.100"
          }}
        >
          {isConnected ? '🔌 Connected' : '🔌 Disconnected'}
        </Box>
      </HStack>
      
      <ViewNavigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        menuItemsCount={menuItems.length}
      />
      
      {currentView === 'table' ? (
        <TableView 
          menuItems={selectedItems.length > 0 ? selectedItems : menuItems} 
          allMenuItems={menuItems}
          selectedItems={selectedItems}
          onClearSelection={() => setSelectedItems([])}
        />
      ) : (
        <DetailView 
          menuItems={menuItems} 
          onItemSelection={handleItemSelection}
          selectedBatchSizes={selectedBatchSizes}
          onBatchSizeClick={handleBatchSizeClick}
        />
      )}
    </Box>
  );
}

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
