import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdvisorySection } from '@/components/advisory';

export default function AdvisoryPage() {
  return (
    <DashboardLayout activeNavItem="advisory">
      <AdvisorySection />
    </DashboardLayout>
  );
}
