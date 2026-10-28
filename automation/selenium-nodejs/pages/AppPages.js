const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.welcomeBadge = '[data-testid="welcome-badge"]';
    this.scanSummaryCard = '[data-testid="scan-summary-card"]';
    this.quickScanBtn = '[data-testid="quick-scan-btn"]';
    this.breedLibraryBtn = '[data-testid="breed-library-btn"]';
    this.recordsBtn = '[data-testid="records-btn"]';
    this.analyticsBtn = '[data-testid="analytics-btn"]';
    this.searchBar = 'input[placeholder*="Search"]';
  }

  async open() {
    return await this.navigate('home');
  }
}

class ScannerPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.cameraView = '[data-testid="camera-view"]';
    this.captureBtn = '[data-testid="capture-btn"]';
    this.galleryUploadBtn = '[data-testid="gallery-upload-btn"]';
    this.confidenceMeter = '[data-testid="confidence-meter"]';
  }

  async open() {
    return await this.navigate('scanner');
  }
}

class RecordsPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.recordsList = '[data-testid="records-list"]';
    this.exportExcelBtn = '[data-testid="export-excel-btn"]';
    this.filterDropdown = '[data-testid="filter-dropdown"]';
  }

  async open() {
    return await this.navigate('records');
  }
}

class BreedDetailPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.breedTitle = '[data-testid="breed-title"]';
    this.originText = '[data-testid="origin-text"]';
    this.milkYieldText = '[data-testid="milk-yield"]';
    this.audioNarrationBtn = '[data-testid="audio-narration-btn"]';
    this.youtubeVideosList = '[data-testid="youtube-videos-list"]';
  }

  async open(breedName = 'Gir') {
    return await this.navigate(`breed-detail?breed=${encodeURIComponent(breedName)}`);
  }
}

class ProfilePage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.officerName = '[data-testid="officer-name"]';
    this.officerRole = '[data-testid="officer-role"]';
    this.logoutBtn = '[data-testid="logout-btn"]';
    this.syncStatus = '[data-testid="sync-status"]';
  }

  async open() {
    return await this.navigate('profile');
  }
}

module.exports = {
  HomePage,
  ScannerPage,
  RecordsPage,
  BreedDetailPage,
  ProfilePage
};
