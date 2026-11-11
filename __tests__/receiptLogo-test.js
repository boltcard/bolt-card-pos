import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  downloadReceiptLogo,
  getReceiptLogo,
  isLogoUrl,
  MAX_LOGO_BYTES,
} from '../helper/receiptLogo';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const LOGO_URL = 'https://example.com/logo.png';
const LOGO = 'bG9nbw==';

// stands in for the blob React Native returns from a download
const fakeBlob = (base64, size = 1024) => ({base64, size, close: jest.fn()});

const respondWith = (blob, {ok = true, status = 200} = {}) => {
  global.fetch = jest.fn(async () => ({ok, status, blob: async () => blob}));
};

beforeEach(async () => {
  await AsyncStorage.clear();
  NativeModules.PrintModule = {isPrintableImage: jest.fn(async () => true)};
  // React Native reads a blob as a data URL: "data:<type>;base64,<data>"
  global.FileReader = class {
    readAsDataURL(blob) {
      this.result = 'data:application/octet-stream;base64,' + blob.base64;
      this.onload();
    }
  };
});

describe('isLogoUrl', () => {
  it('accepts an https address', () => {
    expect(isLogoUrl('https://example.com/logo.png')).toBe(true);
    expect(isLogoUrl('HTTPS://example.com/logo.png?v=2')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLogoUrl('')).toBe(false);
    expect(isLogoUrl('http://example.com/logo.png')).toBe(false);
    expect(isLogoUrl('example.com/logo.png')).toBe(false);
    expect(isLogoUrl('https://')).toBe(false);
    expect(isLogoUrl('https://example.com/my logo.png')).toBe(false);
  });
});

describe('downloadReceiptLogo', () => {
  it('saves the downloaded logo for its address', async () => {
    const blob = fakeBlob(LOGO);
    respondWith(blob);

    await expect(downloadReceiptLogo(LOGO_URL)).resolves.toBe(LOGO);

    expect(global.fetch.mock.calls[0][0]).toBe(LOGO_URL);
    expect(NativeModules.PrintModule.isPrintableImage).toHaveBeenCalledWith(
      LOGO,
    );
    expect(blob.close).toHaveBeenCalled();
    await expect(getReceiptLogo(LOGO_URL)).resolves.toBe(LOGO);
  });

  it('replaces the logo saved earlier', async () => {
    respondWith(fakeBlob(LOGO));
    await downloadReceiptLogo(LOGO_URL);
    respondWith(fakeBlob('bmV3'));
    await downloadReceiptLogo(LOGO_URL);

    await expect(getReceiptLogo(LOGO_URL)).resolves.toBe('bmV3');
  });

  describe('when the download cannot be used', () => {
    beforeEach(async () => {
      respondWith(fakeBlob(LOGO));
      await downloadReceiptLogo(LOGO_URL);
    });

    afterEach(async () => {
      // the logo saved earlier is still there
      await expect(getReceiptLogo(LOGO_URL)).resolves.toBe(LOGO);
    });

    it('reports a network failure', async () => {
      global.fetch = jest.fn(async () => {
        throw new Error('Network request failed');
      });
      await expect(downloadReceiptLogo(LOGO_URL)).rejects.toThrow(
        'Could not download the logo: Network request failed',
      );
    });

    it('reports an error status from the server', async () => {
      respondWith(fakeBlob('bmV3'), {ok: false, status: 404});
      await expect(downloadReceiptLogo(LOGO_URL)).rejects.toThrow('status 404');
    });

    it('rejects a file over the size limit', async () => {
      const blob = fakeBlob('bmV3', MAX_LOGO_BYTES + 1);
      respondWith(blob);
      await expect(downloadReceiptLogo(LOGO_URL)).rejects.toThrow('too large');
      expect(blob.close).toHaveBeenCalled();
    });

    it('rejects a file that is not a printable image', async () => {
      NativeModules.PrintModule.isPrintableImage.mockResolvedValue(false);
      respondWith(fakeBlob('bmV3'));
      await expect(downloadReceiptLogo(LOGO_URL)).rejects.toThrow(
        'not an image that can be printed',
      );
    });
  });
});

describe('getReceiptLogo', () => {
  it('returns null when nothing has been downloaded', async () => {
    await expect(getReceiptLogo(LOGO_URL)).resolves.toBeNull();
  });

  it('returns null for a different address than the one saved', async () => {
    respondWith(fakeBlob(LOGO));
    await downloadReceiptLogo(LOGO_URL);

    await expect(
      getReceiptLogo('https://example.com/other.png'),
    ).resolves.toBeNull();
    await expect(getReceiptLogo('')).resolves.toBeNull();
  });

  it('returns null when the saved value is damaged', async () => {
    await AsyncStorage.setItem('receiptLogo', 'not json');
    await expect(getReceiptLogo(LOGO_URL)).resolves.toBeNull();
  });
});
