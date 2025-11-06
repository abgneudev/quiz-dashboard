import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  label: string;
  count: number;
  total: number;
  color?: string; // CSS color or var
  emoji?: string;
}

export default function StatsCard({ label, count, total, color = 'var(--primary-red)', emoji = '🔸' }: StatsCardProps) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={styles.card} style={{ borderColor: color }}>
      <div className={styles.topRow}>
        <div className={styles.icon} style={{ ['--icon-bg' as unknown as string]: color }} aria-hidden>
          <span className={styles.iconContent}>{emoji}</span>
        </div>
        <div className={styles.meta}>
          <div className={styles.count}>{count}</div>
          <div className={styles.label}>{label}</div>
        </div>
        <div className={styles.percent}>{percent}%</div>
      </div>
    </div>
  );
}
