export const clearAppCache = async () => {
  try {
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    
    // Clear localStorage auth data and refresh
    localStorage.removeItem('impacthub-auth');
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear cache:', error);
    window.location.reload();
  }
};

export const checkConnection = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};