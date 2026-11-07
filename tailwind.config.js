/** @type {import('tailwindcss').Config} */
module.exports = {
  // 扫描根目录 HTML、assets/js 下所有业务脚本、以及各大子模块（projects / games / models）的 HTML
  content: [
    "./index.html",
    "./daily.html",
    "./assets/js/**/*.js",
    "./{projects,games,models}/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Silkscreen"', '"ChinesePixel"', 'cursive']
      }
    }
  },
  plugins: [],
};
