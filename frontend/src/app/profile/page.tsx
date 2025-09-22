'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MyProfile from '@/components/profile/MyProfile';
import Team from '@/components/profile/Team';
import IDPDevelopmentPlan from '@/components/profile/IDPDevelopmentPlan';
import UserIDP from '@/components/profile/UserIDP';
import UserPerformance from '@/components/profile/UserPerformance';
import UserRoleQuestions from '@/components/profile/UserRoleQuestions';
import MyPerformance from '@/components/profile/MyPerformance';

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'my-profile';

  const renderContent = () => {
    switch (tab) {
      case 'team':
        return <Team />;
      case 'idp':
        return <IDPDevelopmentPlan />;
      case 'performance':
        return <MyPerformance />;
      case 'user-idp':
        return <UserIDP />;
      case 'user-performance':
        return <UserPerformance />;
      case 'user-role-questions':
        return <UserRoleQuestions />;
      case 'my-profile':
      default:
        return <MyProfile />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderContent()}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      }>
        <ProfilePageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
