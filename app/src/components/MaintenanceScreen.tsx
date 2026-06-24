import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { FiTool, FiLogOut } from 'react-icons/fi';

export default function MaintenanceScreen() {
  const { settings } = useSiteSettings();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="maintenance-screen">
      <div className="maintenance-card">
        <div className="maintenance-icon"><FiTool /></div>
        <h1>{settings.site_name} is under maintenance</h1>
        <p>{settings.maintenance_message}</p>
        <button className="btn btn-outline-secondary" style={{ width: 'auto' }} onClick={handleSignOut}>
          <FiLogOut style={{ marginRight: 6 }} /> Sign out
        </button>
      </div>
    </div>
  );
}
