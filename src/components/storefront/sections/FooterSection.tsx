import React from 'react';

export interface FooterSectionSettings {
  links?: { label: string; url: string }[];
  social?: { icon: string; url: string }[];
  contact_info?: string;
}

const FooterSection: React.FC<{ settings: FooterSectionSettings }> = ({ settings }) => {
  return (
    <footer className="w-full bg-gray-100 py-8 px-6 mt-12 border-t">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <ul className="flex flex-wrap gap-4 mb-4 md:mb-0">
            {settings.links?.map((link, i) => (
              <li key={i}>
                <a href={link.url} className="text-gray-700 hover:text-black text-sm font-medium">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4 items-center">
          {settings.social?.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer">
              {/* For demo, use emoji as icon. Replace with real icon picker in production. */}
              <span className="text-xl">{item.icon}</span>
            </a>
          ))}
        </div>
        {settings.contact_info && (
          <div className="text-xs text-gray-500 mt-2 md:mt-0">{settings.contact_info}</div>
        )}
      </div>
    </footer>
  );
};

export default FooterSection; 