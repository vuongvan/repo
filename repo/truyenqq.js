// ==MiruExtension==
// @name         TruyenQQNO
// @version      v0.1.0
// @author       VuPhi
// @lang         vi
// @license      MIT
// @type         manga
// @icon         https://truyenqqno.com/favicon.ico
// @package      truyenqqno.manga
// @webSite      https://truyenqqno.com
// @nsfw         false
// @tags         manga, manhwa, manhua
// ==/MiruExtension==

export default class extends Extension {

  async requestHtml(url) {
    const res = await this.request(url)

    const parser = new DOMParser()

    return parser.parseFromString(res, "text/html")
  }

  async latest(page) {

    const path = page == 1
      ? "/truyen-moi-cap-nhat.html"
      : "/truyen-moi-cap-nhat/trang-" + page + ".html"

    const doc = await this.requestHtml(path)

    const list = [...doc.querySelectorAll(".item")]

    return list.map(el => ({
      title: el.querySelector(".title")?.textContent.trim(),
      url: el.querySelector("a")?.getAttribute("href"),
      cover: el.querySelector("img")?.getAttribute("src"),
      update: el.querySelector(".chapter")?.textContent.trim()
    }))
  }

  async search(keyword, page) {

    const path = "/tim-kiem/trang-" + page + ".html?q=" + encodeURIComponent(keyword)

    const doc = await this.requestHtml(path)

    const list = [...doc.querySelectorAll(".item")]

    return list.map(el => ({
      title: el.querySelector(".title")?.textContent.trim(),
      url: el.querySelector("a")?.getAttribute("href"),
      cover: el.querySelector("img")?.getAttribute("src"),
      update: el.querySelector(".chapter")?.textContent.trim()
    }))
  }

  async detail(url) {

    const doc = await this.requestHtml(url)

    const title = doc.querySelector(".title-detail")?.textContent.trim()

    const cover = doc.querySelector(".detail-info img")?.getAttribute("src")

    const desc = doc.querySelector(".detail-content p")?.textContent.trim() || ""

    const chapters = [...doc.querySelectorAll(".list-chapter a")]

    const episodes = [{
      title: "Chapters",
      urls: chapters.map(ch => ({
        name: ch.textContent.trim(),
        url: ch.getAttribute("href")
      })).reverse()
    }]

    return {
      title,
      cover,
      desc,
      episodes
    }
  }

  async watch(url) {

    const doc = await this.requestHtml(url)

    const imgs = [...doc.querySelectorAll(".page-chapter img")]

    return {
      type: "images",
      urls: imgs.map(img => img.getAttribute("src"))
    }
  }
}
