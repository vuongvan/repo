// ==MiruExtension==
// @name         AnimeWeb
// @version      v0.0.1
// @author       Gemini
// @lang         vi
// @license      MIT
// @type         bangumi
// @icon         https://animeweb.vip/storage/images/logo.png
// @package      animeweb.vip
// @webSite      https://animeweb.vip
// @nsfw         false
// @tags         anime, vietsub, animeweb
// ==/MiruExtension==

export default class extends Extension {
  async load() {
    this.registerSetting({
      title: "AnimeWeb API",
      key: "api_domain",
      type: "input",
      description: "API Domain của AnimeWeb",
      defaultValue: "https://animeweb.vip/api/v2",
    });
  }

  async fetchJson(url) {
    const apiDomain = await this.getSetting("api_domain");
    const res = await this.request("", {
      headers: { 
        "Miru-Url": apiDomain + url,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Referer": "https://animeweb.vip/"
      },
    });
    return typeof res === "object" ? res : JSON.parse(res);
  }

  async latest(page) {
    // API lấy danh sách anime mới cập nhật
    const data = await this.fetchJson("/movie/filter?page=" + page + "&limit=20&sort=updated_at");
    return data.data.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: item.poster_url || item.thumb_url,
      update: item.current_episode ? "Tập " + item.current_episode : "Full",
    }));
  }

  async search(kw, page) {
    const encodedKw = encodeURIComponent(kw);
    const data = await this.fetchJson("/movie/filter?keyword=" + encodedKw + "&page=" + page + "&limit=20");
    return data.data.map((item) => ({
      title: item.name,
      url: item.slug,
      cover: item.poster_url || item.thumb_url,
      update: item.year ? item.year.toString() : "",
    }));
  }

  async detail(url) {
    const data = await this.fetchJson("/movie/info/" + url);
    const movie = data.data;
    
    // AnimeWeb chia tập theo từng server hoặc danh sách tập trực tiếp
    const episodes = [{
      title: "Danh sách tập",
      urls: movie.episodes.map((ep) => ({
        name: "Tập " + ep.name,
        url: ep.id.toString(), // Dùng ID tập để lấy link watch
      })),
    }];

    return {
      title: movie.name,
      cover: movie.poster_url,
      desc: movie.description ? movie.description.replace(/<[^>]*>?/gm, "") : "Không có mô tả.",
      episodes: episodes,
    };
  }

  async watch(url) {
    // Gọi API để lấy link m3u8 từ episode ID
    const data = await this.fetchJson("/episode/server/" + url);
    // Lấy server đầu tiên có link m3u8
    const playUrl = data.data[0].link_m3u8 || data.data[0].link_embed;

    return {
      type: "hls",
      url: playUrl,
    };
  }
}
