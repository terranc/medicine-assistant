import React from 'react';
import { Medicine } from '../types';

interface MedicineCardProps {
  medicine: Medicine;
  onTagClick: (tag: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onTagClick }) => {
  return (
    <div className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div className="p-6 flex flex-col flex-1">
        {/* Header - Only render if source country exists to avoid whitespace */}
        {medicine.sourceCountry && (
          <div className="flex justify-end items-start mb-4 gap-2">
             <span className="text-xs text-muted-foreground flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-100 whitespace-nowrap">
               {medicine.sourceCountry}
             </span>
          </div>
        )}

        {/* Title Area */}
        <div className="mb-4">
          <h3 className="font-semibold leading-snug tracking-tight text-lg mb-1.5 text-primary">
            <a 
              href={`https://zh.wikipedia.org/wiki/${encodeURIComponent(medicine.genericName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 hover:underline decoration-blue-600/30 underline-offset-4 transition-colors inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              title="查看维基百科"
            >
              {medicine.genericName}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-50 transition-opacity">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </h3>
          {medicine.brandName && (
            <p className="text-sm text-primary/80 font-medium">
              {medicine.brandName}
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid gap-2 text-sm mb-4">
          <div className="flex items-start gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-muted-foreground shrink-0">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            </svg>
            <span className="text-muted-foreground break-words">{medicine.company}</span>
          </div>
          
          {medicine.specification && (
            <div className="flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-muted-foreground shrink-0">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
              </svg>
              <span className="text-muted-foreground">{medicine.specification}</span>
            </div>
          )}
          
           {medicine.registrationNum && (
            <div className="flex items-start gap-2.5 pt-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-muted-foreground shrink-0">
                 <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
               </svg>
              <span className="text-xs font-mono text-muted-foreground/80 break-all">{medicine.registrationNum}</span>
            </div>
          )}
        </div>

        {/* Tags Section */}
        {medicine.tags && medicine.tags.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-1.5">
              {medicine.tags.map((tag, i) => (
                <button 
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                  className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};