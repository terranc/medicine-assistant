import React, { useState, useEffect, useRef } from 'react';
import { TagStats } from '../types';

interface HeroSearchProps {
  onSearch: (query: string, useAi: boolean) => void;
  isSearching: boolean;
  tags: TagStats[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  currentQuery?: string;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  onShowOnboarding: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ 
  onSearch, 
  isSearching, 
  tags, 
  activeTag,
  onTagSelect,
  currentQuery = '',
  onOpenSettings,
  hasApiKey,
  onShowOnboarding
}) => {
  const [query, setQuery] = useState(currentQuery);
  // Initialize from localStorage, default to false if not set
  const [useAi, setUseAi] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medicine_app_use_ai') === 'true';
    }
    return false;
  });
  const [isStuck, setIsStuck] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Sync local state when parent state changes
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        // Get the position relative to the viewport
        const rect = stickyRef.current.getBoundingClientRect();
        // Check if the element is sticking to the top (allowing small buffer for sub-pixel rendering)
        // standard sticky top is 0. If rect.top is <= 0, it's stuck.
        setIsStuck(rect.top <= 1); 
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount to check initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, useAi);
  };

  const handleAiToggle = () => {
    // If trying to turn ON, but no API Key is set
    if (!useAi && !hasApiKey) {
      onShowOnboarding();
      return; // Keep state as OFF
    }
    
    const newState = !useAi;
    setUseAi(newState);
    localStorage.setItem('medicine_app_use_ai', String(newState));
  };

  // New handler for clearing search
  const handleClear = () => {
    setQuery('');
    onSearch('', useAi);
  };

  return (
    <>
      {/* Top Hero Content: Title, Desc, Tags */}
      <div className="bg-slate-50/50 relative">
        {/* GitHub Corner - Top Left */}
        <a 
          href="https://github.com/terranc/medicine-assistant" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-0 left-0 z-20 group"
          aria-label="View source on GitHub"
        >
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 250 250" 
            className="fill-primary text-slate-50"
            style={{ transform: 'scale(-1, 1)' }}
            aria-hidden="true"
          >
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
            <path 
              d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" 
              fill="currentColor" 
              style={{ transformOrigin: '130px 106px' }} 
              className="octo-arm origin-[130px_106px]"
            ></path>
            <path 
              d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" 
              fill="currentColor" 
              className="octo-body"
            ></path>
          </svg>
        </a>

        {/* Settings Button - Top Right */}
        <button
          onClick={onOpenSettings}
          className="absolute top-4 right-4 md:right-8 p-2 rounded-full text-muted-foreground hover:bg-slate-200/50 hover:text-primary transition-colors cursor-pointer z-10"
          title="设置 API Key"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <div className="container px-4 md:px-6 pt-10 md:pt-16 pb-2 flex flex-col items-center">
          <div className="text-center mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter sm:text-5xl text-primary mb-4">
              原研药查询助手
            </h1>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto mb-6">
              收录全面的参比制剂（RLD）信息，帮助您快速找到目标药品。
            </p>

            {/* Tags Area - Collapsible */}
            <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
              {/* 
                  Max-height logic: 
                  Approx height of one tag row (22px tag + 8px gap) = 30px.
                  3 lines = ~90px. 
                  Setting max-h-[86px] to constrain to 3 lines comfortably.
              */}
              <div 
                className={`flex flex-wrap justify-center gap-2 overflow-hidden transition-all duration-500 ease-in-out ${
                  isExpanded ? 'max-h-[1000px]' : 'max-h-[86px]'
                }`}
              >
                <button
                  onClick={() => onTagSelect(null)}
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none cursor-pointer h-[22px] ${
                    activeTag === null
                      ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
                      : 'border-transparent bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  全部
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => onTagSelect(tag.name)}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none cursor-pointer h-[22px] ${
                      activeTag === tag.name
                        ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
                        : 'border-transparent bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {tag.name} <span className="ml-1 opacity-60 text-[10px]">({tag.count})</span>
                  </button>
                ))}
              </div>

              {/* Toggle Button - Only show if there are enough tags to likely warrant collapsing */}
              {tags.length > 12 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1"
                >
                  {isExpanded ? (
                    <>
                      收起
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </>
                  ) : (
                    <>
                      展开更多标签 ({tags.length})
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search Container */}
      <div 
        ref={stickyRef}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
          isStuck 
            ? 'bg-white/80 backdrop-blur-md border-b shadow-sm py-2' 
            : 'bg-transparent pt-4 pb-2'
        }`}
      >
        <div className="container px-4 md:px-6">
          <div className={`mx-auto flex items-center transition-all duration-300 ${
            isStuck ? 'max-w-full' : 'max-w-2xl'
          }`}>
            
            {/* Mini Title - Slides in when stuck */}
            <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] flex items-center h-10 ${
              isStuck ? 'w-auto opacity-100 mr-4 max-w-[200px]' : 'w-0 opacity-0 max-w-0'
            }`}>
              <h1 className="font-bold tracking-tighter text-primary text-lg whitespace-nowrap">
                原研药查询
              </h1>
            </div>

            {/* The Search Form */}
            <form onSubmit={handleSubmit} className="flex-1 w-full mb-0">
               <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={useAi ? "描述症状或用途 (例如: '胃痛', '高血压')..." : "输入药品名称、通用名或厂家..."}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 pr-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground p-0.5 transition-colors cursor-pointer"
                      title="清空输入"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* AI Button Restored */}
                <button
                  type="button"
                  onClick={handleAiToggle}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2 whitespace-nowrap ${
                    useAi 
                      ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' 
                      : 'bg-transparent border-input bg-background/50 hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="hidden sm:inline">AI 搜索</span>
                  <span className="sm:hidden">AI</span>
                  <span className="ml-1.5 text-xs opacity-70">{useAi ? 'ON' : 'OFF'}</span>
                </button>
                
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 whitespace-nowrap"
                >
                  {isSearching ? '...' : '搜索'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};