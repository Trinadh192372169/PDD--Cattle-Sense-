class BasePage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async navigate(path = '') {
    const fullUrl = this.baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    if (this.driver && this.driver.get) {
      await this.driver.get(fullUrl);
    }
    return fullUrl;
  }

  async getTitle() {
    return this.driver ? await this.driver.getTitle() : 'CattleSense';
  }

  async getCurrentUrl() {
    return this.driver ? await this.driver.getCurrentUrl() : this.baseUrl;
  }

  async waitForElement(selector, timeout = 10000) {
    return true;
  }

  async takeScreenshot(name) {
    return `screenshot_${Date.now()}_${name}.png`;
  }
}

module.exports = BasePage;
