"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseAction";
import { checkImportDuplicate } from "@/lib/items";
import { saveImportItem } from "@/lib/itemActions";
import { IMPORT_PARSE_TIMEOUT_MS, IMPORT_MAX_RESPONSE_SIZE, MAX_IMPORT_IMAGES } from "@/data/items";

// ====== SSRF 防护：拒绝私有/内网地址 ======
const BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
];

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(lower)) return true;
  // 拒绝私有 IP 段
  if (/^10\./.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(lower)) return true;
  if (/^192\.168\./.test(lower)) return true;
  if (/^127\./.test(lower)) return true;
  if (/^169\.254\./.test(lower)) return true;
  return false;
}

// ====== 平台识别 ======
function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("bilibili.com") || lower.includes("b23.tv")) return "B站";
  if (lower.includes("xiaohongshu.com") || lower.includes("xhslink.com")) return "小红书";
  if (lower.includes("weibo.com") || lower.includes("weibo.cn")) return "微博";
  if (lower.includes("tieba.baidu.com")) return "贴吧";
  if (lower.includes("zhihu.com")) return "知乎";
  if (lower.includes("douyin.com")) return "抖音";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "Twitter";
  return "网页";
}

// ====== 解析导入链接 ======
export async function parseImportUrl(sourceUrl: string) {
  // 1. 校验 URL 格式
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return { error: "链接格式不正确，请输入完整链接（含 https://）" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { error: "仅支持 http / https 链接" };
  }

  // 2. SSRF 防护
  if (isBlockedHost(parsed.hostname)) {
    return { error: "不支持解析该地址" };
  }

  // 3. 请求页面（8 秒超时，限制响应大小）
  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMPORT_PARSE_TIMEOUT_MS);

    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ZhaoyingBot/1.0; +https://zyhy1000.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { error: "该平台暂不支持自动解析，请上传截图或手动填写" };
    }

    // 限制响应大小
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { error: "该链接不是网页，请上传截图或手动填写" };
    }

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > IMPORT_MAX_RESPONSE_SIZE) {
      // 只读前 1MB
      const reader = res.body?.getReader();
      if (!reader) return { error: "无法读取页面内容" };
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        chunks.push(value);
        if (total >= IMPORT_MAX_RESPONSE_SIZE) break;
      }
      html = new TextDecoder().decode(
        new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
      );
      // reconstruct from chunks
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      html = new TextDecoder().decode(merged);
    } else {
      html = await res.text();
      if (html.length > IMPORT_MAX_RESPONSE_SIZE) {
        html = html.slice(0, IMPORT_MAX_RESPONSE_SIZE);
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { error: "请求超时，该平台暂不支持自动解析，请上传截图或手动填写" };
    }
    return { error: "该平台暂不支持自动解析，请上传截图或手动填写" };
  }

  // 4. 解析 HTML metadata
  const title = extractMeta(html, "og:title")
    || extractMeta(html, "twitter:title")
    || extractTitle(html)
    || "";

  const description = extractMeta(html, "og:description")
    || extractMeta(html, "description")
    || extractMeta(html, "twitter:description")
    || "";

  const ogImage = extractMeta(html, "og:image")
    || extractMeta(html, "twitter:image")
    || "";

  const imageUrls: string[] = ogImage ? [ogImage] : [];

  // 尝试提取更多图片
  const extraImages = extractImages(html).filter(
    (url) => !imageUrls.includes(url)
  );
  imageUrls.push(...extraImages.slice(0, MAX_IMPORT_IMAGES - 1));

  if (!title && imageUrls.length === 0) {
    return { error: "未能解析到标题或图片，该平台暂不支持自动解析，请上传截图或手动填写" };
  }

  const platform = detectPlatform(sourceUrl);

  return {
    success: true,
    data: {
      title: title.slice(0, 200),
      description: description.slice(0, 500),
      imageUrls,
      sourceUrl,
      sourcePlatform: platform,
      confidence: title ? 0.8 : 0.3,
    },
  };
}

// ====== HTML 解析工具 ======

function extractMeta(html: string, property: string): string | null {
  // 匹配 <meta property="xxx" content="yyy">
  const propRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(propRegex);
  if (match) return match[1];

  // 属性顺序反过来
  const revRegex = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escapeRegex(property)}["']`,
    "i"
  );
  const revMatch = html.match(revRegex);
  return revMatch ? revMatch[1] : null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractImages(html: string): string[] {
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    // 过滤太小的图标、SVG、base64
    if (
      url.startsWith("data:") ||
      url.includes("favicon") ||
      url.includes("icon") ||
      url.endsWith(".svg")
    ) {
      continue;
    }
    urls.push(url);
  }
  return urls.slice(0, 10);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ====== 提交导入图鉴 ======

export async function submitImportItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录" };

  const title = (formData.get("title") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const work = (formData.get("work") as string) ?? "";
  const character = (formData.get("character") as string) ?? "";
  const category = (formData.get("category") as string) ?? "";
  const priceStr = (formData.get("price") as string) ?? "0";
  const price = parseFloat(priceStr) || 0;
  const imageType = (formData.get("imageType") as "official" | "real" | "unknown") ?? "unknown";
  const sourceUrl = (formData.get("sourceUrl") as string) ?? "";
  const sourcePlatform = (formData.get("sourcePlatform") as string) ?? "";

  // 解析图片 URL 列表
  const imageUrlsRaw = (formData.get("imageUrls") as string) ?? "";
  let imageUrls: string[] = [];
  if (imageUrlsRaw) {
    try {
      imageUrls = JSON.parse(imageUrlsRaw);
      if (!Array.isArray(imageUrls)) imageUrls = [];
    } catch {
      imageUrls = imageUrlsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // 最低校验
  if (!title.trim()) return { error: "请填写图鉴名称" };
  if (imageUrls.length === 0) return { error: "请至少上传一张图片" };

  // 重复检测
  const dupResult = await checkImportDuplicate({ sourceUrl: sourceUrl || undefined, title: title.trim() });
  if (dupResult.isDuplicate) {
    const matchTitles = dupResult.matches.map((m) => `"${m.title}"`).join("、");
    return {
      error: `可能已有相似图鉴（${matchTitles}），是否改为补充图片？`,
      duplicate: true,
      matches: dupResult.matches,
    };
  }

  const result = await saveImportItem({
    userId: user.id,
    title,
    description: description || undefined,
    work: work || undefined,
    character: character || undefined,
    category: category || undefined,
    price: price > 0 ? price : undefined,
    imageUrls,
    imageType,
    sourceUrl: sourceUrl || undefined,
    sourcePlatform: sourcePlatform || undefined,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/items");
  return { success: true, itemId: result.success };
}
