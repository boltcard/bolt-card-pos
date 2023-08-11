import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Text} from 'react-native-elements';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Toast from 'react-native-toast-message';

import QRCodeScanner from 'react-native-qrcode-scanner';

const ScanInvoice = () => {
  const {navigate, goBack} = useNavigation();
  
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onRead = (e: {data: string}) => {
    try {
      console.log('onread', e);
      const jsonData = JSON.parse(e.data);
      if(!jsonData.payment_request) {
        Toast.show({
          type: 'error',
          text1: 'Invalid QR Code',
          text2: 'Payment request value is null',
        });
      } else {
        //find the invoice
        console.log(jsonData.payment_request)
      }
    } catch(err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Invalid QR Code',
        text2: 'Not a correct format',
      });
    }
  }

  const onCancel = () => {
    navigate('Home')
  }

  return (
    <>
      <View />
      <View style={{...styles.root, ...backgroundStyle}}>
          <QRCodeScanner
            onRead={onRead}
            // flashMode={RNCamera.Constants.FlashMode.torch}
            topContent={
              <Text style={styles.centerText}>
                Scan QRcode to check the invoice
              </Text>
            }
            bottomContent={
              <Button onPress={onCancel} style={styles.buttonTouchable} title="Cancel">
              </Button>
            }
          />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});

export default ScanInvoice;
