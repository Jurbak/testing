(function() {
  // Only register SW if served via HTTP/HTTPS (not file://)
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.protocol === 'http:')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered');

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      }).catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    });
  }

  // Online/Offline detection - only show on HTTP/HTTPS, not file://
  if (window.location.protocol !== 'file:') {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.className = 'offline-indicator';
    offlineIndicator.innerHTML = '<span>&#9888;</span> Anda sedang offline';
    document.body.appendChild(offlineIndicator);

    function updateOnlineStatus() {
      if (navigator.onLine) {
        offlineIndicator.classList.remove('show');
      } else {
        offlineIndicator.classList.add('show');
      }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  function showUpdateBanner() {
    let banner = document.querySelector('.pwa-update-banner');
    if (banner) return;

    banner = document.createElement('div');
    banner.className = 'pwa-install-banner pwa-update-banner';
    banner.innerHTML = `
      <p>Versi baru tersedia</p>
      <button class="btn btn-primary" id="btnUpdate">Update</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('btnUpdate').addEventListener('click', () => {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });

    setTimeout(() => banner.classList.add('show'), 3000);
  }
})();
