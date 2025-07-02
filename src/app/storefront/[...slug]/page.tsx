import React from 'react';
import StorefrontRenderer, { StorefrontTemplateData } from '@/components/storefront/StorefrontRenderer';

// TODO: Replace with real DB fetching and route logic
const mockTemplate: StorefrontTemplateData = {
  sections: {
    header: { type: 'header', settings: { logo: '', nav_links: [{ label: 'Home', url: '/' }], announcement: 'Free shipping!', announcement_bg: '#F5F5F5' } },
    hero1: { type: 'hero-banner', settings: { heading: 'Welcome!', subheading: 'Shop the best products', background_image: '', text_color: '#fff', button_link: '/products' } },
    featured: { type: 'featured-products', settings: { max_products: 4 } },
    footer: { type: 'footer', settings: { links: [{ label: 'Contact', url: '/contact' }], social: [{ icon: '🌐', url: 'https://example.com' }], contact_info: 'Email us at support@example.com' } },
  },
  order: ['header', 'hero1', 'featured', 'footer'],
};

const StorefrontPage = () => {
  // TODO: Use params.slug to determine page type and fetch correct template
  return (
    <main className="min-h-screen bg-gray-50">
      <StorefrontRenderer data={mockTemplate} />
    </main>
  );
};

export default StorefrontPage; 