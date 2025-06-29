"use client";

import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { type Bot } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { updateBotFlow } from '@/app/actions/bots';
import { EditorSidebar } from './editor/sidebar';
import MessageNode from './editor/nodes/message-node';

const nodeTypes = {
  messageNode: MessageNode,
};

const initialNodes: Node[] = [
  { id: 'start', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 }, deletable: false },
];

interface BotEditorClientProps {
  bot: Bot;
}

export function BotEditorClient({ bot }: BotEditorClientProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(bot.flow_data?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(bot.flow_data?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const nodeIdCounter = useRef(bot.flow_data?.nodes.length || 1);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onSave = async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const result = await updateBotFlow(bot.id, flow);
      if (result.error) {
        toast.error("Failed to save flow", { description: result.error });
      } else {
        toast.success("Flow saved successfully!");
      }
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const getId = useCallback(() => `dndnode_${++nodeIdCounter.current}`, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `Message`, text: 'Your message here...' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, getId]
  );

  return (
    <div className="h-[calc(100vh-60px)] w-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between p-2 border-b bg-white dark:bg-gray-950">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/bot-manager">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">
            Editing: <span className="font-bold">{bot.name}</span>
          </h1>
        </div>
        <Button onClick={onSave}>Save Flow</Button>
      </header>
      <div className="flex-grow flex">
        <ReactFlowProvider>
          <EditorSidebar />
          <div className="flex-grow h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
            >
              <Controls />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
              <Background gap={16} size={1} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}