# Fixes for Recent Application Errors

## 1. useAI Hook Error - Missing React Hook

### Issue
The application was generating a runtime error:

```
Uncaught ReferenceError: useRef is not defined
    at useAI (useAI.ts:20:24)
```

### Fix
Added the missing `useRef` import to the useAI hook:

```typescript
import { useState, useEffect, useRef } from 'react';
```

## 2. AppOptimizer Database Errors - Missing Tables

### Issue
The application was generating 404 and 400 errors for database tables that don't exist yet:

```
otxttowidmshxzzfxpdu.supabase.co/rest/v1/notifications?select=...&user_id=eq...  404
otxttowidmshxzzfxpdu.supabase.co/rest/v1/user_roles?select=...&user_id=eq...  404
otxttowidmshxzzfxpdu.supabase.co/rest/v1/posts?select=...  400
```

### Fix
Temporarily commented out references to tables that don't exist yet in the AppOptimizer component:

- Removed `user_roles` table from critical resources
- Removed `posts` table from non-critical resources
- Removed `notifications` table from non-critical resources

```typescript
// Temporarily removing these tables that don't exist yet
// which are causing 404/400 errors
/*
{
  tableName: 'user_roles',
  ...
}
*/
```

## Next Steps

1. **Create the missing tables** - When ready to implement these features, create:
   - `notifications` table for user notifications
   - `user_roles` table for role-based permissions
   - `posts` table for community content

2. **Update Database Optimizer** - Once tables are created, uncomment the relevant code in AppOptimizer.tsx

3. **Add error handling** - Consider adding better error handling in the `prefetchData` function to gracefully handle missing tables
