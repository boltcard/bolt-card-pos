import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
  Image,
  Modal,
  NativeModules,
  Alert,
} from 'react-native';

import {useNavigation, useFocusEffect} from '@react-navigation/native';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Button} from 'react-native-elements';
import PinPadButton from '../components/PinPadButton';
import PinCodeModal from '../components/PinCodeModal';
import {ShopSettingsContext} from '../contexts/ShopSettingsContext';
import {LightningCustodianWallet} from '../wallets/lightning-custodian-wallet.js';
import ConnectToHub from './settings/ConnectToHub';
import Clipboard from '@react-native-clipboard/clipboard';
import DropDownPicker from 'react-native-dropdown-picker';
import LottieView from 'lottie-react-native';
import {updateExchangeRate} from '../helper/currency';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import moment from 'moment';
import {printCiontek, printBitcoinize, onPDF} from '../helper/printing';
let {bech32} = require('bech32');

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

  const qrRef = useRef(null);
  const [qrData, setQrData] = useState(null);

  //NFC shizzle
  const [ndef, setNdef] = useState<string>();
  const [boltLoading, setBoltLoading] = useState<boolean>(false);
  const [boltServiceResponse, setBoltServiceResponse] =
    useState<boolean>(false);
  const [boltServiceCallback, setBoltServiceCallback] =
    useState<boolean>(false);

  //connection
  const [lndWallet, setLndWallet] = useState<LightningCustodianWallet>();

  //shop settings
  const {shopName, lndhub, lndhubUser, printer} =
    useContext(ShopSettingsContext);

  //PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [pinTimeout, setPintimeout] = useState(0);

  const [open, setOpen] = useState(false);
  const [fiatCurrency, setFiatCurrency] = useState(null);
  const [lastRate, setLastRate] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('sats');

  const animationRef = useCallback(ref => {
    if (ref) {
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
    console.log('***** useEffect [qrRef, currentInvoiceObj]');
    qrRef.current?.toDataURL(dataURL => setQrData(dataURL));
  }, [qrRef, currentInvoiceObj]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('***** useFocusEffect React.useCallback');

      console.log('useFocusEffect', shopName, lndhub, lndhubUser);
      if (!shopName || !lndhub || !lndhubUser) {
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
    }, [lndhub, lndhubUser]),
  );

  useEffect(() => {
    console.log('***** useEffect [navigation, shopName]');
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity
            style={{marginRight: 7}}
            onPress={() => {
              navigation.navigate('Recent Invoices');
            }}>
            <Icon name="list" color={isDarkMode ? '#fff' : '#000'} size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SettingsRoot');
            }}>
            <Icon name="cog" color={isDarkMode ? '#fff' : '#000'} size={30} />
          </TouchableOpacity>
        </>
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
      console.log('***** initWallet');
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

      console.log('init with lndhub, lndhubUser', lndhub, lndhubUser);
      initWallet();
    }
  }, [lndhub, lndhubUser]);

  const makeLndInvoice = async () => {
    console.log('***** makeLndInvoice');
    if (!lndWallet) {
      Toast.show({
        type: 'error',
        text1: 'Configuration error',
        text2:
          'Wallet not configured, please reconnect to the hub in the settings',
      });
      return;
    }

    if (lndWallet) {
      if (parseInt(satsAmount) <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Add invoice error',
          text2: 'Not a valid amount',
        });
        return;
      }
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

      if (!nfcData || nfcData == '') {
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
      console.log('boltURL', boltURL);

      //deal with LNURL over NFC
      if (boltURL.startsWith('lightning:')) {
        const lnurlbetch = boltURL.substring(10);
        const decoded = bech32.decode(lnurlbetch, 2000);
        let requestByteArray = bech32.fromWords(decoded.words);
        const lnurl = Buffer.from(requestByteArray).toString();
        console.log('*** LNURL', lnurl);

        fetch(lnurl)
          .then(response => {
            console.log(response);
            // setBoltServiceResponse(true);
            return response.json();
          })
          .then(async data => {
            console.log('lnurl request', data);
            if (data.callback && data.k1) {
              const callback = new URL(data.callback);
              callback.searchParams.set('k1', data.k1);
              callback.searchParams.set('pr', lndInvoice);
              console.log('callback.toString()', callback.toString());
              await fetch(callback.toString())
                .then(cbResponse => cbResponse.json())
                .then(cbData => {
                  console.log('bolt callback', cbData);
                  if (cbData.status == 'ERROR') {
                    console.error(cbData.reason);
                    Toast.show({
                      type: 'error',
                      text1: 'LNURL Error',
                      text2: cbData.reason,
                    });
                    setTimeout(() => {
                      readNdef();
                    }, 1000);
                    setBoltLoading(false);
                  } else {
                    setBoltServiceCallback(true);
                  }
                });
            } else {
              console.error('no callback or k1 specified!');
            }
          });
      }

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
      //   Alert.alert('NFC Read Error', error.message);
    } finally {
      // stop the nfc scanning
      await stopReadNdef();
      //   readNdef();
    }
  }

  const isValidUrl = urlString => {
    console.log('***** isValidUrl');
    try {
      return Boolean(new URL(urlString));
    } catch (e) {
      return false;
    }
  };

  async function stopReadNdef() {
    console.log('***** stopReadNdef');
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('*** ERROR: NFC stopReadNdef:', error);
    }
  }

  const resetInvoice = () => {
    console.log('***** resetInvoice');
    setInputAmount(0);
    setTotalAmount(0);
    setFiatAmount(0);
    setSatsAmount(0);
    setHiddenTotal(0);
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
    console.log('***** useEffect []');
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      clearInterval(fetchInvoiceInterval.current);
      fetchInvoiceInterval.current = undefined;
    };
  }, []);

  useEffect(() => {
    console.log('***** useEffect');
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
    console.log('***** fetchCallback');
    if (pin) {
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
            readNdef();
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
        setCallbackUrl('');
      });
  };

  /**
   * Set with a valid URL from the NFC reader.
   * Calls the bolt service and sends the invoice to the callback
   */
  useEffect(() => {
    console.log('***** useEffect [ndef]');
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

            if (data.pinLimit) {
              //if the card has pin enabled
              //check the amount didn't exceed the limit
              const limitSat = data.pinLimit / 1000;
              if (limitSat <= satsAmount) {
                setCallbackUrl(callback);
                setPinCode('');
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
    console.log('***** retryBoltcardPayment');
    setBoltLoading(false);
    setBoltServiceCallback(false);
    setBoltServiceResponse(false);
    NfcManager.cancelTechnologyRequest().then(() => {
      if (Platform.OS == 'android') {
        setTimeout(() => {
          readNdef();
        }, 1000);
      }
    });
  };

  const press = (input: string) => {
    // console.log('press', input);
    if (input === 'c') {
      if (inputAmount == 0) {
        setTotalAmount(0);
        setHiddenTotal(0);
        setSatsAmount(0);
        setFiatAmount(0);
      }
      if (inputAmount > 0) setInputAmount('0');
    } else if (input === '+') {
      setTotalAmount(twoDP(parseFloat(hiddenTotal) + parseFloat(inputAmount)));
      setInputAmount('0');
      setHiddenTotal(totalAmount);
    } else if (selectedUnit == 'sats' || selectedUnit == 'btc') {
      const updatedAmout =
        inputAmount === '0' ? input : inputAmount + '' + input;
      setInputAmount(parseInt(updatedAmout));
      setTotalAmount(parseInt(hiddenTotal) + parseInt(updatedAmout));
    } else {
      const updatedAmount =
        inputAmount === '0' || inputAmount === 0
          ? twoDP(input * 0.01)
          : twoDP((parseFloat(inputAmount) + parseFloat(input * 0.001)) * 10);
      setInputAmount(updatedAmount);
      setTotalAmount(
        twoDP(parseFloat(hiddenTotal) + parseFloat(updatedAmount)),
      );
    }
  };

  const twoDP = input => {
    return Math.round(input * 100) / 100;
  };

  /**
   * Update the various conversions to sats etc.
   */
  useEffect(() => {
    console.log('***** useEffect [inputAmount, selectedUnit, totalAmount]');
    if (selectedUnit == 'sats') {
      if (fiatCurrency)
        setFiatAmount(
          currency.satoshiToLocalCurrency(
            totalAmount ? totalAmount : satsAmount,
          ),
        );
      setSatsAmount(totalAmount);
    } else if (selectedUnit == 'btc') {
      setSatsAmount(currency.btcToSatoshi(totalAmount));
      if (fiatCurrency)
        setFiatAmount(
          currency.satoshiToLocalCurrency(currency.btcToSatoshi(totalAmount)),
        );
    } else {
      if (fiatCurrency)
        setSatsAmount(currency.btcToSatoshi(currency.fiatToBTC(totalAmount)));
      if (fiatCurrency) setFiatAmount(totalAmount);
    }
  }, [inputAmount, selectedUnit, totalAmount]);

  useEffect(() => {
    console.log('***** useEffect [pinCode]');
    if (pinCode && pinCode.length == 4) {
      setTimeout(() => {
        setShowPinModal(false);
        fetchCallback(callbackUrl, pinCode);
      }, 500);
    }
  }, [pinCode]);

  const currencyItems = [
    {label: 'Sats', value: 'sats'},
    {label: 'BTC', value: 'btc'},
  ];

  if (fiatCurrency) {
    currencyItems.push({
      label: fiatCurrency.endPointKey,
      value: fiatCurrency.endPointKey,
    });
  }

  if (initialisingWallet) {
    return <ActivityIndicator size="large" />;
  }

  const cancelPinCodeModal = () => {
    setCallbackUrl(null);
    setShowPinModal(false);
    retryBoltcardPayment();
  };

  const onPrint = async invoice => {
    console.log('***** onPrint');
    if (printer == 'ciontek') {
      console.log('printCiontek');
      printCiontek(
        invoice.description,
        invoice.timestamp,
        invoice.ispaid,
        invoice.payment_hash,
        invoice.amt,
      );
    } else {
      console.log('printBitcoinize');
      printBitcoinize(
        invoice.description,
        invoice.timestamp,
        invoice.ispaid,
        invoice.payment_hash,
        invoice.amt,
      );
    }
  };

  console.log('re-render...');
  return (
    <View style={{...backgroundStyle, flex: 1}}>
      <View style={{...backgroundStyle, flex: 1}}>
        <PinCodeModal
          showModal={showPinModal}
          onCancel={cancelPinCodeModal}
          topText={
            <Text
              style={{
                textAlign: 'center',
                fontSize: 25,
                marginBottom: 20,
                fontWeight: 600,
              }}>
              {satsAmount ? satsAmount.toLocaleString() : 0} sats
            </Text>
          }
          onEnter={() => {
            setShowPinModal(false);
            fetchCallback(callbackUrl, pinCode);
          }}
          pinCode={pinCode}
          setPinCode={setPinCode}
        />
        {!walletConfigured && (
          <ConnectToHub lndhub={lndhub} lndhubUser={lndhubUser} />
        )}
        {walletConfigured && (
          <>
            <View
              style={{
                flexDirection: 'column',
                margin: 0,
                padding: 0,
                flex: 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  margin: 0,
                  padding: 0,
                }}>
                <Text
                  style={{
                    ...textStyle,
                    fontSize: 35,
                    marginTop: 10,
                    marginLeft: 5,
                  }}>
                  {selectedUnit != 'sats' &&
                    selectedUnit != 'btc' &&
                    fiatCurrency?.symbol}
                </Text>
                <View
                  style={{
                    borderRadius: 8,
                    flex: 3,
                    marginTop: 10,
                    marginLeft: 5,
                    overflow: 'hidden',
                  }}>
                  <Text
                    style={{
                      borderRadius: 8,
                      borderWidth: 1,
                      color: '#000',
                      fontSize: 35,
                      paddingHorizontal: 10,
                      paddingVertical: 0,
                      paddingLeft: 10,
                      textAlign: 'right',
                      backgroundColor: 'white',
                    }}>
                    {inputAmount}
                  </Text>
                </View>
                <DropDownPicker
                  style={{height: '60%'}}
                  open={open}
                  value={selectedUnit}
                  items={currencyItems}
                  setOpen={setOpen}
                  setValue={setSelectedUnit}
                  // setItems={setItems}
                  theme={isDarkMode ? 'DARK' : 'LIGHT'}
                  multiple={false}
                  containerStyle={{
                    margin: 10,
                    width: 100,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  marginHorizontal: 10,
                  marginTop: 0,
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    updateExchangeRate();
                    console.log(lastRate);
                  }}>
                  {lastRate && (
                    <>
                      <Text
                        style={{
                          ...textStyle,
                          fontSize: 15,
                          textAlign: 'center',
                        }}>
                        {'Rate ' + lastRate.Rate}
                      </Text>
                      <Text
                        style={{
                          ...textStyle,
                          fontSize: 15,
                          textAlign: 'center',
                        }}>
                        {' Last update ' +
                          Math.round(
                            (new Date() - lastRate.LastUpdated) / 1000 / 60,
                          ) +
                          ' min ago'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {!lndInvoice && (
              <View style={{flex: 4, zIndex: -1}}>
                <View style={{flex: 1, padding: 10}}>
                  <View
                    style={{flex: 1, marginBottom: 5, alignContent: 'stretch'}}>
                    <Pressable
                      onPress={() => makeLndInvoice()}
                      disabled={invoiceLoading}>
                      <View
                        style={{
                          backgroundColor: invoiceLoading
                            ? '#D3D3D3'
                            : '#ff9900',
                          height: '100%',
                          justifyContent: 'center',
                          borderRadius: 20,
                        }}>
                        {invoiceLoading ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                fontSize: 22,
                                textAlign: 'center',
                                color: '#000',
                              }}>
                              Charge{' '}
                              {fiatAmount
                                ? fiatAmount + ' ' + fiatCurrency?.endPointKey
                                : satsAmount.toLocaleString() + ' sats'}{' '}
                              {}
                            </Text>
                            <Text
                              style={{
                                fontSize: 17,
                                textAlign: 'center',
                                color: '#000',
                              }}>
                              {satsAmount ? satsAmount.toLocaleString() : 0}{' '}
                              sats
                            </Text>
                          </>
                        )}
                      </View>
                    </Pressable>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignContent: 'stretch',
                    }}>
                    <PinPadButton number="7" onPress={() => press('7')} />
                    <PinPadButton number="8" onPress={() => press('8')} />
                    <PinPadButton number="9" onPress={() => press('9')} />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignContent: 'stretch',
                    }}>
                    <PinPadButton number="4" onPress={() => press('4')} />
                    <PinPadButton number="5" onPress={() => press('5')} />
                    <PinPadButton number="6" onPress={() => press('6')} />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignContent: 'stretch',
                    }}>
                    <PinPadButton number="1" onPress={() => press('1')} />
                    <PinPadButton number="2" onPress={() => press('2')} />
                    <PinPadButton number="3" onPress={() => press('3')} />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignContent: 'stretch',
                    }}>
                    <PinPadButton number="C" onPress={() => press('c')} />
                    <PinPadButton number="0" onPress={() => press('0')} />
                    <PinPadButton number="+" onPress={() => press('+')} />
                  </View>
                </View>
              </View>
            )}
            {lndInvoice &&
              (!invoiceIsPaid ? (
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 4,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 5,
                    }}>
                    <Text
                      style={{
                        ...textStyle,
                        fontSize: 25,
                        margin: 0,
                        lineHeight: 30,
                        marginRight: 10,
                      }}>
                      Pay {satsAmount ? satsAmount.toLocaleString() : 0} sats.
                    </Text>
                    {!boltLoading && (
                      <View style={{padding: 0}}>
                        <View
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 30,
                            backgroundColor: '#f00',
                            borderRadius: 20,
                          }}>
                          <Pressable onPress={resetInvoice}>
                            <Text style={{fontSize: 20, color: '#fff'}}>
                              Cancel
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={{padding: 20, backgroundColor: '#fff'}}>
                    <QRCode
                      size={330}
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
                    <View
                      style={{
                        padding: 10,
                        backgroundColor: '#f90',
                        borderRadius: 10,
                        marginTop: 5,
                      }}>
                      <Pressable onPress={readNdef}>
                        <Text style={{fontSize: 20, color: '#000'}}>
                          <Icon name="wifi" color="#000" size={20} />
                          Enable Bolt Card NFC
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={{
                    ...textStyle,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderRadius: 10,
                    margin: 10,
                    backgroundColor: 'white',
                    paddingVertical: 10,
                  }}>
                  {currentInvoiceObj && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{}}>
                        <Button
                          size="lg"
                          icon={{
                            name: 'description',
                            size: 50,
                          }}
                          type="clear"
                          onPress={() => onPDF(currentInvoiceObj)}
                        />
                      </View>
                      <View style={{}}>
                        <Button
                          size="lg"
                          icon={{
                            name: 'print',
                            size: 50,
                          }}
                          type="clear"
                          onPress={() => onPrint(currentInvoiceObj)}
                        />
                        <View style={{height: 0, width: 0, opacity: 0}}>
                          <QRCode
                            value={JSON.stringify({
                              payment_hash: currentInvoiceObj.payment_hash,
                            })}
                            getRef={qrRef}
                            size={400}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                  <View style={{height: 170}}>
                    <LottieView
                      source={require('../img/success_animation.json')}
                      autoplay={true}
                      loop={false}
                      style={{flex: 1}}
                      ref={animationRef}
                      resizeMode="contain"
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
                        backgroundColor: '#ff9900',
                      }}
                      titleStyle={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#000',
                      }}></Button>
                  </View>
                </View>
              ))}

            <Modal
              animationType="fade"
              visible={lndInvoice && !invoiceIsPaid && boltLoading}
              onRequestClose={retryBoltcardPayment}
              transparent={true}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={{color: '#000', fontSize: 18}}>
                    Bolt Card Detected.{' '}
                    <Icon name="checkmark" color="darkgreen" size={20} />
                  </Text>
                  {boltServiceResponse && (
                    <Text style={{color: '#000', fontSize: 18}}>
                      Bolt Service connected{' '}
                      <Icon name="checkmark" color="darkgreen" size={20} />
                    </Text>
                  )}
                  {boltServiceCallback && (
                    <>
                      <Text style={{color: '#000', fontSize: 18}}>
                        Bolt Service Callback{' '}
                        <Icon name="checkmark" color="darkgreen" size={20} />
                      </Text>
                      <Text style={{color: '#000', fontSize: 18}}>
                        Payment initiated...
                      </Text>
                    </>
                  )}

                  <ActivityIndicator size="large" color="#ff9900" />
                  <View style={{padding: 20}}>
                    <Button
                      title="Retry Payment"
                      onPress={retryBoltcardPayment}
                      buttonStyle={{
                        backgroundColor: '#ff9900',
                      }}
                      titleStyle={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#000',
                      }}></Button>
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
