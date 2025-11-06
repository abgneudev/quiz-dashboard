'use client';

import { Response } from '@/types/database';
import { getPersonalityEmoji } from '@/utils/personalityUtils';
import styles from './ResponseCard.module.css';

interface ResponseCardProps {
  response: Response;
}

export default function ResponseCard({ response }: ResponseCardProps) {
  const date = new Date(response.created_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const emoji = getPersonalityEmoji(response.personality_result);

  const getPersonalityBadgeClass = (typeName: string) => {
    switch (typeName) {
      case 'The Quiet Observer':
        return `${styles.personalityBadge} ${styles.personalityBadgeQuiet}`;
      case 'The Social Connector':
        return `${styles.personalityBadge} ${styles.personalityBadgeSocial}`;
      case 'The Action Driver':
        return `${styles.personalityBadge} ${styles.personalityBadgeAction}`;
      case 'The Imaginative Dreamer':
        return `${styles.personalityBadge} ${styles.personalityBadgeImaginative}`;
      default:
        return styles.personalityBadge;
    }
  };

  const personalityTypeName = response.personality_types?.name || `Type ${response.personality_result}`;
  const badgeClass = getPersonalityBadgeClass(personalityTypeName);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.nameSection}>
          <div>
            <h3 className={styles.name}>{response.name}</h3>
          </div>
        </div>
        <span className={styles.date}>{formattedDate}</span>
      </div>

      <div className={badgeClass}>
        <span className={styles.emoji}>{emoji}</span>
        {personalityTypeName}
      </div>

      {/* Legacy single review_comments field (keeps backwards compatibility) */}
      {response.review_comments && (
        <div className={styles.reviewComments}>
          {response.review_comments}
        </div>
      )}

      {/* Related reviews from the `reviews` table (one-to-many) */}
      {response.reviews && response.reviews.length > 0 && (
        <div className={styles.reviewList}>
          {response.reviews.map((r) => (
            <div key={r.id} className={styles.reviewText}>
              {r.review_text}
            </div>
          ))}
        </div>
      )}

      <div className={styles.email}>{response.email}</div>
    </div>
  );
}
