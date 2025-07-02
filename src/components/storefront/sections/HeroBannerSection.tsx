import React from 'react';

export interface HeroBannerSectionSettings {
  heading?: string;
  subheading?: string;
  background_image?: string;
  text_color?: string;
  button_link?: string;
}

const HeroBannerSection: React.FC<{ settings: HeroBannerSectionSettings }> = ({ settings }) => {
  return (
    <section
      className="w-full flex items-center justify-center min-h-[350px] relative overflow-hidden"
      style={{
        backgroundImage: settings.background_image ? `url(${settings.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: settings.text_color || '#FFFFFF',
      }}
    >
      <div className="relative z-10 text-center px-6 py-16 bg-black/40 rounded-lg max-w-2xl mx-auto">
        {settings.heading && (
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: settings.text_color || '#FFFFFF' }}>{settings.heading}</h1>
        )}
        {settings.subheading && (
          <p className="text-lg md:text-2xl mb-6" style={{ color: settings.text_color || '#FFFFFF' }}>{settings.subheading}</p>
        )}
        {settings.button_link && (
          <a
            href={settings.button_link}
            className="inline-block px-6 py-2 bg-white text-black font-semibold rounded shadow hover:bg-gray-200 transition"
          >
            Shop Now
          </a>
        )}
      </div>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-0" />
    </section>
  );
};

export default HeroBannerSection; 