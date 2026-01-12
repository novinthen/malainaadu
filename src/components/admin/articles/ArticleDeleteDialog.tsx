/**
 * ArticleDeleteDialog Component
 * Confirmation dialog for deleting articles
 */

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UI_TEXT } from '@/constants/ui';
import type { Article } from '@/types/database';

interface ArticleDeleteDialogProps {
  article: Article | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArticleDeleteDialog({
  article,
  isLoading,
  onClose,
  onConfirm,
}: ArticleDeleteDialogProps) {
  return (
    <Dialog open={!!article} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Padam Artikel?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak boleh dibatalkan. Artikel "{article?.title}" akan dipadam secara kekal.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {UI_TEXT.cancel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {UI_TEXT.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
