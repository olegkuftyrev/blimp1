'use client';

import { Box, Heading, Text, VStack, Card, Button } from "@chakra-ui/react";

export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <Box minH="100vh" bg="gray.50" p={8} className="min-h-screen bg-gray-50 p-8">
        
      <Box maxW="6xl" mx="auto" className="max-w-6xl mx-auto">
        <VStack gap={8} className="space-y-8">
          <Heading as="h1" size="3xl" color="gray.800" className="text-4xl font-bold text-gray-800">
            Test Page
          </Heading>
          <Text fontSize="lg" color="gray.600" className="text-lg text-gray-600">
            This is an empty test page for experimenting with new features.
          </Text>
          
          <Card.Root bg="white" borderRadius="lg" shadow="lg" p={6} className="bg-white rounded-lg shadow-lg p-6">
            <Card.Body>
                
              <VStack gap={4} className="space-y-4">
                <Heading as="h2" size="lg" color="gray.700" className="text-xl font-semibold text-gray-700">
                  Test Card
                </Heading>
                <VStack gap={3} className="space-y-3">
                  <Button
                    w="100%"
                    colorPalette="green"
                    variant="solid"
                    size="lg"
                    fontWeight="medium"
                  >
                    Button 1
                  </Button>
                  <Button
                    w="100%"
                    colorPalette="green"
                    variant="solid"
                    size="lg"
                    fontWeight="medium"
                  >
                    Button 2
                  </Button>
                  <Button
                    w="100%"
                    colorPalette="green"
                    variant="solid"
                    size="lg"
                    fontWeight="medium"
                  >
                    Button 3
                  </Button>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}
