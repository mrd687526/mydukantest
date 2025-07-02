import React from 'react';

export interface HeaderSectionSettings {
  logo?: string;
  nav_links?: { label: string; url: string }[];
  announcement?: string;
  announcement_bg?: string;
}

const HeaderSection: React.FC<{ settings: HeaderSectionSettings }> = ({ settings }) => {
  return (
    <header className="w-full">
      {settings.announcement && (
        <div
          className="text-center py-2 text-sm"
          style={{ background: settings.announcement_bg || '#F5F5F5' }}
        >
          {settings.announcement}
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-10 w-auto mr-4" />
          )}
        </div>
        <nav>
          <ul className="flex gap-6">
            {settings.nav_links?.map((link, i) => (
              <li key={i}>
                <a href={link.url} className="text-gray-700 hover:text-black font-medium">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default HeaderSection; 