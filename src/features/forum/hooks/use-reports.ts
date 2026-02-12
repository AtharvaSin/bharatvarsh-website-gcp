'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaginationMeta } from '../types';

export interface ReportView {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  filer: { id: string; name: string | null; image: string | null };
  thread?: {
    id: string;
    title: string;
    body: string;
    author: { id: string; name: string | null };
  };
  post?: {
    id: string;
    body: string;
    author: { id: string; name: string | null };
  };
  createdAt: string;
  resolvedAt: string | null;
  resolver?: { id: string; name: string | null } | null;
  resolution: string | null;
}

interface UseReportsParams {
  status?: string;
  page?: number;
  limit?: number;
}

interface UseReportsReturn {
  reports: ReportView[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a paginated list of content reports from the moderation queue.
 * Supports filtering by report status (open, in_review, resolved, etc.).
 */
export function useReports(
  params: UseReportsParams = {}
): UseReportsReturn {
  const [reports, setReports] = useState<ReportView[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const res = await fetch(`/api/forum/reports?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const json = await res.json();
      setReports(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [params.status, params.page, params.limit]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    pagination,
    isLoading,
    error,
    refetch: fetchReports,
  };
}
