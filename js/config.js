/**
 * DEFAULT WEDDING CONFIGURATION
 * 
 * Đây là cấu trúc dữ liệu cấu hình mặc định của toàn bộ website thiệp cưới.
 * Tất cả nội dung văn bản, ngày giờ, địa điểm, nhạc nền và đường dẫn hình ảnh
 * trên trang web sẽ được tải động từ cấu hình này.
 */

const DEFAULT_WEDDING_CONFIG = {
  // 1. THÔNG TIN CHUNG (GENERAL INFO)
  wedding_date: "2026-02-08T10:00:00.000Z", // Ngày đếm ngược
  music_url: "https://files.catbox.moe/n121p0.mp3", // Nhạc nền mặc định
  
  // 2. CHÚ RỂ (GROOM)
  groom_name: "Đình Long",
  groom_fullname: "Lê Đình Long",
  groom_bio: "Một chàng trai thích trải nghiệm, kiên trì và luôn mang năng lượng ấm áp. Với anh, che chở và mang lại hạnh phúc trọn vẹn cho Lan Anh là sứ mệnh cả cuộc đời.",
  groom_photo: "CD ANH/DSC03817_1.JPG",
  groom_facebook: "#",
  groom_instagram: "#",
  
  // 3. CÔ DÂU (BRIDE)
  bride_name: "Trần Ánh",
  bride_fullname: "Trần Thị Ánh",
  bride_bio: "Cô gái nhạy cảm, thích cắm hoa và luôn tin vào những điều kỳ diệu của tình yêu. Hạnh phúc lớn nhất là khi tìm thấy Thế Anh - mảnh ghép định mệnh của đời mình.",
  bride_photo: "CD ANH/DSC03871_1.JPG",
  bride_facebook: "#",
  bride_instagram: "#",
  
  // 4. LỄ VU QUY - NHÀ GÁI (VU QUY EVENT)
  vuquy_time: "09:00 - Thứ Bảy, 25/07/2026",
  vuquy_lunar: "(Tức ngày 12 tháng 6 năm Bính Ngọ)",
  vuquy_venue: "Tư gia nhà gái",
  vuquy_address: "Cột 8, Phường Hạ Long, Tỉnh Quảng Ninh",
  vuquy_map: "https://maps.google.com/?q=123+Co+Giang,+Quan+1,+TP+HCM",
  vuquy_calendar: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lễ+Vu+Quy+Thế+Anh+&amp;Lan+Anh&dates=20261121T020000Z/20261121T050000Z&details=Trân+trọng+kính+mời+quý+khách+tham+dự+Lễ+Vu+Quy+tại+Tư+gia+nhà+gái&location=123+Cô+Giang,+Quận+1,+TP.HCM",
  
  // 5. LỄ THÀNH HÔN - NHÀ TRAI (THANH HON EVENT)
  thanhhon_time: "17:00 - Chủ Nhật, 02/08/2026",
  thanhhon_lunar: "(Tức ngày 20 tháng 6 năm Bính Ngọ)",
  thanhhon_venue: "Trung tâm hội nghị & tiệc cưới Royal Lotus Hotel Danang",
  thanhhon_address: "120A Nguyễn Văn Thoại, Ngũ Hành Sơn, Đà Nẵng",
  thanhhon_map: "https://maps.google.com/?q=Romance+Palace+456+Nguyen+Hue,+Quan+1,+TP+HCM",
  thanhhon_calendar: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lễ+Thành+Hôn+Thế+Anh+&amp;Lan+Anh&dates=20261122T040000Z/20261122T080000Z&details=Trân+trọng+kính+mời+quý+khách+tham+dự+Lễ+Thành+Hôn+tại+Romance+Palace&location=456+Nguyễn+Huệ,+Quận+1,+TP.HCM",
  
  // 6. CÂU CHUYỆN TÌNH YÊU (LOVE STORY TIMELINE)
  story_1_date: "Tháng 11 . 2022",
  story_1_title: "Ngày đầu tiên gặp gỡ",
  story_1_desc: "Một buổi chiều thu dịu mát tại quán cà phê sách nhỏ, ánh mắt chúng mình vô tình chạm nhau qua từng trang sách cũ. Cuộc trò chuyện ngắn ngủi hôm ấy chính là khởi đầu cho một mối duyên lành định mệnh.",
  
  story_2_date: "Tháng 12 . 2022",
  story_2_title: "Lần đầu tiên hẹn hò",
  story_2_desc: "Hà Nội đón đợt gió mùa đông bắc đầu tiên, chúng mình dạo quanh những góc phố cổ thân quen, cùng uống chung ly trà ấm và nghe những điệu nhạc nhẹ. Khoảnh khắc đôi tay khẽ chạm nhau, thế giới dường như chỉ còn lại hai đứa.",
  
  story_3_date: "Tháng 01 . 2025",
  story_3_title: "Lời cầu hôn ngọt ngào",
  story_3_desc: "Dưới bầu trời lấp lánh pháo hoa đêm giao thừa và những tiếng sóng vỗ nhẹ nhàng bên bờ biển thơ mộng, Thế Anh đã quỳ gối và trao chiếc nhẫn ước hẹn. Câu trả lời nghẹn ngào trong giọt nước mắt hạnh phúc của Lan Anh: \"Vâng, em đồng ý!\".",
  
  story_4_date: "Tháng 11 . 2026",
  story_4_title: "Ngày chung đôi",
  story_4_desc: "Hai năm một chặng đường yêu thương tha thiết, giờ đây chúng mình cùng nhau bước sang trang mới của cuộc đời. Một tổ ấm ngập tràn tiếng cười, tình thương và sự tôn trọng lẫn nhau đang chờ đợi phía trước.",
  
  // 7. BÌA & MẢNG DỮ LIỆU ALBUM ẢNH KHÔNG GIỚI HẠN (DYNAMIC UNLIMITED WEDDING GALLERY)
  cover_photo: "CD ANH/DSC03755_1.JPG",
  
  gallery_images: [
    { url: "CD ANH/DSC03955_1.JPG", category: "dating" },
    { url: "CD ANH/DSC04000_1.JPG", category: "prewedding" },
    { url: "CD ANH/DSC04145_1.JPG", category: "dating" },
    { url: "CD ANH/DSC04180_1.JPG", category: "prewedding" },
    { url: "CD ANH/DSC04201_1.JPG", category: "prewedding" },
    { url: "CD ANH/DSC04229_1.JPG", category: "dating" },
    { url: "CD ANH/DSC04278_1.JPG", category: "prewedding" },
    { url: "CD ANH/DSC04296_1.JPG", category: "prewedding" }
  ]
};

/**
 * Trích xuất đối tượng Date từ chuỗi ký tự mô tả ngày giờ (ví dụ: "09:00 - Thứ Bảy, 21 . 11 . 2026")
 * Hỗ trợ các định dạng ngày: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
 * Hỗ trợ định dạng giờ: HH:MM
 */
function parseDateFromText(text, defaultDate) {
  let fallback = defaultDate;
  if (typeof fallback === 'string') {
    fallback = new Date(fallback);
  }
  if (!text) return fallback;
  
  // Regex tìm ngày: ngày (1-2 chữ số) ./- tháng (1-2 chữ số) ./- năm (4 chữ số)
  const dateRegex = /(\d{1,2})\s*[\.\/-]\s*(\d{1,2})\s*[\.\/-]\s*(\d{4})/;
  const dateMatch = text.match(dateRegex);
  if (!dateMatch) return fallback;
  
  const day = parseInt(dateMatch[1]);
  const month = parseInt(dateMatch[2]) - 1; // Tháng trong JS bắt đầu từ 0
  const year = parseInt(dateMatch[3]);
  
  // Regex tìm giờ: giờ (1-2 chữ số) : phút (2 chữ số)
  const timeRegex = /(\d{1,2}):(\d{2})/;
  const timeMatch = text.match(timeRegex);
  let hours = 11;
  let minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    minutes = parseInt(timeMatch[2]);
  }
  
  return new Date(year, month, day, hours, minutes);
}

/**
 * Trích xuất ngày âm lịch Việt Nam (đầy đủ Thiên Can, Địa Chi) dạng "(Tức ngày 12 tháng 10 năm Bính Ngọ)"
 */
function getVietnameseLunarString(date) {
  if (!date || isNaN(date.getTime())) return "";
  const dd = date.getDate();
  const mm = date.getMonth() + 1;
  const yy = date.getFullYear();
  
  if (!window.convertSolar2Lunar) {
    console.error("Không tìm thấy hàm convertSolar2Lunar trong window.amlich.js!");
    return "";
  }
  
  // Múi giờ Việt Nam là GMT+7
  const lunarArr = window.convertSolar2Lunar(dd, mm, yy, 7.0);
  const lunarDay = lunarArr[0];
  const lunarMonth = lunarArr[1];
  const lunarYear = lunarArr[2];
  const isLeap = lunarArr[3];
  
  const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  
  const yearStem = CAN[(lunarYear + 6) % 10];
  const yearBranch = CHI[(lunarYear + 8) % 12];
  
  const leapText = isLeap ? " nhuận" : "";
  return `(Tức ngày ${lunarDay} tháng ${lunarMonth}${leapText} năm ${yearStem} ${yearBranch})`;
}

/**
 * Định dạng ngày giờ thành chuỗi hiển thị thiệp cưới: "HH:MM - Thứ..., DD/MM/YYYY"
 */
function formatVietnameseDateString(date) {
  if (!date || isNaN(date.getTime())) return "";
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const weekday = daysOfWeek[date.getDay()];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${hours}:${minutes} - ${weekday}, ${day}/${month}/${year}`;
}
