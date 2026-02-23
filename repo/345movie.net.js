// ==MiruExtension==
// @name         KKPhim
// @version      v0.0.6
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
    // Sửa lỗi 'not a function' bằng cách đảm bảo gọi đúng tên hàm của Miru
    this.registerSetting({
      title: "KKPhim API",
      key: "api_domain",
      type: "input",
      description: "API Domain của KKPhim",
      defaultValue: "https://phimapi.com",
    });

    this.registerFilter({
      title: "Danh mục",
      key: "category",
      type: "radio",
      defaultValue: "danh-sach/phim-moi-cap-nhat",
      options: {
        "Mới cập nhật": "danh-sach/phim-moi-cap-nhat",
        "Phim Lẻ": "v1/api/danh-sach/phim-le",
        "Phim Bộ": "v1/api/danh-sach/phim-bo",
        "Hoạt Hình": "v1/api/danh-sach/hoat-hinh",
        "TV Shows": "v1/api/danh-sach/tv-shows",
      },
    });
  }

  async fetchJson(url) {
    const apiDomain = await this.getSetting("api_domain");
    const res = await this.request("", {
      headers: { "Miru-Url": apiDomain + "/" + url },
    });
    return typeof res === "object" ? res : JSON.parse(res);
  }

  async latest(page, filter) {
    // Kiểm tra filter để tránh lỗi null
    const category = (filter && filter.category) ? filter.category[0] : "danh-sach/phim-moi-cap-nhat";
    const res = await this.fetchJson(category + "?page=" + page);
    const items = res.items || (res.data ? res.data.items : []);
    
    return items.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: item.poster_url.startsWith("http") ? item.poster_url : "https://phimimg.com/" + item.poster_url,
      update: item.year ? "Năm " + item.year : "",
    }));
  }

  async search(kw, page) {
    // Sửa lỗi FormatException bằng cách encode từ khóa
    const encodedKw = encodeURIComponent(kw);
    const data = await this.fetchJson("v1/api/tim-kiem?keyword=" + encodedKw + "&limit=20&page=" + page);
    return data.data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: "https://phimimg.com/" + item.poster_url,
      update: item.year ? "Năm " + item.year : "",
    }));
  }

  async detail(url) {
    const data = await this.fetchJson("phim/" + url);
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
