export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Define your mapping of short paths to full UTM-tagged URLs
    const redirects = {
      "/qr": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=general_promo",
      "/postcard": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=postcard_mailing",
      "/flyer": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=event_flyer",
    };

    const path = url.pathname;

    if (redirects[path]) {
      // 302 redirect is "Found" (Temporary) - tells browsers not to cache the destination
      // so you can change the target URL later (e.g., from Preorder to Buy Now).
      return Response.redirect(redirects[path], 302);
    }

    // If the path doesn't match, let the request pass through to your main site
    return fetch(request);
  },
};