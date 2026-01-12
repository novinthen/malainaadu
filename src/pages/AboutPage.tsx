import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <MainLayout>
      <SEOHead
        title="எங்களைப் பற்றி"
        description="செய்தி மலேசியா என்பது மலேசியாவின் நம்பகமான பல ஆதாரங்களிலிருந்து செய்திகளை தொகுக்கும் சமீபத்திய செய்தி போர்டல் ஆகும். எங்கள் நோக்கம் மற்றும் தொலைநோக்கு பற்றி மேலும் அறிக."
        canonicalUrl="/patri"
      />

      <section className="py-6 md:py-12">
        <div className="container max-w-4xl">
          <h1 className="mb-6 font-display text-3xl font-bold md:text-4xl">
            செய்தி மலேசியா பற்றி
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="lead text-xl text-muted-foreground">
              செய்தி மலேசியா என்பது மலேசியாவின் நம்பகமான பல ஆதாரங்களிலிருந்து 
              செய்திகளை எளிதாக அணுகக்கூடிய சமீபத்திய செய்தி போர்டல் ஆகும்.
            </p>

            <div className="my-8 grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Target className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">எங்கள் நோக்கம்</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ஒரே தளத்தில் பல ஆதாரங்களிலிருந்து சமீபத்திய செய்திகளை எளிதாக அணுக வழங்குதல்.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Globe className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">எங்கள் தொலைநோக்கு</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    விரிவான செய்தி கவரேஜுடன் மலேசிய மக்களின் முதன்மை செய்தி போர்டலாக மாறுதல்.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Users className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">மக்களுக்காக</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    அனைத்து சமூகத்தினரும் எளிதாக புரிந்துகொள்ளும் வகையில் செய்திகள் தொகுக்கப்பட்டு வழங்கப்படுகின்றன.
                  </p>
                </CardContent>
              </Card>
            </div>

            <h2>நாங்கள் என்ன செய்கிறோம்</h2>
            <p>
              மலேசியாவின் பல நம்பகமான செய்தி ஆதாரங்களிலிருந்து செய்திகளை சேகரித்து 
              எளிதாக உலாவக்கூடிய ஒரே தளத்தில் வழங்குகிறோம். அரசியல், விளையாட்டு, 
              பொழுதுபோக்கு, பொருளாதாரம் மற்றும் பல தலைப்புகளின் கீழ் செய்திகள் வகைப்படுத்தப்படுகின்றன.
            </p>

            <h2>செய்தி ஆதாரங்கள்</h2>
            <p>
              இந்த இணையதளத்தில் காட்டப்படும் அனைத்து செய்திகளும் மலேசியாவின் 
              நம்பகமான ஊடகங்களிலிருந்து பெறப்படுகின்றன. ஒவ்வொரு கட்டுரையிலும் 
              மேலும் படிக்க மூல இணைப்பு வழங்கப்படுகிறது.
            </p>

            <h2>எங்களை தொடர்பு கொள்ள</h2>
            <p>
              எந்த கேள்விகள், பரிந்துரைகள் அல்லது கருத்துக்களுக்கும், எங்கள் தொடர்பு 
              பக்கம் வழியாக அல்லது <strong>hello@seithi-malaysia.com</strong> என்ற 
              மின்னஞ்சல் மூலம் எங்களை தொடர்பு கொள்ளுங்கள்.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
