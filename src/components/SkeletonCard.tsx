import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.nameSkeleton}></div>
        <div className={styles.badgeSkeleton}></div>
        <div className={styles.dateSkeleton}></div>
      </div>
      <div className={styles.personalitySkeleton}></div>
      <div className={styles.emailSkeleton}></div>
    </div>
  );
}