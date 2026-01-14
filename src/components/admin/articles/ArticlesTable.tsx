/**
 * ArticlesTable Component
 * Table view for admin articles list with enhanced information,
 * checkbox selection, and pagination
 */

import { Eye, Edit, Trash2, Star, Zap, ExternalLink, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { STATUS_COLORS, STATUS_LABELS, UI_TEXT } from '@/constants/ui';
import { formatRelativeTime, formatPublishDate } from '@/lib/date-utils';
import type { Article } from '@/types/database';

interface ArticlesTableProps {
  articles?: Article[];
  isLoading: boolean;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ArticlesTable({
  articles,
  isLoading,
  onEdit,
  onDelete,
  selectedIds,
  onSelectionChange,
  currentPage,
  totalPages,
  onPageChange,
}: ArticlesTableProps) {
  const getDisplayDate = (article: Article) => {
    return article.publish_date || article.created_at;
  };

  const allSelected = articles?.length ? articles.every((a) => selectedIds.includes(a.id)) : false;
  const someSelected = articles?.some((a) => selectedIds.includes(a.id)) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked && articles) {
      onSelectionChange([...new Set([...selectedIds, ...articles.map((a) => a.id)])]);
    } else if (articles) {
      const articleIds = articles.map((a) => a.id);
      onSelectionChange(selectedIds.filter((id) => !articleIds.includes(id)));
    }
  };

  const handleSelectOne = (articleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, articleId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== articleId));
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label={UI_TEXT.selectAll}
                    className={someSelected ? 'data-[state=checked]:bg-primary' : ''}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement).dataset.state = someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked';
                      }
                    }}
                  />
                </TableHead>
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
                  <TableCell colSpan={10} className="text-center py-8">
                    {UI_TEXT.loading}
                  </TableCell>
                </TableRow>
              ) : articles?.length ? (
                articles.map((article) => (
                  <TableRow 
                    key={article.id}
                    className={selectedIds.includes(article.id) ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectOne(article.id, checked as boolean)}
                        aria-label={`Select ${article.title}`}
                      />
                    </TableCell>
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
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {UI_TEXT.noArticles}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {generatePageNumbers().map((page, index) =>
                  page === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
