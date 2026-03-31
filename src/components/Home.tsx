'use client';

import { useMemo } from 'react';
import type { Doctor } from '@/lib/types';
import styles from './Home.module.css';

interface HomeProps {
  doctors: Doctor[];
  onStartBooking: () => void;
  onOpenSettings: () => void;
}

export default function Home({ doctors, onStartBooking, onOpenSettings }: HomeProps) {
  const hour = new Date().getHours();
  const greeting = useMemo(() => {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, [hour]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerCircle} />

        <div className={styles.topBar}>
          <div className={styles.greeting}>
            <span className={styles.greetingSmall}>{greeting},</span>
            <span className={styles.greetingName}>Ahmed Al-Rashid</span>
          </div>
          <div className={styles.topActions}>
            <button className={styles.notifBtn} aria-label="Notifications">
              <span style={{ fontSize: 16 }}>🔔</span>
              <span className={styles.notifDot} />
            </button>
            <button className={styles.avatar} onClick={onOpenSettings} aria-label="Profile">
              AR
            </button>
          </div>
        </div>

        <div className={styles.searchBar} onClick={onStartBooking} role="button" tabIndex={0}>
          <div className={styles.searchPulse}>
            <span style={{ fontSize: 13, color: 'white' }}>✦</span>
          </div>
          <span className={styles.searchText}>Ask AI — &quot;I need a cardiologist...&quot;</span>
          <span className={styles.aiBadge}>AI</span>
        </div>
      </div>

      <div className={styles.body}>
        <div>
          <p className={styles.sectionTitle}>Quick Actions</p>
          <div className={styles.quickActions}>
            <div className={styles.featuredCard} onClick={onStartBooking} role="button" tabIndex={0}>
              <div className={styles.featuredIcon}>🤖</div>
              <div className={styles.featuredContent}>
                <p className={styles.featuredLabel}>AI-Powered</p>
                <p className={styles.featuredTitle}>AI Smart Booking</p>
                <p className={styles.featuredSub}>Find the right doctor instantly</p>
              </div>
              <div className={styles.featuredArrow}>→</div>
            </div>

            <div className={styles.actionCard}>
              <div className={`${styles.actionIcon} ${styles.actionIconBlue}`}>📋</div>
              <p className={styles.actionTitle}>My Records</p>
              <p className={styles.actionSub}>View history</p>
            </div>

            <div className={styles.actionCard}>
              <div className={`${styles.actionIcon} ${styles.actionIconTeal}`}>📅</div>
              <p className={styles.actionTitle}>Upcoming</p>
              <p className={styles.actionSub}>0 appointments</p>
            </div>
          </div>
        </div>

        <div className={styles.doctorsSection}>
          <p className={styles.sectionTitle}>Available Doctors</p>
          <div className={styles.doctorsGrid}>
            {doctors.map((doc) => (
              <div key={doc.id} className={styles.doctorChip}>
                <div
                  className={styles.doctorAvatar}
                  style={{ background: doc.avatarColor }}
                >
                  {doc.avatar}
                </div>
                <div className={styles.doctorInfo}>
                  <p className={styles.doctorName}>{doc.name}</p>
                  <div className={styles.doctorMeta}>
                    <span className={styles.doctorSpec}>{doc.specialty}</span>
                    <span style={{ color: 'var(--hmg-muted)' }}>·</span>
                    <span className={styles.doctorRating}>★ {doc.rating}</span>
                  </div>
                </div>
                <div
                  className={`${styles.availDot} ${
                    doc.available ? styles.availDotGreen : styles.availDotGray
                  }`}
                />
                <button
                  className={`${styles.bookBtn} ${!doc.available ? styles.bookBtnDisabled : ''}`}
                  onClick={doc.available ? onStartBooking : undefined}
                  disabled={!doc.available}
                >
                  {doc.available ? 'Book' : 'Busy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={`${styles.navItem} ${styles.navItemActive}`}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>Home</span>
          <span className={styles.navDot} />
        </div>
        <div className={styles.navItem} onClick={onStartBooking}>
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navLabel}>Search</span>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>📅</span>
          <span className={styles.navLabel}>Appointments</span>
        </div>
        <div className={styles.navItem} onClick={onOpenSettings}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Profile</span>
        </div>
      </nav>
    </div>
  );
}
