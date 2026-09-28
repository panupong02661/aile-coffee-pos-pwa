# Project Architecture Rules

- Capacitor native builds must unregister the browser app-shell service worker and clear only `aile-coffee-*` caches before rendering, because persisted PWA caches can serve an obsolete login bundle after an APK update.
- Browser and installed-web versions retain the existing service worker for offline support; native cache cleanup must not clear localStorage or IndexedDB because they contain shop scope and queued offline orders.