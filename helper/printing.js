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
