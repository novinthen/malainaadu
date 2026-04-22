import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Rss, Cpu, Database, Languages, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BATCH_SIZE = 10;
const MAX_BATCHES = 20; // safety cap (200 articles)

interface ReprocessSummary {
  batches: number;
  fixed: number;
  failed: number;
  errors: string[];
}

export default function SettingsPage() {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [batchesRun, setBatchesRun] = useState(0);
  const [fixedCount, setFixedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [summary, setSummary] = useState<ReprocessSummary | null>(null);

  const handleReprocessMalayLeak = async () => {
    setIsReprocessing(true);
    setSummary(null);
    setBatchesRun(0);
    setFixedCount(0);
    setFailedCount(0);
    setStatusMessage('தொடங்குகிறது...');

    let totalFixed = 0;
    let totalFailed = 0;
    let batches = 0;
    const allErrors: string[] = [];

    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        batches = i + 1;
        setStatusMessage(`Batch ${batches} செயலாக்கப்படுகிறது (${BATCH_SIZE} கட்டுரைகள்)...`);

        const { data, error } = await supabase.functions.invoke('reprocess-articles', {
          body: { mode: 'malay-leak', limit: BATCH_SIZE },
        });

        if (error) throw error;

        const processed = data?.processed ?? 0;
        const total = data?.total ?? 0;
        const errors: string[] = data?.errors ?? [];

        const failedInBatch = Math.max(0, total - processed);
        totalFixed += processed;
        totalFailed += failedInBatch;
        if (errors.length) allErrors.push(...errors.map((e) => String(e)));

        setBatchesRun(batches);
        setFixedCount(totalFixed);
        setFailedCount(totalFailed);

        // Done when no more Malay-leaked articles remain
        if (total === 0) {
          batches = i; // this batch found nothing
          break;
        }

        // Small delay to avoid hammering the AI gateway
        await new Promise((r) => setTimeout(r, 1000));
      }

      const finalSummary: ReprocessSummary = {
        batches,
        fixed: totalFixed,
        failed: totalFailed,
        errors: allErrors,
      };
      setSummary(finalSummary);
      setStatusMessage('');

      if (totalFixed === 0 && totalFailed === 0) {
        toast.success('மலாய் தலைப்புள்ள கட்டுரைகள் எதுவும் இல்லை.');
      } else {
        toast.success(
          `முடிந்தது: ${totalFixed} சரிசெய்யப்பட்டது, ${totalFailed} தோல்வி (${batches} batches).`
        );
      }
      if (allErrors.length) console.warn('Reprocess errors:', allErrors);
    } catch (err) {
      console.error('Reprocess failed:', err);
      const message = err instanceof Error ? err.message : 'Reprocess failed';
      setStatusMessage('');
      setSummary({
        batches,
        fixed: totalFixed,
        failed: totalFailed,
        errors: [...allErrors, message],
      });
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
              மொழிபெயர்ப்பு தோல்வியடைந்து மலாய் தலைப்புடன் வெளியிடப்பட்ட கட்டுரைகளை மீண்டும் செயலாக்கவும். ஒரே ஓட்டத்தில் அனைத்தும் {BATCH_SIZE}-ன் batches-ஆக தானாக செயலாக்கப்படும்.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {isReprocessing && (
              <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{statusMessage || 'செயலாக்கம்...'}</span>
                  <span className="font-medium">Batch {batchesRun}/{MAX_BATCHES}</span>
                </div>
                <Progress value={(batchesRun / MAX_BATCHES) * 100} />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    சரிசெய்யப்பட்டது: <strong className="text-foreground">{fixedCount}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                    தோல்வி: <strong className="text-foreground">{failedCount}</strong>
                  </span>
                </div>
              </div>
            )}

            {summary && !isReprocessing && (
              <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  செயலாக்கம் முடிந்தது
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Batches</div>
                    <div className="font-semibold">{summary.batches}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">சரிசெய்யப்பட்டது</div>
                    <div className="font-semibold text-primary">{summary.fixed}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">தோல்வி</div>
                    <div className="font-semibold text-destructive">{summary.failed}</div>
                  </div>
                </div>
                {summary.errors.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      பிழைகள் ({summary.errors.length})
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-destructive">
                      {summary.errors.slice(0, 10).map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
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
