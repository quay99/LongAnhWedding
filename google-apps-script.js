/**
 * GOOGLE APPS SCRIPT FOR WEDDING RSVP, GUESTBOOK & CONFIGURATION EDITOR
 * 
 * Hướng dẫn sử dụng:
 * 1. Truy cập https://sheet.new để tạo một trang tính Google Sheet mới.
 * 2. Đặt tên cho trang tính (ví dụ: "Danh Sách Khách Cưới 2026").
 * 3. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa hết code mặc định trong file `Mã.gs` (Code.gs) và dán toàn bộ đoạn code này vào.
 * 5. Nhấn nút Lưu (Save - biểu tượng đĩa mềm).
 * 6. Nhấn nút Triển khai (Deploy) -> Triển khai mới (New deployment).
 * 7. Chọn loại cấu hình là "Ứng dụng web" (Web app) bằng cách click vào biểu tượng bánh răng cạnh "Chọn loại".
 * 8. Điền thông tin:
 *    - Mô tả: "Wedding RSVP, Editor & Uploader API"
 *    - Thực thi dưới danh nghĩa: "Tôi" (Your email)
 *    - Ai có quyền truy cập: "Bất kỳ ai" (Anyone - Rất quan trọng)
 * 9. Nhấn Triển khai (Deploy). Google sẽ hỏi cấp quyền truy cập tài khoản trang tính của bạn, chọn "Cấp quyền truy cập" (Authorize Access) và làm theo hướng dẫn (nếu có cảnh báo bảo mật, nhấn Advanced -> Go to ... (unsafe) để tiếp tục).
 * 10. Copy URL của Web App nhận được và dán vào biến `GOOGLE_SHEET_SCRIPT_URL` trong file `js/script.js` trên website của bạn.
 */

function doGet(e) {
  try {
    // A. LẤY CẤU HÌNH TRANG WEB (GET CONFIGURATION)
    if (e && e.parameter && e.parameter.config === "true") {
      const configSheet = getSheet("Config");
      const configData = configSheet.getDataRange().getValues();
      const configObj = {};
      
      if (configData.length > 1) {
        for (let i = 1; i < configData.length; i++) {
          const key = configData[i][0];
          const val = configData[i][1];
          if (key) {
            configObj[key] = val;
          }
        }
      }
      return createJsonResponse({ status: "success", data: configObj });
    }
    
    // B. LẤY DANH SÁCH RSVP KHÁCH MỜI
    const rsvpSheet = getSheet("RSVP");
    const rsvpData = rsvpSheet.getDataRange().getValues();
    
    if (rsvpData.length <= 1) {
      return createJsonResponse({ status: "success", data: [] });
    }
    
    const headers = rsvpData[0];
    const isAdmin = e && e.parameter && e.parameter.admin === "true";
    const resultRows = [];
    
    const nameIndex = headers.indexOf("Họ và Tên");
    const phoneIndex = headers.indexOf("Số điện thoại");
    const attIndex = headers.indexOf("Xác nhận tham dự");
    const sideIndex = headers.indexOf("Bên khách");
    const guestIndex = headers.indexOf("Số người đi cùng");
    const msgIndex = headers.indexOf("Lời chúc");
    const dateIndex = headers.indexOf("Thời gian");
    
    for (let i = 1; i < rsvpData.length; i++) {
      const row = rsvpData[i];
      const name = nameIndex !== -1 ? row[nameIndex] : "";
      const phone = phoneIndex !== -1 ? row[phoneIndex] : "";
      const att = attIndex !== -1 ? row[attIndex] : "";
      const side = sideIndex !== -1 ? row[sideIndex] : "";
      const guests = guestIndex !== -1 ? row[guestIndex] : "1";
      const msg = msgIndex !== -1 ? row[msgIndex] : "";
      const date = dateIndex !== -1 ? row[dateIndex] : "";
      
      if (isAdmin) {
        resultRows.push({
          date: date ? formatDate(new Date(date)) : "",
          name: name,
          phone: phone,
          attendance: att === "Tham dự" ? "yes" : "no",
          side: side,
          guests: guests,
          message: msg
        });
      } else {
        if (msg && msg.toString().trim() !== "") {
          resultRows.push({
            name: name,
            side: side,
            message: msg,
            date: date ? formatDate(new Date(date)) : ""
          });
        }
      }
    }
    
    if (!isAdmin) {
      resultRows.reverse();
    }
    
    return createJsonResponse({ status: "success", data: resultRows });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function doPost(e) {
  try {
    let params;
    
    if (e.postData && e.postData.type === "application/json") {
      params = JSON.parse(e.postData.contents);
    } else {
      params = e.parameter;
      if (params.payload) {
        params = JSON.parse(params.payload);
      }
    }
    
    // A. LƯU CẤU HÌNH TRANG WEB (SAVE CONFIGURATION)
    if (params.action === "saveConfig" && params.config) {
      const configSheet = getSheet("Config");
      
      configSheet.clear();
      
      configSheet.appendRow(["Key", "Value"]);
      const headerRange = configSheet.getRange(1, 1, 1, 2);
      headerRange.setFontWeight("bold");
      headerRange.setBackgroundColor("#D4AF37");
      headerRange.setFontColor("#FFFFFF");
      configSheet.setFrozenRows(1);
      
      const configObj = params.config;
      const rows = [];
      
      for (let key in configObj) {
        if (configObj.hasOwnProperty(key)) {
          rows.push([key, configObj[key].toString()]);
        }
      }
      
      if (rows.length > 0) {
        configSheet.getRange(2, 1, rows.length, 2).setValues(rows);
      }
      
      configSheet.autoResizeColumns(1, 2);
      
      return createJsonResponse({ status: "success", message: "Lưu cấu hình website thành công!" });
    }
    
    // B. UPLOAD HÌNH ẢNH LÊN GOOGLE DRIVE (FILE UPLOAD)
    if (params.action === "uploadFile" && params.fileData && params.filename) {
      const base64Data = params.fileData.split(",")[1] || params.fileData;
      const contentType = params.fileData.split(";")[0].split(":")[1] || "image/jpeg";
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, params.filename);
      
      // Lấy hoặc Tạo thư mục "Wedding Website Images"
      let folder;
      const folders = DriveApp.getFoldersByName("Wedding Website Images");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("Wedding Website Images");
      }
      
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Đường dẫn trực tiếp của ảnh tải lên Google Drive
      const fileId = file.getId();
      const directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      
      return createJsonResponse({ 
        status: "success", 
        message: "Upload file thành công!", 
        data: { url: directUrl } 
      });
    }
    
    // C. LƯU THÔNG TIN ĐĂNG KÝ RSVP MẶC ĐỊNH
    const rsvpSheet = getSheet("RSVP");
    const name = params.name || "";
    const phone = params.phone || "";
    const attendance = params.attendance || "";
    const side = params.side || "";
    const guests = params.guests || "1";
    const message = params.message || "";
    const timestamp = new Date();
    
    if (!name) {
      return createJsonResponse({ status: "error", message: "Họ và tên là bắt buộc!" });
    }
    
    rsvpSheet.appendRow([
      timestamp,
      name,
      phone,
      attendance === "yes" ? "Tham dự" : "Không tham dự",
      side,
      guests,
      message
    ]);
    
    return createJsonResponse({ 
      status: "success", 
      message: "Xác nhận RSVP thành công!",
      data: {
        name: name,
        side: side,
        message: message,
        date: formatDate(timestamp)
      }
    });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    
    if (name === "RSVP") {
      sheet.appendRow([
        "Thời gian",
        "Họ và Tên",
        "Số điện thoại",
        "Xác nhận tham dự",
        "Bên khách",
        "Số người đi cùng",
        "Lời chúc"
      ]);
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackgroundColor("#F5E6E8");
      headerRange.setFontColor("#2C2C2C");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 7);
    } else if (name === "Config") {
      sheet.appendRow(["Key", "Value"]);
      const headerRange = sheet.getRange(1, 1, 1, 2);
      headerRange.setFontWeight("bold");
      headerRange.setBackgroundColor("#D4AF37");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 2);
    }
  }
  return sheet;
}

function formatDate(date) {
  try {
    return Utilities.formatDate(date, "GMT+7", "dd/MM/yyyy HH:mm");
  } catch (e) {
    return date.toLocaleString();
  }
}

function createJsonResponse(data) {
  const jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}
