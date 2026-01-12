/**
 * ArticlesTable Component
 * Table view for admin articles list
 */

import { Eye, Edit, Trash2, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { STATUS_COLORS, STATUS_LABELS, UI_TEXT } from '@/constants/ui';
import type { Article } from '@/types/database';

interface ArticlesTableProps {
  articles?: Article[];
  isLoading: boolean;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export function ArticlesTable({ articles, isLoading, onEdit, onDelete }: ArticlesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px]">Tajuk</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tontonan</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {UI_TEXT.loading}
                  </TableCell>
                </TableRow>
              ) : articles?.length ? (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {article.is_featured && (
                          <Star className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500" />
                        )}
                        {article.is_breaking && (
                          <Zap className="h-4 w-4 shrink-0 text-red-500 fill-red-500" />
                        )}
                        <span className="line-clamp-2">{article.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.source?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{article.category?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[article.status]}>
                        {STATUS_LABELS[article.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {article.view_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/berita/${article.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(article)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {UI_TEXT.noArticles}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
