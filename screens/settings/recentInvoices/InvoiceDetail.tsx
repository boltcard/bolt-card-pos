import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useColorScheme
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ListItem, Text, Badge, Button} from 'react-native-elements';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import QRCode from 'react-native-qrcode-svg';

const InvoiceDetail = ({route}) => {


  const {navigate} = useNavigation();

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {invoice} = route.params;

  const qrRef = useRef(null)
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    qrRef.current?.toDataURL(dataURL => setQrData(dataURL));
  }, [qrRef])

  const print = async () => {
     let options = {
      html: `
        <h1 style="font-size: 100px">Bolt Card POS</h1>
        <h1 style="font-size: 80px">${invoice.description}</h1>
        <p style="font-size: 60px;">${invoice.amt} sats</p>
        <p style="font-size: 60px; overflow-wrap: break-word; word-break: break-all;">Payment Hash: ${invoice.payment_hash}</p>
        <img src="data:image/jpeg;base64,${qrData}" width="100%" height="auto"/>
      `,
      fileName: 'receipt',
      directory: 'Documents',
      height: 1400,
      width: 595
    };

    let file = await RNHTMLtoPDF.convert(options)
    if(file?.filePath) FileViewer.open(file?.filePath);
  }

  return (
    <>
      <View />
      <ScrollView style={{...styles.root, ...backgroundStyle}} keyboardShouldPersistTaps="handled">
        {invoice ?
          <View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <Text h3>Invoice detail</Text>
              <Button 
                icon={{
                  name: 'print'
                }}
                type="clear"
                onPress={print}
              />
            </View>
            <View style={{flexDirection: 'row', marginBottom: 10, alignItems: 'center'}}>
              <Text>
                {invoice.amt} sats
              </Text>
              {invoice.ispaid ? <Badge status="success" value="Paid" containerStyle={styles.badgeContainer} badgeStyle={styles.badge} textStyle={styles.badgeText} /> : <Badge status="warning" value="Unpaid" containerStyle={styles.badgeContainer} badgeStyle={styles.badge} textStyle={styles.badgeText} />}
            </View>
            <Text style={{marginBottom: 20}}>Payment Hash: {invoice.payment_hash}</Text>
            <QRCode
              value={JSON.stringify({payment_hash: invoice.payment_hash})}
              getRef={qrRef}
              size={230}
            />
            
          </View>
          :
          <Text>No invoice passed</Text>
        }
        
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20
  },
  badgeContainer: {
    marginLeft: 5,
  },
  badge: {
    height: 22
  },
  badgeText: {
    fontSize: 13,
    lineHeight: 20
  }
})

export default InvoiceDetail;
