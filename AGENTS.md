# Project Architecture Rules

- Capacitor native builds must unregister the browser app-shell service worker and clear only `aile-coffee-*` caches before rendering, because persisted PWA caches can serve an obsolete login bundle after an APK update.
- Browser and installed-web versions retain the existing service worker for offline support; native cache cleanup must not clear localStorage or IndexedDB because they contain shop scope and queued offline orders.
- Staff passwords are stored as salted SHA-256 (`password_salt` + `password_hash` = base64 sha256 of password+salt) via the staff-auth edge function; legacy plain-text rows are rehashed on successful login — never store plain-text passwords.
- Offline order side effects (notifications, stock deduction, member points, queue) must run only when `orders.side_effects_done` is false, then set it true, so re-syncing an offline order never duplicates them.
- Customer and kitchen printouts must rasterize the same React documents used by checkout previews, with shop-scoped settings snapshots, because separate text templates drift from the preview; Android Star accepts the resulting image through its existing print method.