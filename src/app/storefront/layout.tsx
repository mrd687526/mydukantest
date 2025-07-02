import React, { useEffect, useState } from 'react';
import StorefrontRenderer, { StorefrontTemplateData } from '@/components/storefront/StorefrontRenderer';

const defaultTemplate: StorefrontTemplateData = {
  sections: {
    header: { type: 'header', settings: { logo: '', nav_links: [{ label: 'Home', url: '/' }], announcement: 'Free shipping!', announcement_bg: '#F5F5F5' } },
    hero1: { type: 'hero-banner', settings: { heading: 'Welcome!', subheading: 'Shop the best products', background_image: '', text_color: '#fff', button_link: '/products' } },
    featured: { type: 'featured-products', settings: { max_products: 4 } },
    footer: { type: 'footer', settings: { links: [{ label: 'Contact', url: '/contact' }], social: [{ icon: '🌐', url: 'https://example.com' }], contact_info: 'Email us at support@example.com' } },
  },
  order: ['header', 'hero1', 'featured', 'footer'],
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [liveTemplate, setLiveTemplate] = useState<StorefrontTemplateData | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'THEME_UPDATE' && event.data.data) {
        setLiveTemplate(event.data.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {liveTemplate ? <StorefrontRenderer data={liveTemplate} /> : children}
    </div>
  );
} 