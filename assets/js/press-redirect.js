export default {
  async fetch(request) {
    const url = new URL(request.url);
    // Standardize the path: lowercase and remove trailing slash
    const pathname = url.pathname.toLowerCase().replace(/\/$/, "");

    // 1. Media & Press Redirects -> media.html
    const mediaPaths = new Set([
      "/pr", "/press", "/media", "/presskit", "/press-kit", 
      "/mediakit", "/media-kit", "/agents", "/publishers"
    ]);

    if (mediaPaths.has(pathname)) {
      return Response.redirect("https://justholdher.com/media.html", 301);
    }

    // 2. Buy & Order Redirects -> buy.html
    const buyPaths = new Set([
      "/buy", "/buynow", "/order", "/book", "/purchase", 
      "/where-to-buy", "/buyitnow", "/buy-now", "/buy-it-now"
    ]);

    if (buyPaths.has(pathname)) {
      return Response.redirect("https://justholdher.com/buy.html", 301);
    }

    // 3. Notebook Redirects -> notebook.html
    const notebookPaths = new Set([
      "/notebook", 
      "/judysnotebook", 
      "/judys-notebook", 
      "/notes", 
      "/spiralnotebook", 
      "/spiral-notebook"
    ]);

    if (notebookPaths.has(pathname)) {
      return Response.redirect("https://justholdher.com/notebook.html", 301);
    }

    // 4. Fallback: If no match, continue to the site normally
    return fetch(request);
  }
};
