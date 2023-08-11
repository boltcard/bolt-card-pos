import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Text} from 'react-native-elements';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Toast from 'react-native-toast-message';

import {ShopSettingsContext} from '../../../contexts/ShopSettingsContext';

import QRCodeScanner from 'react-native-qrcode-scanner';

const queryLimit = 20;

const ScanInvoice = () => {
  const {navigate, goBack} = useNavigation();

  const {shopWallet} = useContext(ShopSettingsContext);

  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [scannedPaymentHash, setScannedPaymentHash] = useState("");

  //pagination
  const [queryOffset, setQueryOffset] = useState(0);
  const [queryEndReached, setQueryEndReached] = useState(false);
  
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const reset = () => {
    setScannedPaymentHash("");
    setLoading(false);
  }

  const fetchInvoices = useCallback(async (offset = 0) => {
    console.log('fetchInvoices', offset);
      try{
        await shopWallet.authorize();
        const foundInvoices = await shopWallet?.getUserInvoices(queryLimit, offset);
        setQueryOffset(offset);
        if (foundInvoices && Array.isArray(foundInvoices)) {
          if(foundInvoices.length < offset + queryLimit) setQueryEndReached(true);
          setInvoices(foundInvoices);
        }
      } catch(err) {
        Toast.show({
          type: 'error',
          text1: 'Fetching invoice error',
          text2: err
        });
        reset();
        console.log(err);
      }

  }, [shopWallet, invoices])

  useEffect(() => {
    if(!shopWallet) {
      setLoading(true);
    }
  }, [shopWallet]);

  const findInvoiceByHash = (hash) => {
    console.log('findInvoiceByHash')
    const foundInvoice = invoices.filter(invoice => invoice.payment_hash == hash);
    if(foundInvoice.length > 0) {
      reset();
      navigate('Invoice Detail', {invoice: foundInvoice[0]});
    } else {
      if(!queryEndReached) {
        fetchInvoices(queryOffset + queryLimit)
      } else {
        reset();
        Toast.show({
        type: 'error',
        text1: 'Invoice not found',
        text2: 'No invoice with the same payment hash',
      });
      }
    }
  }

  useEffect(() => {
    if(invoices && scannedPaymentHash) {
      console.log('useeffect invoices')
      findInvoiceByHash(scannedPaymentHash);
    }
  }, [invoices])

  useEffect(() => {
    if(scannedPaymentHash) {
      console.log('useeffect scannedPaymentHash')
      findInvoiceByHash(scannedPaymentHash);
    }
  }, [scannedPaymentHash])

  const onRead = (e: {data: string}) => {
    setLoading(true);
    try {
      console.log('onread', e.data);
      const jsonData = JSON.parse(e.data);
      if(!jsonData.payment_hash) {
        Toast.show({
          type: 'error',
          text1: 'Invalid QR Code',
          text2: 'Payment hash value is null',
        });
      } else {
        //find the invoice
        setScannedPaymentHash(jsonData.payment_hash);
      }
    } catch(err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Invalid QR Code',
        text2: 'Not a correct format',
      });
      reset();
    }
  }

  const onCancel = () => {
    goBack()
  }

  return (
    <>
      <View />
      <View style={{...styles.root, ...backgroundStyle}}>
        {loading ? 
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" />
          </View>
          :
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
        }
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
