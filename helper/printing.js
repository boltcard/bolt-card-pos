import {NativeModules, Alert} from 'react-native';
import moment from 'moment';

export const printBitcoinize = async (
  description,
  timestamp,
  ispaid,
  payment_hash,
  amt,
) => {
  try {
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
    await NativeModules.PrintModule.printQRCode(
      JSON.stringify({payment_hash: payment_hash}),
      400,
      400,
    );

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
) => {
  try {
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
    await NativeModules.PrintModule.printQRCodeCiontek(
      JSON.stringify({payment_hash: payment_hash}),
      360,
      360,
    );

    await NativeModules.PrintModule.paperOutCiontek();
    await NativeModules.PrintModule.paperOutCiontek();
    await NativeModules.PrintModule.paperOutCiontek();
  } catch (e) {
    Alert.alert('Error', 'There was an error when printing ' + e.message, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
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
