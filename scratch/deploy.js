import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error(`Không tìm thấy file: ${htmlPath}`);
  process.exit(1);
}

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Tạo mã timestamp duy nhất
const newVersion = Date.now();
console.log(`Dang tao phien ban cache-busting moi: ${newVersion}`);

// Regex tim kiem cac duong dan CSS/JS co dang ?v=... de thay the
const updatedContent = htmlContent.replace(/(\.(css|js)\?v=)[^"\' >]+/g, `$1${newVersion}`);

fs.writeFileSync(htmlPath, updatedContent, 'utf8');
console.log('Da cap nhat thanh cong phien ban moi vao index.html!');
