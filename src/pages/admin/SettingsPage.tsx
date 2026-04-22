import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Rss, Cpu, Database, Languages, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleReprocessMalayLeak = async () => {
    setIsReprocessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reprocess-articles', {
        body: { mode: 'malay-leak', limit: 10 },
      });

      if (error) throw error;

      const processed = data?.processed ?? 0;
      const total = data?.total ?? 0;
      if (total === 0) {
        toast.success('மலாய் தலைப்புள்ள கட்டுரைகள் எதுவும் இல்லை.');
      } else {
        toast.success(`${processed}/${total} கட்டுரைகள் தமிழில் மறுபடி மொழிபெயர்க்கப்பட்டன.`);
      }
      if (data?.errors?.length) {
        console.warn('Reprocess errors:', data.errors);
      }
    } catch (err) {
      console.error('Reprocess failed:', err);
      const message = err instanceof Error ? err.message : 'Reprocess failed';
      toast.error(`மறுபதிவாக்கம் தோல்வியடைந்தது: ${message}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Tetapan</h1>
          <p className="text-muted-foreground">Konfigurasi sistem Berita Malaysia</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Auto Fetch Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Pengambilan Automatik
              </CardTitle>
              <CardDescription>Status cron job untuk mengambil artikel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jadual</span>
                  <span className="text-sm font-medium">Setiap 15 minit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cron Expression</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">*/15 * * * *</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RSS Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5 text-primary" />
                Sumber Berita
              </CardTitle>
              <CardDescription>Sumber RSS yang dikonfigurasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sinar Harian</span>
                  <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Astro Awani</span>
                  <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Pemprosesan AI
              </CardTitle>
              <CardDescription>Konfigurasi Gemini AI untuk penulisan semula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Model</span>
                  <span className="text-sm font-medium">Gemini 2.0 Flash</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Key</span>
                  <Badge variant="outline">Dikonfigurasi</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Panjang Kandungan</span>
                  <span className="text-sm font-medium">200-300 patah perkataan</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Pangkalan Data
              </CardTitle>
              <CardDescription>Maklumat Lovable Cloud</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform</span>
                  <span className="text-sm font-medium">Lovable Cloud</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">RLS</span>
                  <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Edge Functions</span>
                  <Badge className="bg-green-100 text-green-700">1 Deployed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Malay-leak backfill */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              மலாய் தலைப்புகளை தமிழுக்கு மாற்று
            </CardTitle>
            <CardDescription>
              மொழிபெயர்ப்பு தோல்வியடைந்து மலாய் தலைப்புடன் வெளியிடப்பட்ட கட்டுரைகளை மீண்டும் செயலாக்கவும். ஒரே நேரத்தில் 10 கட்டுரைகள் வரை செயலாக்கப்படும்.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleReprocessMalayLeak}
              disabled={isReprocessing}
              className="w-full sm:w-auto"
            >
              {isReprocessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  செயலாக்கப்படுகிறது...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  மலாய் தலைப்புள்ள கட்டுரைகளை மறுபடி மொழிபெயர்
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Maklumat Lanjut</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Untuk mengkonfigurasi Google OAuth bagi log masuk admin, sila ikut langkah-langkah berikut:
            </p>
            <ol>
              <li>Pergi ke <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Cipta OAuth 2.0 Client ID untuk aplikasi web</li>
              <li>Tambah redirect URL: <code>{window.location.origin}/admin</code></li>
              <li>Konfigurasi di panel Lovable Cloud → Authentication → Google</li>
            </ol>
            <p>
              Selepas konfigurasi, anda perlu menambah pengguna pertama sebagai admin melalui SQL:
            </p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {`INSERT INTO user_roles (user_id, role) 
VALUES ('USER_UUID_HERE', 'admin');`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
