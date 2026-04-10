export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Map short paths to full tracked URLs
    const redirects = {
      "/qr": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=general_promo",
      "/postcard": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=postcard_mailing",
      "/flyer": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=event_flyer",

      // Event landing page
      "/launch": "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_landing",

      // QR-specific entry points for tent signs
      "/launch-buy": "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_buy#buy",
      "/launch-notebook": "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_notebook#notebook",
    };

    const path = url.pathname;

    if (redirects[path]) {
      // Temporary redirect so destinations can be changed later without browser cache issues
      return Response.redirect(redirects[path], 302);
    }

    // Optional convenience handling:
    // If someone visits /launch with a hashless URL directly, send to launch.html.
    // Note: URL fragments like #buy and #notebook are never sent to the server,
    // so they cannot be read here from the incoming request.
    if (path === "/launch") {
      return Response.redirect(
        "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_landing",
        302
      );
    }

    // Otherwise pass through to origin
    return fetch(request);
  },
};
