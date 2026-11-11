import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECEIPT_LOGO_STORAGE_KEY = 'receiptLogo';

// A logo for 58mm paper is at most 384 pixels wide, so the file has no need to
// be large. Android's AsyncStorage also cannot read back a value much over 2MB.
export const MAX_LOGO_BYTES = 500 * 1024;

/**
 * Release builds on Android only allow https requests, so an http address
 * would fail with nothing more helpful than "Network request failed".
 */
export const isLogoUrl = url => /^https:\/\/\S+$/i.test(url);

const blobToBase64 = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error('The downloaded file could not be read.'));
    reader.onload = () => {
      // reader.result is a data URL: "data:<type>;base64,<data>"
      const dataUrl = String(reader.result);
      resolve(dataUrl.substring(dataUrl.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });

/**
 * Downloads the logo, checks that it can be printed and saves it on the
 * device, so that printing a receipt does not need the network.
 * If anything fails the previously saved logo is left as it was.
 *
 * @param {string} url https address of the image
 * @returns {Promise<string>} the image file as base64
 */
export const downloadReceiptLogo = async url => {
  let response;
  try {
    response = await fetch(url, {headers: {'Cache-Control': 'no-cache'}});
  } catch (e) {
    throw new Error('Could not download the logo: ' + e.message);
  }
  if (!response.ok) {
    throw new Error(
      'Could not download the logo: the server responded with status ' +
        response.status,
    );
  }

  const blob = await response.blob();
  let base64;
  try {
    if (blob.size > MAX_LOGO_BYTES) {
      throw new Error(
        `The logo file is too large (${Math.round(blob.size / 1024)} KB). ` +
          `The limit is ${MAX_LOGO_BYTES / 1024} KB.`,
      );
    }
    base64 = await blobToBase64(blob);
  } finally {
    // React Native keeps the downloaded data in memory until the blob is closed
    if (typeof blob.close === 'function') {
      blob.close();
    }
  }

  if (!(await NativeModules.PrintModule.isPrintableImage(base64))) {
    throw new Error(
      'The file at that address is not an image that can be printed. Use a PNG or JPEG file.',
    );
  }

  await AsyncStorage.setItem(
    RECEIPT_LOGO_STORAGE_KEY,
    JSON.stringify({url, base64}),
  );
  return base64;
};

/**
 * @param {string} url the logo address from the print settings
 * @returns {Promise<string|null>} the logo saved for that address as base64,
 *          or null if it has not been downloaded
 */
export const getReceiptLogo = async url => {
  try {
    const saved = JSON.parse(
      await AsyncStorage.getItem(RECEIPT_LOGO_STORAGE_KEY),
    );
    return saved && url && saved.url === url ? saved.base64 : null;
  } catch (e) {
    return null;
  }
};
