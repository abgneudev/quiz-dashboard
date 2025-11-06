'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Response } from '@/types/database';
import ResponseCard from '@/components/ResponseCard';
import StatsCard from '@/components/StatsCard';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import { getPersonalityEmoji } from '@/utils/personalityUtils';
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
  // support multiple selected types (empty array = all types)
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
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
      // Filter by personality type(s) - selectedTypes empty = no filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(response.personality_result)) {
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
  }, [allResponses, searchTerm, selectedTypes]);

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
  // map categories to counts and get the official emoji from personalityUtils
  const categories = [
    { key: 'The Quiet Observer', id: 1, color: '#4caf50' },
    { key: 'The Action Driver', id: 2, color: 'var(--primary-red)' },
    { key: 'The Imaginative Dreamer', id: 3, color: '#f57f17' },
    { key: 'The Social Connector', id: 4, color: '#2196f3' }
  ].map((c) => ({ ...c, count: personalityCounts[c.key] || 0, emoji: getPersonalityEmoji(c.id) }));

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
              <div className={styles.totalValue}>{total}</div>
              <div className={styles.totalLabel}>Total Responses</div>
            </div>

            <div className={styles.breakdownGrid}>
              {categories.map((c) => (
                <StatsCard key={c.key} label={c.key} count={c.count} total={total} color={c.color} emoji={c.emoji} />
              ))}
            </div>
          </div>

          <div className={styles.headerControls}>
            {/* headerControls reserved for filters / actions — removed the old numeric summaries as requested */}
          </div>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Types:</label>
                <div>
                  <MultiSelectDropdown
                    options={[
                      { id: 1, label: 'The Quiet Observer' },
                      { id: 2, label: 'The Action Driver' },
                      { id: 3, label: 'The Imaginative Dreamer' },
                      { id: 4, label: 'The Social Connector' }
                    ]}
                    selected={selectedTypes}
                    onChange={(arr: number[]) => setSelectedTypes(arr)}
                  />
                </div>
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
