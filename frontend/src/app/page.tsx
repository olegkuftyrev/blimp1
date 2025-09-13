'use client';

import Link from "next/link";

export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { Box, Grid, Heading, Text, Button, HStack, Status, VStack, SimpleGrid, Badge, Stack } from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface Order {
  id: number;
  tableSection: number;
  menuItemId: number;
  batchSize: number;
  status: string;
  timerStart?: string;
  timerEnd?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export default function Home() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);

  const handleNavigation = (path: string) => {
    if (selectedRestaurant) {
      // Add restaurant ID as query parameter
      const url = new URL(path, window.location.origin);
      url.searchParams.set('restaurant_id', selectedRestaurant.id.toString());
      router.push(url.pathname + url.search);
    } else {
      router.push(path);
    }
  };

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const response = await fetch(`${apiUrl}/api/restaurants`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text);
          throw new Error(`Expected JSON response but got: ${contentType}`);
        }
        
        const data = await response.json();
        setRestaurants(data.data || []);
        setRestaurantsLoading(false);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurantsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch orders from API (only when restaurant is selected)
  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchOrders = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const response = await fetch(`${apiUrl}/api/orders?restaurant_id=${selectedRestaurant.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text);
          throw new Error(`Expected JSON response but got: ${contentType}`);
        }
        
        const data = await response.json();
        setOrders(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Refresh orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [selectedRestaurant]);

  // Count total active orders
  const getTotalActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'cooking', 'timer_expired', 'ready'].includes(order.status)
    ).length;
  };

  if (restaurantsLoading) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <Text fontSize="xl" color="gray.600">Loading restaurants...</Text>
      </Box>
    );
  }

  // Show restaurant selection if no restaurant is selected
  if (!selectedRestaurant) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50" 
        p={8}
        className="min-h-screen bg-gray-50 p-8"
      >
        <Box maxW="4xl" mx="auto" className="max-w-4xl mx-auto">
          <VStack gap={8} mb={12} className="mb-12">
            <Heading 
              as="h1" 
              size="3xl" 
              textAlign="center" 
              color="gray.800"
              className="text-3xl font-bold text-center text-gray-800"
            >
              Blimp Smart Table
            </Heading>
            <Text 
              textAlign="center" 
              color="gray.600" 
              fontSize="xl"
              className="text-center text-gray-600 text-xl"
            >
              Select a restaurant to continue
            </Text>
          </VStack>

          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            gap={6}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {restaurants.map((restaurant) => (
              <Box 
                key={restaurant.id}
                cursor="pointer" 
                onClick={() => setSelectedRestaurant(restaurant)}
                _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                transition="all 0.2s"
                bg="white"
                borderRadius="lg"
                shadow="md"
                p={6}
                className="cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 bg-white rounded-lg shadow-md p-6"
              >
                <Stack gap={4}>
                  <Heading size="md" color="blue.600">
                    {restaurant.name}
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {restaurant.address}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {restaurant.phone}
                  </Text>
                  <HStack justify="center">
                    <Status.Root colorPalette="green" size="sm">
                      <Status.Indicator />
                    </Status.Root>
                    <Badge colorScheme="green" fontSize="xs">
                      Active
                    </Badge>
                  </HStack>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      bg="gray.50" 
      p={8}
      className="min-h-screen bg-gray-50 p-8"
    >
      <Box maxW="6xl" mx="auto" className="max-w-6xl mx-auto">
        {/* Header Section */}
        <VStack gap={6} mb={12} className="mb-12">
          <Heading 
            as="h1" 
            size="3xl" 
            textAlign="center" 
            color="gray.800"
            className="text-3xl font-bold text-center text-gray-800"
          >
          Blimp Smart Table
          </Heading>
          
          {/* Selected Restaurant Info */}
          <Box bg="blue.50" borderColor="blue.200" borderWidth="1px" borderRadius="lg" p={6} className="bg-blue-50 border-blue-200 border rounded-lg p-6">
            <VStack gap={3}>
              <Heading size="lg" color="blue.700" className="text-blue-700">
                {selectedRestaurant.name}
              </Heading>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                {selectedRestaurant.address}
              </Text>
              <HStack gap={4}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme="blue"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  Change Restaurant
                </Button>
                <HStack gap={2}>
                  <Status.Root colorPalette="green" size="sm">
                    <Status.Indicator />
                  </Status.Root>
                  <Badge colorScheme="green" fontSize="xs">Active</Badge>
                </HStack>
              </HStack>
            </VStack>
          </Box>
          
          <Text 
            textAlign="center" 
            color="gray.600" 
            fontSize="lg"
            maxW="2xl"
            className="text-center text-gray-600 text-lg max-w-2xl"
          >
            Select your section to manage orders and operations
          </Text>
          
          {/* System Status */}
          <HStack gap={4}>
            <Text color="gray.500" fontSize="sm" className="text-gray-500 text-sm">
              System Status:
            </Text>
            <HStack gap={2}>
              <Status.Root colorPalette="green">
                <Status.Indicator />
              </Status.Root>
              <Badge colorScheme="green" fontSize="sm">Online</Badge>
            </HStack>
          </HStack>
        </VStack>


        {/* Dashboard Cards */}
        <SimpleGrid 
          columns={{ base: 1, md: 2 }} 
          gap={6}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Table Section */}
          <Box 
            cursor="pointer" 
            onClick={() => handleNavigation("/table/1")}
            _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
            transition="all 0.2s"
            bg="white"
            borderRadius="lg"
            shadow="md"
            className="cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 bg-white rounded-lg shadow-md"
          >
            <Box textAlign="center" p={8}>
              <Heading size="lg" mb={2} color="blue.600">
                Table Section
              </Heading>
              <Text color="gray.600" mb={4}>
                Manage all orders and menu items
              </Text>
              <HStack justify="center" gap={2}>
                <Status.Root colorPalette="blue" size="sm">
                  <Status.Indicator />
                </Status.Root>
                <Badge colorScheme="blue" fontSize="sm">
                  {loading ? "..." : `${getTotalActiveOrders()} Active Orders`}
                </Badge>
              </HStack>
            </Box>
          </Box>

          {/* BOH Page */}
          <Box 
            cursor="pointer" 
            onClick={() => handleNavigation("/boh")}
            _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
            transition="all 0.2s"
            bg="white"
            borderRadius="lg"
            shadow="md"
            className="cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 bg-white rounded-lg shadow-md"
          >
            <Box textAlign="center" p={8}>
              <Heading size="lg" mb={2} color="purple.600">
                BOH Management
              </Heading>
              <Text color="gray.600" mb={4}>
                Back of house operations
              </Text>
              <HStack justify="center" gap={2}>
                <Status.Root colorPalette="purple" size="sm">
                  <Status.Indicator />
                </Status.Root>
                <Badge colorScheme="purple" fontSize="sm">
                  {loading ? "..." : `${getTotalActiveOrders()} Total Active Orders`}
                </Badge>
              </HStack>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
