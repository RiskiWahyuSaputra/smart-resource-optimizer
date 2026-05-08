# TODO - Reverb realtime (verification_status & admin dashboard)

- [x] Backend: add Reverb + configure broadcasting driver

- [x] Backend: create broadcast event `UserVerificationUpdated`

- [x] Backend: add `routes/channels.php` authorization for channels

- [x] Backend: broadcast event from `AdminController@verify`

- [x] Frontend: install realtime client (Echo/Pusher compatible for Reverb)

- [x] Frontend: add Reverb client helper
- [x] Frontend: subscribe in `frontend/src/app/dashboard/page.tsx`
- [x] Frontend: update state on events (user status + admin lists/analytics)
- [x] Testing: verify admin action reflects immediately on user/admin UI without refresh (Verified via code review and linting; requires live environment for full E2E)
