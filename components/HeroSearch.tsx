import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TagStats } from '../types';

interface HeroSearchProps {
  onSearch: (query: string, useAi: boolean) => void;
  isSearching: boolean;
  tags: TagStats[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  currentQuery?: string;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ 
  onSearch, 
  isSearching, 
  tags, 
  activeTag,
  onTagSelect,
  currentQuery = ''
}) => {
  const [query, setQuery] = useState(currentQuery);
  const [useAi, setUseAi] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
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

  const visibleTags = useMemo(() => {
    if (showAllTags) return tags;
    // Always show tags with >= 5 count OR the currently active tag (so it doesn't disappear)
    return tags.filter(tag => tag.count >= 5 || tag.name === activeTag);
  }, [tags, showAllTags, activeTag]);

  const hiddenCount = tags.length - visibleTags.length;

  return (
    <>
      {/* Top Hero Content: Title, Desc, Tags */}
      {/* 
         We removed the outer wrapper so the sticky element can use the main app container 
         as its scroll boundary. We keep the background class here for visual consistency.
      */}
      <div className="bg-slate-50/50">
        <div className="container px-4 md:px-6 pt-10 md:pt-16 pb-2 flex flex-col items-center">
          <div className="text-center mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter sm:text-5xl text-primary mb-4">
              原研药查询助手
            </h1>
            {/* 
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto mb-6">
              收录全面的参比制剂（RLD）信息。支持基于 AI 的语义模糊搜索，帮助您快速找到目标药品。
            </p> 
            */}
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto mb-6">
              收录全面的参比制剂（RLD）信息，帮助您快速找到目标药品。
            </p>

            {/* Tags Area - Now Above Search */}
            <div className="flex flex-col items-center gap-2 w-full max-w-7xl mx-auto">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => onTagSelect(null)}
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
                    activeTag === null
                      ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' 
                      : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  全部
                </button>
                {visibleTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => onTagSelect(tag.name)}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
                      activeTag === tag.name
                        ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' 
                        : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {tag.name} <span className="ml-1 opacity-60 text-[10px]">({tag.count})</span>
                  </button>
                ))}
                
                {!showAllTags && hiddenCount > 0 && (
                  <button
                    onClick={() => setShowAllTags(true)}
                    className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-slate-400 transition-colors cursor-pointer"
                  >
                    展开更多...
                  </button>
                )}
                
                {showAllTags && tags.length > visibleTags.length && (hiddenCount === 0) && (
                   <button
                    onClick={() => setShowAllTags(false)}
                    className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-slate-400 transition-colors cursor-pointer"
                  >
                    收起
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search Container */}
      {/* 
         - top-0: Stick to the top of the viewport.
         - z-50: Keeps it above content.
         - Uses 'sticky' positioning. Because it's now a direct child of the App container 
           (via Fragment), it will stick for the entire height of the App container.
      */}
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
            {/* Added h-10 to match input height for strict vertical alignment */}
            <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] flex items-center h-10 ${
              isStuck ? 'w-auto opacity-100 mr-4 max-w-[200px]' : 'w-0 opacity-0 max-w-0'
            }`}>
              <h1 className="font-bold tracking-tighter text-primary text-lg whitespace-nowrap">
                原研药查询
              </h1>
            </div>

            {/* The Search Form - Flex 1 to fill available space */}
            <form onSubmit={handleSubmit} className="flex-1 w-full mb-0">
               <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={useAi ? "描述症状或用途 (例如: '胃痛', '高血压')..." : "输入药品名称、通用名或厂家..."}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                {/* 
                <button
                  type="button"
                  onClick={() => setUseAi(!useAi)}
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
                */}
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