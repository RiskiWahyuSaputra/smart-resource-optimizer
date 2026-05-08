# Reverb Realtime Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable real-time updates for user verification status and the admin dashboard using Laravel Reverb and Echo.

**Architecture:** Use `laravel-echo` with a custom `reverbClient` helper to subscribe to private user and admin channels in the `DashboardPage`. When events occur, refresh the relevant state (user profile via `checkAuth`, admin lists via existing load functions).

**Tech Stack:** Next.js (Frontend), Laravel Reverb (Backend), Laravel Echo, Pusher-js.

---

### Task 1: Integrate Reverb Client in Dashboard

**Files:**
- Modify: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: Import Reverb client and useAuth hook additions**

Update imports and destructure `token` and `checkAuth` from `useAuth`.

- [ ] **Step 2: Add useEffect for Reverb subscription**

Implement the subscription logic.

```typescript
  // Realtime updates via Reverb
  useEffect(() => {
    if (!user || !token) return;

    const echo = getEchoClient(token);

    // 1. Listen for user-specific verification updates
    const userChannel = echo.private(`user.${user.id}`);
    userChannel.listen('.user.verification.updated', (data: any) => {
      console.log('User verification updated (realtime):', data);
      void checkAuth(); // Refresh user object in context
    });

    // 2. Listen for admin-wide updates
    let adminChannel: any = null;
    if (user.role === 'admin') {
      adminChannel = echo.private('admin');
      adminChannel.listen('.user.verification.updated', (data: any) => {
        console.log('Admin: User verification updated (realtime):', data);
        void loadAllVerifications();
        void loadDashboardOverviewAnalytics();
      });
    }

    return () => {
      userChannel.stopListening('.user.verification.updated');
      if (adminChannel) {
        adminChannel.stopListening('.user.verification.updated');
      }
      // Note: We don't disconnect echo globally here to avoid affecting other components if added later,
      // but in this app, Dashboard is the main consumer.
    };
  }, [user?.id, token, user?.role]);
```

- [ ] **Step 3: Verify listener name**

The backend `broadcastAs` returns `user.verification.updated`. In Echo, if we use `broadcastAs`, we often need to prefix with a dot `.` if we don't want the namespace. Laravel's default is `App\Events\UserVerificationUpdated` if not overridden. Since it IS overridden in `broadcastAs`, `.user.verification.updated` is correct for Echo.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/dashboard/page.tsx
git commit -m "feat(frontend): integrate Reverb realtime updates in dashboard"
```

### Task 2: Verification and Testing

- [ ] **Step 1: Start Reverb server**

Run: `php artisan reverb:start` in backend directory.

- [ ] **Step 2: Run backend queue (if using async broadcasting)**

Run: `php artisan queue:work` in backend directory.

- [ ] **Step 3: Test User Verification Flow**

1. Login as a restaurant/community user in one browser.
2. Login as admin in another browser (or incognito).
3. Admin approves/rejects the user.
4. Verify the user's dashboard updates immediately without refresh.
5. Verify the admin's "Quick Queue" or verification list updates immediately when another admin (or the same one) performs an action.

- [ ] **Step 4: Commit**

```bash
# No code changes, just verification
```
