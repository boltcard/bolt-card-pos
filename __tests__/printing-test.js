import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {printReceipt} from '../helper/printing';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const LOGO_URL = 'https://example.com/logo.png';
const LOGO = 'bG9nbw==';

const invoice = {
  description: 'My Shop',
  timestamp: 1700000000,
  ispaid: true,
  payment_hash: 'abc123',
  amt: 21,
};

// the native method names used by each printer
const printers = {
  bitcoinize: {text: 'printText', qr: 'printQRCode', image: 'printImage'},
  ciontek: {
    text: 'printTextCiontek',
    qr: 'printQRCodeCiontek',
    image: 'printImageCiontek',
  },
  sunmi: {
    text: 'printTextSunmi',
    qr: 'printQRCodeSunmi',
    image: 'printImageSunmi',
  },
};

// every call made to the native print module, in order: [method, ...arguments]
let calls;
const called = method => calls.filter(call => call[0] === method);
const firstIndex = method => calls.findIndex(call => call[0] === method);
const lastIndex = method =>
  calls.length - 1 - [...calls].reverse().findIndex(call => call[0] === method);

const saveLogo = () =>
  AsyncStorage.setItem(
    'receiptLogo',
    JSON.stringify({url: LOGO_URL, base64: LOGO}),
  );

beforeEach(async () => {
  calls = [];
  NativeModules.PrintModule = new Proxy(
    {},
    {
      get:
        (_target, method) =>
        (...args) => {
          calls.push([method, ...args]);
        },
    },
  );
  await AsyncStorage.clear();
});

describe.each(Object.keys(printers))('printReceipt on %s', printer => {
  const {text, qr, image} = printers[printer];

  it('prints the payment QR code below the text by default', async () => {
    await printReceipt(invoice, {printer});

    expect(called(qr)).toHaveLength(1);
    expect(called(qr)[0][1]).toBe(JSON.stringify({payment_hash: 'abc123'}));
    expect(called(image)).toHaveLength(0);
    expect(called(text)).toHaveLength(5);
    expect(firstIndex(qr)).toBeGreaterThan(lastIndex(text));
  });

  it('prints the QR code above the text when the position is top', async () => {
    await printReceipt(invoice, {printer, receiptImagePosition: 'top'});

    expect(called(qr)).toHaveLength(1);
    expect(firstIndex(qr)).toBe(0);
    expect(firstIndex(qr)).toBeLessThan(firstIndex(text));
  });

  it('prints the saved logo instead of the QR code', async () => {
    await saveLogo();
    await printReceipt(invoice, {
      printer,
      receiptImage: 'logo',
      receiptLogoUrl: LOGO_URL,
    });

    expect(called(image)).toEqual([[image, LOGO]]);
    expect(called(qr)).toHaveLength(0);
    expect(firstIndex(image)).toBeGreaterThan(lastIndex(text));
  });

  it('prints the saved logo above the text when the position is top', async () => {
    await saveLogo();
    await printReceipt(invoice, {
      printer,
      receiptImage: 'logo',
      receiptImagePosition: 'top',
      receiptLogoUrl: LOGO_URL,
    });

    expect(called(image)).toEqual([[image, LOGO]]);
    expect(firstIndex(image)).toBe(0);
  });

  it('keeps the QR code when no logo has been downloaded', async () => {
    await printReceipt(invoice, {
      printer,
      receiptImage: 'logo',
      receiptLogoUrl: LOGO_URL,
    });

    expect(called(qr)).toHaveLength(1);
    expect(called(image)).toHaveLength(0);
  });

  it('keeps the QR code when the saved logo is for another address', async () => {
    await saveLogo();
    await printReceipt(invoice, {
      printer,
      receiptImage: 'logo',
      receiptLogoUrl: 'https://example.com/other.png',
    });

    expect(called(qr)).toHaveLength(1);
    expect(called(image)).toHaveLength(0);
  });
});

it('prints nothing when no known printer is selected', async () => {
  await printReceipt(invoice, {printer: ''});
  expect(calls).toHaveLength(0);
});
