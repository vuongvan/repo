// ==MiruExtension==
// @name         KKPhim
// @version      v0.0.7
// @author       Gemini
// @lang         vi
// @license      MIT
// @type         bangumi
// @icon         https://phimimg.com/upload/giang-vien/logo-kkphim.png
// @package      kkphim.api
// @webSite      https://phimapi.com
// @nsfw         false
// @tags         anime, phim, vietsub
// ==/MiruExtension==

export default class extends Extension {
  async load() {
    this.registerSetting({
      title: "KKPhim API",
      key: "api_domain",
      type: "input",
      description: "API Domain của KKPhim",
      defaultValue: "https://phimapi.com",
    });
  }

  async latest(page) {
    const apiDomain = await this.getSetting("api_domain");
    const res = await this.request("", {
      headers: { "Miru-Url": apiDomain + "/danh-sach/phim-moi-cap-nhat?page=" + page },
    });
    // Nếu res là chuỗi thì parse, nếu là object thì dùng luôn
    const data = typeof res === "string" ? JSON.parse(res) : res;
    return data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: item.poster_url,
      update: item.year ? "Năm " + item.year : "",
    }));
  }

  async search(kw, page) {
    const apiDomain = await this.getSetting("api_domain");
    const encodedKw = encodeURIComponent(kw);
    const res = await this.request("", {
      headers: { "Miru-Url": apiDomain + "/v1/api/tim-kiem?keyword=" + encodedKw + "&limit=20&page=" + page },
    });
    const data = typeof res === "string" ? JSON.parse(res) : res;
    return data.data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: "https://phimimg.com/" + item.poster_url,
      update: item.year ? "Năm " + item.year : "",
    }));
  }

  async detail(url) {
    const apiDomain = await this.getSetting("api_domain");
    const res = await this.request("", {
      headers: { "Miru-Url": apiDomain + "/phim/" + url },
    });
    const data = typeof res === "string" ? JSON.parse(res) : res;
    const movie = data.movie;
    const episodes = data.episodes.map((server) => ({
      title: server.server_name,
      urls: server.server_data.map((item) => ({
        name: "Tập " + item.name,
        url: item.link_m3u8,
      })),
    }));
    return {
      title: movie.name,
      cover: movie.poster_url,
      desc: movie.content ? movie.content.replace(/<[^>]*>?/gm, "") : "",
      episodes: episodes,
    };
  }

  async watch(url) {
    return {
      type: "hls",
      url: url,
    };
  }
}
