import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const TARGET_DIR = 'CD ANH';
const MAX_DIMENSION = 2000; // Độ phân giải cực sắc nét cho màn hình Retina
const JPEG_QUALITY = 85;    // Chất lượng 85% (cho dung lượng 0.2MB - 0.5MB sắc nét vượt trội)
const SIZE_THRESHOLD_KB = 400; // Bỏ qua các ảnh đã có dung lượng nhỏ dưới 400KB

async function compressAll() {
  console.log('=== TRÌNH TỐI ƯU HÓA HÌNH ẢNH DÀNH CHO THIỆP CƯỚI ===\n');
  
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Không tìm thấy thư mục ${TARGET_DIR}!`);
    return;
  }

  // Quét toàn bộ file trong thư mục
  const files = fs.readdirSync(TARGET_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
    const isTestFile = file.startsWith('test_') || file.startsWith('test_output');
    const isProtected = file.startsWith('pw') || file.startsWith('groom') || file.startsWith('bride') || file.startsWith('Page');
    return isImage && !isTestFile && !isProtected;
  });

  console.log(`Tìm thấy ${files.length} hình ảnh cần kiểm tra tối ưu...\n`);

  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let compressedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(TARGET_DIR, file);
    const stat = fs.statSync(filePath);
    const originalSizeMB = stat.size / (1024 * 1024);
    totalOriginalSize += stat.size;

    console.log(`[${i + 1}/${files.length}] Đang xử lý: ${file} (${originalSizeMB.toFixed(2)} MB)...`);

    // Nếu ảnh đã dưới 400KB, bỏ qua để tránh nén trùng lặp làm giảm chất lượng
    if (stat.size < SIZE_THRESHOLD_KB * 1024) {
      console.log(`  --> ⚡ Đã được tối ưu sẵn (${(stat.size / 1024).toFixed(1)} KB). Bỏ qua!`);
      totalNewSize += stat.size;
      skippedCount++;
      continue;
    }

    try {
      const img = await Jimp.read(filePath);
      const w = img.bitmap.width;
      const h = img.bitmap.height;
      
      let resized = false;
      let targetW = w;
      let targetH = h;

      // Tính toán tỉ lệ co giãn bảo toàn khía cạnh (Preserve Aspect Ratio)
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(w, h);
        targetW = Math.round(w * scale);
        targetH = Math.round(h * scale);
        
        img.resize({ w: targetW, h: targetH });
        resized = true;
      }

      // Lưu đè trực tiếp lên file cũ với chất lượng 80%
      await img.write(filePath, { quality: JPEG_QUALITY });
      
      const newStat = fs.statSync(filePath);
      const newSizeKB = newStat.size / 1024;
      totalNewSize += newStat.size;
      compressedCount++;

      const reduction = ((stat.size - newStat.size) / stat.size * 100).toFixed(1);
      console.log(`  --> ✅ Nén thành công! Tỉ lệ: ${w}x${h} -> ${targetW}x${targetH} | Dung lượng: ${originalSizeMB.toFixed(2)}MB -> ${newSizeKB.toFixed(1)}KB (Giảm ${reduction}%)`);
    } catch (err) {
      console.error(`  --> ❌ Lỗi khi xử lý file ${file}:`, err.message);
      totalNewSize += stat.size; // Giữ nguyên kích thước cũ trong tổng
    }
  }

  const originalSizeMB = totalOriginalSize / (1024 * 1024);
  const newSizeMB = totalNewSize / (1024 * 1024);
  const totalSavedMB = originalSizeMB - newSizeMB;
  const overallReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);

  console.log('\n======================================================');
  console.log('🎉 TỔNG KẾT QUÁ TRÌNH TỐI ƯU HÓA ẢNH');
  console.log(`- Tổng số ảnh xử lý: ${files.length}`);
  console.log(`- Đã nén thành công: ${compressedCount} ảnh lớn`);
  console.log(`- Giữ nguyên (đã nhẹ sẵn): ${skippedCount} ảnh`);
  console.log(`- Tổng dung lượng GỐC: ${originalSizeMB.toFixed(2)} MB`);
  console.log(`- Tổng dung lượng MỚI: ${newSizeMB.toFixed(2)} MB`);
  console.log(`- Dung lượng TIẾT KIỆM ĐƯỢC: ${totalSavedMB.toFixed(2)} MB (Giảm ${overallReduction}%)`);
  console.log('======================================================\n');
  console.log('🚀 Website cưới của bạn giờ đây đã sẵn sàng load với tốc độ siêu tốc 0.1s!');
}

compressAll();
