import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  Stack,
  Button
} from '@chakra-ui/react';

export function DetailView({ menuItems, onItemSelection, selectedBatchSizes, onBatchSizeClick }) {
  const handleBatchSizeClick = (itemId, batchType) => {
    onBatchSizeClick(itemId, batchType);
  };

  const getBatchSizeButtonProps = (itemId, batchType, label, colorScheme) => {
    const isActive = selectedBatchSizes[itemId] === batchType;
    return {
      colorScheme: isActive ? colorScheme : 'gray',
      variant: isActive ? 'solid' : 'outline',
      size: 'sm',
      onClick: () => handleBatchSizeClick(itemId, batchType),
      _hover: { transform: 'translateY(-1px)' },
      transition: 'all 0.2s'
    };
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} textAlign="center">
        Menu Items Detailed View
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {menuItems.map((item) => (
          <Box key={item.id} p={6} border="1px" borderColor="gray.200" borderRadius="lg" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
            <Box textAlign="center" mb={4}>
              <Heading size="md">{item.name}</Heading>
              <Badge colorScheme="blue" size="sm" mt={2}>
                ID: {item.id}
              </Badge>
            </Box>

            <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
              {item.description}
            </Text>

            <Stack spacing={4} divideY="1px" divideColor="gray.200" _dark={{ divideColor: "gray.700" }}>
              <Box pb={4}>
                <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center">
                  Cooking Times (minutes)
                </Text>
                <SimpleGrid columns={3} spacing={2}>
                  <Box textAlign="center">
                    <Text fontSize="xs" color="gray.500">Level 1</Text>
                    <Text fontSize="lg" fontWeight="bold">{item.cookingTime1}</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="xs" color="gray.500">Level 2</Text>
                    <Text fontSize="lg" fontWeight="bold">{item.cookingTime2}</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="xs" color="gray.500">Level 3</Text>
                    <Text fontSize="lg" fontWeight="bold">{item.cookingTime3}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Box pt={4}>
                <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center">
                  Batch Sizes
                </Text>
                <Stack spacing={2}>
                  <Button
                    {...getBatchSizeButtonProps(item.id, 'lunch', 'Lunch Rush', 'orange')}
                    w="100%"
                  >
                    Lunch Rush: {item.batchSizeLunchRush}
                  </Button>
                  <Button
                    {...getBatchSizeButtonProps(item.id, 'dinner', 'Dinner Rush', 'red')}
                    w="100%"
                  >
                    Dinner Rush: {item.batchSizeDinnerRush}
                  </Button>
                  <Button
                    {...getBatchSizeButtonProps(item.id, 'down', 'Down Time', 'green')}
                    w="100%"
                  >
                    Down Time: {item.batchSizeDownTime}
                  </Button>
                </Stack>
              </Box>
            </Stack>

            <Box mt={4} textAlign="center">
              <Text fontSize="xs" color="gray.500">
                All properties displayed for item #{item.id}
              </Text>
              {selectedBatchSizes[item.id] && (
                <Text fontSize="xs" color="blue.500" mt={1}>
                  Active: {selectedBatchSizes[item.id].charAt(0).toUpperCase() + selectedBatchSizes[item.id].slice(1)} Rush
                </Text>
              )}
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
