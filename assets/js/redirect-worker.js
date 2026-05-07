/**
 * Cloudflare Worker — Permanent vanity-URL aliases
 *
 * Routes canonical short paths to their permanent destinations.
 * Status code: 301 (permanent). These aliases are stable infrastructure;
 * search engines should consolidate ranking onto the canonical URLs.
 *
 * Distinct from qr-worker.js, which handles temporary campaign tracking.
 */

const ORIGIN = "https://justholdher.com";

const REDIRECTS = {
  // Media & Press → media.html
  "/pr":          `${ORIGIN}/media.html`,
  "/press":       `${ORIGIN}/media.html`,
  "/media":       `${ORIGIN}/media.html`,
  "/presskit":    `${ORIGIN}/media.html`,
  "/press-kit":   `${ORIGIN}/media.html`,
  "/mediakit":    `${ORIGIN}/media.html`,
  "/media-kit":   `${ORIGIN}/media.html`,
  "/agents":      `${ORIGIN}/media.html`,
  "/publishers":  `${ORIGIN}/media.html`,

  // Buy & Order → buy.html
  "/buy":           `${ORIGIN}/buy.html`,
  "/buynow":        `${ORIGIN}/buy.html`,
  "/order":         `${ORIGIN}/buy.html`,
  "/book":          `${ORIGIN}/buy.html`,
  "/purchase":      `${ORIGIN}/buy.html`,
  "/where-to-buy":  `${ORIGIN}/buy.html`,
  "/buyitnow":      `${ORIGIN}/buy.html`,
  "/buy-now":       `${ORIGIN}/buy.html`,
  "/buy-it-now":    `${ORIGIN}/buy.html`,

  // Notebook → notebook.html
  "/notebook":         `${ORIGIN}/notebook.html`,
  "/judysnotebook":    `${ORIGIN}/notebook.html`,
  "/judys-notebook":   `${ORIGIN}/notebook.html`,
  "/notes":            `${ORIGIN}/notebook.html`,
  "/spiralnotebook":   `${ORIGIN}/notebook.html`,
  "/spiral-notebook":  `${ORIGIN}/notebook.html`,

  // Speaking & Visits → speaking.html
  // /speaking is printed on outreach flyers and email signatures;
  // redirect to /speaking.html (the warmer, less transactional URL).
  "/visit":     `${ORIGIN}/speaking.html`,
  "/visits":     `${ORIGIN}/speaking.html`,
  "/speaking":  `${ORIGIN}/speaking.html`,
  "/speaker":  `${ORIGIN}/speaking.html`,
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Normalize path: lowercase, strip trailing slashes
    const path = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";

    const target = REDIRECTS[path];
    if (!target) {
      return fetch(request);
    }

    return new Response(null, {
      status: 301,
      headers: {
        "Location": target,
        // 301s are permanent — cache for a year on the edge and in browsers
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }
};
