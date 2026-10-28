class MobileBasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async findElement(locator) {
    return true;
  }

  async click(locator) {
    return true;
  }

  async sendKeys(locator, text) {
    return true;
  }

  async takeScreenshot(name) {
    return `mobile_screenshot_${Date.now()}_${name}.png`;
  }
}

class MobileLoginPage extends MobileBasePage {
  constructor(driver) {
    super(driver);
    this.emailField = '~email-input, //android.widget.EditText[@content-desc="email-input"]';
    this.passwordField = '~password-input, //android.widget.EditText[@content-desc="password-input"]';
    this.loginBtn = '~login-btn, //android.widget.Button[@content-desc="login-btn"]';
    this.googleBtn = '~google-signin-btn';
    this.demoBtn = '~demo-officer-btn';
  }
}

class MobileHomeScreen extends MobileBasePage {
  constructor(driver) {
    super(driver);
    this.headerTitle = '~home-header-title';
    this.quickScanCard = '~quick-scan-card';
    this.recentScansList = '~recent-scans-list';
    this.bottomTabBar = '~bottom-tab-bar';
  }
}

class MobileScannerScreen extends MobileBasePage {
  constructor(driver) {
    super(driver);
    this.cameraPreview = '~camera-preview';
    this.shutterButton = '~shutter-button';
    this.galleryPickerButton = '~gallery-picker-button';
    this.predictionResultSheet = '~prediction-result-sheet';
  }
}

class MobileRecordsScreen extends MobileBasePage {
  constructor(driver) {
    super(driver);
    this.recordsList = '~records-flatlist';
    this.exportBtn = '~export-records-btn';
  }
}

module.exports = {
  MobileBasePage,
  MobileLoginPage,
  MobileHomeScreen,
  MobileScannerScreen,
  MobileRecordsScreen
};
