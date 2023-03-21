import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity, View
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

const QRScanner = (props:any) => {
    
    return (
      <View style={{flex:1}}>
        <QRCodeScanner
          onRead={props.onScanSuccess}
          // flashMode={RNCamera.Constants.FlashMode.torch}
          topContent={
            <Text style={styles.centerText}>
              Scan your LNDHub Invoice QR Code
            </Text>
          }
          bottomContent={
            <TouchableOpacity onPress={props.cancel}style={styles.buttonTouchable}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
}

const styles = StyleSheet.create({
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


export default QRScanner;