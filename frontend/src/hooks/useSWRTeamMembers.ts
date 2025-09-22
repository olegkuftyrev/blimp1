import useSWR from 'swr';
import apiClient from '@/lib/axios';

// Types
interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  restaurants?: Restaurant[];
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

// Hook for getting team members
export function useSWRTeamMembers() {
  const { 
    data: teamData, 
    error, 
    isLoading,
    mutate 
  } = useSWR('/users/team', fetcher);

  // Debug: log the data structure
  if (teamData?.data) {
    console.log('Team members data:', teamData.data);
    if (teamData.data.length > 0) {
      console.log('First team member structure:', teamData.data[0]);
    }
  }

  return {
    teamMembers: teamData?.data || [],
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
}

// Hook for getting team members by restaurant
export function useSWRTeamMembersByRestaurant(restaurantId: number) {
  const { teamMembers, loading, error } = useSWRTeamMembers();
  
  // Filter team members by restaurant and role
  const filteredMembers = teamMembers.filter((user: User) => {
    if (!user.restaurants) return false;
    return user.restaurants.some(restaurant => restaurant.id === restaurantId);
  });

  // Get black shirts and ops leads for this restaurant
  const blackShirts = filteredMembers.filter(user => user.role === 'black_shirt');
  const opsLeads = filteredMembers.filter(user => user.role === 'ops_lead');

  return {
    teamMembers: filteredMembers,
    blackShirts,
    opsLeads,
    loading,
    error
  };
}
