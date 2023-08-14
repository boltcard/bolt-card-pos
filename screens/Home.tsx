import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
  Image,
  Modal
} from 'react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import QRCode from 'react-native-qrcode-svg';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Button } from 'react-native-elements';
import PinPadButton from '../components/PinPadButton';
import PinCodeButton from '../components/PinCodeButton';
import CircleBorder from '../components/CircleBorder';
import { ShopSettingsContext } from '../contexts/ShopSettingsContext';
import { LightningCustodianWallet } from '../wallets/lightning-custodian-wallet.js';
import ConnectToHub from './settings/ConnectToHub';
import Clipboard from '@react-native-clipboard/clipboard';
import DropDownPicker from 'react-native-dropdown-picker';
import dateFormat from "dateformat";
import LottieView from "lottie-react-native"

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import moment from 'moment';

const currency = require('../helper/currency');

const boltLogo = require('../img/bolt-card-icon.png');
const boltPosLogo = require('../img/bolt-card-pos.png');

export type Props = {
  navigation: any;
};

function Home({navigation}): React.FC<Props> {
  const fetchInvoiceInterval = useRef();

  const isDarkMode = useColorScheme() === 'dark';
  const {navigate} = useNavigation();

  const [inputAmount, setInputAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hiddenTotal, setHiddenTotal] = useState(0);
  const [fiatAmount, setFiatAmount] = useState(0);
  const [satsAmount, setSatsAmount] = useState(0);

  const [initialisingWallet, setInitialisingWallet] = useState<boolean>(true);
  const [walletConfigured, setWalletConfigured] = useState<boolean>(false);

  //invoice stuff
  const [isFetchingInvoices, setIsFetchingInvoices] = useState<boolean>(false);
  const [lndInvoice, setLndInvoice] = useState<string>(null);
  const [invoiceIsPaid, setInvoiceIsPaid] = useState<boolean>(false);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);
  const [currentInvoiceObj, setCurrentInvoiceObj] = useState(); 

  const qrRef = useRef(null)
  const [qrData, setQrData] = useState(null);

  //NFC shizzle
  const [ndef, setNdef] = useState<string>();
  const [boltLoading, setBoltLoading] = useState<boolean>(false);
  const [boltServiceResponse, setBoltServiceResponse] = useState<boolean>(false);
  const [boltServiceCallback, setBoltServiceCallback] = useState<boolean>(false);
  
  //connection
  const [lndWallet, setLndWallet] = useState<LightningCustodianWallet>();

  //shop settings
  const {shopName, lndhub, lndhubUser} = useContext(ShopSettingsContext);

  //PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [pinTimeout, setPintimeout] = useState(0);


  const [open, setOpen] = useState(false);
  const [fiatCurrency, setFiatCurrency] = useState(null);
  const [lastRate, setLastRate] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('sats');

  const animationRef = useCallback((ref) => {
      if(ref) {
          ref.play();
      }
  }, []);


  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };

  useEffect(() => {
    qrRef.current?.toDataURL(dataURL => setQrData(dataURL));
  }, [qrRef, currentInvoiceObj])

  useFocusEffect(
    React.useCallback(() => {
      console.log('useFocusEffect', shopName, lndhub, lndhubUser);
      if(!shopName || !lndhub || !lndhubUser) {
        setWalletConfigured(false);
      }

      currency.init().then(() => {
        currency.getPreferredCurrency().then(preferred => {
          setFiatCurrency(preferred);
          console.log('currency.getPreferredCurrency()', preferred);
        });
        currency.mostRecentFetchedRate().then(lastFetchedRate => {
          setLastRate(lastFetchedRate);
          console.log('currency.mostRecentFetchedRate()', lastFetchedRate);
        });
      });
      // return () => unsubscribe();
    }, [lndhub, lndhubUser])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SettingsRoot');
          }}>
          <Icon name="cog" color={isDarkMode ? '#fff' : '#000'} size={30} />
        </TouchableOpacity>
      ),
      headerShown: true,
      title: shopName,
      headerStyle: {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: {height: 0, width: 0},
      },
      headerTintColor: isDarkMode ? '#fff' : '#000',
    });
  }, [navigation, shopName]);

  //once the connections details have been loaded from local store
  //set up the connection objects to connect to the hub 
  useEffect(() => {
    async function initWallet() {
      console.log('initialising wallet...');
      const wallet = new LightningCustodianWallet();
      wallet.setLabel('initialised custodial wallet');
      const isValidNodeAddress =
        await LightningCustodianWallet.isValidNodeAddress(lndhub);
      if (isValidNodeAddress) {
        console.log('isValidNodeAddress...');
        wallet.setBaseURI(lndhub);
        await wallet.init();
      } else {
        throw new Error(
          'The provided node address is not a valid LND Hub node.',
        );
      }
      await wallet.setSecret(lndhubUser);
      setLndWallet(wallet);

      console.log(wallet);
      console.log('wallet.getID()', wallet.getID());
      setInitialisingWallet(false);
    }
    if (lndhub == 'blank' || lndhubUser == 'blank') {
      setInitialisingWallet(false);
      setWalletConfigured(false);
    } else if (lndhub && lndhubUser) {
      setWalletConfigured(true);

      console.log('init with lndhub, lndhubUser', lndhub, lndhubUser)
      initWallet();
    }

  }, [lndhub, lndhubUser]);

  const makeLndInvoice = async () => {
    if (!lndWallet) {
      throw new Error(
        'Wallet not configured, please reconnect to the hub in the settings',
      );
    }

    if (lndWallet) {
      setInvoiceLoading(true);
      console.log('invoicing...');
      setInvoiceIsPaid(false);
      try {
        await lndWallet.authorize();
      } catch (error) {
        console.log(error.message);
        Toast.show({
          type: 'error',
          text1: 'LND Auth error',
          text2: error.message,
        });
        setInvoiceLoading(false);

      }
      try {
        const result = await lndWallet.addInvoice(
          parseInt(satsAmount),
          shopName,
        );
        console.log('result', result);
        setLndInvoice(result);
        setIsFetchingInvoices(true);
      } catch (error) {
        console.log(error.message);
        Toast.show({
          type: 'error',
          text1: 'Add invoice error',
          text2: error.message,
        });
        setInvoiceLoading(false);
      }
      if (Platform.OS !== 'ios') readNdef();
      setInvoiceLoading(false);
    }
  };

  function bin2String(array) {
    var result = '';
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }

  async function readNdef() {
    console.log('***** Await NFC Tag');
    try {
      // register for the NFC tag with NDEF in it
      const result = await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log('NfcManager.requestTechnology(NfcTech.Ndef)', result);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      const nfcData = tag.ndefMessage[0].payload;
      // console.log('Tag found', tag);
      // console.log('NDEF', nfcData);

      if(!nfcData || nfcData == "") {
        console.log('NDEF empty');
        Toast.show({
          type: 'error',
          text1: 'Bolt Card Response Empty',
          text2: 'The bolt card response was empty. Is the card configured?',
        });
        await NfcManager.cancelTechnologyRequest();
        setTimeout(() => {
          readNdef();
        }, 1000);
      }

      const bytesToNdef = String.fromCharCode(...nfcData);
      const boltURL = bytesToNdef.substring(1, bytesToNdef.length);
      if (isValidUrl(boltURL)) {
        console.log('Bolt URL found: ' + boltURL);
        setNdef(boltURL);
      } else {
        console.log('NDEF invalid: ' + boltURL);
        Toast.show({
          type: 'error',
          text1: 'Bolt Card Invalid',
          text2: 'This card did not provide a Bolt service URL',
        });
        await NfcManager.cancelTechnologyRequest();
        setTimeout(() => {
          readNdef();
        }, 1000);
      }
      console.log(bytesToNdef.substring(1, bytesToNdef.length));
    } catch (error) {
      console.log('*** readNdef() NFC Error:', error);
    } finally {
      // stop the nfc scanning
      stopReadNdef();
    }
  }

  const isValidUrl = urlString => {
    try {
      return Boolean(new URL(urlString));
    } catch (e) {
      return false;
    }
  }

  async function stopReadNdef() {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('*** ERROR: NFC stopReadNdef:', error);
    }
  }

  const resetInvoice = () => {
    setInputAmount(0);
    setTotalAmount(0);
    setIsFetchingInvoices(false);
    clearInterval(fetchInvoiceInterval.current);
    fetchInvoiceInterval.current = undefined;
    setLndInvoice(null);
    setBoltLoading(false);
    setBoltServiceResponse(false);
    setBoltServiceCallback(true);
    setCurrentInvoiceObj(null);

    stopReadNdef();
  };

  useEffect(() => {
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    };
  }, []);

  useEffect(() => {
    console.log(
      'Polling invoices - invoiceIsPaid:',
      invoiceIsPaid,
      'isFetchingInvoices',
      isFetchingInvoices,
    );
    if (!invoiceIsPaid) {
      fetchInvoiceInterval.current = setInterval(async () => {
        if (isFetchingInvoices) {
          try {
            const userInvoices = await lndWallet?.getUserInvoices(20);
            // console.log('userInvoices', userInvoices);
            // fetching only last 20 invoices
            // for invoice that was created just now - that should be enough (it is basically the last one, so limit=1 would be sufficient)
            // but that might not work as intended IF user creates 21 invoices, and then tries to check the status of invoice #0, it just wont be updated
            const updatedUserInvoice = userInvoices.filter(filteredInvoice =>
              typeof lndInvoice === 'object'
                ? filteredInvoice.payment_request === lndInvoice.payment_request
                : filteredInvoice.payment_request === lndInvoice,
            )[0];

            console.log(Date.now() + ' ispaid?', updatedUserInvoice?.ispaid);
            if (typeof updatedUserInvoice !== 'undefined') {
              if (updatedUserInvoice.ispaid) {
                // we fetched the invoice, and it is paid :-)
                setInvoiceIsPaid(true);
                setBoltLoading(false);
                setIsFetchingInvoices(false);
                setCurrentInvoiceObj(updatedUserInvoice);
                clearInterval(fetchInvoiceInterval.current);
                fetchInvoiceInterval.current = undefined;
              } else {
                const currentDate = new Date();
                const now = (currentDate.getTime() / 1000) | 0;
                const invoiceExpiration =
                  updatedUserInvoice.timestamp + updatedUserInvoice.expire_time;
                if (invoiceExpiration < now && !updatedUserInvoice.ispaid) {
                  // invoice expired :-(
                  setIsFetchingInvoices(false);
                  setBoltLoading(false);
                  // ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
                  clearInterval(fetchInvoiceInterval.current);
                  fetchInvoiceInterval.current = undefined;
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }, 2000);
    } else {
      setIsFetchingInvoices(false);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingInvoices]);

  const fetchCallback = (callback, pin = null) => {
    if(pin) {
      callback.searchParams.set('pin', pin);
    }
    return fetch(callback.toString())
            .then(cbResponse => cbResponse.json())
            .then(cbData => {
              console.log('bolt callback', cbData);
              if (cbData.status == 'ERROR') {
                console.error(cbData.reason);
                Toast.show({
                  type: 'error',
                  text1: 'Bolt Card Error',
                  text2: cbData.reason,
                });
                setTimeout(() => {
                  readNdef()
                }, 1000);
                setBoltLoading(false);
              } else {
                setBoltServiceCallback(true);
              }
              
            })
            .catch(err => {
              console.error(err);
              Toast.show({
                type: 'error',
                text1: 'Bolt Card Error',
                text2: err.message,
              });
              setTimeout(() => {
                readNdef();
              }, 1000);
              setBoltLoading(false);
            })
            .finally(() => {
              setNdef(undefined);
              clearPinAndCallback();
            });
  }


  /**
   * Set with a valid URL from the NFC reader.
   * Calls the bolt service and sends the invoice to the callback
   */
  useEffect(() => {
    if (ndef) {
      setBoltLoading(true);
      const url = ndef.replace('lnurlw://', 'https://');
      fetch(url)
        .then(response => {
          setBoltServiceResponse(true);
          return response.json();
        })
        .then(data => {
          console.log('bolt request', data);
          if (data.callback) {
            const callback = new URL(data.callback);
            callback.searchParams.set('k1', data.k1);
            callback.searchParams.set('pr', lndInvoice);

            if(data.pinLimit) {
              //if the card has pin enabled 
              //check the amount didn't exceed the limit
              const limitSat = data.pinLimit / 1000;
              if(limitSat <= satsAmount) {
                setCallbackUrl(callback);
                setPinCode("");
                setShowPinModal(true);
                return;
              }
            }
            fetchCallback(callback);
          } else if (data.status == 'ERROR') {
            console.error(data.reason);
            Toast.show({
              type: 'error',
              text1: 'Bolt Card Error',
              text2: data.reason,
            });
            setTimeout(() => {
              readNdef();
            }, 1000);
            setBoltLoading(false);
            setNdef(undefined);
          }
        })
        .catch(err => {
          console.error(err);
          Toast.show({
            type: 'error',
            text1: 'Bolt Card Error',
            text2: err.message,
          });
          setTimeout(() => {
            readNdef();
          }, 1000);
          setBoltLoading(false);
        })
        .finally(() => {
          setNdef(undefined);
        });
    }
  }, [ndef]);

  const retryBoltcardPayment = () => {
    setBoltLoading(false);
    setBoltServiceCallback(false);
    setBoltServiceResponse(false);
    NfcManager.cancelTechnologyRequest().then(() => {
      if(Platform.OS == 'android') {
        setTimeout(() => {
          readNdef();
        }, 1000);
      }
    });
  }

  const press = (input: string) => {
    if (input === 'c') {
      if(inputAmount == 0) {
        setTotalAmount(0);
        setHiddenTotal(0);
        setSatsAmount(0);
        setFiatAmount(0);
      }
      if(inputAmount > 0) setInputAmount('0');
    } 
    else if (input === '+') {
      setTotalAmount(twoDP((parseFloat(hiddenTotal) + parseFloat(inputAmount))));
      setInputAmount('0');
      setHiddenTotal(totalAmount);
    }
    else if(selectedUnit == 'sats' || selectedUnit == 'btc') {
      const updatedAmout = (inputAmount === '0') ? input : inputAmount + '' + input;
      setInputAmount(parseInt(updatedAmout));
      setTotalAmount(parseInt(hiddenTotal) + parseInt(updatedAmout));
    }
    else {
      const updatedAmount = (inputAmount === '0' || inputAmount === 0) ? twoDP(input*0.01) : twoDP((parseFloat(inputAmount) + parseFloat(input*0.001))*10);
      setInputAmount(updatedAmount);
      setTotalAmount(twoDP(parseFloat(hiddenTotal) + parseFloat(updatedAmount)));
    }
  };

  const twoDP = (input) => {
    return Math.round(input*100)/100;
  }

  /**
   * Update the various conversions to sats etc.
   */
  useEffect(()=> {
    if(selectedUnit == 'sats') {
      if(fiatCurrency) setFiatAmount(currency.satoshiToLocalCurrency(totalAmount ? totalAmount : satsAmount));
      setSatsAmount(totalAmount);
    }
    else if(selectedUnit == 'btc') {
      setSatsAmount(currency.btcToSatoshi(totalAmount));
      if(fiatCurrency) setFiatAmount(currency.satoshiToLocalCurrency(currency.btcToSatoshi(totalAmount)));
    }
    else {
      if(fiatCurrency) setSatsAmount(currency.btcToSatoshi(currency.fiatToBTC(totalAmount)));
      if(fiatCurrency) setFiatAmount(totalAmount);
    }
  },[inputAmount, selectedUnit, totalAmount])

  useEffect(() => {
    if(pinCode && pinCode.length == 4) {
      setTimeout(() => {
        setShowPinModal(false);
        fetchCallback(callbackUrl, pinCode);
      }, 500)
    }
  }, [pinCode]);

  const copyToClipboard = () => {
    Clipboard.setString(lndInvoice);
    Toast.show({
      type: 'success',
      text1: 'Copied to clipboard',
      text2: 'Invoice has been copied to clipboard',
    });
  }

  const currencyItems = [
    {label: 'Sats', value: 'sats'},
    {label: 'BTC', value: 'btc'}
  ];

  if(fiatCurrency) {
    currencyItems.push({label: fiatCurrency.endPointKey, value: fiatCurrency.endPointKey});
  }

  if (initialisingWallet) {
    return <ActivityIndicator />;
  }

  const isPinEntered = (pos) => {
    return pinCode && pos < (pinCode.length + 1);
  }

  const pinPress = (val) => {
    if(val == 'X') {
      setPinCode((prevPin) => {
        return prevPin.slice(0, -1);
      })
    } else {
      if(pinCode && pinCode.length >= 4) {
        return;
      }
      setPinCode((prevPin) => {
        return "" + prevPin + val;
      })

    }
  }

  const clearPinAndCallback = () => {
    setPinCode("");
    setCallbackUrl(null)
  }

  const onPrint = async (invoice) => {
    let options = {
      html: `
        <h1 style="font-size: 100px">${invoice.description}</h1>
        <p style="font-size: 50px">Payment made in Bitcoin</p>
        <p style="font-size: 50px">${moment(invoice.timestamp * 1000).format('DD/MM/YY HH:mm:ss')}</p>
        <p style="font-size: 60px;">${invoice.amt} sats <span style="font-weight: 600;">${invoice.ispaid ? "(PAID)" : "(PENDING)"}</span></p>
        <p style="font-size: 60px; overflow-wrap: break-word; word-break: break-all;">Payment Hash: ${invoice.payment_hash}</p>
        <img src="data:image/jpeg;base64,${qrData}" width="100%" height="auto"/>
      `,
      fileName: 'receipt_'+invoice.payment_hash,
      directory: 'Documents',
      height: 1500,
      width: 595
    };

    try {
      let file = await RNHTMLtoPDF.convert(options)
      if(file?.filePath) FileViewer.open(file?.filePath);
    } catch(err) {
      Toast.show({
        type: 'error',
        text1: 'Error opening pdf',
        text2: err,
      });
      console.log(err);
    }
  }

  return (
    <View style={{...backgroundStyle, flex: 1}}>
      <View style={{...backgroundStyle, flex: 1}}>
        <Modal
          animationType="fade"
          transparent={false}
          visible={showPinModal}
          onRequestClose={() => {
            setShowPinModal(!showPinModal);
            setPinCode("");
          }}
        >
          <View style={{justifyContent: 'center', flex: 1, backgroundColor: "#FF9900"}}>
            <Text style={{textAlign: 'center', fontSize: 25, marginBottom: 20, fontWeight: 600}}>{satsAmount ? satsAmount.toLocaleString() : 0} sats</Text>
            <Text style={{textAlign: 'center', fontSize: 30, marginBottom: 30, fontWeight: 700, color: '#333'}}>Enter PIN</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 30}}>
              <CircleBorder fill={isPinEntered(1)} containerStyle={{marginRight: 10}}/>
              <CircleBorder fill={isPinEntered(2)} containerStyle={{marginRight: 10}} />
              <CircleBorder fill={isPinEntered(3)} containerStyle={{marginRight: 10}} />
              <CircleBorder fill={isPinEntered(4)}  />
            </View>
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <PinCodeButton number="1" onPress={() => pinPress('1')} />
              <PinCodeButton number="2" onPress={() => pinPress('2')} />
              <PinCodeButton number="3" onPress={() => pinPress('3')} />
            </View>
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <PinCodeButton number="4" onPress={() => pinPress('4')} />
              <PinCodeButton number="5" onPress={() => pinPress('5')} />
              <PinCodeButton number="6" onPress={() => pinPress('6')} />
            </View>
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <PinCodeButton number="7" onPress={() => pinPress('7')} />
              <PinCodeButton number="8" onPress={() => pinPress('8')} />
              <PinCodeButton number="9" onPress={() => pinPress('9')} />
            </View>
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <PinCodeButton number="" />
              <PinCodeButton number="0" onPress={() => pinPress('0')} />
              <PinCodeButton number={<Icon name="backspace" size={35}/>} onPress={() => pinPress('X')} />
            </View>
            <View style={{marginTop: 15, justifyContent: 'center', paddingHorizontal: 20}}>
              <Button
                title="Cancel"
                onPress={() => {
                  clearPinAndCallback();
                  setShowPinModal(false);
                  retryBoltcardPayment()
                }}
                buttonStyle={{backgroundColor: "tomato"}}
                titleStyle={{fontSize: 20}}
              ></Button>
            </View>
          </View>
        </Modal>
        {!walletConfigured && (
          <ConnectToHub 
            lndhub={lndhub}
            lndhubUser={lndhubUser}
          />
        )}
        {walletConfigured && (
          <>
            <View style={{flexDirection: 'column',  margin:0, padding:0}}>
              <View style={{flexDirection: 'row',  margin:0, padding:0}}>
                <Text
                  style={{...textStyle, fontSize: 35, height:50, marginTop:10, marginLeft:5}}
                >{selectedUnit != 'sats' && selectedUnit != 'btc' && fiatCurrency?.symbol}</Text>
                <View
                  style={{borderRadius: 8, flex:3, marginTop: 10, marginLeft:5, overflow: 'hidden', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, height:50}}>
                  <Text
                    style={{borderRadius: 8, color: '#000', fontSize: 40, borderWidth: 1, paddingHorizontal:10, paddingVertical: 0, paddingLeft:10, textAlign: 'right', backgroundColor: 'white'}}
                  >
                    {inputAmount}
                  </Text>

                </View>
                <DropDownPicker
                  open={open}
                  value={selectedUnit}
                  items={currencyItems}
                  setOpen={setOpen}
                  setValue={setSelectedUnit}
                  // setItems={setItems}
                  theme={isDarkMode ? "DARK" : "LIGHT"}
                  multiple={false}
                  containerStyle={{
                    margin: 10,
                    width: 100,
                  }}
                />
              </View>
              <View style={{flexDirection: 'column', zIndex: -1, marginHorizontal:10, marginTop:0, alignItems:'center' }}>
                  <>
                    <Text style={{...textStyle, fontSize: 15}}>
                    {lastRate && ('Rate update ' +Math.round((new Date()-lastRate.LastUpdated )/1000/60) +' min ago')}
                    </Text>
                  </>
                </View>
            </View>
            {!lndInvoice && (
              <View style={{flex:4, zIndex: -1 }}>
                <View style={{flex: 1, padding: 10}}>
                <View style={{marginBottom:10}}>
                  <Pressable
                    onPress={() => makeLndInvoice()}
                    disabled={invoiceLoading}>
                    <View
                      style={{
                        backgroundColor: invoiceLoading ? '#D3D3D3' : '#ff9900',
                        height: 70,
                        justifyContent: 'center',
                        borderRadius:20
                        
                      }}>
                      {invoiceLoading ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <>
                          <Text
                            style={{
                              fontWeight:'bold',
                              fontSize: 22,
                              textAlign: 'center',
                              color: '#000',
                            }}>
                            Charge {fiatAmount ? (fiatAmount + ' ' + fiatCurrency?.endPointKey) : satsAmount.toLocaleString() + ' sats'} {}
                          </Text>
                          <Text
                            style={{
                              fontSize: 17,
                              textAlign: 'center',
                              color: '#000',
                            }}>
                            {satsAmount ? satsAmount.toLocaleString() : 0} sats
                          </Text>
                        </>
                      )}
                    </View>
                  </Pressable>
                </View>
                  <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
                    <PinPadButton number="7" onPress={() => press('7')} />
                    <PinPadButton number="8" onPress={() => press('8')} />
                    <PinPadButton number="9" onPress={() => press('9')} />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <PinPadButton number="4" onPress={() => press('4')} />
                    <PinPadButton number="5" onPress={() => press('5')} />
                    <PinPadButton number="6" onPress={() => press('6')} />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <PinPadButton number="1" onPress={() => press('1')} />
                    <PinPadButton number="2" onPress={() => press('2')} />
                    <PinPadButton number="3" onPress={() => press('3')} />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <PinPadButton number="C" onPress={() => press('c')} />
                    <PinPadButton number="0" onPress={() => press('0')} />
                    <PinPadButton number="+" onPress={() => press('+')} />
                  </View>
                </View>
              </View>
            )}
            {lndInvoice &&
              (!invoiceIsPaid  ? (
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginVertical:5}}>
                    <Text style={{...textStyle, fontSize:25, margin: 0, lineHeight:30, marginRight:10}}>
                      Pay {satsAmount ? satsAmount.toLocaleString() : 0} sats.
                    </Text> 
                    {!boltLoading && 
                    <View style={{padding: 0}}>
                      <View style={{paddingVertical: 10, paddingHorizontal:30, backgroundColor: "#f00", borderRadius:20}}>
                        <Pressable
                          onPress={resetInvoice}
                        >
                          <Text style={{fontSize:20, color:"#fff"}}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                    }
                  </View>
                  <View style={{padding: 20, backgroundColor: '#fff'}}>
                    <QRCode
                      size={300}
                      value={lndInvoice}
                      logo={boltLogo}
                      logoSize={80}
                      logoBackgroundColor="transparent"
                    />
                  </View>
                  
                  {/*<View style={{width:'100%', padding: 20, flexDirection:'row', justifyContent:'space-around'}}>
                    <View  style={{borderWidth:1, borderColor: '#ccc', padding:10, borderRadius:10}}>
                      <Pressable 
                        onPress={() => copyToClipboard()}
                      >
                        <Text style={{fontSize:20}}><Icon name="copy" color="#F60" size={30} /> Copy</Text>
                      </Pressable>
                    </View>
                    <View style={{borderWidth:1, borderColor: '#ccc', padding:10, borderRadius:10}}>
                      <Pressable 
                        onPress={() => share()}
                      >
                        <Text style={{fontSize:20}}><Icon name="share" color="#F60" size={30} /> Share</Text>
                      </Pressable>
                    </View>
                  </View>*/}
                  {Platform.OS === 'ios' && (
                    <View style={{padding: 10, backgroundColor: "#f90", borderRadius:10, marginTop:5}}>
                      <Pressable
                        onPress={readNdef}
                      >
                        <Text style={{fontSize:20, color:"#000"}}>
                          <Icon name="wifi" color="#000" size={20} />
                          Enable Bolt Card NFC
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={{...textStyle, flexDirection: 'column', justifyContent: 'center', borderWidth:1, borderRadius:10, margin:10, backgroundColor: 'white', paddingVertical: 30}}>
                  {currentInvoiceObj &&
                    <View style={{alignItems: 'flex-end'}}>
                      <View style={{height: 0, width: 0, opacity: 0}}>
                        <QRCode
                          value={JSON.stringify({payment_hash: currentInvoiceObj.payment_hash})}
                          getRef={qrRef}
                          size={400}
                        />
                      </View>
                      <Button 
                        icon={{
                          name: 'print'
                        }}
                        type="clear"
                        onPress={() => onPrint(currentInvoiceObj)}
                      />
                    </View>
                  }
                  <View>
                    <LottieView
                      source={require('../img/success_animation.json')}
                      autoplay={true} 
                      loop={true} 
                      style={{height: 140}}
                      ref={animationRef}
                      resizeMode = 'cover'
                    />
                  </View>
                  <View
                    style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <Text style={{fontSize: 60, color: '#000'}}>Paid!</Text>
                  </View>
                  <View style={{padding: 20}}>
                    <Button
                      title="Done"
                      onPress={resetInvoice}
                      buttonStyle={{
                        backgroundColor: '#ff9900'
                      }}
                      titleStyle={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#000'
                      }}
                    >
                    </Button>
                  </View>
                </View>
              ))}

            <Modal
              animationType="fade"
              visible={lndInvoice && (!invoiceIsPaid && boltLoading)}
              onRequestClose={retryBoltcardPayment}
              transparent={true}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={{color: '#000', fontSize:20}}>Bolt Card Detected. <Icon name="checkmark" color="darkgreen" size={20} /></Text>
                  {boltServiceResponse && 
                    <Text style={{color: '#000', fontSize:20}}>
                      Bolt Service connected <Icon name="checkmark" color="darkgreen" size={20} />
                    </Text>
                  }
                  {boltServiceCallback && 
                    <>
                      <Text style={{color: '#000', fontSize:20}}>
                        Bolt Service Callback success <Icon name="checkmark" color="darkgreen" size={20} />
                      </Text>
                      <Text style={{color: '#000', fontSize:20}}>
                        Payment initiated...
                      </Text>
                    </>
                  }
                  
                  <ActivityIndicator size="large" color="#ff9900" />
                  <View style={{padding: 20}}>
                    <Button
                      title="Retry Payment"
                      onPress={retryBoltcardPayment}
                      buttonStyle={{
                        backgroundColor: '#ff9900'
                      }}
                      titleStyle={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#000'
                      }}
                    >
                    </Button>
                    
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Home;