/**
 * Database Optimization Utilities
 * 
 * This file provides utilities to optimize database interactions
 * for better application performance.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Simple in-memory cache with time-based expiration
 */
type CacheEntry<T> = {
  data: T;
  expires: number;
};

class QueryCache {
  private cache: Record<string, CacheEntry<any>> = {};
  
  /**
   * Get an item from cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      // Clear expired cache entry
      delete this.cache[key];
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set an item in the cache with expiration
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache[key] = {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    };
  }
  
  /**
   * Clear a specific cache entry
   */
  clear(key: string): void {
    delete this.cache[key];
  }
  
  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache = {};
  }
  
  /**
   * Clear cache entries by prefix
   */
  clearByPrefix(prefix: string): void {
    Object.keys(this.cache)
      .filter(key => key.startsWith(prefix))
      .forEach(key => delete this.cache[key]);
  }
}

// Create a global instance of QueryCache
export const queryCache = new QueryCache();

/**
 * Perform an optimized query with caching
 * @param tableName Table to query
 * @param queryFn Function that returns a Supabase query
 * @param cacheKey Unique key for caching
 * @param ttlSeconds Cache TTL in seconds
 */
export async function cachedQuery<T>(
  tableName: string,
  queryFn: () => any,
  cacheKey: string,
  ttlSeconds: number = 300
): Promise<T | null> {
  // Check if data exists in cache
  const cachedData = queryCache.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Execute the query
    const { data, error } = await queryFn();
    
    if (error) {
      console.error(`Error in cached query for ${tableName}:`, error);
      return null;
    }
    
    // Store in cache
    queryCache.set<T>(cacheKey, data, ttlSeconds);
    return data;
  } catch (error) {
    console.error(`Exception in cached query for ${tableName}:`, error);
    return null;
  }
}

/**
 * Clear cache for specific table
 */
export function clearTableCache(tableName: string): void {
  queryCache.clearByPrefix(tableName);
}

/**
 * Select only the minimum columns required
 */
export function selectMinimal<T>(
  tableName: string,
  columns: string[],
  options?: { 
    limit?: number; 
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    cacheKey?: string;
    ttlSeconds?: number;
  }
): Promise<T[] | null> {
  const cacheKey = options?.cacheKey || `${tableName}:minimal:${columns.join(',')}:${JSON.stringify(options?.filters || {})}`;
  
  return cachedQuery<T[]>(tableName, () => {
    let query = supabase
      .from(tableName)
      .select(columns.join(','));
    
    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }
    
    // Apply order
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return query;
  }, cacheKey, options?.ttlSeconds);
}

/**
 * Efficient counting of rows with caching
 */
export async function countRows(
  tableName: string, 
  filters?: Record<string, any>,
  cacheKey?: string,
  ttlSeconds: number = 600
): Promise<number> {
  const key = cacheKey || `${tableName}:count:${JSON.stringify(filters || {})}`;
  
  const result = await cachedQuery<{ count: number }>(tableName, () => {
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }
    
    return query;
  }, key, ttlSeconds);
  
  return result?.count || 0;
}

/**
 * Background data prefetching
 */
export function prefetchData(
  prefetchRequests: Array<{
    tableName: string;
    columns: string[];
    filters?: Record<string, any>;
    cacheKey: string;
    ttlSeconds?: number;
  }>
): void {
  // Use requestIdleCallback or setTimeout to defer loading until idle
  const runPrefetch = () => {
    prefetchRequests.forEach(request => {
      selectMinimal(
        request.tableName,
        request.columns,
        {
          filters: request.filters,
          cacheKey: request.cacheKey,
          ttlSeconds: request.ttlSeconds
        }
      ).catch(err => console.warn(`Prefetch error for ${request.tableName}:`, err));
    });
  };
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runPrefetch);
  } else {
    setTimeout(runPrefetch, 100);
  }
}

/**
 * Optimized batch operations
 */
export async function batchInsert<T>(
  tableName: string,
  records: Partial<T>[],
  batchSize: number = 100
): Promise<{ successful: number; failed: number; errors: any[] }> {
  const result = {
    successful: 0,
    failed: 0,
    errors: [] as any[]
  };
  
  // Process in batches
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (error) {
        result.failed += batch.length;
        result.errors.push(error);
      } else {
        result.successful += batch.length;
        
        // Clear cache for this table as data has changed
        clearTableCache(tableName);
      }
    } catch (error) {
      result.failed += batch.length;
      result.errors.push(error);
    }
  }
  
  return result;
}

export default {
  queryCache,
  cachedQuery,
  selectMinimal,
  countRows,
  prefetchData,
  clearTableCache,
  batchInsert
};
