/**
 * ArticlesTable Component
 * Table view for admin articles list with enhanced information
 */

import { Eye, Edit, Trash2, Star, Zap, ExternalLink, Facebook, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { STATUS_COLORS, STATUS_LABELS, UI_TEXT } from '@/constants/ui';
import { formatRelativeTime, formatPublishDate } from '@/lib/date-utils';
import type { Article } from '@/types/database';

interface ArticlesTableProps {
  articles?: Article[];
  isLoading: boolean;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export function ArticlesTable({ articles, isLoading, onEdit, onDelete }: ArticlesTableProps) {
  const getDisplayDate = (article: Article) => {
    return article.publish_date || article.created_at;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[280px]">Tajuk</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tarikh</TableHead>
                <TableHead className="text-center">Asal</TableHead>
                <TableHead className="text-center">FB</TableHead>
                <TableHead className="text-right">Tontonan</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    {UI_TEXT.loading}
                  </TableCell>
                </TableRow>
              ) : articles?.length ? (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="flex gap-1 shrink-0">
                          {article.is_featured && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                          {article.is_breaking && (
                            <Zap className="h-4 w-4 text-red-500 fill-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="line-clamp-2 text-sm font-medium">{article.title}</span>
                          {article.slug && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              /{article.slug}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{article.source?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{article.category?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[article.status]}>
                        {STATUS_LABELS[article.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-muted-foreground whitespace-nowrap cursor-default">
                              {formatRelativeTime(getDisplayDate(article))}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formatPublishDate(getDisplayDate(article))}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      {article.original_url ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={article.original_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Buka artikel asal</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {article.posted_to_facebook ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center justify-center h-8 w-8">
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Dihantar ke Facebook</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {article.view_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`/berita/${article.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
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
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
