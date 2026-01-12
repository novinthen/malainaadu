import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Rss, RefreshCw, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Source } from '@/types/database';

export default function SourcesPage() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);
  const [deleteSource, setDeleteSource] = useState<Source | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRssUrl, setFormRssUrl] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formActive, setFormActive] = useState(true);

  const { data: sources, isLoading } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Source[];
    },
  });

  const { data: articleCounts } = useQuery({
    queryKey: ['source-article-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('source_id')
        .eq('status', 'published');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((article) => {
        if (article.source_id) {
          counts[article.source_id] = (counts[article.source_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const createSource = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('sources').insert({
        name: formName,
        rss_url: formRssUrl,
        logo_url: formLogoUrl || null,
        is_active: formActive,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      toast.success('Sumber baharu telah ditambah!');
      setAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('URL RSS ini sudah wujud');
      } else {
        toast.error('Gagal menambah sumber');
      }
    },
  });

  const updateSource = useMutation({
    mutationFn: async () => {
      if (!editSource) return;

      const { error } = await supabase
        .from('sources')
        .update({
          name: formName,
          rss_url: formRssUrl,
          logo_url: formLogoUrl || null,
          is_active: formActive,
        })
        .eq('id', editSource.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      toast.success('Sumber telah dikemaskini!');
      setEditSource(null);
      resetForm();
    },
    onError: () => {
      toast.error('Gagal mengemaskini sumber');
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      toast.success('Sumber telah dipadam!');
      setDeleteSource(null);
    },
    onError: () => {
      toast.error('Gagal memadam sumber');
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('sources')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      toast.success('Status sumber dikemaskini');
    },
  });

  const triggerFetch = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-rss`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Fetch failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Berjaya! ${data.processed} artikel baharu diproses.`);
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-articles'] });
    },
    onError: () => {
      toast.error('Gagal mengambil artikel');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormRssUrl('');
    setFormLogoUrl('');
    setFormActive(true);
  };

  const openEdit = (source: Source) => {
    setEditSource(source);
    setFormName(source.name);
    setFormRssUrl(source.rss_url);
    setFormLogoUrl(source.logo_url || '');
    setFormActive(source.is_active);
  };

  const openAdd = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Sumber RSS</h1>
            <p className="text-muted-foreground">Urus sumber berita RSS</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => triggerFetch.mutate()}
              disabled={triggerFetch.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${triggerFetch.isPending ? 'animate-spin' : ''}`} />
              Ambil Sekarang
            </Button>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Sumber
            </Button>
          </div>
        </div>

        {/* Sources Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>URL RSS</TableHead>
                    <TableHead>Artikel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Memuatkan...
                      </TableCell>
                    </TableRow>
                  ) : sources?.length ? (
                    sources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Rss className="h-4 w-4 text-primary" />
                            <span className="font-medium">{source.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={source.rss_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary hover:underline truncate block max-w-[300px]"
                          >
                            {source.rss_url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {articleCounts?.[source.id] || 0} artikel
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={source.is_active ? 'text-green-600' : 'text-muted-foreground'}
                            onClick={() => toggleActive.mutate({ id: source.id, isActive: !source.is_active })}
                          >
                            {source.is_active ? (
                              <>
                                <Power className="mr-1 h-4 w-4" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <PowerOff className="mr-1 h-4 w-4" />
                                Tidak Aktif
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(source)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteSource(source)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Tiada sumber RSS
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog
          open={addDialogOpen || !!editSource}
          onOpenChange={() => {
            setAddDialogOpen(false);
            setEditSource(null);
            resetForm();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editSource ? 'Edit Sumber' : 'Tambah Sumber Baharu'}
              </DialogTitle>
              <DialogDescription>
                {editSource
                  ? 'Kemaskini maklumat sumber RSS'
                  : 'Tambah sumber RSS baharu untuk mengambil berita'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nama Sumber *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sinar Harian"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>URL RSS *</Label>
                <Input
                  value={formRssUrl}
                  onChange={(e) => setFormRssUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>URL Logo (pilihan)</Label>
                <Input
                  value={formLogoUrl}
                  onChange={(e) => setFormLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formActive}
                  onCheckedChange={setFormActive}
                  id="active"
                />
                <Label htmlFor="active">Aktif (termasuk dalam pengambilan berkala)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false);
                  setEditSource(null);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                onClick={() => (editSource ? updateSource.mutate() : createSource.mutate())}
                disabled={!formName || !formRssUrl || createSource.isPending || updateSource.isPending}
              >
                {editSource ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteSource} onOpenChange={() => setDeleteSource(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Padam Sumber?</DialogTitle>
              <DialogDescription>
                Sumber "{deleteSource?.name}" akan dipadam. Artikel sedia ada tidak akan terjejas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteSource(null)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteSource && deleteSourceMutation.mutate(deleteSource.id)}
                disabled={deleteSourceMutation.isPending}
              >
                Padam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
