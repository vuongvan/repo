// ==MiruExtension==
// @name         Tranh18
// @version      v0.1.0
// @author       VuPhi
// @lang         vi
// @license      MIT
// @type         manga
// @icon         https://tranh18.com/favicon.ico
// @package      tranh18.manga
// @webSite      https://tranh18.com
// @nsfw         true
// @tags         manga, manhwa, 18+
// ==/MiruExtension==

export default class extends Extension {
  baseUrl = "https://tranh18.com";

  async requestHtml(url) {
    const res = await this.request(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": this.baseUrl
      }
    });
    return this.parseHtml(res);
  }

  async latest(page) {
    const doc = await this.requestHtml(this.baseUrl + "/page/" + page);

    const list = [...doc.querySelectorAll(".bsx")];

    return list.map(el => ({
      title: el.querySelector(".tt")?.textContent.trim(),
      url: el.querySelector("a")?.href,
      cover: el.querySelector("img")?.src,
      update: ""
    }));
  }

  async search(keyword, page) {
    const url = this.baseUrl + "/?s=" + encodeURIComponent(keyword) + "&page=" + page;

    const doc = await this.requestHtml(url);

    const list = [...doc.querySelectorAll(".bsx")];

    return list.map(el => ({
      title: el.querySelector(".tt")?.textContent.trim(),
      url: el.querySelector("a")?.href,
      cover: el.querySelector("img")?.src,
      update: ""
    }));
  }

  async detail(url) {
    const doc = await this.requestHtml(url);

    const title = doc.querySelector(".entry-title")?.textContent.trim();
    const cover = doc.querySelector(".thumb img")?.src;
    const desc = doc.querySelector(".entry-content")?.textContent.trim() || "";

    const chapters = [...doc.querySelectorAll("#chapterlist li a")];

    const episodes = [{
      title: "Chapters",
      urls: chapters.map(ch => ({
        name: ch.textContent.trim(),
        url: ch.href
      })).reverse()
    }];

    return {
      title: title,
      cover: cover,
      desc: desc,
      episodes: episodes
    };
  }

  async watch(url) {
    const doc = await this.requestHtml(url);

    const imgs = [...doc.querySelectorAll(".reading-content img")];

    return {
      type: "images",
      urls: imgs.map(img => img.src)
    };
  }
  }
