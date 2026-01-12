import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <MainLayout>
      <SEOHead
        title="பக்கம் கிடைக்கவில்லை"
        description="மன்னிக்கவும், நீங்கள் தேடும் பக்கம் கிடைக்கவில்லை."
        noIndex
      />

      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <span className="text-7xl">🔍</span>
        <h1 className="mt-6 font-display text-4xl font-bold">404</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          பக்கம் கிடைக்கவில்லை
        </p>
        <p className="mt-4 max-w-md text-muted-foreground">
          மன்னிக்கவும், நீங்கள் தேடும் பக்கம் இல்லை அல்லது நீக்கப்பட்டுள்ளது.
          முகப்பு பக்கத்திற்கு திரும்புங்கள் அல்லது தேடலைப் பயன்படுத்துங்கள்.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              முகப்பு பக்கம்
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/thedi">
              <Search className="mr-2 h-4 w-4" />
              செய்தி தேடு
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
