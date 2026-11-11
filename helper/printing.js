import {NativeModules, Alert} from 'react-native';
import moment from 'moment';
import {getReceiptLogo} from './receiptLogo';

/**
 * The print functions below take an optional last argument:
 *   logo       - the shop's logo as base64, printed instead of the payment QR code
 *   imageOnTop - print the image (logo or QR code) above the text instead of below
 */

export const printBitcoinize = async (
  description,
  timestamp,
  ispaid,
  payment_hash,
  amt,
  {logo, imageOnTop} = {},
) => {
  const printImage = async () => {
    if (logo) {
      await NativeModules.PrintModule.printImage(logo);
    } else {
      await NativeModules.PrintModule.printQRCode(
        JSON.stringify({payment_hash: payment_hash}),
        400,
        400,
      );
    }
  };

  try {
    if (imageOnTop) {
      await printImage();
      await NativeModules.PrintModule.paperOut(24);
    }

    await NativeModules.PrintModule.printText(description, 32);
    await NativeModules.PrintModule.paperOut(24);

    await NativeModules.PrintModule.printText('Payment made in Bitcoin', 24);
    await NativeModules.PrintModule.paperOut(24);

    await NativeModules.PrintModule.printText(
      moment(timestamp * 1000).format('DD/MM/YY HH:mm:ss'),
      24,
    );
    await NativeModules.PrintModule.paperOut(24);

    await NativeModules.PrintModule.printText(
      amt + ' sats ' + (ispaid ? '(PAID)' : '(PENDING)'),
      32,
    );
    await NativeModules.PrintModule.paperOut(24);

    await NativeModules.PrintModule.printText(payment_hash, 24);
    await NativeModules.PrintModule.paperOut(24);
    if (!imageOnTop) {
      await printImage();
    }

    await NativeModules.PrintModule.paperOut(100);
  } catch (e) {
    Alert.alert('Error', 'There was an error when printing ' + e.message, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
};

export const printCiontek = async (
  description,
  timestamp,
  ispaid,
  payment_hash,
  amt,
  {logo, imageOnTop} = {},
) => {
  const printImage = async () => {
    if (logo) {
      await NativeModules.PrintModule.printImageCiontek(logo);
    } else {
      await NativeModules.PrintModule.printQRCodeCiontek(
        JSON.stringify({payment_hash: payment_hash}),
        360,
        360,
      );
    }
  };

  try {
    if (imageOnTop) {
      await printImage();
      await NativeModules.PrintModule.paperOutCiontek();
    }

    await NativeModules.PrintModule.printTextCiontek(description, 32);
    await NativeModules.PrintModule.paperOutCiontek();

    await NativeModules.PrintModule.printTextCiontek(
      'Payment made in Bitcoin',
      24,
    );
    await NativeModules.PrintModule.paperOutCiontek();

    await NativeModules.PrintModule.printTextCiontek(
      moment(timestamp * 1000).format('DD/MM/YY HH:mm:ss'),
      24,
    );
    await NativeModules.PrintModule.paperOutCiontek();

    await NativeModules.PrintModule.printTextCiontek(
      amt + ' sats ' + (ispaid ? '(PAID)' : '(PENDING)'),
      32,
    );
    await NativeModules.PrintModule.paperOutCiontek();

    await NativeModules.PrintModule.printTextCiontek(payment_hash, 24);
    await NativeModules.PrintModule.paperOutCiontek();
    if (!imageOnTop) {
      await printImage();
    }

    await NativeModules.PrintModule.paperOutCiontek();
    await NativeModules.PrintModule.paperOutCiontek();
    await NativeModules.PrintModule.paperOutCiontek();
  } catch (e) {
    Alert.alert('Error', 'There was an error when printing ' + e.message, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
};

export const printSunmi = async (
  description,
  timestamp,
  ispaid,
  payment_hash,
  amt,
  {logo, imageOnTop} = {},
) => {
  const printImage = async () => {
    if (logo) {
      await NativeModules.PrintModule.printImageSunmi(logo);
    } else {
      await NativeModules.PrintModule.printQRCodeSunmi(
        JSON.stringify({payment_hash: payment_hash}),
        360,
        360,
      );
    }
  };

  try {
    if (imageOnTop) {
      await printImage();
    }

    await NativeModules.PrintModule.printTextSunmi(description, 32);
    // await NativeModules.PrintModule.paperOutSunmi();

    await NativeModules.PrintModule.printTextSunmi(
      'Payment made in Bitcoin',
      24,
    );
    // await NativeModules.PrintModule.paperOutSunmi();

    await NativeModules.PrintModule.printTextSunmi(
      moment(timestamp * 1000).format('DD/MM/YY HH:mm:ss'),
      24,
    );
    // await NativeModules.PrintModule.paperOutSunmi();

    await NativeModules.PrintModule.printTextSunmi(
      amt + ' sats ' + (ispaid ? '(PAID)' : '(PENDING)'),
      32,
    );
    // await NativeModules.PrintModule.paperOutSunmi();

    await NativeModules.PrintModule.printTextSunmi(payment_hash, 24);
    // await NativeModules.PrintModule.paperOutSunmi();
    if (!imageOnTop) {
      await printImage();
    }

    // await NativeModules.PrintModule.paperOutSunmi();
    // await NativeModules.PrintModule.paperOutSunmi();
    await NativeModules.PrintModule.paperOutSunmi();
  } catch (e) {
    Alert.alert('Error', 'There was an error when printing ' + e.message, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
};

/**
 * Prints a receipt for the invoice on the printer chosen in the print
 * settings, with either the payment QR code or the shop's own logo.
 *
 * @param invoice
 * @param settings the printer and receipt image settings from ShopSettingsContext
 */
export const printReceipt = async (
  invoice,
  {printer, receiptImage, receiptImagePosition, receiptLogoUrl},
) => {
  const print = {
    ciontek: printCiontek,
    bitcoinize: printBitcoinize,
    sunmi: printSunmi,
  }[printer];
  if (!print) {
    return;
  }

  // when the logo has not been downloaded the receipt keeps its QR code
  const logo =
    receiptImage === 'logo' ? await getReceiptLogo(receiptLogoUrl) : null;

  await print(
    invoice.description,
    invoice.timestamp,
    invoice.ispaid,
    invoice.payment_hash,
    invoice.amt,
    {logo, imageOnTop: receiptImagePosition === 'top'},
  );
};

export const onPDF = async invoice => {
  console.log('***** onPDF');
  let options = {
    html: `
        <h1 style="font-size: 100px">${invoice.description}</h1>
        <p style="font-size: 50px">Payment made in Bitcoin</p>
        <p style="font-size: 50px">${moment(invoice.timestamp * 1000).format(
          'DD/MM/YY HH:mm:ss',
        )}</p>
        <p style="font-size: 60px;">${
          invoice.amt
        } sats <span style="font-weight: 600;">${
      invoice.ispaid ? '(PAID)' : '(PENDING)'
    }</span></p>
        <p style="font-size: 60px; overflow-wrap: break-word; word-break: break-all;">Payment Hash: ${
          invoice.payment_hash
        }</p>
        <img src="data:image/jpeg;base64,${qrData}" width="100%" height="auto"/>
      `,
    fileName: 'receipt_' + invoice.payment_hash,
    directory: 'Documents',
    height: 1500,
    width: 595,
  };

  try {
    let file = await RNHTMLtoPDF.convert(options);
    if (file?.filePath) FileViewer.open(file?.filePath);
  } catch (err) {
    Toast.show({
      type: 'error',
      text1: 'Error opening pdf',
      text2: err,
    });
    console.log(err);
  }
};
