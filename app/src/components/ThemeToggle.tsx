import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { resolved, setMode } = useTheme();
  const isDark = resolved === 'dark';
  return (
    <button
      className="header-btn"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
