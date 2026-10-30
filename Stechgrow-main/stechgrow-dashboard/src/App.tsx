import { useState } from 'react';
import SidebarTopCard from './components/SidebarTopCard';
import SidebarNavCard from './components/SidebarNavCard';
import UploadCard from './components/UploadCard';
import TopSearchBar from './components/TopSearchBar';
import AiButton from './components/AiButton';
import NotificationButton from './components/NotificationButton';
import ProfileAvatar from './components/ProfileAvatar';
import DetectRiskButton from './components/DetectRiskButton';
import ActionToolbar from './components/ActionToolbar';
import TotalSalesCard from './components/TotalSalesCard';
import TotalProfitCard from './components/TotalProfitCard';
import TotalUnitSoldCard from './components/TotalUnitSoldCard';
import CountriesCard from './components/CountriesCard';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121214]">
      <aside
        className={`py-5 ${
          isSidebarCollapsed ? 'px-2' : 'px-5'
        } flex flex-col gap-4 shrink-0 overflow-y-auto transition-all duration-300`}
      >
        <SidebarTopCard
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <SidebarNavCard
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
        />
      </aside>

      <main className="flex-1 min-h-0 pt-5 pr-5 pb-6 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-[1500px] flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <UploadCard />
            <TopSearchBar />
            <AiButton className="ml-auto" />
            <NotificationButton />
            <ProfileAvatar />
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-[48px] font-medium leading-tight text-white select-none">
              {activeTab}
            </h1>
            {activeTab === 'Dashboard' && (
              <div className="flex items-center gap-4">
                <ActionToolbar />
                <DetectRiskButton
                  onDetectRisk={() => setActiveTab('Risk Detection & Health')}
                />
              </div>
            )}
          </div>

          {activeTab === 'Dashboard' && (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3 mb-6">
                <TotalSalesCard />
                <TotalProfitCard />
                <TotalUnitSoldCard />
                <CountriesCard />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5 pb-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[356px] rounded-[10px] bg-[#1E1E1E] border border-white/5"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}