import React, { useRef, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Home, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const TOTAL_PAGES = 15;
const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => `/selangor/page_${i + 1}.jpg`);

const Page = React.forwardRef<HTMLDivElement, { src: string; number: number }>(
  ({ src, number }, ref) => (
    <div ref={ref} className="bg-white">
      <img
        src={src}
        alt={`Page ${number}`}
        className="w-full h-full object-contain"
        loading={number <= 2 ? 'eager' : 'lazy'}
      />
    </div>
  )
);
Page.displayName = 'Page';

export default function SelangorPage() {
  const isMobile = useIsMobile();
  const flipBook = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const goNext = () => flipBook.current?.pageFlip()?.flipNext();
  const goPrev = () => flipBook.current?.pageFlip()?.flipPrev();

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Responsive dimensions
  const pageWidth = isMobile ? Math.min(window.innerWidth - 16, 400) : 450;
  const pageHeight = Math.round(pageWidth * 1.414); // A4 ratio

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#DA251D' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#DA251D' }}>
        <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">முகப்பு</span>
        </Link>
        <h1 className="text-white font-bold text-lg sm:text-xl tracking-wide">
          SELANGOR
        </h1>
        <button
          onClick={toggleFullscreen}
          className="text-white hover:opacity-80 transition-opacity p-1"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </header>

      {/* Yellow accent bar */}
      <div className="h-1" style={{ backgroundColor: '#FCD116' }} />

      {/* Flipbook */}
      <div className="flex-1 flex items-center justify-center bg-neutral-900 px-2 py-4">
        {/* @ts-ignore - react-pageflip types are incomplete */}
        <HTMLFlipBook
          ref={flipBook}
          width={pageWidth}
          height={pageHeight}
          size="stretch"
          minWidth={280}
          maxWidth={600}
          minHeight={400}
          maxHeight={900}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={isMobile}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
        >
          {pages.map((src, i) => (
            <Page key={i} src={src} number={i + 1} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-3" style={{ backgroundColor: '#DA251D' }}>
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
          style={{ backgroundColor: '#FCD116', color: '#DA251D' }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">முந்தையது</span>
        </button>

        <span
          className="text-sm font-bold px-3 py-1 rounded-full min-w-[60px] text-center"
          style={{ backgroundColor: '#FCD116', color: '#DA251D' }}
        >
          {currentPage + 1} / {TOTAL_PAGES}
        </span>

        <button
          onClick={goNext}
          disabled={currentPage >= TOTAL_PAGES - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
          style={{ backgroundColor: '#FCD116', color: '#DA251D' }}
        >
          <span className="hidden sm:inline">அடுத்தது</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
