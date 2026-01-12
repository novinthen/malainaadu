import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';

export function Footer() {
  const { data: categories } = useCategories();

  return (
    <footer className="border-t bg-card pb-20 md:pb-0">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-xl font-bold text-primary-foreground">செ</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold leading-none text-foreground">
                  செய்தி
                </span>
                <span className="text-sm font-medium leading-none text-primary">
                  மலேசியா
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              மலேசியாவின் சமீபத்திய செய்தி போர்டல். நம்பகமான பல ஆதாரங்களிலிருந்து செய்திகள்.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              வகைகள்
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {categories?.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/kategori/${category.slug}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              இணைப்புகள்
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/trending"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  டிரெண்டிங் செய்திகள்
                </Link>
              </li>
              <li>
                <Link
                  to="/terkini"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  சமீபத்திய செய்திகள்
                </Link>
              </li>
              <li>
                <Link
                  to="/cari"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  செய்தி தேடல்
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              தகவல்
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/tentang"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  எங்களைப் பற்றி
                </Link>
              </li>
              <li>
                <Link
                  to="/privasi"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  தனியுரிமைக் கொள்கை
                </Link>
              </li>
              <li>
                <Link
                  to="/terma"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  பயன்பாட்டு விதிகள்
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} செய்தி மலேசியா. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.
          </p>
        </div>
      </div>
    </footer>
  );
}
