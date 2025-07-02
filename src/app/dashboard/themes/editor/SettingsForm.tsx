import React from 'react';

interface SettingField {
  type: string;
  id: string;
  label: string;
  default?: any;
  multiple?: boolean;
  fields?: SettingField[];
}

interface SettingsFormProps {
  schema: SettingField[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ schema, values, onChange }) => {
  const handleFieldChange = (id: string, value: any) => {
    onChange({ ...values, [id]: value });
  };

  return (
    <form className="space-y-4">
      {schema.map((field) => {
        const value = values[field.id] ?? field.default ?? '';
        switch (field.type) {
          case 'text':
            return (
              <div key={field.id}>
                <label className="block font-medium mb-1">{field.label}</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={value}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                />
              </div>
            );
          case 'color':
            return (
              <div key={field.id}>
                <label className="block font-medium mb-1">{field.label}</label>
                <input
                  type="color"
                  className="w-12 h-8 p-0 border rounded"
                  value={value}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                />
              </div>
            );
          case 'number':
            return (
              <div key={field.id}>
                <label className="block font-medium mb-1">{field.label}</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={value}
                  onChange={e => handleFieldChange(field.id, Number(e.target.value))}
                />
              </div>
            );
          case 'image_picker':
            return (
              <div key={field.id}>
                <label className="block font-medium mb-1">{field.label}</label>
                <input
                  type="url"
                  className="w-full border rounded px-3 py-2"
                  value={value}
                  placeholder="Image URL"
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                />
                {value && (
                  <img src={value} alt="Preview" className="mt-2 h-20 rounded border" />
                )}
              </div>
            );
          case 'link':
            return (
              <div key={field.id}>
                <label className="block font-medium mb-1">{field.label}</label>
                <input
                  type="url"
                  className="w-full border rounded px-3 py-2"
                  value={value}
                  placeholder="https://..."
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                />
              </div>
            );
          case 'repeater':
            return (
              <RepeaterField
                key={field.id}
                field={field}
                value={value}
                onChange={v => handleFieldChange(field.id, v)}
              />
            );
          default:
            return null;
        }
      })}
    </form>
  );
};

const RepeaterField: React.FC<{
  field: SettingField;
  value: any[];
  onChange: (v: any[]) => void;
}> = ({ field, value = [], onChange }) => {
  const addItem = () => {
    onChange([...(value || []), {}]);
  };
  const updateItem = (idx: number, itemValue: any) => {
    const updated = [...value];
    updated[idx] = itemValue;
    onChange(updated);
  };
  const removeItem = (idx: number) => {
    const updated = [...value];
    updated.splice(idx, 1);
    onChange(updated);
  };
  return (
    <div className="mb-2">
      <label className="block font-medium mb-1">{field.label}</label>
      <div className="space-y-2">
        {(value || []).map((item, idx) => (
          <div key={idx} className="flex gap-2 items-end">
            {field.fields?.map(subField => (
              <div key={subField.id} className="flex-1">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder={subField.label}
                  value={item[subField.id] || ''}
                  onChange={e => {
                    updateItem(idx, { ...item, [subField.id]: e.target.value });
                  }}
                />
              </div>
            ))}
            <button type="button" className="text-red-500 px-2" onClick={() => removeItem(idx)}>-</button>
          </div>
        ))}
        <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={addItem}>Add</button>
      </div>
    </div>
  );
};

export default SettingsForm; 