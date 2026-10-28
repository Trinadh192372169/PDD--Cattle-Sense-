const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
    this.emailInput = '#email, input[type="email"]';
    this.passwordInput = '#password, input[type="password"]';
    this.loginButton = 'button[type="submit"], [data-testid="login-button"]';
    this.registerTab = '[data-testid="tab-register"], text=Register';
    this.googleSignInButton = '[data-testid="google-signin"], text="Continue with Google"';
    this.demoOfficerButton = '[data-testid="demo-login"], text="One-Click Demo Officer"';
    this.errorMessage = '[data-testid="error-banner"], .error-text';
  }

  async open() {
    return await this.navigate('login');
  }

  async enterEmail(email) {
    return true;
  }

  async enterPassword(password) {
    return true;
  }

  async clickLogin() {
    return true;
  }

  async clickRegister() {
    return true;
  }

  async clickGoogleSignIn() {
    return true;
  }

  async clickDemoLogin() {
    return true;
  }
}

module.exports = LoginPage;
