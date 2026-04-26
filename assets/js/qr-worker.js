/**
 * Cloudflare Worker — QR / print campaign redirects
 *
 * Routes campaign-specific paths to their destinations with UTM tagging
 * for attribution in GA4.
 *
 * Status code: 302 (temporary). Campaign destinations may change, and we
 * want fresh edge cache resolution if we swap targets mid-campaign.
 *
 * UTM convention (current as of bookmark launch):
 *   utm_source   — the physical artifact (bookmark, tabletent, postcard, flyer)
 *   utm_medium   — how the user arrived (qr | print)
 *   utm_campaign — the marketing initiative
 *   utm_content  — optional drill-down within source (page section, batch)
 *
 * Legacy routes (/qr, /postcard, /flyer, /launch*) use the older convention
 * (utm_source=qr, utm_medium=print). Left intact intentionally — see decision
 * log. Migrate after current campaigns conclude.
 */

const ORIGIN = "https://justholdher.com";

// New-convention routes (utm_source = surface, utm_medium = qr|print)
const ROUTES_NEW = {
  "/hold": `${ORIGIN}/hold.html?utm_source=bookmark&utm_medium=qr&utm_campaign=book_launch`,
};

// Legacy routes — original convention preserved for reporting continuity.
// Do not modify without a migration plan.
const ROUTES_LEGACY = {
  "/qr":               `${ORIGIN}/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=general_promo`,
  "/postcard":         `${ORIGIN}/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=postcard_mailing`,
  "/flyer":            `${ORIGIN}/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=event_flyer`,
  "/launch":           `${ORIGIN}/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_landing`,
  "/launch-buy":       `${ORIGIN}/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_buy#buy`,
  "/launch-notebook":  `${ORIGIN}/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_notebook#notebook`,
};

const REDIRECTS = { ...ROUTES_NEW, ...ROUTES_LEGACY };

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Normalize path: lowercase, strip trailing slashes, collapse to "/" if empty
    const path = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";

    const target = REDIRECTS[path];
    if (!target) {
      // Not a campaign route — fall through to origin.
      return fetch(request);
    }

    // Forward whitelisted query params from the incoming request to the destination.
    // This lets us encode batch-level attribution on the QR itself
    // (e.g. /hold?src=portland → ?src=portland passthrough for the page's own
    // event tracking, without polluting the worker's UTM scheme).
    const FORWARD_PARAMS = new Set(["src"]);

    const dest = new URL(target);
    for (const [key, value] of url.searchParams.entries()) {
      if (FORWARD_PARAMS.has(key.toLowerCase())) {
        // Don't overwrite UTMs the worker has set; only add fields not already present
        if (!dest.searchParams.has(key)) {
          dest.searchParams.set(key, value);
        }
      }
    }

    return new Response(null, {
      status: 302,
      headers: {
        "Location": dest.toString(),
        // Short cache so a destination swap mid-campaign propagates within minutes
        "Cache-Control": "public, max-age=300",
        // Don't let intermediate proxies hold this longer than we do
        "X-Robots-Tag": "noindex"
      }
    });
  }
};
