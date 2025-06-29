"use client";

import { type Node } from 'reactflow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SettingsPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
}

export function EditorSettingsPanel({ selectedNode, onUpdateNode }: SettingsPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="w-80 p-4 border-l bg-gray-50 dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <p className="text-sm text-muted-foreground">Select a node to edit its properties.</p>
      </aside>
    );
  }

  const handleDataChange = (key: string, value: any) => {
    onUpdateNode(selectedNode.id, { ...selectedNode.data, [key]: value });
  };

  return (
    <aside className="w-80 p-4 border-l bg-gray-50 dark:bg-gray-900 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Node ID: {selectedNode.id}</p>
      </div>

      {selectedNode.type === 'messageNode' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label || ''}
              onChange={(e) => handleDataChange('label', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="node-text">Message Text</Label>
            <Textarea
              id="node-text"
              value={selectedNode.data.text || ''}
              onChange={(e) => handleDataChange('text', e.target.value)}
              rows={5}
            />
          </div>
        </div>
      )}
    </aside>
  );
}