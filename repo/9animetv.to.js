// ==MiruExtension==
// @name         Tranh18
// @version      v0.0.1
// @author       Gemini
// @lang         vi
// @license      MIT
// @type         manga
// @icon         https://m.tranh18.com/frontend/images/logo.png
// @package      tranh18.com
// @webSite      https://m.tranh18.com
// @nsfw         true
// @tags         truyen-tranh, 18+, manhua
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/danh-sach?page=${page}`);
    // Sử dụng querySelector để bóc tách dữ liệu từ HTML
    const bs = this.querySelectorAll(res, "div.list-stories > ul > li");
    const list = [];
    bs.forEach((element) => {
      const title = element.querySelector("h3 > a").text.trim();
      const url = element.querySelector("a").getAttribute("href");
      const cover = element.querySelector("img").getAttribute("data-src") || element.querySelector("img").getAttribute("src");
      list.push({
        title,
        url,
        cover,
      });
    });
    return list;
  }

  async search(kw, page) {
    const res = await this.request(`/tim-kiem?q=${encodeURIComponent(kw)}&page=${page}`);
    const bs = this.querySelectorAll(res, "div.list-stories > ul > li");
    const list = [];
    bs.forEach((element) => {
      const title = element.querySelector("h3 > a").text.trim();
      const url = element.querySelector("a").getAttribute("href");
      const cover = element.querySelector("img").getAttribute("data-src") || element.querySelector("img").getAttribute("src");
      list.push({
        title,
        url,
        cover,
      });
    });
    return list;
  }

  async detail(url) {
    const res = await this.request(url);
    const title = this.querySelector(res, "h1.title-story").text.trim();
    const cover = this.querySelector(res, "div.info-story img").getAttribute("src");
    const desc = this.querySelector(res, "div.summary-content").text.trim();
    
    // Lấy danh sách chương
    const chapters = [];
    const eps = this.querySelectorAll(res, "ul.list-chapters > li > a");
    eps.forEach((element) => {
      chapters.push({
        name: element.text.trim(),
        url: element.getAttribute("href"),
      });
    });

    return {
      title,
      cover,
      desc,
      episodes: [{
        title: "Danh sách chương",
        urls: chapters.reverse(), // Đảo ngược để chương mới nhất lên đầu hoặc tùy chọn
      }],
    };
  }

  async watch(url) {
    const res = await this.request(url);
    const images = [];
    // Bóc tách tất cả link ảnh trong chương truyện
    const imgs = this.querySelectorAll(res, "div.reading-content img");
    imgs.forEach((element) => {
      const src = element.getAttribute("data-src") || element.getAttribute("src");
      if (src) images.push(src);
    });
    
    return {
      urls: images,
    };
  }
}
