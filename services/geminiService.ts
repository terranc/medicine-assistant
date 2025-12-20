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

  // Preserve the original fetch function
  const originalFetch = window.fetch;

  // 1. Prepare the custom Base URL
  // Moved out of try block so it is accessible in finally block
  let customBaseUrl = baseUrl?.trim();
  if (customBaseUrl?.endsWith('/')) {
    customBaseUrl = customBaseUrl.slice(0, -1);
  }

  try {
    // 2. Global Fetch Hijack
    // Since the SDK might ignore clientOptions.fetch or clientOptions.baseUrl depending on the version/environment,
    // we temporarily override window.fetch to guarantee the request is intercepted.
    if (customBaseUrl && customBaseUrl.startsWith('http')) {
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        let urlStr: string;
        if (typeof input === 'string') {
            urlStr = input;
        } else if (input instanceof URL) {
            urlStr = input.toString();
        } else {
            urlStr = input.url;
        }

        // Target the official Google API domain
        const googleHostRegex = /https?:\/\/generativelanguage\.googleapis\.com/i;

        if (googleHostRegex.test(urlStr)) {
            const oldUrl = urlStr;
            // A. Replace Host
            urlStr = urlStr.replace(googleHostRegex, customBaseUrl!);

            // B. Ensure API Key is in Query Params
            // Many proxies (like Cloudflare workers) require the key in the URL query string '?key=...'
            // even if it's already in the headers.
            const urlObj = new URL(urlStr);
            if (!urlObj.searchParams.has('key') && apiKey) {
                urlObj.searchParams.set('key', apiKey);
                urlStr = urlObj.toString();
            }

            console.log(`[Gemini Proxy] Hijacked & Redirecting:\nFrom: ${oldUrl}\nTo:   ${urlStr}`);
        }

        // C. Call Original Fetch with modified URL
        if (input instanceof Request) {
            // Clone the request with the new URL
            // Passing 'input' (the old Request) copies method, headers, body, etc.
            const newReq = new Request(urlStr, input);
            return originalFetch(newReq);
        } else {
            return originalFetch(urlStr, init);
        }
      };
    }

    // 3. Initialize SDK (Standard init)
    // We don't pass baseUrl/fetch here anymore because we are handling it globally.
    const ai = new GoogleGenAI({ apiKey });
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

    // 4. Execute Request
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
    return [userQuery];
  } finally {
    // 5. CRITICAL: Restore original fetch
    // Must happen immediately after the request finishes or fails
    if (customBaseUrl) {
      window.fetch = originalFetch;
    }
  }
};