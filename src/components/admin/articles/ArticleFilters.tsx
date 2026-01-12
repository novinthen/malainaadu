/**
 * ArticleFilters Component
 * Search and filter controls for admin articles table
 */

import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Source } from '@/types/database';

interface ArticleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  sources?: Source[];
}

export function ArticleFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  sources,
}: ArticleFiltersProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap gap-4 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="published">Diterbitkan</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="draft">Draf</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={onSourceChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sumber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sumber</SelectItem>
            {sources?.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
