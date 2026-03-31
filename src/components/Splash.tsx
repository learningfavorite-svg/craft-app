'use client';

import styles from './Splash.module.css';

interface SplashProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function Splash({ onGetStarted, onSignIn }: SplashProps) {
  return (
    <div className={styles.container}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.circle3} />

      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        AI-Powered
      </div>

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>HMG</span>
            <span className={styles.logoSubtitle}>Healthcare Group</span>
          </div>
        </div>

        <p className={styles.tagline}>
          Your Health,<br />Our Priority.
        </p>

        <div className={styles.actions}>
          <button className="btn-gold" onClick={onGetStarted}>
            Get Started
          </button>
          <button className="btn-ghost" onClick={onSignIn}>
            Sign In
          </button>
        </div>

        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.dotActive}`} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  );
}
