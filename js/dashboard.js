/**
 * SECURE TABBED ADMIN PORTAL - RSVP LOGS MANAGEMENT, GOOGLE DRIVE FILE UPLOADER & LIVE WEBSITE CONFIGURATION EDITOR
 */

const ADMIN_PASSWORD = "long1999"; // Mật khẩu quản trị mặc định

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('secret-trigger');
  const modal = document.getElementById('admin-modal');
  const closeBtn = document.getElementById('admin-close-btn');
  const authForm = document.getElementById('admin-auth-form');
  const passwordInput = document.getElementById('admin-password');
  const authError = document.getElementById('admin-auth-error');
  
  // Tabs and Navigations
  const adminTabsHeader = document.getElementById('admin-tabs');
  const rsvpTabContent = document.getElementById('rsvp-dashboard');
  const configTabContent = document.getElementById('config-dashboard');
  const tabButtons = document.querySelectorAll('.admin-tab-btn');

  // Form Editor
  const configForm = document.getElementById('wedding-config-editor-form');
  const editorLoading = document.getElementById('editor-loading');

  // Actions
  const btnExport = document.getElementById('admin-export-csv');
  const btnClearLocal = document.getElementById('admin-clear-local');
  const btnRefresh = document.getElementById('admin-refresh');

  let rsvpDataList = [];
  let isAuthorized = false;

  if (!trigger || !modal) return;

  // --- A. ĐĂNG NHẬP & KÍCH HOẠT CỔNG QUẢN TRỊ ---
  trigger.addEventListener('dblclick', () => {
    modal.classList.add('active');
    passwordInput.value = '';
    authError.style.display = 'none';
    
    if (isAuthorized) {
      authForm.style.display = 'none';
      adminTabsHeader.style.display = 'flex';
      
      const activeTab = document.querySelector('.admin-tab-btn.active').getAttribute('data-tab');
      showTab(activeTab);
    } else {
      authForm.style.display = 'flex';
      adminTabsHeader.style.display = 'none';
      rsvpTabContent.style.display = 'none';
      configTabContent.style.display = 'none';
      passwordInput.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pwd = passwordInput.value;
    
    if (pwd === ADMIN_PASSWORD) {
      isAuthorized = true;
      authForm.style.display = 'none';
      adminTabsHeader.style.display = 'flex';
      authError.style.display = 'none';
      showTab('rsvp-dashboard');
    } else {
      authError.textContent = "Mật khẩu không chính xác! Vui lòng thử lại.";
      authError.style.display = 'block';
      passwordInput.select();
    }
  });

  // --- B. QUẢN LÝ CHUYỂN TABS ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const targetTab = btn.getAttribute('data-tab');
      showTab(targetTab);
    });
  });

  function showTab(tabId) {
    if (tabId === 'rsvp-dashboard') {
      rsvpTabContent.style.display = 'block';
      configTabContent.style.display = 'none';
      loadDashboardData();
    } else if (tabId === 'config-dashboard') {
      rsvpTabContent.style.display = 'none';
      configTabContent.style.display = 'block';
      prefillConfigEditorForm();
      initImageUploaders(); // Khởi tạo tính năng Upload ảnh
    }
  }

  // --- C. TẢI DỮ LIỆU ĐĂNG KÝ RSVP (TAB 1) ---
  async function loadDashboardData() {
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="7" class="admin-table-empty"><i class="fas fa-spinner fa-spin"></i> Đang tải danh sách khách mời...</td></tr>';
    
    let liveData = [];
    const apiUrl = window.GOOGLE_SHEET_SCRIPT_URL || "";
    
    if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const response = await fetch(apiUrl + "?admin=true");
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
          liveData = result.data;
        }
      } catch (err) {
        console.warn("Không kết nối được Google Sheet để lấy RSVP:", err);
      }
    }

    let localData = [];
    try {
      localData = JSON.parse(localStorage.getItem('wedding-rsvp-list')) || [];
    } catch(e) {
      localData = [];
    }

    const formattedLocal = localData.map(item => ({
      date: item.date || "Ngoại tuyến",
      name: item.name,
      phone: item.phone || "-", // Số điện thoại có thể trống do đã lược bỏ
      attendance: item.attendance || "yes",
      side: item.side,
      guests: item.guests || "1",
      message: item.message,
      isLocal: true
    }));

    const formattedLive = liveData.map(item => ({
      date: item.date,
      name: item.name,
      phone: item.phone || "-",
      attendance: item.attendance || "yes",
      side: item.side,
      guests: item.guests || "1",
      message: item.message,
      isLocal: false
    }));

    rsvpDataList = [...formattedLocal, ...formattedLive];

    calculateStatistics(rsvpDataList);
    renderTable(rsvpDataList);
  }

  function calculateStatistics(data) {
    let totalRSVPs = data.length;
    let totalGuestsCount = 0;
    let attendingCount = 0;
    let notAttendingCount = 0;
    let sideGroom = 0;
    let sideBride = 0;

    data.forEach(item => {
      const isAttending = item.attendance === "yes" || item.attendance === "Tham dự";
      const numGuests = parseInt(item.guests) || 1;

      if (isAttending) {
        attendingCount++;
        totalGuestsCount += numGuests;
      } else {
        notAttendingCount++;
      }

      const side = item.side ? item.side.toLowerCase() : '';
      if (side.includes('trai') || side.includes('groom')) {
        sideGroom += isAttending ? numGuests : 0;
      } else if (side.includes('gái') || side.includes('bride')) {
        sideBride += isAttending ? numGuests : 0;
      }
    });

    document.getElementById('stat-total-rsvp').textContent = totalRSVPs;
    document.getElementById('stat-total-guests').textContent = totalGuestsCount;
    document.getElementById('stat-attending').textContent = attendingCount;
    document.getElementById('stat-not-attending').textContent = notAttendingCount;
    document.getElementById('stat-side-groom').textContent = sideGroom;
    document.getElementById('stat-side-bride').textContent = sideBride;
  }

  function renderTable(data) {
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;

    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="admin-table-empty">Chưa có khách mời nào phản hồi.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    
    const reversedData = [...data].reverse();

    reversedData.forEach((item, index) => {
      const tr = document.createElement('tr');
      const isAttending = item.attendance === "yes" || item.attendance === "Tham dự";
      
      const attendanceBadge = isAttending 
        ? `<span class="badge badge-success">Có (${item.guests} người)</span>`
        : `<span class="badge badge-danger">Không</span>`;

      const sourceTag = item.isLocal 
        ? `<span style="font-size:0.7rem; color:#856404; background-color:#fff3cd; padding:2px 6px; border-radius:4px; margin-left:8px;">Local</span>`
        : `<span style="font-size:0.7rem; color:#155724; background-color:#d4edd5; padding:2px 6px; border-radius:4px; margin-left:8px;">Live</span>`;

      let actionBtn = '';
      if (item.isLocal) {
        actionBtn = `<button class="btn-admin btn-admin-danger delete-local-btn" data-index="${index}" style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-trash-alt"></i></button>`;
      } else {
        actionBtn = `<span style="color:#999; font-size:0.75rem; font-style:italic;" title="Vui lòng xóa hàng trực tiếp trên file Google Sheets của bạn">Xem Sheet</span>`;
      }

      tr.innerHTML = `
        <td>${item.date || "Ngoại tuyến"}</td>
        <td style="font-weight:700;">${escapeHTML(item.name)} ${sourceTag}</td>
        <td>${escapeHTML(item.phone || "-")}</td>
        <td>${attendanceBadge}</td>
        <td>${escapeHTML(item.side)}</td>
        <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHTML(item.message || '')}">${escapeHTML(item.message || "-")}</td>
        <td>${actionBtn}</td>
      `;

      tableBody.appendChild(tr);
    });

    const deleteBtns = tableBody.querySelectorAll('.delete-local-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const visualIndex = parseInt(btn.getAttribute('data-index'));
        const reversedList = [...rsvpDataList].reverse();
        const targetItem = reversedList[visualIndex];
        
        if (confirm(`Bạn có chắc muốn xóa phản hồi của khách "${targetItem.name}" khỏi dữ liệu Local?`)) {
          deleteLocalRecord(targetItem);
        }
      });
    });
  }

  function deleteLocalRecord(targetItem) {
    let localData = [];
    try {
      localData = JSON.parse(localStorage.getItem('wedding-rsvp-list')) || [];
    } catch(e) {
      localData = [];
    }

    const updatedLocal = localData.filter(item => !(item.name === targetItem.name && item.phone === targetItem.phone));
    localStorage.setItem('wedding-rsvp-list', JSON.stringify(updatedLocal));
    loadDashboardData();
  }

  // --- D. CHỈNH SỬA CẤU HÌNH LIVE EDITOR & PREFILL (TAB 2) ---
  function prefillConfigEditorForm() {
    const config = window.weddingConfig;
    if (!config) return;

    document.getElementById('cfg-music-url').value = config.music_url || '';
    
    // Ngày giờ cưới
    if (config.wedding_date) {
      try {
        const date = new Date(config.wedding_date);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        
        document.getElementById('cfg-wedding-date').value = `${y}-${m}-${d}T${h}:${min}`;
      } catch(err) {
        console.error(err);
      }
    }

    // Chú rể
    document.getElementById('cfg-groom-name').value = config.groom_name || '';
    document.getElementById('cfg-groom-fullname').value = config.groom_fullname || '';
    document.getElementById('cfg-groom-fb').value = config.groom_facebook || '#';
    document.getElementById('cfg-groom-photo').value = config.groom_photo || '';
    document.getElementById('cfg-groom-bio').value = config.groom_bio || '';

    // Cô dâu
    document.getElementById('cfg-bride-name').value = config.bride_name || '';
    document.getElementById('cfg-bride-fullname').value = config.bride_fullname || '';
    document.getElementById('cfg-bride-fb').value = config.bride_facebook || '#';
    document.getElementById('cfg-bride-photo').value = config.bride_photo || '';
    document.getElementById('cfg-bride-bio').value = config.bride_bio || '';

    // Lễ Vu Quy
    document.getElementById('cfg-vuquy-time').value = config.vuquy_time || '';
    document.getElementById('cfg-vuquy-lunar').value = config.vuquy_lunar || '';
    document.getElementById('cfg-vuquy-venue').value = config.vuquy_venue || '';
    document.getElementById('cfg-vuquy-address').value = config.vuquy_address || '';
    document.getElementById('cfg-vuquy-map').value = config.vuquy_map || '';

    // Khởi tạo datetime-local picker cho Lễ Vu Quy
    if (config.vuquy_time) {
      try {
        const date = parseDateFromText(config.vuquy_time, new Date());
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        document.getElementById('cfg-vuquy-time-picker').value = `${y}-${m}-${d}T${h}:${min}`;
      } catch(err) {
        console.error("Lỗi khi parse vuquy_time:", err);
      }
    }

    // Sự kiện khi thay đổi ngày giờ Vu Quy
    const vqPicker = document.getElementById('cfg-vuquy-time-picker');
    if (vqPicker) {
      vqPicker.oninput = () => {
        const val = vqPicker.value;
        if (val) {
          const date = new Date(val);
          // Tự động định dạng lại ngày giờ dương lịch thân thiện
          const formattedDate = formatVietnameseDateString(date);
          document.getElementById('cfg-vuquy-time').value = formattedDate;
          
          // Tự động tính toán ngày âm lịch
          const lunarString = getVietnameseLunarString(date);
          document.getElementById('cfg-vuquy-lunar').value = lunarString;
        } else {
          document.getElementById('cfg-vuquy-time').value = '';
          document.getElementById('cfg-vuquy-lunar').value = '';
        }
      };
    }

    // Lễ Thành Hôn
    document.getElementById('cfg-thanhhon-time').value = config.thanhhon_time || '';
    document.getElementById('cfg-thanhhon-lunar').value = config.thanhhon_lunar || '';
    document.getElementById('cfg-thanhhon-venue').value = config.thanhhon_venue || '';
    document.getElementById('cfg-thanhhon-address').value = config.thanhhon_address || '';
    document.getElementById('cfg-thanhhon-map').value = config.thanhhon_map || '';

    // Khởi tạo datetime-local picker cho Lễ Thành Hôn
    if (config.thanhhon_time) {
      try {
        const date = parseDateFromText(config.thanhhon_time, new Date());
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        document.getElementById('cfg-thanhhon-time-picker').value = `${y}-${m}-${d}T${h}:${min}`;
      } catch(err) {
        console.error("Lỗi khi parse thanhhon_time:", err);
      }
    }

    // Sự kiện khi thay đổi ngày giờ Thành Hôn
    const thPicker = document.getElementById('cfg-thanhhon-time-picker');
    if (thPicker) {
      thPicker.oninput = () => {
        const val = thPicker.value;
        if (val) {
          const date = new Date(val);
          // Tự động định dạng lại ngày giờ dương lịch thân thiện
          const formattedDate = formatVietnameseDateString(date);
          document.getElementById('cfg-thanhhon-time').value = formattedDate;
          
          // Tự động tính toán ngày âm lịch
          const lunarString = getVietnameseLunarString(date);
          document.getElementById('cfg-thanhhon-lunar').value = lunarString;
        } else {
          document.getElementById('cfg-thanhhon-time').value = '';
          document.getElementById('cfg-thanhhon-lunar').value = '';
        }
      };
    }

    // Câu chuyện tình yêu
    document.getElementById('cfg-story-1-date').value = config.story_1_date || '';
    document.getElementById('cfg-story-1-title').value = config.story_1_title || '';
    document.getElementById('cfg-story-1-desc').value = config.story_1_desc || '';

    document.getElementById('cfg-story-2-date').value = config.story_2_date || '';
    document.getElementById('cfg-story-2-title').value = config.story_2_title || '';
    document.getElementById('cfg-story-2-desc').value = config.story_2_desc || '';

    document.getElementById('cfg-story-3-date').value = config.story_3_date || '';
    document.getElementById('cfg-story-3-title').value = config.story_3_title || '';
    document.getElementById('cfg-story-3-desc').value = config.story_3_desc || '';

    document.getElementById('cfg-story-4-date').value = config.story_4_date || '';
    document.getElementById('cfg-story-4-title').value = config.story_4_title || '';
    document.getElementById('cfg-story-4-desc').value = config.story_4_desc || '';

    // Đường dẫn ảnh bìa & Vị trí hiển thị
    document.getElementById('cfg-cover-photo').value = config.cover_photo || '';
    const coverPosEl = document.getElementById('cfg-cover-position');
    if (coverPosEl) coverPosEl.value = config.cover_position || 'center top';
    
    // Khởi tạo và kết xuất ảnh trong album cưới không giới hạn
    renderGalleryEditorItems(config.gallery_images || []);

    // Tự động kết xuất ảnh thumbnail xem trước cho tất cả các thẻ ảnh tĩnh
    const staticImageInputs = ['cfg-groom-photo', 'cfg-bride-photo', 'cfg-cover-photo'];
    
    staticImageInputs.forEach(id => {
      const input = document.getElementById(id);
      const preview = document.getElementById(`preview-${id}`);
      const status = document.getElementById(`status-${id}`);
      if (input && preview) {
        preview.src = input.value || '';
        if (status) {
          if (input.value) {
            status.textContent = "Đang sử dụng";
            status.className = "editor-upload-status success";
          } else {
            status.textContent = "Chưa thiết lập";
            status.className = "editor-upload-status";
          }
        }
      }
    });

    // Lắng nghe thay đổi thủ công trên đường dẫn ảnh tĩnh
    staticImageInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.oninput = null;
        input.addEventListener('input', () => {
          const preview = document.getElementById(`preview-${id}`);
          const status = document.getElementById(`status-${id}`);
          if (preview) preview.src = input.value;
          if (status) {
            if (input.value) {
              status.textContent = "Đang sử dụng";
              status.className = "editor-upload-status success";
            } else {
              status.textContent = "Chưa thiết lập";
              status.className = "editor-upload-status";
            }
          }
        });
      }
    });
  }

  // --- E. KHỞI TẠO TÍNH NĂNG UPLOAD HÌNH ẢNH DYNAMIC VÀ EVENT DELEGATION ---
  
  // Trả về chuỗi HTML đại diện cho một thẻ ảnh cưới trong album editor
  function createGalleryItemHtml(url, category, index) {
    return `
      <div class="editor-image-card gallery-editor-item" style="border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; background-color: rgba(255,255,255,0.02); margin-bottom: 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div class="editor-image-card-title" style="font-weight:700; color:var(--text-secondary); font-size:0.85rem;">Ảnh cưới #${index + 1}</div>
          <button type="button" class="btn-admin btn-admin-danger editor-delete-gallery-item" style="padding:4px 8px; font-size:0.75rem;"><i class="fas fa-trash-alt"></i> Xóa</button>
        </div>
        <div style="display:flex; gap:10px; margin-bottom: 8px;">
          <input type="text" class="editor-control image-path-input gallery-url-input" placeholder="CD ANH/ten-anh.jpg hoặc đường dẫn URL" value="${escapeHTML(url)}" style="flex:1;" required>
          <input type="file" accept="image/*" class="file-uploader-input gallery-file-input" style="display:none;">
          <button type="button" class="btn-admin btn-admin-success file-select-btn" style="white-space:nowrap;"><i class="fas fa-file-image"></i> Chọn file</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap: 15px; flex-wrap: wrap;">
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.8rem; color:var(--text-secondary); margin:0; white-space:nowrap;">Danh mục:</label>
            <select class="editor-control gallery-category-select" style="padding:4px 8px; font-size:0.8rem; border-radius:4px; min-width:120px;">
              <option value="dating" ${category === 'dating' ? 'selected' : ''}>Hình hẹn hò</option>
              <option value="prewedding" ${category === 'prewedding' ? 'selected' : ''}>Pre-Wedding</option>
            </select>
          </div>
          <div class="editor-image-row" style="margin:0; padding:0; background:none; border:none; display:flex; align-items:center; gap:8px;">
            <img class="editor-image-thumb gallery-preview-thumb" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--border-color);" src="${url || ''}" onerror="this.src='';">
            <span class="editor-upload-status gallery-upload-status ${url ? 'success' : ''}" style="font-size:0.75rem;">${url ? 'Đang sử dụng' : 'Chưa thiết lập'}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Kết xuất danh sách ảnh cưới
  function renderGalleryEditorItems(images) {
    const listContainer = document.getElementById('editor-gallery-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (!images || images.length === 0) {
      listContainer.innerHTML = '<div style="text-align:center; color:var(--text-secondary); font-style:italic; padding:20px 0;" class="gallery-empty-msg">Chưa có ảnh cưới nào trong danh sách. Nhấn "Thêm ảnh" để bắt đầu!</div>';
      return;
    }
    
    images.forEach((img, idx) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = createGalleryItemHtml(img.url || '', img.category || 'prewedding', idx);
      const child = tempDiv.firstElementChild;
      listContainer.appendChild(child);
    });
  }

  // Cập nhật lại số thứ tự Ảnh cưới #1, #2, ... khi có thay đổi
  function updateGalleryIndices() {
    const items = document.querySelectorAll('.gallery-editor-item');
    items.forEach((item, idx) => {
      const title = item.querySelector('.editor-image-card-title');
      if (title) {
        title.textContent = `Ảnh cưới #${idx + 1}`;
      }
    });
  }

  // Hàm dùng chung tải ảnh lên Drive / Local Base64 preview
  async function handleImageUpload(file, textInput, previewImg, statusSpan) {
    const reader = new FileReader();
    
    statusSpan.textContent = "Đang chuẩn bị file...";
    statusSpan.className = "editor-upload-status loading";

    reader.onload = async () => {
      const base64Data = reader.result;
      const apiUrl = window.GOOGLE_SHEET_SCRIPT_URL || "";

      if (apiUrl && apiUrl.startsWith('http')) {
        try {
          statusSpan.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lên Drive...';
          
          const payload = {
            action: "uploadFile",
            filename: file.name,
            fileData: base64Data
          };

          const formBody = "payload=" + encodeURIComponent(JSON.stringify(payload));

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
          });

          const result = await response.json();
          if (result.status === 'success' && result.data && result.data.url) {
            textInput.value = result.data.url;
            if (previewImg) previewImg.src = result.data.url;
            statusSpan.textContent = "Đã tải lên Drive thành công!";
            statusSpan.className = "editor-upload-status success";
          } else {
            statusSpan.textContent = "Lỗi: " + result.message;
            statusSpan.className = "editor-upload-status error";
          }
        } catch (err) {
          console.error(err);
          statusSpan.textContent = "Không thể upload, hãy thử lại.";
          statusSpan.className = "editor-upload-status error";
        }
      } else {
        textInput.value = base64Data;
        if (previewImg) previewImg.src = base64Data;
        statusSpan.textContent = "Đã lưu cục bộ (Chờ đồng bộ Drive)";
        statusSpan.className = "editor-upload-status success";
        
        if (file.size > 2000000) {
          alert("Lưu ý: Bạn đang test offline, lưu file dung lượng lớn (>2MB) vào LocalStorage trình duyệt có thể làm đầy bộ nhớ. Khi deploy thật thông qua Google Sheets, ảnh sẽ được đẩy lên Google Drive nên sẽ không giới hạn!");
        }
      }
    };

    reader.readAsDataURL(file);
  }

  function initImageUploaders() {
    // A. Khởi tạo cho các nút tải ảnh tĩnh ngoài gallery list (Groom, Bride, Cover)
    const fileButtons = document.querySelectorAll('.editor-form .file-select-btn');
    
    fileButtons.forEach(btn => {
      if (btn.closest('#editor-gallery-list')) return; // Bỏ qua vì đã xử lý bằng Event Delegation
      
      btn.onclick = null;
      btn.addEventListener('click', (e) => {
        const fileInput = btn.previousElementSibling;
        if (fileInput && fileInput.type === 'file') {
          fileInput.click();
        }
      });
    });

    const fileInputs = document.querySelectorAll('.editor-form .file-uploader-input');
    fileInputs.forEach(input => {
      if (input.closest('#editor-gallery-list')) return;
      
      input.onchange = null;
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const targetId = input.getAttribute('data-target');
        const textInput = document.getElementById(targetId);
        const previewImg = document.getElementById(`preview-${targetId}`);
        const statusSpan = document.getElementById(`status-${targetId}`);

        if (!textInput || !previewImg || !statusSpan) return;

        await handleImageUpload(file, textInput, previewImg, statusSpan);
      });
    });

    // B. Khởi tạo nút "Thêm ảnh mới vào Album"
    const addGalleryBtn = document.getElementById('editor-add-gallery-item');
    if (addGalleryBtn) {
      addGalleryBtn.onclick = null;
      addGalleryBtn.addEventListener('click', () => {
        const listContainer = document.getElementById('editor-gallery-list');
        if (!listContainer) return;
        
        // Xóa thông báo trống
        const emptyMsg = listContainer.querySelector('.gallery-empty-msg');
        if (emptyMsg) {
          listContainer.innerHTML = '';
        }
        
        const itemsCount = listContainer.querySelectorAll('.gallery-editor-item').length;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createGalleryItemHtml('', 'prewedding', itemsCount);
        const child = tempDiv.firstElementChild;
        listContainer.appendChild(child);
        
        // Cuộn xuống ảnh mới tạo
        child.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // C. Đăng ký Event Delegation cho danh sách ảnh cưới dynamic (#editor-gallery-list)
    const galleryList = document.getElementById('editor-gallery-list');
    if (galleryList && !galleryList.dataset.delegated) {
      galleryList.dataset.delegated = "true";

      // 1. Gắn sự kiện click (cho "Chọn file" và "Xóa")
      galleryList.addEventListener('click', (e) => {
        // Nút Chọn file
        const btn = e.target.closest('.file-select-btn');
        if (btn) {
          const fileInput = btn.previousElementSibling;
          if (fileInput && fileInput.type === 'file') {
            fileInput.click();
          }
          return;
        }

        // Nút Xóa ảnh cưới
        const deleteBtn = e.target.closest('.editor-delete-gallery-item');
        if (deleteBtn) {
          const card = deleteBtn.closest('.gallery-editor-item');
          if (card && confirm("Bạn có chắc chắn muốn xóa ảnh cưới này khỏi album thiết lập?")) {
            card.remove();
            updateGalleryIndices();
            
            // Nếu trống, hiển thị lại thông báo trống
            const listContainer = document.getElementById('editor-gallery-list');
            if (listContainer && listContainer.querySelectorAll('.gallery-editor-item').length === 0) {
              listContainer.innerHTML = '<div style="text-align:center; color:var(--text-secondary); font-style:italic; padding:20px 0;" class="gallery-empty-msg">Chưa có ảnh cưới nào trong danh sách. Nhấn "Thêm ảnh" để bắt đầu!</div>';
            }
          }
        }
      });

      // 2. Gắn sự kiện thay đổi file chọn tải lên
      galleryList.addEventListener('change', async (e) => {
        if (e.target.classList.contains('gallery-file-input')) {
          const file = e.target.files[0];
          if (!file) return;
          
          const card = e.target.closest('.gallery-editor-item');
          if (!card) return;
          
          const urlInput = card.querySelector('.gallery-url-input');
          const previewImg = card.querySelector('.gallery-preview-thumb');
          const statusSpan = card.querySelector('.gallery-upload-status');
          
          await handleImageUpload(file, urlInput, previewImg, statusSpan);
        }
      });

      // 3. Gắn sự kiện thay đổi tay văn bản trong input
      galleryList.addEventListener('input', (e) => {
        if (e.target.classList.contains('gallery-url-input')) {
          const card = e.target.closest('.gallery-editor-item');
          if (!card) return;
          
          const previewImg = card.querySelector('.gallery-preview-thumb');
          const statusSpan = card.querySelector('.gallery-upload-status');
          const val = e.target.value.trim();
          
          if (previewImg) {
            previewImg.src = val;
          }
          
          if (statusSpan) {
            if (val) {
              statusSpan.textContent = "Đang sử dụng";
              statusSpan.className = "editor-upload-status gallery-upload-status success";
            } else {
              statusSpan.textContent = "Chưa thiết lập";
              statusSpan.className = "editor-upload-status gallery-upload-status";
            }
          }
        }
      });
    }
  }

  // --- F. GỬI LƯU CẤU HÌNH SỬA ĐỔI ---
  if (configForm) {
    configForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (editorLoading) editorLoading.style.display = 'flex';
      const submitBtn = configForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const rawDate = document.getElementById('cfg-wedding-date').value;
      let isoDate = window.weddingConfig.wedding_date;
      if (rawDate) {
        isoDate = new Date(rawDate).toISOString();
      } else {
        // Tự động đồng bộ trường wedding_date bằng cách trích xuất từ cfg-thanhhon-time
        const thanhhonVal = document.getElementById('cfg-thanhhon-time').value;
        const parsedDate = parseDateFromText(thanhhonVal, new Date());
        isoDate = parsedDate.toISOString();
      }

      // Thu thập thông tin cấu hình mới
      const updatedConfig = {
        config_version: DEFAULT_WEDDING_CONFIG.config_version,
        wedding_date: isoDate,
        music_url: document.getElementById('cfg-music-url').value.trim(),
        
        groom_name: document.getElementById('cfg-groom-name').value.trim(),
        groom_fullname: document.getElementById('cfg-groom-fullname').value.trim(),
        groom_photo: document.getElementById('cfg-groom-photo').value.trim(),
        groom_bio: document.getElementById('cfg-groom-bio').value.trim(),
        groom_facebook: document.getElementById('cfg-groom-fb').value.trim(),
        groom_instagram: '#',

        bride_name: document.getElementById('cfg-bride-name').value.trim(),
        bride_fullname: document.getElementById('cfg-bride-fullname').value.trim(),
        bride_photo: document.getElementById('cfg-bride-photo').value.trim(),
        bride_bio: document.getElementById('cfg-bride-bio').value.trim(),
        bride_facebook: document.getElementById('cfg-bride-fb').value.trim(),
        bride_instagram: '#',

        vuquy_time: document.getElementById('cfg-vuquy-time').value.trim(),
        vuquy_lunar: document.getElementById('cfg-vuquy-lunar').value.trim(),
        vuquy_venue: document.getElementById('cfg-vuquy-venue').value.trim(),
        vuquy_address: document.getElementById('cfg-vuquy-address').value.trim(),
        vuquy_map: document.getElementById('cfg-vuquy-map').value.trim(),
        vuquy_calendar: window.weddingConfig.vuquy_calendar || '',

        thanhhon_time: document.getElementById('cfg-thanhhon-time').value.trim(),
        thanhhon_lunar: document.getElementById('cfg-thanhhon-lunar').value.trim(),
        thanhhon_venue: document.getElementById('cfg-thanhhon-venue').value.trim(),
        thanhhon_address: document.getElementById('cfg-thanhhon-address').value.trim(),
        thanhhon_map: document.getElementById('cfg-thanhhon-map').value.trim(),
        thanhhon_calendar: window.weddingConfig.thanhhon_calendar || '',

        story_1_date: document.getElementById('cfg-story-1-date').value.trim(),
        story_1_title: document.getElementById('cfg-story-1-title').value.trim(),
        story_1_desc: document.getElementById('cfg-story-1-desc').value.trim(),

        story_2_date: document.getElementById('cfg-story-2-date').value.trim(),
        story_2_title: document.getElementById('cfg-story-2-title').value.trim(),
        story_2_desc: document.getElementById('cfg-story-2-desc').value.trim(),

        story_3_date: document.getElementById('cfg-story-3-date').value.trim(),
        story_3_title: document.getElementById('cfg-story-3-title').value.trim(),
        story_3_desc: document.getElementById('cfg-story-3-desc').value.trim(),

        story_4_date: document.getElementById('cfg-story-4-date').value.trim(),
        story_4_title: document.getElementById('cfg-story-4-title').value.trim(),
        story_4_desc: document.getElementById('cfg-story-4-desc').value.trim(),

        cover_photo: document.getElementById('cfg-cover-photo').value.trim(),
        cover_position: document.getElementById('cfg-cover-position') ? document.getElementById('cfg-cover-position').value : 'center top'
      };

      // Xây dựng mảng gallery_images từ các thẻ ảnh cưới động
      const galleryItems = document.querySelectorAll('.gallery-editor-item');
      const galleryImagesArray = [];
      
      galleryItems.forEach(item => {
        const url = item.querySelector('.gallery-url-input').value.trim();
        const category = item.querySelector('.gallery-category-select').value;
        if (url) {
          galleryImagesArray.push({ url, category });
        }
      });
      
      // Đồng bộ mảng gallery_images dưới dạng chuỗi JSON
      updatedConfig.gallery_images = JSON.stringify(galleryImagesArray);

      // 1. Lưu Local
      localStorage.setItem('wedding-saved-config', JSON.stringify(updatedConfig));

      // 2. Đồng bộ Google Sheets
      let liveSuccess = false;
      const apiUrl = window.GOOGLE_SHEET_SCRIPT_URL || "";
      
      if (apiUrl && apiUrl.startsWith('http')) {
        try {
          const payload = {
            action: "saveConfig",
            config: updatedConfig
          };

          const formBody = "payload=" + encodeURIComponent(JSON.stringify(payload));

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
          });

          const result = await response.json();
          if (result.status === 'success') {
            liveSuccess = true;
          } else {
            console.error("Lỗi đồng bộ Google Sheets:", result.message);
          }
        } catch(err) {
          console.error("Lỗi kết nối:", err);
        }
      }

      if (editorLoading) editorLoading.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;

      if (liveSuccess) {
        alert("Đồng bộ cấu hình thành công lên Google Sheets! Trang web sẽ tự động tải lại.");
      } else {
        alert("Lưu cấu hình thành công cục bộ (Demo Offline)! Trang web sẽ tải lại.");
      }

      location.reload();
    });
  }

  // --- G. CÁC THAO TÁC RSVP DATA ---
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (rsvpDataList.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
      }

      let csvContent = "Thời gian,Họ và Tên,Số điện thoại,Trạng thái tham dự,Bên khách mời,Số lượng đi cùng,Lời chúc\n";
      
      rsvpDataList.forEach(item => {
        const isAttending = item.attendance === "yes" || item.attendance === "Tham dự";
        const attText = isAttending ? "Tham dự" : "Không tham dự";
        
        const safeName = `"${(item.name || '').replace(/"/g, '""')}"`;
        const safePhone = `"${(item.phone || '').replace(/"/g, '""')}"`;
        const safeSide = `"${(item.side || '').replace(/"/g, '""')}"`;
        const safeMsg = `"${(item.message || '').replace(/"/g, '""')}"`;
        const safeDate = `"${(item.date || '').replace(/"/g, '""')}"`;
        
        csvContent += `${safeDate},${safeName},${safePhone},${attText},${safeSide},${item.guests || 1},${safeMsg}\n`;
      });

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
      link.setAttribute("download", `DanhSachKhachCuoi_${dateStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  const btnCopyConfig = document.getElementById('admin-copy-config');
  if (btnCopyConfig) {
    btnCopyConfig.addEventListener('click', () => {
      const localData = localStorage.getItem('wedding-saved-config');
      if (localData) {
        navigator.clipboard.writeText(localData).then(() => {
          alert("Đã sao chép dữ liệu cấu hình chuẩn của bạn vào Clipboard!\nHãy Dán (Ctrl+V hoặc dán trên điện thoại) chuỗi ký tự này gửi vào ô chat với AI để tôi lưu vĩnh viễn dữ liệu này vào file code cho bạn nhé!");
        }).catch(err => {
          console.error("Lỗi copy:", err);
          prompt("Vui lòng bôi đen và sao chép (Ctrl+C) toàn bộ văn bản dưới đây để gửi cho AI:", localData);
        });
      } else {
        alert("Chưa tìm thấy dữ liệu cấu hình mới nào được lưu trong trình duyệt này. Bạn hãy thiết lập thông tin ở Tab 2, nhấn 'Lưu Thiết Lập Thiệp' trước nhé!");
      }
    });
  }

  if (btnClearLocal) {
    btnClearLocal.addEventListener('click', () => {
      if (confirm("Hành động này sẽ XÓA SẠCH toàn bộ dữ liệu RSVP và thiết lập thiệp cưới lưu cục bộ trên trình duyệt này. Bản ghi trên Google Sheets sẽ giữ nguyên. Bạn có đồng ý?")) {
        localStorage.removeItem('wedding-rsvp-list');
        localStorage.removeItem('wedding-saved-config');
        alert("Đã làm sạch dữ liệu!");
        location.reload();
      }
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadDashboardData();
    });
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
});
