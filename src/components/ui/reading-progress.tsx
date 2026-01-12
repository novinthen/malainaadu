import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;
      
      const { top, height } = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrolled = Math.max(0, -top);
      const totalHeight = height - windowHeight;
      const percentage = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
      
      setProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/50">
      <div 
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
