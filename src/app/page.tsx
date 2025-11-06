'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Response } from '@/types/database';
import ResponseCard from '@/components/ResponseCard';
import StatsCard from '@/components/StatsCard';
import styles from './page.module.css';

async function getResponses(): Promise<Response[]> {
  const { data, error } = await supabase
    .from('responses')
    .select(`
      *,
      personality_types (
        id,
        name,
        description
      ),
      reviews (
        id,
        review_text,
        created_at,
        response_id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching responses:', error);
    return [];
  }

  return data || [];
}

export default function Home() {
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Shared fetch function so the page can refresh on demand
  const fetchResponses = async () => {
    try {
      setIsRefreshing(true);
      const responses = await getResponses();
      setAllResponses(responses);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch data on client side (initial load)
  useEffect(() => {
    fetchResponses();
  }, []);

  // Filter responses based on search term and type
  const filteredResponses = useMemo(() => {
    return allResponses.filter((response) => {
      // Filter by personality type
      if (selectedType && response.personality_result !== parseInt(selectedType)) {
        return false;
      }

      // Filter by search term (name or email)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = response.name.toLowerCase().includes(searchLower);
        const emailMatch = response.email.toLowerCase().includes(searchLower);
        if (!nameMatch && !emailMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allResponses, searchTerm, selectedType]);

  // Calculate personality type counts from filtered responses
  const personalityCounts = useMemo(() => {
    return filteredResponses.reduce((acc, response) => {
      const typeName = response.personality_types?.name || 'Unknown';
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredResponses]);

  const total = filteredResponses.length;

  // map counts into an array with consistent ordering and colors/emojis
  const categories = [
    { key: 'The Quiet Observer', color: '#4caf50', emoji: '🤫' },
    { key: 'The Action Driver', color: 'var(--primary-red)', emoji: '⚡' },
    { key: 'The Imaginative Dreamer', color: '#f57f17', emoji: '🌟' },
    { key: 'The Social Connector', color: '#2196f3', emoji: '🤝' }
  ].map((c) => ({ ...c, count: personalityCounts[c.key] || 0 }));

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <a href="#">Dashboard</a>
          <span className={styles.breadcrumbSeparator}>{'>'}</span>
          <span>Quiz Responses</span>
        </div>

        <div className={styles.headerContent}>
          <div className={styles.metricsAndFilters}>
            <div className={styles.totalBlock}>
              <div className={styles.totalLabel}>Total Responses</div>
              <div className={styles.totalValue}>{total}</div>
            </div>

            <div className={styles.breakdownGrid}>
              {categories.map((c) => (
                <StatsCard key={c.key} label={c.key} count={c.count} total={total} color={c.color} emoji={c.emoji} />
              ))}
            </div>
          </div>

          <div className={styles.headerControls}>
            <div className={styles.summaryStats}>
              {/* Keep the compact summary for quick glance (accessible on wider screens) */}
              {categories.map((c) => (
                <div key={c.key} className={styles.summaryColumn}>
                  <div className={styles.summaryValue}>{c.count}</div>
                  <div className={styles.summaryLabel}>{c.key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Type:</label>
            <select
              className={styles.filterSelect}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="1">The Quiet Observer</option>
              <option value="2">The Action Driver</option>
              <option value="3">The Imaginative Dreamer</option>
              <option value="4">The Social Connector</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search:</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button
            className={styles.iconButton}
            title={isRefreshing ? 'Refreshing…' : 'Refresh'}
            onClick={fetchResponses}
            disabled={isRefreshing}
          >
            {isRefreshing ? '⏳' : '↻'}
          </button>
          <button className={styles.iconButton} title="Export">
            ⤓
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {filteredResponses.length === 0 ? (
          <div className={styles.empty}>
            No responses found. Adjust your filters or check back later.
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {filteredResponses.map((response) => (
                <ResponseCard key={response.id} response={response} />
              ))}
            </div>

            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing 1-{Math.min(filteredResponses.length, 12)} of {filteredResponses.length}
              </div>
              <div className={styles.paginationControls}>
                <select className={styles.filterSelect} style={{ minWidth: '120px' }}>
                  <option>12 per page</option>
                  <option>24 per page</option>
                  <option>48 per page</option>
                </select>
                <button className={styles.pageButton}>←</button>
                <button className={`${styles.pageButton} ${styles.active}`}>1</button>
                <button className={styles.pageButton}>2</button>
                <button className={styles.pageButton}>3</button>
                <button className={styles.pageButton}>→</button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
