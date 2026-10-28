const path = require('path');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.ANDROID_VERSION || '13.0',
  'appium:app': process.env.APK_PATH || path.join(__dirname, '../../../app/android/app/build/outputs/apk/debug/app-debug.apk'),
  'appium:appPackage': 'com.cattlesense.app',
  'appium:appActivity': 'com.cattlesense.app.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 300,
  'appium:autoGrantPermissions': true,
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10)
  }
};

module.exports = capabilities;
