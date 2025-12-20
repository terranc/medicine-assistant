import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, baseUrl: string) => void;
  currentKey: string;
  currentBaseUrl?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey, currentBaseUrl = '' }) => {
  const [key, setKey] = useState(currentKey);
  const [baseUrl, setBaseUrl] = useState(currentBaseUrl);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setKey(currentKey);
    setBaseUrl(currentBaseUrl);
  }, [currentKey, currentBaseUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary mb-2">设置 API Key</h2>
          <p className="text-sm text-muted-foreground mb-4">
            要启用 AI 语义搜索功能，请在下方输入您的 Google Gemini API Key。
            <br />
            您的 Key 仅存储在本地浏览器中，不会上传至任何中间服务器。
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-foreground mb-1">
                Gemini API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="baseUrl" className="block text-sm font-medium text-foreground mb-1">
                API Base URL (可选)
              </label>
              <input
                id="baseUrl"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://generativelanguage.googleapis.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div className="text-[10px] text-muted-foreground mt-1 space-y-1">
                <p>国内网络环境通常需要配置此项。</p>
                <p>格式示例: <code className="bg-slate-100 px-1 rounded">https://my-proxy.com</code> (末尾无需加 /v1beta 等)</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded border">
              没有 Key? <a href="https://privnode.com/ref/uZLF" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">点击这里免费获取</a>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            取消
          </button>
          <button
            onClick={() => {
              onSave(key, baseUrl);
              onClose();
            }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};