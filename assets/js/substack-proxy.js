/**
 * Cloudflare Worker — Substack RSS to JSON
 * Converts RSS XML to JSON safely (no DOMParser)
 */

addEventListener("fetch", event => {
  event.respondWith(handleRequest());
});

async function handleRequest() {
  const SUBSTACK_RSS_URL = "https://judysnotebook.substack.com/feed";
  const POST_LIMIT = 10;

  try {
    const response = await fetch(SUBSTACK_RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Cloudflare Worker)"
      }
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    // Extract items
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, POST_LIMIT);

    const items = itemMatches.map(match => {
      const item = match[1];

      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
        const result = item.match(regex);
        return result ? decode(result[1]) : "";
      };

      return {
        title: getTag("title"),
        link: getTag("link"),
        pubDate: getTag("pubDate"),
        description: getTag("description"),
        content: getTag("content:encoded")
      };
    });

    const feedTitle = xml.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/)?.[1] || "Substack Feed";
    const feedLink = xml.match(/<channel>[\s\S]*?<link>(.*?)<\/link>/)?.[1] || SUBSTACK_RSS_URL;

    return new Response(JSON.stringify({
      title: decode(feedTitle),
      link: decode(feedLink),
      items
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// Basic HTML entity decoder
function decode(str) {
  return str
    ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    ?.replace(/&amp;/g, "&")
    ?.replace(/&lt;/g, "<")
    ?.replace(/&gt;/g, ">")
    ?.replace(/&quot;/g, '"')
    ?.replace(/&#39;/g, "'");
}
