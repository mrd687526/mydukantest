import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface SectionListProps {
  sections: Record<string, { type: string; name: string }>;
  order: string[];
  onReorder: (newOrder: string[]) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const ItemType = 'SECTION';

const DraggableSection: React.FC<{
  id: string;
  index: number;
  name: string;
  moveSection: (from: number, to: number) => void;
  selected: boolean;
  onSelect?: () => void;
}> = ({ id, index, name, moveSection, selected, onSelect }) => {
  const ref = React.useRef<HTMLLIElement>(null);
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { id: string; index: number }) {
      if (item.index === index) return;
      moveSection(item.index, index);
      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));
  return (
    <li
      ref={ref}
      className={`p-2 bg-gray-100 rounded cursor-move border ${selected ? 'border-black' : 'border-transparent'} ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
      style={{ userSelect: 'none' }}
    >
      {name}
    </li>
  );
};

const SectionList: React.FC<SectionListProps> = ({ sections, order, onReorder, selectedId, onSelect }) => {
  const [internalOrder, setInternalOrder] = React.useState(order);
  React.useEffect(() => setInternalOrder(order), [order]);
  const moveSection = (from: number, to: number) => {
    const updated = [...internalOrder];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setInternalOrder(updated);
    onReorder(updated);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <ul className="space-y-2 mb-8">
        {internalOrder.map((id, idx) => (
          <DraggableSection
            key={id}
            id={id}
            index={idx}
            name={sections[id]?.name || sections[id]?.type || id}
            moveSection={moveSection}
            selected={selectedId === id}
            onSelect={onSelect ? () => onSelect(id) : undefined}
          />
        ))}
      </ul>
    </DndProvider>
  );
};

export default SectionList; 