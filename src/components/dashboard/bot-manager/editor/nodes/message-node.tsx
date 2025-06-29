"use client";

import { Handle, Position, type NodeProps } from 'reactflow';

function MessageNode({ data }: NodeProps<{ label: string; text: string }>) {
  return (
    <div className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-md w-64">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div>
        <p className="font-semibold text-sm">{data.label || 'Send Message'}</p>
        <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md break-words">
          {data.text || 'Click to edit...'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
}

export default MessageNode;