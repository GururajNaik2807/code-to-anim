// src/utils/analytics.js

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const trackPageView = (path, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      ...params,
    });
  }
};