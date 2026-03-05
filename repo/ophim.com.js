// ==MiruExtension==
// @name         Ổ Phim
// @version      v0.3.0
// @author       VM
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

  baseUrl = "https://ophim1.com";
  imgCdn = "https://img.ophim.live/uploads/movies/";

  async fetchJson(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": this.baseUrl + url
      }
    });

    return typeof res === "object" ? res : JSON.parse(res);
  }

  poster(path){
    if(!path) return "";
    if(path.startsWith("http")) return path;
    return this.imgCdn + path;
  }

  formatUpdate(item){
    const ep = item.episode_current || item.last_episode || "";
    const year = item.year || "";
    return (ep ? ep : "Đang cập nhật") + (year ? " • " + year : "");
  }

  async latest(page){

    const data = await this.fetchJson(
      "/v1/api/danh-sach/phim-moi-cap-nhat?page=" + page
    );

    const items = data.data?.items || data.items || [];

    return items.map(item => ({
      title: item.name,
      url: item.slug,
      cover: this.poster(item.thumb_url),
      update: this.formatUpdate(item)
    }));
  }

  async search(keyword,page){

    const data = await this.fetchJson(
      "/v1/api/tim-kiem?keyword=" +
      encodeURIComponent(keyword) +
      "&limit=20&page=" + page
    );

    const items = data.data?.items || [];

    return items.map(item => ({
      title: item.name,
      url: item.slug,
      cover: this.poster(item.thumb_url),
      update: this.formatUpdate(item)
    }));
  }

  async detail(slug){

    const data = await this.fetchJson("/phim/" + slug);

    const movie = data.movie;

    const episodes = (data.episodes || []).map(server => ({
      title: server.server_name,
      urls: server.server_data.map(ep => ({
        name: "Tập " + ep.name,
        url: ep.link_m3u8
      }))
    }));

    return {
      title: movie.name,
      cover: this.poster(movie.thumb_url),
      desc: movie.content
        ? movie.content.replace(/<[^>]*>?/gm,"")
        : "Không có mô tả",
      episodes
    };
  }

  async watch(url){
    return {
      type: "hls",
      url: url
    };
  }

}
