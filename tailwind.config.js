/** @type {import('tailwindcss').Config} */
module.exports = {
  // 扫描根目录 HTML、js 目录下所有脚本、以及子模块的 HTML
  content: [
    "./index.html",
    "./js/**/*.js",
    "./{projects,game,models}/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Silkscreen"', '"ChinesePixel"', 'cursive']
      }
    }
  },
  plugins: [],
}