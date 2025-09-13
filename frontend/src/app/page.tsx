'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Grid, Heading, Text, Button, HStack, Status, VStack, SimpleGrid, Badge } from "@chakra-ui/react";
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



export default function Home() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
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
  }, []);

  // Count total active orders
  const getTotalActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'cooking', 'timer_expired', 'ready'].includes(order.status)
    ).length;
  };

  if (loading) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <Text fontSize="xl" color="gray.600">Loading dashboard...</Text>
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
          <Text 
            textAlign="center" 
            color="gray.600" 
            fontSize="lg"
            maxW="2xl"
            className="text-center text-gray-600 text-lg max-w-2xl"
          >
            Restaurant Management Dashboard - Select your section to manage orders and operations
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
