import React, { useState } from 'react';
import {
  Box,
  Heading,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  Text,
  Badge,
  HStack,
  Button,
  VStack
} from '@chakra-ui/react';

export function TableView({ menuItems, allMenuItems, selectedItems, onClearSelection }) {
  const [selectedBatch, setSelectedBatch] = useState(null);

  const handleBatchSelect = (batchType) => {
    if (selectedBatch === batchType) {
      setSelectedBatch(null); // Deselect if clicking the same button
    } else {
      setSelectedBatch(batchType);
    }
  };

  // Helper function to get batch size based on selected batch
  const getBatchSize = (item, batchType) => {
    switch (batchType) {
      case 'lunch':
        return item.batchSizeLunchRush;
      case 'dinner':
        return item.batchSizeDinnerRush;
      case 'down':
        return item.batchSizeDownTime;
      default:
        return 0;
    }
  };

  // Helper function to get batch label
  const getBatchLabel = (batchType) => {
    switch (batchType) {
      case 'lunch':
        return 'Lunch Rush';
      case 'dinner':
        return 'Dinner Rush';
      case 'down':
        return 'Down Time';
      default:
        return '';
    }
  };

  // Filter items based on selected batch OR selected items from DetailView
  const filteredItems = selectedItems.length > 0 
    ? selectedItems 
    : (selectedBatch 
        ? allMenuItems.filter(item => getBatchSize(item, selectedBatch) > 0)
        : allMenuItems);

  const hasSelection = selectedItems.length > 0;

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Menu Items Overview
        </Heading>
        
        {/* Selection Status */}
        {hasSelection && (
          <Box textAlign="center" p={4} bg="blue.50" borderRadius="lg" _dark={{ bg: "blue.900" }}>
            <Text fontSize="md" fontWeight="medium" color="blue.800" _dark={{ color: "blue.100" }} mb={2}>
              🎯 Showing selected items from DetailView
            </Text>
            <Text fontSize="sm" color="blue.600" _dark={{ color: "blue.200" }} mb={3}>
              {selectedItems.length === 1 
                ? `${selectedItems[0]?.name} - ${selectedItems[0]?.description}`
                : `${selectedItems.length} items selected`
              }
            </Text>
            {selectedItems.length > 1 && (
              <Text fontSize="xs" color="blue.500" _dark={{ color: "blue.300" }} mb={3}>
                {selectedItems.map(item => item.name).join(', ')}
              </Text>
            )}
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={onClearSelection}
              size="sm"
            >
              ✖️ Clear Selection ({selectedItems.length})
            </Button>
          </Box>
        )}
        
        {/* Batch Selection Buttons - Only show when no DetailView selection */}
        {!hasSelection && (
          <Box textAlign="center">
            <Text fontSize="md" mb={3} fontWeight="medium">
              Select Batch Type to Filter:
            </Text>
            <HStack spacing={3} justify="center">
              <Button
                colorScheme={selectedBatch === 'lunch' ? 'orange' : 'gray'}
                variant={selectedBatch === 'lunch' ? 'solid' : 'outline'}
                onClick={() => handleBatchSelect('lunch')}
                size="md"
              >
                🍽️ Lunch Rush
              </Button>
              <Button
                colorScheme={selectedBatch === 'dinner' ? 'red' : 'gray'}
                variant={selectedBatch === 'dinner' ? 'solid' : 'outline'}
                onClick={() => handleBatchSelect('dinner')}
                size="md"
              >
                🌙 Dinner Rush
              </Button>
              <Button
                colorScheme={selectedBatch === 'down' ? 'green' : 'gray'}
                variant={selectedBatch === 'down' ? 'solid' : 'outline'}
                onClick={() => handleBatchSelect('down')}
                size="md"
              >
                ⏰ Down Time
              </Button>
              {selectedBatch && (
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => setSelectedBatch(null)}
                  size="md"
                >
                  ✖️ Clear Filter
                </Button>
              )}
            </HStack>
            
            {selectedBatch && (
              <Text fontSize="sm" color="blue.600" mt={2} fontWeight="medium">
                Showing items with {getBatchLabel(selectedBatch)} batch size &gt; 0
              </Text>
            )}
          </Box>
        )}

        {/* Results Count */}
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.600">
            {filteredItems.length} of {allMenuItems.length} items
            {hasSelection && ' (DetailView selection)'}
            {selectedBatch && !hasSelection && ` (${getBatchLabel(selectedBatch)} only)`}
          </Text>
        </Box>
        
        {/* Table */}
        <TableRoot variant="simple" size="sm">
          <TableHeader>
            <TableRow>
              <TableColumnHeader>Name</TableColumnHeader>
              <TableColumnHeader>Description</TableColumnHeader>
              <TableColumnHeader>Cooking Times</TableColumnHeader>
              <TableColumnHeader>Batch Sizes</TableColumnHeader>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Text fontWeight="bold">{item.name}</Text>
                  <Badge colorScheme="blue" size="sm">ID: {item.id}</Badge>
                </TableCell>
                <TableCell>
                  <Text fontSize="sm">{item.description}</Text>
                </TableCell>
                <TableCell>
                  <Box>
                    <Text fontSize="xs">Level 1: {item.cookingTime1}m</Text>
                    <Text fontSize="xs">Level 2: {item.cookingTime2}m</Text>
                    <Text fontSize="xs">Level 3: {item.cookingTime3}m</Text>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Text fontSize="xs">
                      <Badge colorScheme="orange" size="xs">Lunch:</Badge> {item.batchSizeLunchRush}
                    </Text>
                    <Text fontSize="xs">
                      <Badge colorScheme="red" size="xs">Dinner:</Badge> {item.batchSizeDinnerRush}
                    </Text>
                    <Text fontSize="xs">
                      <Badge colorScheme="green" size="xs">Down:</Badge> {item.batchSizeDownTime}
                    </Text>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
        
        {filteredItems.length === 0 && selectedBatch && !hasSelection && (
          <Box textAlign="center" p={6}>
            <Text fontSize="lg" color="gray.500">
              No items found for {getBatchLabel(selectedBatch)} batch type
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Try selecting a different batch type or clear the filter
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
