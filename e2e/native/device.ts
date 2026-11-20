import { _android as android, type AndroidDevice } from '@playwright/test';

export const PKG = 'com.jainikkumbhani1234.skillio';

/** Connects to one running emulator by adb serial (e.g. "emulator-5554"). */
export async function connect(serial: string) {
  const devices = await android.devices();
  const device = devices.find((d) => d.serial() === serial);
  if (!device) throw new Error(`Emulator ${serial} not found — running: ${devices.map((d) => d.serial()).join(', ')}`);
  for (const d of devices) if (d !== device) await d.close();
  // Metro (port 8083, baked into the debug build) must be reachable from the emulator.
  await device.shell('true');
  return device;
}

/** Physical screen size in px. */
export async function screenSize(device: AndroidDevice) {
  const out = (await device.shell('wm size')).toString();
  const [, w, h] = /(\d+)x(\d+)/.exec(out.split('\n').filter(Boolean).pop()!)!;
  return { width: Number(w), height: Number(h) };
}

/** Cold-starts the app on a deep link: `skillio://?state=noLessons`, `skillio://practice`, … */
export async function launch(device: AndroidDevice, path = '') {
  await device.shell(`am force-stop ${PKG}`);
  await device.shell(`am start -W -a android.intent.action.VIEW -d 'skillio://${path}' ${PKG}`);
}

/** adb `screencap` under the hood — safe to call with or without the UI driver attached. */
export const screenshot = (device: AndroidDevice, path: string) => device.screenshot({ path });

/**
 * System animations off/on (Developer options → animation scales). Standard for Android UI tests, and it
 * doubles as a check that the app honours "Remove animations" (Reanimated follows the system setting).
 */
export async function setSystemAnimations(device: AndroidDevice, on: boolean) {
  for (const key of ['window_animation_scale', 'transition_animation_scale', 'animator_duration_scale'])
    await device.shell(`settings put global ${key} ${on ? 1 : 0}`);
}

/** Scrolls the home list by roughly 55% of the screen height. */
export async function swipeUp(device: AndroidDevice) {
  const { width, height } = await screenSize(device);
  await device.shell(`input swipe ${width / 2} ${Math.round(height * 0.72)} ${width / 2} ${Math.round(height * 0.17)} 350`);
}
