import { GoogleGenAI, Type } from "@google/genai";

/**
 * Uses Gemini to understand the user's medical intent and returns a list of keywords
 * and categories to filter the local database.
 */
export const expandSearchQuery = async (
  userQuery: string, 
  availableCategories: string[],
  apiKey?: string,
  baseUrl?: string
): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No Gemini API Key provided. Skipping AI search.");
    return [userQuery];
  }

  try {
    const clientOptions: any = { apiKey };
    
    // Normalize Base URL: remove trailing slash
    let customBaseUrl = baseUrl?.trim();
    if (customBaseUrl?.endsWith('/')) {
      customBaseUrl = customBaseUrl.slice(0, -1);
    }

    // Configure client with custom baseUrl and fetch interceptor
    if (customBaseUrl && customBaseUrl.startsWith('http')) {
        // 1. Set the baseUrl property (Standard SDK support)
        clientOptions.baseUrl = customBaseUrl;

        // 2. Add a robust fetch interceptor (Fallback/Enforcement)
        // This ensures that even if the SDK ignores 'baseUrl' or constructs absolute URLs internally,
        // we intercept the network call and rewrite the host.
        clientOptions.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            // Determine the current URL string
            let urlStr: string;
            if (typeof input === 'string') {
                urlStr = input;
            } else if (input instanceof URL) {
                urlStr = input.toString();
            } else {
                urlStr = input.url;
            }

            // Check if the request is targeting the official Google API
            const defaultHost = 'https://generativelanguage.googleapis.com';
            if (urlStr.startsWith(defaultHost) && customBaseUrl) {
                // Replace the official host with the custom proxy host
                urlStr = urlStr.replace(defaultHost, customBaseUrl);
            }

            // Perform the fetch with the new URL
            if (input instanceof Request) {
                // Critical: If input is a Request object, we must clone it to preserve
                // method (POST), headers (Auth), and body (JSON payload).
                // Passing 'input' as the second argument to Request constructor copies these properties.
                const newReq = new Request(urlStr, input);
                return fetch(newReq);
            } else {
                // If input was a string/URL, pass the 'init' options (headers/body) directly.
                return fetch(urlStr, init);
            }
        };
    }

    const ai = new GoogleGenAI(clientOptions);
    const model = 'gemini-2.5-flash';
    const categoriesString = availableCategories.slice(0, 50).join(', '); 

    const prompt = `
      你是一个专业的医药搜索助手。用户正在查询“原研药（参比制剂）”数据库。
      
      用户输入: "${userQuery}"
      
      数据库包含的分类示例: ${categoriesString}...
      
      任务:
      1. 分析用户查询的医疗意图（例如：如果用户输入“胃痛”，意图可能是“胃炎”、“溃疡”、“抑酸药”、“质子泵抑制剂”）。
      2. 返回 5-10 个关键词，这些关键词可能出现在药品的“通用名”、“商品名”、“适应症”或“分类”字段中。
      3. **必须包含中文关键词**，如果适用也可以包含英文通用名。
      4. 如果查询暗示了特定的分类，请包含该分类名称。
      
      输出 JSON 格式:
      {
        "keywords": ["关键词1", "关键词2", ...]
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const keywords = result.keywords || [];
    
    // Always include the original query as a keyword
    if (!keywords.includes(userQuery)) {
      keywords.unshift(userQuery);
    }

    return keywords;

  } catch (error) {
    console.error("Gemini Semantic Search Error:", error);
    // If AI fails, still return the original query so the user sees results
    return [userQuery];
  }
};