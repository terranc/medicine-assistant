export interface RawMedicineData {
  // Trying to accommodate potential variations in the source JSON
  [key: string]: any;
}

export interface Medicine {
  id: string;
  genericName: string; // 通用名
  brandName: string;   // 商品名
  company: string;     // 厂家
  specification: string; // 规格
  category: string;    // 治疗类别/分类
  tags: string[];      // 标签
  registrationNum?: string; // 注册证号
  sourceCountry?: string; // 产地/来源
  originalData: RawMedicineData; // Keep original just in case
}

export interface SearchState {
  query: string;
  isAiEnabled: boolean;
  isSearching: boolean;
  activeTag: string | null;
}

export interface TagStats {
  name: string;
  count: number;
}