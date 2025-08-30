import React from 'react';
import {
  HStack,
  Button,
  Text,
  Box,
  Badge
} from '@chakra-ui/react';

export function ViewNavigation({ currentView, onViewChange, menuItemsCount }) {
  return (
    <Box p={4} bg="gray.50" _dark={{ bg: "gray.800" }} borderRadius="lg" mb={6}>
      <HStack justify="space-between" align="center">
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Menu Management System
          </Text>
          <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
            {menuItemsCount} items available
          </Text>
        </Box>
        
        <HStack spacing={3}>
          <Button
            colorScheme={currentView === 'table' ? 'blue' : 'gray'}
            variant={currentView === 'table' ? 'solid' : 'outline'}
            onClick={() => onViewChange('table')}
            size="md"
          >
            📊 Table View
          </Button>
          
          <Button
            colorScheme={currentView === 'detail' ? 'blue' : 'gray'}
            variant={currentView === 'detail' ? 'solid' : 'outline'}
            onClick={() => onViewChange('detail')}
            size="md"
          >
            🎯 Detail View
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
