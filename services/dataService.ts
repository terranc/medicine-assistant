import { Medicine, RawMedicineData, TagStats } from '../types';

const DATA_URL = 'https://cdn.jsdelivr.net/gh/lvwzhen/medicine@develop/data/tableData.json?referrer=grok.com';

// Helper to guess fields if the JSON keys are inconsistent or Chinese
const mapToMedicine = (item: RawMedicineData, index: number): Medicine => {
  // Heuristic mapping based on common fields in Chinese medicine datasets
  const genericName = item['通用名'] || item['commonName'] || item['name'] || item['名称'] || '未知名称';
  const brandName = item['商品名'] || item['brandName'] || item['tradeName'] || '';
  const company = item['生产厂家'] || item['company'] || item['manufacturer'] || item['厂家'] || '未知厂商';
  const specification = item['规格'] || item['specification'] || item['spec'] || '';
  const category = item['治疗类别'] || item['category'] || item['class'] || item['分类'] || '未分类';
  const registrationNum = item['注册证号'] || item['approvalNumber'] || item['licenseNumber'];
  const sourceCountry = item['产地'] || item['source'] || item['country'];

  // Handle tags which might be an array or a string (comma/space separated)
  let tags: string[] = [];
  const rawTags = item['tags'] || item['标签'] || item['tag'];
  if (Array.isArray(rawTags)) {
    tags = rawTags.map(String).map(t => t.trim()).filter(Boolean);
  } else if (typeof rawTags === 'string') {
    // Split by common separators: comma (English/Chinese) or spaces
    tags = rawTags.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean);
  }

  return {
    id: `med-${index}`,
    genericName: String(genericName).trim(),
    brandName: String(brandName).trim(),
    company: String(company).trim(),
    specification: String(specification).trim(),
    category: String(category).trim(),
    tags: tags,
    registrationNum: registrationNum ? String(registrationNum).trim() : undefined,
    sourceCountry: sourceCountry ? String(sourceCountry).trim() : undefined,
    originalData: item
  };
};

export const fetchMedicineData = async (): Promise<Medicine[]> => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`数据获取失败: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map((item, index) => mapToMedicine(item, index));
    } else if (data && typeof data === 'object') {
      // Handle case where data might be wrapped in a property like { data: [...] }
      const possibleArray = Object.values(data).find(val => Array.isArray(val));
      if (possibleArray && Array.isArray(possibleArray)) {
         return possibleArray.map((item, index) => mapToMedicine(item, index));
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching medicine data:", error);
    throw error;
  }
};

export const extractCategories = (medicines: Medicine[]): string[] => {
  const categories = new Set(medicines.map(m => m.category).filter(c => c && c !== '未分类'));
  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'zh-CN'));
};

export const extractTags = (medicines: Medicine[]): TagStats[] => {
  const counts: Record<string, number> = {};
  
  medicines.forEach(m => {
    m.tags.forEach(tag => {
      if (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
};