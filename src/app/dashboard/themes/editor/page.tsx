import React, { useRef, useState, useEffect } from 'react';
import SectionList from './SectionList';
import SettingsForm from './SettingsForm';
import { loadThemeData, saveTemplate } from './api';

const MOCK_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_TEMPLATE_NAMES = [
  { name: 'index', label: 'Home Page' },
  { name: 'product', label: 'Product Page' },
  { name: 'cart', label: 'Cart Page' },
];

const ThemeEditorPage = () => {
  const [sectionDefs, setSectionDefs] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE_NAMES[0].name);
  const [template, setTemplate] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load section definitions and templates
  useEffect(() => {
    setLoading(true);
    loadThemeData(MOCK_TENANT_ID)
      .then(({ sectionDefs, themes }) => {
        setSectionDefs(sectionDefs);
        setThemes(themes);
        // Find active theme and template for selectedTemplate
        const activeTheme = themes.find((t: any) => t.is_active) || themes[0];
        const tpl = activeTheme?.theme_templates?.find((tpl: any) => tpl.name === selectedTemplate);
        setTemplate(tpl ? tpl.data_json : { sections: {}, order: [] });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Handle template switching
  useEffect(() => {
    if (!themes.length) return;
    const activeTheme = themes.find((t: any) => t.is_active) || themes[0];
    const tpl = activeTheme?.theme_templates?.find((tpl: any) => tpl.name === selectedTemplate);
    setTemplate(tpl ? tpl.data_json : { sections: {}, order: [] });
    setSelectedSection(null);
  }, [selectedTemplate, themes]);

  // Post template to iframe for live preview
  useEffect(() => {
    if (iframeRef.current && template) {
      iframeRef.current.contentWindow?.postMessage({ type: 'THEME_UPDATE', data: template }, '*');
    }
  }, [template]);

  // Add section
  const handleAddSection = (type: string) => {
    const id = `${type}_${Date.now()}`;
    const def = sectionDefs.find((d) => d.key === type);
    if (!def) return;
    setTemplate((prev: any) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [id]: { type, settings: {} },
      },
      order: [...(prev.order || []), id],
    }));
    setSelectedSection(id);
  };

  // Remove section
  const handleRemoveSection = (id: string) => {
    setTemplate((prev: any) => {
      const { [id]: _, ...rest } = prev.sections;
      return {
        ...prev,
        sections: rest,
        order: prev.order.filter((sid: string) => sid !== id),
      };
    });
    setSelectedSection(null);
  };

  // Handle section reorder
  const handleReorder = (newOrder: string[]) => {
    setTemplate((prev: any) => ({ ...prev, order: newOrder }));
  };

  // Handle section settings change
  const handleSettingsChange = (settings: Record<string, any>) => {
    if (!selectedSection) return;
    setTemplate((prev: any) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [selectedSection]: {
          ...prev.sections[selectedSection],
          settings,
        },
      },
    }));
  };

  // Save template
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const activeTheme = themes.find((t: any) => t.is_active) || themes[0];
      await saveTemplate({
        theme_id: activeTheme.id,
        name: selectedTemplate,
        data_json: template,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Get schema for selected section
  const selectedSectionType = selectedSection ? template.sections[selectedSection]?.type : null;
  const selectedSchema = selectedSectionType ? sectionDefs.find((d) => d.key === selectedSectionType)?.settings_schema_json : null;
  const selectedSettings = selectedSection ? template.sections[selectedSection]?.settings : null;

  // Section list for SectionList
  const sectionList = template?.sections
    ? Object.fromEntries(
        Object.entries(template.sections).map(([id, s]: any) => [id, { type: s.type, name: sectionDefs.find((d) => d.key === s.type)?.name || s.type }])
      )
    : {};

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div>
          <select
            className="border rounded px-3 py-1"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            {DEFAULT_TEMPLATE_NAMES.map((tpl) => (
              <option key={tpl.name} value={tpl.name}>{tpl.label}</option>
            ))}
          </select>
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Structure & Settings */}
        <aside className="w-80 bg-white border-r p-4 overflow-y-auto">
          <h2 className="font-bold mb-4">Sections</h2>
          <SectionList
            sections={sectionList}
            order={template.order}
            onReorder={handleReorder}
            selectedId={selectedSection || undefined}
            onSelect={setSelectedSection}
          />
          <div className="mb-4">
            <label className="block font-semibold mb-2">Add Section</label>
            <select
              className="border rounded px-3 py-1 w-full"
              onChange={(e) => {
                if (e.target.value) handleAddSection(e.target.value);
                e.target.selectedIndex = 0;
              }}
            >
              <option value="">Select section type...</option>
              {sectionDefs.map((def) => (
                <option key={def.key} value={def.key}>{def.name}</option>
              ))}
            </select>
          </div>
          <h3 className="font-semibold mb-2">Section Settings</h3>
          {selectedSection && selectedSchema ? (
            <>
              <SettingsForm
                schema={selectedSchema}
                values={selectedSettings || {}}
                onChange={handleSettingsChange}
              />
              <button
                className="mt-4 text-red-500 text-sm underline"
                onClick={() => handleRemoveSection(selectedSection)}
              >
                Remove Section
              </button>
            </>
          ) : (
            <div className="bg-gray-50 p-3 rounded border text-sm text-gray-500">Select a section to edit settings.</div>
          )}
        </aside>
        {/* Middle Panel: Live Preview */}
        <main className="flex-1 flex items-center justify-center bg-gray-100">
          <iframe
            ref={iframeRef}
            title="Storefront Preview"
            src="/storefront"
            className="w-full h-full min-h-[600px] bg-white border rounded shadow"
          />
        </main>
      </div>
    </div>
  );
};

export default ThemeEditorPage; 