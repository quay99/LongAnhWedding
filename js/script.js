/**
 * INTERACTIVE LOGIC - PREMIUM WEDDING INVITATION WEBSITE
 * countdown, theme switcher, audio player, lightbox, URL parameters parser, Google Sheet API & Config Loader
 */

// CẤU HÌNH DỰ ÁN CHÍNH
window.GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwX4Umd74_0MuLbs97QQuYn6XLIoWB7H7ltMYuBYt0PKvw0ZT2c8TuLhMsY17nN_xvY/exec"; // Dán link Web App của Google Apps Script tại đây để kết nối Google Sheet!

// Danh sách lời chúc mẫu mặc định làm dữ liệu demo
const MOCK_WISHES = [];

// Khai báo cấu hình toàn cục
window.weddingConfig = {};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tải nhanh cấu hình cục bộ (Local/Default) để hiển thị NGAY LẬP TỨC (0ms)
  loadLocalConfiguration();

  // 1.1. Nhận diện thiết bị mobile để kích hoạt giao diện tối ưu
  initMobileDetector();

  // 2. CÁ NHÂN HÓA LỜI MỜI (PERSONALIZED GREETINGS)
  initPersonalizedGreeting();

  // 3. BỘ ĐẾM NGƯỢC THỜI GIAN (COUNTDOWN)
  initCountdown();

  // 4. TRÌNH PHÁT NHẠC NỀN LÃNG MẠN (AUDIO CONTROLLER)
  initAudioPlayer();

  // 5. BỘ ĐỔI TÔNG MÀU ĐỘNG (THEME SWITCHER)
  initThemeSwitcher();

  // 6. HIỆU ỨNG CUỘN TRANG XUẤT HIỆN DẦN (SCROLL REVEAL)
  initScrollReveal();

  // 7. ALBUM ẢNH MASONRY & CUSTOM LIGHTBOX
  initPhotoGallery();

  // 8. XỬ LÝ FORM RSVP & KHÁCH MỜI GỬI LỜI CHÚC
  initRSVPForm();

  // 9. TẢI DANH SÁCH LỜI CHÚC (GUESTBOOK)
  loadGuestbookWishes();
  
  // 10. NÚT CHUYỂN BẬT/TẮT HIỆU ỨNG HOA RƠI
  initParticleToggle();

  // 11. TẢI CẤU HÌNH TỪ GOOGLE SHEETS KHÔNG ĐỒNG BỘ (Chạy ngầm - Không chặn hiển thị)
  loadGoogleSheetsConfiguration();
});

/* ==========================================================================
   1. LOAD WEDDING CONFIGURATION (TẢI CẤU HÌNH ĐỘNG DÂN DỤNG)
   ========================================================================== */
function loadLocalConfiguration() {
  window.weddingConfig = Object.assign({}, DEFAULT_WEDDING_CONFIG);

  let localConfig = null;
  try {
    localConfig = JSON.parse(localStorage.getItem('wedding-saved-config'));
    
    // TỰ ĐỘNG XÓA CACHE BỘ NHỚ LOCALSTORAGE KHI PHÁT HIỆN CÓ PHIÊN BẢN CODE MỚI
    if (localConfig && localConfig.config_version !== DEFAULT_WEDDING_CONFIG.config_version) {
      console.warn("Phát hiện phiên bản mã nguồn mới! Tự động làm sạch cache cấu hình trình duyệt.");
      localStorage.removeItem('wedding-saved-config');
      localConfig = null;
    }
    
    // Parse mảng gallery_images nếu lưu ở dạng String trong localStorage
    if (localConfig && typeof localConfig.gallery_images === 'string') {
      try {
        localConfig.gallery_images = JSON.parse(localConfig.gallery_images);
      } catch(e) {
        console.error("Lỗi khi parse local gallery_images:", e);
      }
    }
  } catch(e) {
    localConfig = null;
  }

  if (localConfig) {
    window.weddingConfig = Object.assign(window.weddingConfig, localConfig);
  }

  applyConfigToDOM(window.weddingConfig);
}

function normalizeStoryDate(rawDate) {
  if (rawDate === undefined || rawDate === null) return '';
  const value = String(rawDate).trim();
  if (!value) return '';

  // Nếu chuỗi chỉ chứa ký tự ISO / số / dấu giờ, chuyển về định dạng ngày thuần túy
  if (/^[\d\-:\.TZ ]+$/.test(value)) {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      const dateText = parsed.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const hasTime = parsed.getHours() || parsed.getMinutes();
      const timeText = hasTime ? ` ${parsed.getHours().toString().padStart(2, '0')}:${parsed.getMinutes().toString().padStart(2, '0')}` : '';
      return dateText + timeText;
    }
  }

  return value;
}

function initMobileDetector() {
  const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.matchMedia('(max-width: 768px)').matches;
  if (isMobileDevice) {
    document.body.classList.add('is-device-mobile');
  }
}

async function loadGoogleSheetsConfiguration() {
  if (window.GOOGLE_SHEET_SCRIPT_URL && window.GOOGLE_SHEET_SCRIPT_URL.startsWith('http')) {
    try {
      const response = await fetch(window.GOOGLE_SHEET_SCRIPT_URL + "?config=true");
      const result = await response.json();
      if (result.status === 'success' && result.data && Object.keys(result.data).length > 0) {
        const liveConfig = result.data;
        
        // Parse mảng gallery_images nếu lưu ở dạng String trên Google Sheet
        if (typeof liveConfig.gallery_images === 'string') {
          try {
            liveConfig.gallery_images = JSON.parse(liveConfig.gallery_images);
          } catch(e) {
            console.error("Lỗi khi parse live gallery_images:", e);
          }
        }
        
        // Ghi đè cấu hình mới tải từ Google Sheets lên trên
        window.weddingConfig = Object.assign(window.weddingConfig, liveConfig);
        
        // Re-render DOM
        applyConfigToDOM(window.weddingConfig);
        initPersonalizedGreeting();
        initCountdown();
        
        console.log("Đã tải cấu hình trực tiếp từ Google Sheets!");
      }
    } catch(err) {
      console.warn("Không kết nối được Google Sheet để lấy cấu hình, giữ nguyên bản local:", err);
    }
  }
}

function applyConfigToDOM(config) {
  try {
    // 1. Tiêu đề trình duyệt và các logo
    const titleText = `Lễ Thành Hôn - ${config.groom_name} & ${config.bride_name}`;
    document.title = titleText;
    const browserTitle = document.getElementById('dyn-browser-title');
    if (browserTitle) browserTitle.textContent = titleText;
    
    // Update the 3-line name structure
    const groomNameLine = document.getElementById('groom-name-line');
    const brideNameLine = document.getElementById('bride-name-line');
    if (groomNameLine) groomNameLine.textContent = config.groom_name;
    if (brideNameLine) brideNameLine.textContent = config.bride_name;
    
    const footerNames = document.getElementById('dyn-footer-names');
    if (footerNames) footerNames.textContent = `${config.groom_name} & ${config.bride_name}`;

    // 2. Ảnh bìa chính
    const heroBg = document.getElementById('dyn-hero-bg');
    if (heroBg && config.cover_photo) {
      heroBg.style.backgroundImage = `url('${config.cover_photo}')`;
      if (config.cover_position) {
        heroBg.style.backgroundPosition = config.cover_position;
      } else {
        heroBg.style.backgroundPosition = 'center';
      }
    }

    // 3. Nhạc nền
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic && config.music_url) {
      bgMusic.setAttribute('src', config.music_url);
    }

    // 4. Ngày cưới hiển thị dưới tên
    const heroDate = document.getElementById('dyn-hero-wedding-date');
    if (heroDate && config.wedding_date) {
      const date = new Date(config.wedding_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      heroDate.textContent = `${day}/${month}/${year}`;
    }

    // 5. Chú Rể (Groom Card)
    const groomPhoto = document.getElementById('dyn-groom-photo');
    if (groomPhoto) {
      groomPhoto.src = config.groom_photo || '';
      groomPhoto.setAttribute('loading', 'lazy');
    }
    const groomName = document.getElementById('dyn-groom-name');
    if (groomName) groomName.textContent = config.groom_name || '';
    const groomBio = document.getElementById('dyn-groom-bio');
    if (groomBio) groomBio.textContent = config.groom_bio || '';
    const groomFb = document.getElementById('dyn-groom-fb');
    if (groomFb) groomFb.href = config.groom_facebook || '#';

    // 6. Cô Dâu (Bride Card)
    const bridePhoto = document.getElementById('dyn-bride-photo');
    if (bridePhoto) {
      bridePhoto.src = config.bride_photo || '';
      bridePhoto.setAttribute('loading', 'lazy');
    }
    const brideName = document.getElementById('dyn-bride-name');
    if (brideName) brideName.textContent = config.bride_name || '';
    const brideBio = document.getElementById('dyn-bride-bio');
    if (brideBio) brideBio.textContent = config.bride_bio || '';
    const brideFb = document.getElementById('dyn-bride-fb');
    if (brideFb) brideFb.href = config.bride_facebook || '#';

    // 7. Lễ Vu Quy (Vu Quy Event)
    const vqTime = document.getElementById('dyn-vuquy-time');
    if (vqTime) vqTime.textContent = config.vuquy_time || '';
    const vqLunar = document.getElementById('dyn-vuquy-lunar');
    if (vqLunar) vqLunar.textContent = config.vuquy_lunar || '';
    const vqVenue = document.getElementById('dyn-vuquy-venue');
    if (vqVenue) vqVenue.textContent = config.vuquy_venue || '';
    const vqAddress = document.getElementById('dyn-vuquy-address');
    if (vqAddress) vqAddress.textContent = config.vuquy_address || '';
    const vqMap = document.getElementById('dyn-vuquy-map-link');
    if (vqMap) vqMap.href = config.vuquy_map || '#';
    const vqCal = document.getElementById('dyn-vuquy-cal-link');
    if (vqCal) vqCal.href = config.vuquy_calendar || '#';

    // 8. Lễ Thành Hôn (Thanh Hon Event)
    const thTime = document.getElementById('dyn-thanhhon-time');
    if (thTime) thTime.textContent = config.thanhhon_time || '';
    const thLunar = document.getElementById('dyn-thanhhon-lunar');
    if (thLunar) thLunar.textContent = config.thanhhon_lunar || '';
    const thVenue = document.getElementById('dyn-thanhhon-venue');
    if (thVenue) thVenue.textContent = config.thanhhon_venue || '';
    const thAddress = document.getElementById('dyn-thanhhon-address');
    if (thAddress) thAddress.textContent = config.thanhhon_address || '';
    const thMap = document.getElementById('dyn-thanhhon-map-link');
    if (thMap) thMap.href = config.thanhhon_map || '#';
    const thCal = document.getElementById('dyn-thanhhon-cal-link');
    if (thCal) thCal.href = config.thanhhon_calendar || '#';

    // 9. Câu Chuyện Tình Yêu (Love Story Timeline)
    const story1Date = document.getElementById('dyn-story-1-date');
    if (story1Date) story1Date.textContent = normalizeStoryDate(config.story_1_date);
    const story1Title = document.getElementById('dyn-story-1-title');
    if (story1Title) story1Title.textContent = config.story_1_title || '';
    const story1Desc = document.getElementById('dyn-story-1-desc');
    if (story1Desc) story1Desc.textContent = config.story_1_desc || '';

    const story2Date = document.getElementById('dyn-story-2-date');
    if (story2Date) story2Date.textContent = normalizeStoryDate(config.story_2_date);
    const story2Title = document.getElementById('dyn-story-2-title');
    if (story2Title) story2Title.textContent = config.story_2_title || '';
    const story2Desc = document.getElementById('dyn-story-2-desc');
    if (story2Desc) story2Desc.textContent = config.story_2_desc || '';

    const story3Date = document.getElementById('dyn-story-3-date');
    if (story3Date) story3Date.textContent = normalizeStoryDate(config.story_3_date);
    const story3Title = document.getElementById('dyn-story-3-title');
    if (story3Title) story3Title.textContent = config.story_3_title || '';
    const story3Desc = document.getElementById('dyn-story-3-desc');
    if (story3Desc) story3Desc.textContent = config.story_3_desc || '';

    const story4Date = document.getElementById('dyn-story-4-date');
    if (story4Date) story4Date.textContent = normalizeStoryDate(config.story_4_date);
    const story4Title = document.getElementById('dyn-story-4-title');
    if (story4Title) story4Title.textContent = config.story_4_title || '';
    const story4Desc = document.getElementById('dyn-story-4-desc');
    if (story4Desc) story4Desc.textContent = config.story_4_desc || '';

    // 10. Album ảnh cưới động không giới hạn (Dynamic Gallery Grid Builder)
    const galleryGrid = document.getElementById('dyn-gallery-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = ''; // Clear items cũ
      
      const imagesList = config.gallery_images || [];
      if (imagesList.length === 0) {
        galleryGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-secondary); font-style:italic; padding:40px 0;">Chưa có ảnh nào trong album. Vui lòng thêm từ Cổng quản lý!</div>';
      } else {
        imagesList.forEach((imgObj, idx) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'gallery-item reveal active';
          itemDiv.setAttribute('data-category', imgObj.category || 'prewedding');
          
          itemDiv.innerHTML = `
            <div class="gallery-img-wrapper">
              <img src="${imgObj.url}" alt="Ảnh cưới ${idx + 1}" loading="lazy">
              <div class="gallery-overlay">
                <div class="gallery-overlay-icon"><i class="fas fa-expand-alt"></i></div>
              </div>
            </div>
          `;
          galleryGrid.appendChild(itemDiv);
        });
      }
    }

  } catch(e) {
    console.error("Lỗi khi điền thông tin dynamic vào trang web:", e);
  }
}

/* ==========================================================================
   2. PERSONALIZED INVITATION (THIỆP ĐÍCH DANH)
   ========================================================================== */
function initPersonalizedGreeting() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Xóa tham số 'role' nếu tồn tại trong URL
  if (urlParams.has('role')) {
    urlParams.delete('role');
  }

  // Nhận diện phân hệ nhà trai / nhà gái từ URL (query parameter hoặc pathname)
  let side = urlParams.get('side');
  const pathname = window.location.pathname.toLowerCase();
  
  if (!side) {
    if (pathname.includes('/nhatrai') || pathname.includes('nhatrai.html')) {
      side = 'nhatrai';
    } else if (pathname.includes('/nhagai') || pathname.includes('nhagai.html')) {
      side = 'nhagai';
    }
  }

  // Thiết lập ẩn/hiện card Lễ Vu Quy & Lễ Thành Hôn dựa trên side
  const vuQuyCard = document.getElementById('event-vuquy-card');
  const thanhHonCard = document.getElementById('event-thanhhon-card');
  const calendarCard = document.getElementById('events-calendar-card');

  // Tính toán ngày sự kiện tương ứng cho side được chọn
  let parsedDate = null;
  if (side === 'nhatrai') {
    parsedDate = parseDateFromText(window.weddingConfig.thanhhon_time, window.weddingConfig.wedding_date);
  } else if (side === 'nhagai') {
    parsedDate = parseDateFromText(window.weddingConfig.vuquy_time, window.weddingConfig.wedding_date);
  } else {
    parsedDate = parseDateFromText(window.weddingConfig.thanhhon_time, window.weddingConfig.wedding_date);
  }

  if (side === 'nhatrai') {
    if (vuQuyCard) vuQuyCard.style.display = 'none';
    if (thanhHonCard) thanhHonCard.style.display = 'block';
    if (calendarCard) {
      calendarCard.style.display = 'block';
      const calendarTitle = document.getElementById('calendar-card-title');
      if (calendarTitle) calendarTitle.textContent = "Lịch Thành Hôn";
      
      // Vẽ lịch khoanh ngày Thành Hôn
      generateWeddingCalendar(parsedDate);
    }
    
    // Tự động chọn radio button "Nhà Trai" trong form RSVP
    const sideGroomRadio = document.getElementById('side-groom');
    if (sideGroomRadio) sideGroomRadio.checked = true;
  } else if (side === 'nhagai') {
    if (thanhHonCard) thanhHonCard.style.display = 'none';
    if (vuQuyCard) vuQuyCard.style.display = 'block';
    if (calendarCard) {
      calendarCard.style.display = 'block';
      const calendarTitle = document.getElementById('calendar-card-title');
      if (calendarTitle) calendarTitle.textContent = "Lịch Vu Quy";
      
      // Vẽ lịch khoanh ngày Vu Quy
      generateWeddingCalendar(parsedDate);
    }
    
    // Tự động chọn radio button "Nhà Gái" trong form RSVP
    const sideBrideRadio = document.getElementById('side-bride');
    if (sideBrideRadio) sideBrideRadio.checked = true;
  } else {
    // Mặc định (hiển thị cả 2 sự kiện như thường, ẩn lịch)
    if (vuQuyCard) vuQuyCard.style.display = 'block';
    if (thanhHonCard) thanhHonCard.style.display = 'block';
    if (calendarCard) calendarCard.style.display = 'none';
  }

  // Thiết lập tên lễ và ngày hiển thị trên màn hình bìa (hero) dựa trên side
  const heroWeddingTag = document.getElementById('dyn-hero-wedding-tag');
  const heroDate = document.getElementById('dyn-hero-wedding-date');
  
  if (heroWeddingTag) {
    if (side === 'nhatrai') {
      heroWeddingTag.textContent = "Lễ Thành Hôn";
    } else if (side === 'nhagai') {
      heroWeddingTag.textContent = "Lễ Vu Quy";
    } else {
      heroWeddingTag.textContent = "Lễ Thành Hôn"; // Mặc định
    }
  }

  if (heroDate && parsedDate) {
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    heroDate.textContent = `${day}/${month}/${year}`;
  }

  const guestName = urlParams.get('to');

  if (guestName) {
    const greetingBox = document.getElementById('personalized-greeting');
    const greetingGuestName = document.getElementById('greeting-guest-name');
    const rsvpNameInput = document.getElementById('rsvp-name');

    // Giải mã tên khách mời từ URL
    let decodedName = "";
    try {
      decodedName = decodeURIComponent(guestName).trim();
    } catch(err) {
      decodedName = guestName.trim();
    }

    // TỰ ĐỘNG SỬA ĐỔI LINK TRÊN THANH ĐỊA CHỈ CHO ĐÚNG CHUẨN URI ENCODED VÀ LOẠI BỎ ROLE, GIỮ NGUYÊN PATH nhatrai/nhagai
    const encodedCheck = encodeURIComponent(decodedName);
    const expectedSearch = `?to=${encodedCheck}`;
    
    let targetPath = window.location.pathname;
    if (side === 'nhatrai') {
      targetPath = targetPath.substring(0, targetPath.lastIndexOf('/')) + '/nhatrai';
    } else if (side === 'nhagai') {
      targetPath = targetPath.substring(0, targetPath.lastIndexOf('/')) + '/nhagai';
    }
    
    if (targetPath.endsWith('//')) targetPath = targetPath.slice(0, -1);
    const cleanUrl = window.location.origin + targetPath + expectedSearch;
    const currentUrl = window.location.href;

    if (decodeURIComponent(currentUrl) !== decodeURIComponent(cleanUrl)) {
      try {
        window.history.replaceState({}, '', cleanUrl);
        console.log("Đã tự động sửa lại liên kết hiển thị cho đúng chuẩn mã hóa và loại bỏ role!");
      } catch(historyErr) {
        console.warn("Không thể viết đè lịch sử trình duyệt:", historyErr);
      }
    }

    if (greetingBox) {
      greetingBox.style.display = 'inline-block';
      greetingGuestName.textContent = decodedName;
    }

    if (rsvpNameInput) {
      rsvpNameInput.value = decodedName;
    }
  } else {
    // Nếu không có tham số 'to' nhưng có phân hệ side nhatrai/nhagai
    let targetPath = window.location.pathname;
    if (side === 'nhatrai') {
      targetPath = targetPath.substring(0, targetPath.lastIndexOf('/')) + '/nhatrai';
    } else if (side === 'nhagai') {
      targetPath = targetPath.substring(0, targetPath.lastIndexOf('/')) + '/nhagai';
    }
    
    if (targetPath.endsWith('//')) targetPath = targetPath.slice(0, -1);
    
    const cleanUrl = window.location.origin + targetPath;
    if (window.location.href !== cleanUrl && (side === 'nhatrai' || side === 'nhagai' || window.location.search)) {
      try {
        window.history.replaceState({}, '', cleanUrl);
      } catch(historyErr) {
        console.warn("Không thể dọn dẹp lịch sử trình duyệt:", historyErr);
      }
    }
  }
}

// Hàm sinh lịch động và khoanh tròn hình trái tim vào ngày tổ chức lễ cưới
function generateWeddingCalendar(highlightDate) {
  const daysGrid = document.getElementById('calendar-days-grid');
  const headerMonth = document.getElementById('calendar-header-month');
  if (!daysGrid || !headerMonth) return;

  if (!highlightDate) {
    highlightDate = new Date();
  }

  const year = highlightDate.getFullYear();
  const month = highlightDate.getMonth(); // 0-indexed
  const highlightDay = highlightDate.getDate();

  // Đổi nhãn tháng tiêu đề dạng tiếng Việt
  headerMonth.textContent = `Tháng ${month + 1} / ${year}`;

  // Lấy số ngày trong tháng và thứ của ngày đầu tiên trong tháng
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Chủ Nhật, 1 = Thứ Hai...

  // Tính số ô trống trước ngày 1 (Tuần Việt Nam bắt đầu từ Thứ Hai)
  // Trong hệ thống getDay(): 0 = CN, 1 = T2, 2 = T3, 3 = T4, 4 = T5, 5 = T6, 6 = T7
  let emptyCells = firstDayOfWeek - 1;
  if (emptyCells < 0) {
    emptyCells = 6; // Nếu ngày đầu tiên là Chủ Nhật, cần 6 ô trống phía trước (T2 -> T7)
  }

  daysGrid.innerHTML = '';

  // 1. Render các ô trống
  for (let i = 0; i < emptyCells; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'calendar-day empty';
    emptyDiv.textContent = '';
    daysGrid.appendChild(emptyDiv);
  }

  // 2. Render tất cả các ngày trong tháng
  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;

    if (day === highlightDay) {
      dayDiv.className = 'calendar-day highlight';
      
      // Tạo hình trái tim khoanh tròn bằng SVG vẽ động tuyệt đẹp
      dayDiv.innerHTML = `
        ${day}
        <svg class="heart-svg" viewBox="0 0 24 24">
          <path d="M12 4.419C12 4.419 10.082 1.5 6.5 1.5C3.5 1.5 1 3.9 1 7C1 13 12 21 12 21C12 21 23 13 23 7C23 3.9 20.5 1.5 17.5 1.5C13.918 1.5 12 4.419 12 4.419Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }

    daysGrid.appendChild(dayDiv);
  }
}

/* ==========================================================================
   3. COUNTDOWN TIMER (BỘ ĐẾM NGƯỢC DYNAMIC)
   ========================================================================== */
function initCountdown() {
  const daysVal = document.getElementById('cd-days');
  const hoursVal = document.getElementById('cd-hours');
  const minutesVal = document.getElementById('cd-minutes');
  const secondsVal = document.getElementById('cd-seconds');

  if (!daysVal) return;

  // Xác định side một lần khi khởi chạy bộ đếm ngược
  const urlParams = new URLSearchParams(window.location.search);
  let side = urlParams.get('side');
  const pathname = window.location.pathname.toLowerCase();
  
  if (!side) {
    if (pathname.includes('/nhatrai') || pathname.includes('nhatrai.html')) {
      side = 'nhatrai';
    } else if (pathname.includes('/nhagai') || pathname.includes('nhagai.html')) {
      side = 'nhagai';
    }
  }

  const updateInterval = setInterval(() => {
    let weddingDate = null;
    if (side === 'nhatrai') {
      weddingDate = parseDateFromText(window.weddingConfig.thanhhon_time, window.weddingConfig.wedding_date);
    } else if (side === 'nhagai') {
      weddingDate = parseDateFromText(window.weddingConfig.vuquy_time, window.weddingConfig.wedding_date);
    } else {
      weddingDate = parseDateFromText(window.weddingConfig.thanhhon_time, window.weddingConfig.wedding_date);
    }

    const countdownDate = weddingDate ? weddingDate.getTime() : new Date().getTime();
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
      clearInterval(updateInterval);
      const countdownWrapper = document.querySelector('.hero-countdown');
      if (countdownWrapper) {
        countdownWrapper.innerHTML = "<div class='countdown-card' style='width:auto;padding:15px 30px;'><span class='countdown-num' style='font-size:1.5rem;'>ĐANG DIỄN RA</span></div>";
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysVal.textContent = days.toString().padStart(2, '0');
    hoursVal.textContent = hours.toString().padStart(2, '0');
    minutesVal.textContent = minutes.toString().padStart(2, '0');
    secondsVal.textContent = seconds.toString().padStart(2, '0');
  }, 1000);
}

/* ==========================================================================
   4. AUDIO PLAYER (NHẠC NỀN)
   ========================================================================== */
function initAudioPlayer() {
  const audio = document.getElementById('bg-music');
  const playBtn = document.getElementById('music-player-btn');
  const openInvitationBtn = document.getElementById('open-invitation-btn');
  const openArrowBtn = document.getElementById('open-arrow-btn');
  const mobileNavArrow = document.getElementById('mobile-nav-arrow');

  if (!audio || !playBtn) return;

  playBtn.addEventListener('click', toggleAudio);

  // Thứ tự các section trên trang (dùng để xác định section tiếp theo khi nhấn mũi tên)
  const sectionOrder = ['hero', 'couple', 'story', 'events', 'gallery', 'rsvp'];
  let currentSectionIndex = 0;

  // Hàm điều hướng thông minh: hỗ trợ cả mobile-book (scroll ngang) và desktop (scroll dọc)
  const navigateToSection = (targetSectionId) => {
    const mobileBook = document.querySelector('.mobile-book');
    const targetSection = document.getElementById(targetSectionId);
    if (!targetSection) return;

    // Kiểm tra xem có đang ở chế độ mobile-book (scroll ngang) không
    const isMobileBookMode = mobileBook && window.getComputedStyle(mobileBook).display === 'flex';

    if (isMobileBookMode) {
      // Trong chế độ mobile-book, các section nằm ngang => scroll container theo trục X
      const sections = Array.from(mobileBook.querySelectorAll(':scope > section'));
      const targetIndex = sections.indexOf(targetSection);
      if (targetIndex !== -1) {
        const scrollTarget = mobileBook.clientWidth * targetIndex;
        mobileBook.scrollTo({ left: scrollTarget, behavior: 'smooth' });
      }
    } else {
      // Desktop mode - scroll dọc như bình thường
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenInvitation = () => {
    navigateToSection('couple');
    playAudio();
  };

  // Xử lý nhấn nút mũi tên điều hướng mobile toàn cục
  const handleMobileNavArrowClick = () => {
    const nextIndex = (currentSectionIndex + 1) % sectionOrder.length;
    navigateToSection(sectionOrder[nextIndex]);
    playAudio();
  };

  if (openInvitationBtn) openInvitationBtn.addEventListener('click', handleOpenInvitation);
  if (openArrowBtn) openArrowBtn.addEventListener('click', handleOpenInvitation);
  
  // Gắn event listener cho nút mũi tên điều hướng mobile toàn cục
  if (mobileNavArrow) {
    mobileNavArrow.addEventListener('click', handleMobileNavArrowClick);
  }

  // Theo dõi section hiện tại bằng scroll listener trên mobile-book container
  const initMobileNavTracking = () => {
    const mobileBook = document.querySelector('.mobile-book');
    if (!mobileBook) return;

    const updateCurrentSection = () => {
      const scrollLeft = mobileBook.scrollLeft;
      const containerWidth = mobileBook.clientWidth;
      const index = Math.round(scrollLeft / containerWidth);
      currentSectionIndex = Math.min(index, sectionOrder.length - 1);
      
      // Ẩn mũi tên trên hero section (section đầu tiên) vì đã có nút "Mở Thiệp Cưới"
      if (mobileNavArrow) {
        if (currentSectionIndex === 0) {
          mobileNavArrow.style.opacity = '0';
          mobileNavArrow.style.pointerEvents = 'none';
        } else {
          mobileNavArrow.style.opacity = '1';
          mobileNavArrow.style.pointerEvents = 'auto';
        }
        
        // Đổi icon: section cuối cùng hiển thị icon quay về (undo), các section khác hiển thị mũi tên phải
        const arrowIcon = mobileNavArrow.querySelector('i');
        if (arrowIcon) {
          if (currentSectionIndex === sectionOrder.length - 1) {
            arrowIcon.className = 'fas fa-undo-alt';
          } else {
            arrowIcon.className = 'fas fa-chevron-right';
          }
        }
      }
    };

    mobileBook.addEventListener('scroll', updateCurrentSection, { passive: true });
    // Chạy lần đầu
    updateCurrentSection();
  };

  // Khởi tạo tracking sau khi DOM đã sẵn sàng
  initMobileNavTracking();

  // Cố gắng tự động phát nhạc khi có bất kỳ tương tác đầu tiên nào trên màn hình (Click, Chạm, Cuộn)
  const playOnInteraction = () => {
    playAudio();
  };

  document.addEventListener('click', playOnInteraction, { once: true });
  document.addEventListener('touchstart', playOnInteraction, { once: true });
  document.addEventListener('scroll', playOnInteraction, { once: true });

  function playAudio() {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.classList.add('playing');
        // Gỡ bỏ các sự kiện tương tác nếu đã phát nhạc thành công
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      }).catch(err => {
        console.log("Autoplay bị chặn bởi chính sách bảo mật trình duyệt:", err);
      });
    }
  }

  function toggleAudio() {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.classList.add('playing');
      }).catch(err => console.log(err));
    } else {
      audio.pause();
      playBtn.classList.remove('playing');
    }
  }
}

/* ==========================================================================
   5. THEME SWITCHER (BỘ ĐỔI TÔNG MÀU ĐỘNG)
   ========================================================================== */
function initThemeSwitcher() {
  const switcher = document.getElementById('theme-switcher');
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const options = document.querySelectorAll('.theme-option');

  if (!switcher || !toggleBtn) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    switcher.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    switcher.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') switcher.classList.remove('open');
  });

  switcher.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const themeColor = opt.getAttribute('data-color');
      
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      
      document.body.setAttribute('data-theme', themeColor);
      localStorage.setItem('selected-wedding-theme', themeColor);
      switcher.classList.remove('open');
    });
  });

  const savedTheme = localStorage.getItem('selected-wedding-theme');
  if (savedTheme) {
    const activeOpt = document.querySelector(`.theme-option[data-color="${savedTheme}"]`);
    if (activeOpt) {
      activeOpt.click();
    }
  }
}

/* ==========================================================================
   6. SCROLL REVEAL (HIỆU ỨNG TRƯỢT XUẤT HIỆN DẦN)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    const fallbackReveal = () => {
      reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
          el.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', fallbackReveal);
    fallbackReveal();
  }
}

/* ==========================================================================
   7. PHOTO GALLERY & LIGHTBOX (BỘ SƯU TẬP ẢNH CƯỚI)
   ========================================================================== */
function initPhotoGallery() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightbox = document.getElementById('custom-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-btn-prev');
  const nextBtn = document.querySelector('.lightbox-btn-next');

  // Lấy các phần tử được kết xuất động trong DOM
  let galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      galleryItems = document.querySelectorAll('.gallery-item'); // Truy vấn lại

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  let currentIndex = 0;
  let visibleItems = Array.from(galleryItems);

  const updateVisibleItems = () => {
    galleryItems = document.querySelectorAll('.gallery-item'); // Truy vấn lại đề phòng đã thay đổi ảnh cưới
    visibleItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
  };

  // Sử dụng Event Delegation cho lưới ảnh cưới động (để click hoạt động khi thêm/xóa ảnh)
  const galleryGrid = document.getElementById('dyn-gallery-grid');
  if (galleryGrid) {
    // Gỡ bỏ và gắn lại sự kiện click
    galleryGrid.onclick = null;
    galleryGrid.addEventListener('click', (e) => {
      const clickedItem = e.target.closest('.gallery-item');
      if (!clickedItem) return;
      
      updateVisibleItems();
      const clickedImg = clickedItem.querySelector('img');
      if (!clickedImg) return;
      
      const imgSrc = clickedImg.getAttribute('src');
      currentIndex = visibleItems.indexOf(clickedItem);
      
      openLightbox(imgSrc);
    });
  }

  const openLightbox = (src) => {
    lightboxImg.setAttribute('src', src);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showNextImg = () => {
    updateVisibleItems();
    if (visibleItems.length <= 1) return;
    
    currentIndex = (currentIndex + 1) % visibleItems.length;
    const nextImg = visibleItems[currentIndex].querySelector('img');
    if (!nextImg) return;
    const nextImgSrc = nextImg.getAttribute('src');
    
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.setAttribute('src', nextImgSrc);
      lightboxImg.style.opacity = 1;
    }, 150);
  };

  const showPrevImg = () => {
    updateVisibleItems();
    if (visibleItems.length <= 1) return;
    
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    const prevImg = visibleItems[currentIndex].querySelector('img');
    if (!prevImg) return;
    const prevImgSrc = prevImg.getAttribute('src');
    
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.setAttribute('src', prevImgSrc);
      lightboxImg.style.opacity = 1;
    }, 150);
  };

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (nextBtn) nextBtn.onclick = showNextImg;
  if (prevBtn) prevBtn.onclick = showPrevImg;

  if (lightbox) {
    lightbox.onclick = (e) => {
      // Đóng lightbox khi nhấp vào khoảng trống (bất kỳ đâu ngoài ảnh chính và các nút điều hướng)
      const isImg = e.target.classList.contains('lightbox-img');
      const isPrev = e.target.closest('.lightbox-btn-prev');
      const isNext = e.target.closest('.lightbox-btn-next');
      
      if (!isImg && !isPrev && !isNext) {
        closeLightbox();
      }
    };
  }

  document.onkeydown = (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImg();
    if (e.key === 'ArrowLeft') showPrevImg();
  };

  // Swipe events trên mobile
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.ontouchstart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  lightbox.ontouchend = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      showNextImg();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      showPrevImg();
    }
  };
}

/* ==========================================================================
   8. RSVP FORM SUBMISSION (XỬ LÝ ĐĂNG KÝ THAM DỰ)
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById('wedding-rsvp-form');
  const loading = document.getElementById('rsvp-loading');
  const submitBtn = form?.querySelector('button[type="submit"]');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvp-name').value.trim();
    const phone = ""; 
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value || "yes";
    const side = document.querySelector('input[name="side"]:checked')?.value || "Bạn chung";
    const guests = document.getElementById('rsvp-guests').value || "1";
    const message = document.getElementById('rsvp-message').value.trim();

    if (!name) {
      alert("Vui lòng nhập Họ và Tên của bạn!");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (loading) loading.style.display = 'flex';

    const formData = { name, phone, attendance, side, guests, message };

    const apiUrl = window.GOOGLE_SHEET_SCRIPT_URL || "";
    if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const formBody = Object.keys(formData)
          .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]))
          .join('&');

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        });

        const result = await response.json();
        
        if (result.status === 'success') {
          handleRSVPSuccess(formData);
        } else {
          console.error("Lỗi Google Script RSVP:", result.message);
          saveRSVPLocal(formData);
          handleRSVPSuccess(formData);
        }
      } catch (err) {
        console.error("Không kết nối được Google Sheet API:", err);
        saveRSVPLocal(formData);
        handleRSVPSuccess(formData);
      }
    } else {
      setTimeout(() => {
        saveRSVPLocal(formData);
        handleRSVPSuccess(formData);
      }, 800);
    }
  });

  function saveRSVPLocal(data) {
    let localData = [];
    try {
      localData = JSON.parse(localStorage.getItem('wedding-rsvp-list')) || [];
    } catch(e) {
      localData = [];
    }
    
    const now = new Date();
    data.date = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    localData.push(data);
    localStorage.setItem('wedding-rsvp-list', JSON.stringify(localData));
  }

  function handleRSVPSuccess(data) {
    if (loading) loading.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
    
    alert(`Cảm ơn ${data.name} đã xác nhận tham dự lễ cưới của chúng tôi!`);
    
    if (data.message) {
      appendWishToUI({
        name: data.name,
        side: data.side,
        message: data.message,
        date: data.date || "Vừa xong"
      });
    }

    form.reset();
    initPersonalizedGreeting();
  }
}

/* ==========================================================================
   9. GUESTBOOK WISHES (ĐỌC & HIỂN THỊ LỜI CHÚC KHÁCH MỜI)
   ========================================================================== */
async function loadGuestbookWishes() {
  const wishesWrapper = document.getElementById('wishes-wrapper');
  if (!wishesWrapper) return;

  wishesWrapper.innerHTML = '<div class="no-wishes" id="wishes-loading"><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Đang tải lời chúc...</div>';

  let wishesList = [];
  const apiUrl = window.GOOGLE_SHEET_SCRIPT_URL || "";

  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        wishesList = result.data;
      }
    } catch (err) {
      console.warn("Lỗi tải API lời chúc, chuyển sang fallback:", err);
    }
  }

  let localData = [];
  try {
    localData = JSON.parse(localStorage.getItem('wedding-rsvp-list')) || [];
  } catch (e) {
    localData = [];
  }
  
  const localWishes = localData
    .filter(item => item.message && item.message.trim() !== "")
    .map(item => ({
      name: item.name,
      side: item.side,
      message: item.message,
      date: item.date || "Vừa xong"
    }));

  const finalWishes = [...localWishes, ...wishesList];
  
  if (finalWishes.length === 0) {
    wishesList = MOCK_WISHES;
  } else {
    wishesList = finalWishes;
  }

  const loader = document.getElementById('wishes-loading');
  if (loader) loader.remove();

  if (wishesList.length === 0) {
    wishesWrapper.innerHTML = '<div class="no-wishes">Hãy để lại lời chúc đầu tiên cho cặp đôi nhé!</div>';
    return;
  }

  wishesWrapper.innerHTML = '';
  wishesList.forEach(wish => {
    appendWishToUI(wish);
  });
}

function appendWishToUI(wish) {
  const wishesWrapper = document.getElementById('wishes-wrapper');
  if (!wishesWrapper) return;

  const noWishes = wishesWrapper.querySelector('.no-wishes');
  if (noWishes) noWishes.remove();

  const wishCard = document.createElement('div');
  wishCard.className = 'wish-card reveal active';
  
  let tagClass = 'guest-both';
  let sideText = 'Bạn chung';
  
  if (wish.side) {
    if (wish.side.includes('trai') || wish.side.includes('Groom')) {
      tagClass = 'guest-boy';
      sideText = 'Nhà trai';
    } else if (wish.side.includes('gái') || wish.side.includes('Bride')) {
      tagClass = 'guest-girl';
      sideText = 'Nhà gái';
    }
  }

  wishCard.innerHTML = `
    <div class="wish-header">
      <span class="wish-sender">${escapeHTML(wish.name)}</span>
      <span class="wish-tag ${tagClass}">${sideText}</span>
    </div>
    <p class="wish-message">${escapeHTML(wish.message)}</p>
    <span class="wish-date">${wish.date || "Vừa xong"}</span>
  `;

  wishesWrapper.insertBefore(wishCard, wishesWrapper.firstChild);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/* ==========================================================================
   10. PARTICLE ANIMATION TOGGLE (BẬT/TẮT HOA RƠI)
   ========================================================================== */
function initParticleToggle() {
  const toggleBtn = document.getElementById('particle-toggle-btn');
  if (!toggleBtn) return;

  let particlesActive = true;

  toggleBtn.addEventListener('click', () => {
    particlesActive = !particlesActive;
    
    if (window.fallingPetals) {
      window.fallingPetals.toggle(particlesActive);
    }

    if (particlesActive) {
      toggleBtn.innerHTML = '<i class="fas fa-snowflake"></i>';
      toggleBtn.title = "Tắt cánh hoa rơi";
      toggleBtn.style.color = 'var(--accent-color)';
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      toggleBtn.title = "Bật cánh hoa rơi";
      toggleBtn.style.color = '#CCCCCC';
    }
  });
}
