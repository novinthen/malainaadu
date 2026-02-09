import React, { useRef, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Home, Maximize, Minimize, X, ZoomIn } from 'lucide-react';
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
  const [zoomedPage, setZoomedPage] = useState<number | null>(null);
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
      <div className="flex-1 flex items-center justify-center bg-neutral-900 px-2 py-4 relative">
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

        {/* Zoom button */}
        <button
          onClick={() => setZoomedPage(currentPage)}
          className="absolute bottom-6 right-4 p-2 rounded-full shadow-lg transition-all active:scale-95"
          style={{ backgroundColor: '#FCD116', color: '#DA251D' }}
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom overlay */}
      {zoomedPage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setZoomedPage(null)}
        >
          <button
            onClick={() => setZoomedPage(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation in zoom mode */}
          {zoomedPage > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setZoomedPage(zoomedPage - 1); }}
              className="absolute left-2 z-50 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {zoomedPage < TOTAL_PAGES - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setZoomedPage(zoomedPage + 1); }}
              className="absolute right-2 z-50 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div
            className="w-full h-full overflow-auto touch-pinch-zoom"
            onClick={(e) => e.stopPropagation()}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <img
              src={pages[zoomedPage]}
              alt={`Page ${zoomedPage + 1} zoomed`}
              className="w-full max-w-none"
              style={{ minWidth: '100%', touchAction: 'pinch-zoom pan-x pan-y' }}
            />
          </div>
        </div>
      )}

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
