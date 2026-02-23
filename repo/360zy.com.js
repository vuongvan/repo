// ==MiruExtension==
// @name         OPhim
// @version      v0.0.1
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

  // Hàm helper gọi API và xử lý JSON
  async fetchJson(url) {
    const apiDomain = await this.getSetting("api_domain");
    const res = await this.request("", {
      headers: { "Miru-Url": apiDomain + url },
    });
    return typeof res === "object" ? res : JSON.parse(res);
  }

  // Trang chủ: Phim mới cập nhật
  async latest(page) {
    const data = await this.fetchJson("/danh-sach/phim-moi-cap-nhat?page=" + page);
    return data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: data.pathImage + item.thumb_url, // OPhim cần nối pathImage
      update: item.year ? "Năm " + item.year : "",
    }));
  }

  // Tìm kiếm phim (Đã fix lỗi dấu tiếng Việt)
  async search(kw, page) {
    const encodedKw = encodeURIComponent(kw);
    // Lưu ý: OPhim dùng v1/api/tim-kiem
    const data = await this.fetchJson("/v1/api/tim-kiem?keyword=" + encodedKw + "&limit=20&page=" + page);
    return data.data.items.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: data.data.APP_DOMAIN_FRONTEND + "/api/v1/movie/show/image/" + item.thumb_url,
    }));
  }

  // Chi tiết phim và danh sách tập
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
      cover: movie.thumb_url,
      desc: movie.content ? movie.content.replace(/<[^>]*>?/gm, "") : "Không có mô tả.",
      episodes: episodes,
    };
  }

  // Trình phát Video
  async watch(url) {
    return {
      type: "hls",
      url: url,
    };
  }
}
