/**
 * ArticleEditDialog Component
 * Modal dialog for editing article details
 */

import { useState, useEffect } from 'react';
import { Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { STATUS_LABELS, UI_TEXT } from '@/constants/ui';
import type { Article, Category, ArticleStatus } from '@/types/database';

interface ArticleEditDialogProps {
  article: Article | null;
  categories?: Category[];
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    categoryId: string | null;
    status: ArticleStatus;
    isFeatured: boolean;
    isBreaking: boolean;
  }) => void;
}

export function ArticleEditDialog({
  article,
  categories,
  isLoading,
  onClose,
  onSave,
}: ArticleEditDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('pending');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  // Reset form when article changes
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setCategoryId(article.category_id || '');
      setStatus(article.status);
      setIsFeatured(article.is_featured);
      setIsBreaking(article.is_breaking);
    }
  }, [article]);

  const handleSave = () => {
    onSave({
      title,
      content,
      categoryId: categoryId || null,
      status,
      isFeatured,
      isBreaking,
    });
  };

  return (
    <Dialog open={!!article} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Artikel</DialogTitle>
          <DialogDescription>Kemaskini maklumat artikel</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tajuk</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label>Kandungan</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 min-h-[150px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ArticleStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{STATUS_LABELS.draft}</SelectItem>
                  <SelectItem value="pending">{STATUS_LABELS.pending}</SelectItem>
                  <SelectItem value="published">{STATUS_LABELS.published}</SelectItem>
                  <SelectItem value="rejected">{STATUS_LABELS.rejected}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="featured" />
              <Label htmlFor="featured" className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                Artikel Pilihan
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isBreaking} onCheckedChange={setIsBreaking} id="breaking" />
              <Label htmlFor="breaking" className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-red-500" />
                Berita Terkini
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {UI_TEXT.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {UI_TEXT.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
