import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchMedicineData, extractCategories, extractTags } from './services/dataService';
import { expandSearchQuery } from './services/geminiService';
import { Medicine } from './types';
import { MedicineCard } from './components/MedicineCard';
import { HeroSearch } from './components/HeroSearch';
import { ApiKeyModal } from './components/ApiKeyModal';
import { OnboardingOverlay } from './components/OnboardingOverlay';

const App: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isAiSearchMode, setIsAiSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Settings & API Key State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Changed from activeCategory to activeTag
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Load API Key and Base URL from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const storedUrl = localStorage.getItem('gemini_base_url');
    if (storedKey) {
      setApiKey(storedKey);
    }
    if (storedUrl) {
      setBaseUrl(storedUrl);
    }
  }, []);

  const handleSaveSettings = (key: string, url: string) => {
    setApiKey(key);
    setBaseUrl(url);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_base_url', url);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMedicineData();
        setMedicines(data);
      } catch (err) {
        setError('加载药品数据失败，请检查网络或数据源。');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = useMemo(() => extractCategories(medicines), [medicines]);
  
  const handleShowOnboarding = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowOnboarding(true);
  }, []);

  const handleSearch = useCallback(async (query: string, useAi: boolean) => {
    setSearchQuery(query);
    setIsAiSearchMode(useAi);
    
    if (!query.trim()) {
      setAiKeywords([]);
      return;
    }

    if (useAi) {
      if (!apiKey) {
        // Double safety: If code reaches here (e.g. Enter pressed while AI somehow ON but no key),
        // show onboarding and fallback.
        handleShowOnboarding();
        
        // Fallback to normal search
        setAiKeywords([query]);
        return;
      }

      setIsSearching(true);
      // Clear previous keywords to avoid filtering with old keywords while new query is set
      setAiKeywords([]); 
      try {
        const keywords = await expandSearchQuery(query, categories, apiKey, baseUrl);
        setAiKeywords(keywords);
      } catch (e) {
        console.error("AI Search failed, falling back to basic");
        setAiKeywords([query]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setAiKeywords([]);
    }
  }, [categories, apiKey, baseUrl, handleShowOnboarding]);

  // 1. First, filter medicines based on the search query ONLY.
  // This intermediate state is used to calculate tags so that tags reflect the search results,
  // but selecting a tag doesn't cause the tag list (counts) to change or disappear.
  const medicinesFilteredByQuery = useMemo(() => {
    if (!searchQuery.trim()) {
      return medicines;
    }

    let result = medicines;
    const lowerQuery = searchQuery.toLowerCase();
    
    if (isAiSearchMode && aiKeywords.length > 0) {
      // AI Mode: Any of the AI keywords match any relevant field
      result = result.filter(m => {
        const tagsStr = m.tags.join(' ');
        const text = `${m.genericName} ${m.brandName} ${m.category} ${m.company} ${m.specification} ${tagsStr}`.toLowerCase();
        // Match if the medicine text contains ANY of the AI-generated keywords
        return aiKeywords.some(keyword => text.includes(keyword.toLowerCase()));
      });
    } else {
      // Strict Mode: Exact substring match
      result = result.filter(m => 
        m.genericName.toLowerCase().includes(lowerQuery) ||
        m.brandName.toLowerCase().includes(lowerQuery) ||
        m.company.toLowerCase().includes(lowerQuery) ||
        m.category.toLowerCase().includes(lowerQuery) ||
        m.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }
    return result;
  }, [medicines, searchQuery, isAiSearchMode, aiKeywords]);

  // 2. Generate Tags based on the query results. 
  // This ensures tags are relevant to the search, but independent of the active tag selection.
  const tags = useMemo(() => extractTags(medicinesFilteredByQuery), [medicinesFilteredByQuery]);

  // 3. Final Filter: Apply the active tag to the query results.
  const filteredMedicines = useMemo(() => {
    if (!activeTag) return medicinesFilteredByQuery;
    return medicinesFilteredByQuery.filter(m => m.tags.includes(activeTag));
  }, [medicinesFilteredByQuery, activeTag]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <HeroSearch 
        onSearch={handleSearch}
        isSearching={isSearching}
        tags={tags}
        activeTag={activeTag}
        onTagSelect={setActiveTag}
        currentQuery={searchQuery}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
        onShowOnboarding={handleShowOnboarding}
      />

      {showOnboarding && (
        <OnboardingOverlay onClose={() => setShowOnboarding(false)} />
      )}

      <ApiKeyModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentKey={apiKey}
        currentBaseUrl={baseUrl}
      />

      <main className="flex-1 container py-8">
        {/* Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 text-sm text-muted-foreground">
          <div>
            {isSearching ? (
              <span>正在进行 AI 分析与搜索...</span>
            ) : (
              <>
                显示 <span className="font-bold text-foreground">{filteredMedicines.length}</span> 条结果
                {medicines.length > 0 && <span> (共 {medicines.length} 条)</span>}
                {activeTag && (
                  <span className="ml-2">
                    · 已筛选标签: <span className="font-medium text-primary">{activeTag}</span>
                    <button 
                      onClick={() => setActiveTag(null)} 
                      className="ml-1 text-xs underline underline-offset-2 hover:text-primary"
                    >
                      (清除)
                    </button>
                  </span>
                )}
              </>
            )}
          </div>
          {!isSearching && isAiSearchMode && aiKeywords.length > 0 && (
            <div className="mt-2 md:mt-0 flex gap-2 flex-wrap items-center justify-center md:justify-end">
              <span className="text-xs font-medium">AI 联想关键词:</span>
              {aiKeywords.map((k, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(k, true)}
                  className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-foreground bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
                  title={`搜索 "${k}"`}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading / Error / Grid */}
        {(loading || isSearching) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl border bg-card"></div>
              ))}
            </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive text-center font-medium">
            {error}
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-xl shadow-sm border-dashed">
              <div className="text-muted-foreground mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground">未找到相关药品</h3>
              <p className="text-muted-foreground mt-2">请尝试调整搜索关键词或分类筛选。</p>
              {isAiSearchMode && <p className="text-primary/80 mt-2 text-sm">AI 语义搜索已开启。尝试使用更简单的描述？</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((med) => (
              <MedicineCard key={med.id} medicine={med} onTagClick={setActiveTag} />
            ))}
          </div>
        )}
      </main>
      
      <footer className="border-t py-8 mt-8 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 原研药查询助手 (Original Medicine Explorer)</p>
          <p className="mt-1">
            数据来源: <a href="https://github.com/terranc/medicine-assistant" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline underline-offset-4">GitHub (terranc/medicine-assistant)</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;