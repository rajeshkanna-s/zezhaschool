import { Outlet } from 'react-router-dom';
import Header from './Header';
import AnnouncementBanner from './AnnouncementBanner';
import CommandPalette from './CommandPalette';
import MaintenanceScreen from './MaintenanceScreen';
import Footer from './Footer';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { settings } = useSiteSettings();
  const { profile } = useAuth();

  // Maintenance mode locks out students; admins keep full access.
  if (settings.maintenance_mode && profile?.role !== 'admin') {
    return <MaintenanceScreen />;
  }

  return (
    <div className="student-portal-layout">
      <Header />
      <main className="student-portal-content">
        <AnnouncementBanner />
        <div className="student-portal-page">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CommandPalette scope="student" />
    </div>
  );
}
