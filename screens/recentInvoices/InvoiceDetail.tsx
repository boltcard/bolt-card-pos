import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useColorScheme,
  NativeModules,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ListItem, Text, Badge, Button} from 'react-native-elements';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import {printCiontek, printBitcoinize, onPDF, printSunmi} from '../../helper/printing';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';
import moment from 'moment';

const InvoiceDetail = ({route}) => {
  const {navigate} = useNavigation();
  const {shopName, lndhub, lndhubUser, printer} =
    useContext(ShopSettingsContext);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
  };

  const {invoice} = route.params;

  const qrRef = useRef(null);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    qrRef.current?.toDataURL(dataURL => setQrData(dataURL));
  }, [qrRef]);

  const formatDate = timestamp => {
    return moment(timestamp * 1000).format('DD/MM/YY HH:mm:ss');
  };

  const print = async () => {
    if (printer == 'ciontek') {
      console.log('printCiontek');
      printCiontek(
        invoice.description,
        invoice.timestamp,
        invoice.ispaid,
        invoice.payment_hash,
        invoice.amt,
      );
    } else if(printer == 'bitcoinize') {
      console.log('printBitcoinize');
      printBitcoinize(
        invoice.description,
        invoice.timestamp,
        invoice.ispaid,
        invoice.payment_hash,
        invoice.amt,
      );
    } else if(printer == 'sunmi') {
      console.log('printSunmi');
      printSunmi(
        invoice.description,
        invoice.timestamp,
        invoice.ispaid,
        invoice.payment_hash,
        invoice.amt,
      );
    }
  };

  return (
    <>
      <View />
      <ScrollView
        style={{...styles.root, ...backgroundStyle}}
        keyboardShouldPersistTaps="handled">
        {invoice ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text h3 h3Style={textStyle}>
                Invoice detail
              </Text>
              <Button
                icon={{
                  name: 'description',
                  color: isDarkMode ? '#fff' : '#000',
                }}
                type="clear"
                onPress={() => onPDF(invoice)}
              />
              <Button
                icon={{
                  name: 'print',
                  color: isDarkMode ? '#fff' : '#000',
                }}
                type="clear"
                onPress={print}
              />
            </View>
            <Text
              style={{
                ...styles.bold,
                ...textStyle,
                marginBottom: 13,
                fontSize: 16,
              }}>
              {formatDate(invoice.timestamp)}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 10,
                alignItems: 'center',
              }}>
              <Text style={textStyle}>{invoice.amt} sats</Text>
              {invoice.ispaid ? (
                <Badge
                  status="success"
                  value="Paid"
                  containerStyle={styles.badgeContainer}
                  badgeStyle={styles.badge}
                  textStyle={styles.badgeText}
                />
              ) : (
                <Badge
                  status="warning"
                  value="Pending"
                  containerStyle={styles.badgeContainer}
                  badgeStyle={styles.badge}
                  textStyle={styles.badgeText}
                />
              )}
            </View>
            <Text style={{...textStyle, marginBottom: 20}}>
              Payment Hash: {invoice.payment_hash}
            </Text>
            <View
              style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <View style={{padding: 10, backgroundColor: 'white'}}>
                <QRCode
                  value={JSON.stringify({payment_hash: invoice.payment_hash})}
                  getRef={qrRef}
                  size={230}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text style={textStyle}>No invoice passed</Text>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
  },
  badgeContainer: {
    marginLeft: 5,
  },
  badge: {
    height: 22,
  },
  badgeText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bold: Platform.select({
    ios: {
      fontWeight: 600,
    },
    android: {
      fontWeight: 700,
    },
  }),
});

export default InvoiceDetail;
