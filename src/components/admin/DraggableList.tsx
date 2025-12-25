import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface DraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  droppableId?: string;
}

export function DraggableList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  droppableId = 'droppable-list',
}: DraggableListProps<T>) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    onReorder(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          >
            {items.map((item, index) => (
              <Draggable
                key={keyExtractor(item)}
                draggableId={keyExtractor(item)}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`relative ${snapshot.isDragging ? 'z-50 shadow-2xl' : ''}`}
                  >
                    {/* Drag handle */}
                    <div
                      {...provided.dragHandleProps}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-2 sm:p-1.5 bg-background/95 backdrop-blur-sm rounded-lg cursor-grab active:cursor-grabbing shadow-md hover:bg-primary/10 transition-colors group border border-border/50 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {renderItem(item, index)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}