/**
 * code.gs
 * Google Apps Script - Backend Controller, API Endpoints, and Safe Data Handling
 * Personal Branding Portfolio: Archana (Graphic Design, Vibe Coding, Copywriting)
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle("Archana | Graphic Designer, Vibe Coder & Copywriter")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Modular include helper for HTML templating
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Helper to get active spreadsheet safely
 */
function getSS() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Helper to read sheet display values safely
 * Returns array of objects keyed by header names
 */
function readSheetAsObjects(sheetName) {
  var ss = getSS();
  if (!ss) return [];
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  var displayValues = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
  var headers = displayValues[0];
  var results = [];

  for (var r = 1; r < displayValues.length; r++) {
    var row = displayValues[r];
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var header = headers[c];
      obj[header] = row[c] !== undefined ? String(row[c]) : "";
    }
    results.push(obj);
  }
  return results;
}

/**
 * Initial payload to power initial app load without multiple roundtrips
 */
function getAllAppData() {
  try {
    var profileObj = getProfileConfig();
    var services = readSheetAsObjects("Services");
    var process = readSheetAsObjects("Process");
    var portfolioResponse = getPortfolioData("All", 1, 6, "");
    var blogResponse = getBlogData("All", 1, 6, "");
    var testimonials = readSheetAsObjects("Testimonials");
    var clients = readSheetAsObjects("Clients");

    return {
      success: true,
      data: {
        profile: profileObj,
        services: services,
        process: process,
        portfolio: portfolioResponse,
        blogs: blogResponse,
        testimonials: testimonials,
        clients: clients
      }
    };
  } catch (err) {
    Logger.log("Error in getAllAppData: " + err.toString());
    return {
      success: false,
      message: err.toString()
    };
  }
}

/**
 * Read Profile Key-Value configurations
 */
function getProfileConfig() {
  var ss = getSS();
  if (!ss) return {};
  var sheet = ss.getSheetByName("Profile");
  if (!sheet) return {};

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};

  var data = sheet.getRange(1, 1, lastRow, 2).getDisplayValues();
  var config = {};
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var val = String(data[i][1]).trim();
    if (key) {
      config[key] = val;
    }
  }
  return config;
}

/**
 * Verify admin password or PIN
 */
function verifyAdminPassword(password) {
  try {
    var config = getProfileConfig();
    var adminPin = config["AdminPIN"] || "archana123";
    if (String(password).trim() === adminPin) {
      return { success: true, message: "Authentication successful." };
    }
    return { success: false, message: "Invalid credentials." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Update Profile Key-Value settings
 */
function updateProfileConfig(configObj) {
  try {
    var ss = getSS();
    var sheet = ss.getSheetByName("Profile");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("Profile");
    }

    var lastRow = sheet.getLastRow();
    var existingKeys = {};
    if (lastRow > 1) {
      var data = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < data.length; i++) {
        var k = String(data[i][0]).trim();
        if (k) existingKeys[k] = i + 2; // Row index (1-based)
      }
    }

    for (var key in configObj) {
      if (configObj.hasOwnProperty(key)) {
        var cleanKey = String(key).trim();
        var cleanVal = String(configObj[key]);

        if (existingKeys[cleanKey]) {
          sheet.getRange(existingKeys[cleanKey], 2).setValue(cleanVal);
        } else {
          sheet.appendRow([cleanKey, cleanVal]);
          existingKeys[cleanKey] = sheet.getLastRow();
        }
      }
    }

    SpreadsheetApp.flush();
    return { success: true, message: "Profile updated successfully." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Server-Side Pagination & Backend Filtering for Portfolio
 */
function getPortfolioData(category, page, pageSize, searchKeyword) {
  try {
    var rawList = readSheetAsObjects("Portfolio");
    var catFilter = String(category || "All").trim();
    var keyword = String(searchKeyword || "").trim().toLowerCase();
    var pageNum = Math.max(1, parseInt(page, 10) || 1);
    var size = Math.max(1, parseInt(pageSize, 10) || 6);

    // Filter by Category and Search Keyword
    var filtered = rawList.filter(function(item) {
      var matchCat = (catFilter === "All" || item.Category === catFilter);
      var matchSearch = true;
      if (keyword) {
        var titleMatch = (item.Title || "").toLowerCase().indexOf(keyword) !== -1;
        var summaryMatch = (item.Summary || "").toLowerCase().indexOf(keyword) !== -1;
        var detailMatch = (item.DetailContent || "").toLowerCase().indexOf(keyword) !== -1;
        matchSearch = titleMatch || summaryMatch || detailMatch;
      }
      return matchCat && matchSearch;
    });

    // Sort by SortOrder (ascending)
    filtered.sort(function(a, b) {
      var sortA = parseInt(a.SortOrder, 10) || 999;
      var sortB = parseInt(b.SortOrder, 10) || 999;
      return sortA - sortB;
    });

    var totalItems = filtered.length;
    var totalPages = Math.ceil(totalItems / size) || 1;
    var startIndex = (pageNum - 1) * size;
    var paginatedItems = filtered.slice(startIndex, startIndex + size);

    return {
      success: true,
      items: paginatedItems,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: pageNum,
      category: catFilter
    };
  } catch (err) {
    return { success: false, items: [], totalItems: 0, totalPages: 1, currentPage: 1, message: err.toString() };
  }
}

/**
 * Server-Side Pagination & Backend Filtering for Blog
 */
function getBlogData(category, page, pageSize, searchKeyword) {
  try {
    var rawList = readSheetAsObjects("Blogs");
    var catFilter = String(category || "All").trim();
    var keyword = String(searchKeyword || "").trim().toLowerCase();
    var pageNum = Math.max(1, parseInt(page, 10) || 1);
    var size = Math.max(1, parseInt(pageSize, 10) || 6);

    var filtered = rawList.filter(function(item) {
      var matchCat = (catFilter === "All" || item.Category === catFilter);
      var matchSearch = true;
      if (keyword) {
        var titleMatch = (item.Title || "").toLowerCase().indexOf(keyword) !== -1;
        var excerptMatch = (item.Excerpt || "").toLowerCase().indexOf(keyword) !== -1;
        matchSearch = titleMatch || excerptMatch;
      }
      return matchCat && matchSearch;
    });

    var totalItems = filtered.length;
    var totalPages = Math.ceil(totalItems / size) || 1;
    var startIndex = (pageNum - 1) * size;
    var paginatedItems = filtered.slice(startIndex, startIndex + size);

    return {
      success: true,
      items: paginatedItems,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: pageNum,
      category: catFilter
    };
  } catch (err) {
    return { success: false, items: [], totalItems: 0, totalPages: 1, currentPage: 1, message: err.toString() };
  }
}

/**
 * Generate sequential message ID with daily reset: MSG-YYYYMMDD-0001
 */
function generateSequentialMessageId() {
  var ss = getSS();
  var sheet = ss.getSheetByName("Messages");
  var timeZone = Session.getScriptTimeZone() || "GMT+7";
  var todayDateStr = Utilities.formatDate(new Date(), timeZone, "yyyyMMdd");
  var prefix = "MSG-" + todayDateStr + "-";

  if (!sheet || sheet.getLastRow() <= 1) {
    return prefix + "0001";
  }

  var lastRow = sheet.getLastRow();
  var idCol = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  var maxSeq = 0;

  for (var i = 0; i < idCol.length; i++) {
    var currentId = String(idCol[i][0]).trim();
    if (currentId.indexOf(prefix) === 0) {
      var numPart = parseInt(currentId.substring(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  var nextSeq = maxSeq + 1;
  var seqStr = String(nextSeq);
  while (seqStr.length < 4) {
    seqStr = "0" + seqStr;
  }
  return prefix + seqStr;
}

/**
 * Submit Contact Message
 */
function submitContactMessage(msgData) {
  try {
    var ss = getSS();
    var sheet = ss.getSheetByName("Messages");
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName("Messages");
    }

    var messageId = generateSequentialMessageId();
    var timeZone = Session.getScriptTimeZone() || "GMT+7";
    var timestamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");

    var senderName = String(msgData.SenderName || "").trim();
    var senderEmail = String(msgData.SenderEmail || "").trim();
    var subject = String(msgData.Subject || "").trim();
    var messageText = String(msgData.MessageText || "").trim();
    var status = "New";

    if (!senderName || !senderEmail || !messageText) {
      return { success: false, message: "Please fill in all required fields." };
    }

    sheet.appendRow([messageId, timestamp, senderName, senderEmail, subject, messageText, status]);
    SpreadsheetApp.flush();

    return {
      success: true,
      message: "Your message has been sent successfully! Reference ID: " + messageId,
      messageId: messageId
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Get Messages List for Admin CMS
 */
function getMessagesList(page, pageSize) {
  try {
    var raw = readSheetAsObjects("Messages");
    raw.reverse(); // newest first
    var pageNum = Math.max(1, parseInt(page, 10) || 1);
    var size = Math.max(1, parseInt(pageSize, 10) || 10);

    var totalItems = raw.length;
    var totalPages = Math.ceil(totalItems / size) || 1;
    var startIndex = (pageNum - 1) * size;
    var paginated = raw.slice(startIndex, startIndex + size);

    return {
      success: true,
      items: paginated,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: pageNum
    };
  } catch (err) {
    return { success: false, items: [], totalItems: 0, totalPages: 1, currentPage: 1, message: err.toString() };
  }
}

/**
 * Update message status (e.g. Read, Replied, Archived)
 */
function updateMessageStatus(messageId, status) {
  return updateRowField("Messages", "MessageID", messageId, "Status", status);
}

/**
 * Generic Upsert (Insert or Update) function
 */
function upsertItem(sheetName, idField, itemData, requiredFields) {
  try {
    var ss = getSS();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName(sheetName);
    }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    var idColIdx = headers.indexOf(idField);

    if (idColIdx === -1) {
      return { success: false, message: "ID field " + idField + " not found in sheet " + sheetName };
    }

    var targetId = String(itemData[idField] || "").trim();
    var existingRowIdx = -1;

    if (lastRow > 1 && targetId) {
      var idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getDisplayValues();
      for (var r = 0; r < idValues.length; r++) {
        if (String(idValues[r][0]).trim() === targetId) {
          existingRowIdx = r + 2;
          break;
        }
      }
    }

    // If new item, generate ID if not supplied
    if (existingRowIdx === -1 && !targetId) {
      var prefix = sheetName.substring(0, 3).toUpperCase();
      targetId = prefix + "-" + Utilities.formatDate(new Date(), "GMT", "yyyyMMdd-HHmmss");
      itemData[idField] = targetId;
    }

    // Build row values according to headers order
    var rowData = [];
    for (var c = 0; c < headers.length; c++) {
      var h = headers[c];
      var val = itemData[h] !== undefined ? String(itemData[h]) : "";
      rowData.push(val);
    }

    if (existingRowIdx !== -1) {
      // Update existing row
      sheet.getRange(existingRowIdx, 1, 1, headers.length).setValues([rowData]);
    } else {
      // Insert new row
      sheet.appendRow(rowData);
    }

    SpreadsheetApp.flush();
    return { success: true, message: "Data saved successfully.", id: targetId };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Generic Delete row by ID
 */
function deleteItem(sheetName, idField, targetId) {
  try {
    var ss = getSS();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, message: "Sheet not found." };

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return { success: false, message: "No data found." };

    var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    var idColIdx = headers.indexOf(idField);
    if (idColIdx === -1) return { success: false, message: "ID field not found." };

    var idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getDisplayValues();
    var rowToDelete = -1;
    for (var r = 0; r < idValues.length; r++) {
      if (String(idValues[r][0]).trim() === String(targetId).trim()) {
        rowToDelete = r + 2;
        break;
      }
    }

    if (rowToDelete !== -1) {
      sheet.deleteRow(rowToDelete);
      SpreadsheetApp.flush();
      return { success: true, message: "Item deleted successfully." };
    }
    return { success: false, message: "Item not found." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Generic helper to update a single field in a row
 */
function updateRowField(sheetName, idField, targetId, fieldName, newValue) {
  try {
    var ss = getSS();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, message: "Sheet not found." };

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return { success: false, message: "No data found." };

    var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    var idColIdx = headers.indexOf(idField);
    var targetColIdx = headers.indexOf(fieldName);
    if (idColIdx === -1 || targetColIdx === -1) return { success: false, message: "Column not found." };

    var idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getDisplayValues();
    var targetRowIdx = -1;
    for (var r = 0; r < idValues.length; r++) {
      if (String(idValues[r][0]).trim() === String(targetId).trim()) {
        targetRowIdx = r + 2;
        break;
      }
    }

    if (targetRowIdx !== -1) {
      sheet.getRange(targetRowIdx, targetColIdx + 1).setValue(String(newValue));
      SpreadsheetApp.flush();
      return { success: true, message: "Updated successfully." };
    }
    return { success: false, message: "Item not found." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Specific CRUD Wrappers
function savePortfolioItem(item) {
  return upsertItem("Portfolio", "PortfolioID", item);
}
function deletePortfolioItem(id) {
  return deleteItem("Portfolio", "PortfolioID", id);
}

function saveBlogItem(item) {
  return upsertItem("Blogs", "BlogID", item);
}
function deleteBlogItem(id) {
  return deleteItem("Blogs", "BlogID", id);
}

function saveServiceItem(item) {
  return upsertItem("Services", "ServiceID", item);
}
function deleteServiceItem(id) {
  return deleteItem("Services", "ServiceID", id);
}

function saveProcessItem(item) {
  return upsertItem("Process", "ProcessID", item);
}
function deleteProcessItem(id) {
  return deleteItem("Process", "ProcessID", id);
}

function saveTestimonialItem(item) {
  return upsertItem("Testimonials", "TestimonialID", item);
}
function deleteTestimonialItem(id) {
  return deleteItem("Testimonials", "TestimonialID", id);
}

function saveClientItem(item) {
  return upsertItem("Clients", "ClientID", item);
}
function deleteClientItem(id) {
  return deleteItem("Clients", "ClientID", id);
}

/**
 * Upload image directly to Google Drive and return direct web CDN URL
 * Dedicated folder: "Archana_Portfolio_Assets"
 */
function uploadImageToDrive(base64Data, fileName, mimeType) {
  try {
    if (!base64Data) {
      return { success: false, message: "Tidak ada data gambar yang dikirim." };
    }

    var folderName = "Archana_Portfolio_Assets";
    var folders = DriveApp.getFoldersByName(folderName);
    var targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
      try {
        targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (folderErr) {
        Logger.log("Folder sharing notice: " + folderErr.toString());
      }
    }

    var cleanBase64 = String(base64Data);
    var detectedMime = mimeType || "image/jpeg";
    if (cleanBase64.indexOf("data:") === 0 && cleanBase64.indexOf(";base64,") !== -1) {
      var parts = cleanBase64.split(";base64,");
      detectedMime = parts[0].replace("data:", "");
      cleanBase64 = parts[1];
    } else if (cleanBase64.indexOf("base64,") !== -1) {
      cleanBase64 = cleanBase64.split("base64,")[1];
    }

    var decoded = Utilities.base64Decode(cleanBase64);
    var safeFileName = fileName ? String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_") : ("img_" + new Date().getTime() + ".jpg");
    var blob = Utilities.newBlob(decoded, detectedMime, safeFileName);

    var file = targetFolder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (fileErr) {
      Logger.log("File sharing notice: " + fileErr.toString());
    }

    var fileId = file.getId();
    var directUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200";

    return {
      success: true,
      url: directUrl,
      fileId: fileId,
      fileName: safeFileName,
      message: "Gambar berhasil diunggah ke Google Drive."
    };
  } catch (err) {
    Logger.log("Error in uploadImageToDrive: " + err.toString());
    return {
      success: false,
      message: "Gagal mengunggah gambar: " + err.toString()
    };
  }
}
