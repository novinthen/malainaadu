/**
 * BulkActionsBar Component
 * Floating action bar for bulk article operations
 */

import { X, Send, Star, StarOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UI_TEXT } from '@/constants/ui';

interface BulkActionsBarProps {
  selectedCount: number;
  onPublish: () => void;
  onFeature: () => void;
  onUnfeature: () => void;
  onDelete: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onPublish,
  onFeature,
  onUnfeature,
  onDelete,
  onClear,
  isLoading,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 bg-background border rounded-lg shadow-lg px-4 py-3">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount} {UI_TEXT.selected}
        </span>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onPublish}
          disabled={isLoading}
          className="gap-1.5"
        >
          <Send className="h-4 w-4" />
          {UI_TEXT.bulkPublish}
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onFeature}
          disabled={isLoading}
          className="gap-1.5"
        >
          <Star className="h-4 w-4" />
          {UI_TEXT.bulkFeature}
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onUnfeature}
          disabled={isLoading}
          className="gap-1.5"
        >
          <StarOff className="h-4 w-4" />
          {UI_TEXT.bulkUnfeature}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isLoading}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          {UI_TEXT.delete}
        </Button>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
