'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import OverviewTab from '@/components/dashboard/OverviewTab';
import DiscoverTab from '@/components/dashboard/DiscoverTab';
import LeadsTab from '@/components/dashboard/LeadsTab';
import CampaignsTab from '@/components/dashboard/CampaignsTab';
import ActivityTab from '@/components/dashboard/ActivityTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import SettingsTab from '@/components/dashboard/SettingsTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && <OverviewTab onNavigateTab={setActiveTab} />}
      {activeTab === 'discover' && <DiscoverTab onNavigateTab={setActiveTab} />}
      {activeTab === 'leads' && <LeadsTab />}
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'activity' && <ActivityTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </DashboardLayout>
  );
}

