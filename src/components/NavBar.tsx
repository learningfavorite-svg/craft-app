'use client';

import styles from './NavBar.module.css';

type NavView = 'dashboard' | 'appointments' | 'booking' | 'clinical' | 'profile';

interface NavBarProps {
  active: NavView;
  onNavigate: (view: NavView) => void;
  alertCount?: number;
}

const NAV_ITEMS: { id: NavView; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: 'Home' },
  { id: 'appointments', icon: '📅', label: 'Appts' },
  { id: 'booking', icon: '🤖', label: 'AI Book' },
  { id: 'clinical', icon: '🧠', label: 'Clinical' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export default function NavBar({ active, onNavigate, alertCount = 0 }: NavBarProps) {
  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ''}`}
          onClick={() => onNavigate(item.id)}
          aria-label={item.label}
        >
          <span className={styles.navIconWrap}>
            <span className={styles.navIcon}>{item.icon}</span>
            {item.id === 'clinical' && alertCount > 0 && (
              <span className={styles.alertDot}>{alertCount}</span>
            )}
          </span>
          <span className={styles.navLabel}>{item.label}</span>
          {active === item.id && <span className={styles.navDot} />}
        </button>
      ))}
    </nav>
  );
}
