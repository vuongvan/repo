// ==MiruExtension==
// @name         OPhim
// @version      v0.0.4
// @author       Gemini
// @lang         vi
// @license      MIT
// @type         bangumi
// @icon         https://ophim17.cc/logo-ophim.png
// @package      ophim.api
// @webSite      https://ophim17.cc
// @nsfw         false
// @tags         phim, vietsub, phimle, phimbo
// ==/MiruExtension==

export default class extends Extension {
  async load() {
    this.registerSetting({
      title: "OPhim API",
      key: "api_domain",
      type: "input",
      description: "API Domain của OPhim",
      defaultValue: "https://ophim1.com",
    });
  }

  async fetchJson(url) {
    const apiDomain = await this.getSetting("api_domain");
    const res = await this.request("", {
      headers: { "Miru-Url": apiDomain + url },
    });
    return typeof res === "object" ? res : JSON.parse(res);
  }

  async latest(page) {
    const data = await this.fetchJson("/danh-sach/phim-moi-cap-nhat?page=" + page);
    return data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      // Cập nhật domain ảnh chuẩn từ link bạn cung cấp
      cover: "https://img.ophim.live/uploads/movies/" + item.thumb_url,
      update: item.year ? "Năm " + item.year : "",
    }));
  }

  async search(kw, page) {
    const encodedKw = encodeURIComponent(kw);
    const data = await this.fetchJson("/v1/api/tim-kiem?keyword=" + encodedKw + "&limit=20&page=" + page);
    
    return data.data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      // Fix lỗi ảnh bìa mục tìm kiếm bằng domain img.ophim.live
      cover: "https://img.ophim.live/uploads/movies/" + item.thumb_url,
    }));
  }

  async detail(url) {
    const data = await this.fetchJson("/phim/" + url);
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
      // Ở trang chi tiết, nếu thumb_url đã có domain thì dùng luôn, không thì nối thêm
      cover: movie.thumb_url.startsWith("http") ? movie.thumb_url : "https://img.ophim.live/uploads/movies/" + movie.thumb_url,
      desc: movie.content ? movie.content.replace(/<[^>]*>?/gm, "") : "Không có mô tả.",
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
