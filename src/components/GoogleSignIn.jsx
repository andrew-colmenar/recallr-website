import axios from "axios";

function getDeviceInfo() {
  const userAgent = navigator.userAgent;

  // Detect device type
  const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)
    ? "mobile"
    : "desktop";

  // Detect operating system
  let operatingSystem = "unknown";
  if (/Android/i.test(userAgent)) operatingSystem = "android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) operatingSystem = "ios";
  else if (/Win/i.test(userAgent)) operatingSystem = "windows";
  else if (/Mac/i.test(userAgent)) operatingSystem = "macos";
  else if (/Linux/i.test(userAgent)) operatingSystem = "linux";

  // Detect browser name and version
  let browserName = "unknown";
  let browserVersion = "unknown";

  if (/Chrome/i.test(userAgent)) {
    browserName = "chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+)/)[1];
  } else if (/Firefox/i.test(userAgent)) {
    browserName = "firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+)/)[1];
  } else if (/Safari/i.test(userAgent)) {
    browserName = "safari";
    browserVersion = userAgent.match(/Version\/(\d+)/)[1];
  } else if (/Edge/i.test(userAgent)) {
    browserName = "edge";
    browserVersion = userAgent.match(/Edge\/(\d+)/)[1];
  }

  return {
    deviceType,
    operatingSystem,
    browserName,
    browserVersion,
  };
}

export const signInWithGoogle = async () => {
  const deviceInfo = getDeviceInfo();

  const params = new URLSearchParams({
    referal_url: "https://auth.recallrai.com", // No need for `encodeURIComponent` here
    device_type: deviceInfo.deviceType,
    operating_system: deviceInfo.operatingSystem,
    browser_version: deviceInfo.browserVersion,
    browser_name: deviceInfo.browserName,
  });

  const redirectUrl = `https://auth.recallrai.com/api/v1/sso/google/redirect?${params.toString()}`;

  window.location.href = redirectUrl;
};
