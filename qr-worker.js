export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    const redirects = {
      "/qr": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=general_promo",
      "/postcard": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=postcard_mailing",
      "/flyer": "https://justholdher.com/?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=event_flyer",

      "/launch": "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_landing",
      "/launch-buy": "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_buy#buy",
      "/launch-notebook": "https://justholdher.com/launch.html?utm_source=qr&utm_medium=print&utm_campaign=book_launch&utm_content=launch_notebook#notebook",
    };

    if (redirects[path]) {
      return Response.redirect(redirects[path], 302);
    }

    return fetch(request);
  },
};
