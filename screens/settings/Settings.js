import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  NativeModules,
} from 'react-native';
import {ListItem, Switch} from 'react-native-elements';
import {SimpleListItem} from '../../SimpleComponents';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  getApplicationName,
  getBuildNumber,
  getBundleId,
  getUniqueId,
  getVersion,
  hasGmsSync,
} from 'react-native-device-info';
import PinSetScreen from './PinSetScreen';
import PinCodeModal from '../../components/PinCodeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const Settings = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };
  const {navigate, goBack} = useNavigation();

  const [initLoading, setInitLoading] = useState(false);
  const [showPinSetScreen, setShowPinSetScreen] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinEnabled, setPinEnabled] = useState(false);

  const checkPin = async () => {
    try {
      setInitLoading(true);
      const managerPin = await AsyncStorage.getItem('manager-pin');
      if (managerPin) {
        setPinEnabled(true);
        setShowPinScreen(true);
      } else {
        setInitLoading(false);
      }
    } catch (err) {
      navigate('Home');
      Toast.show({
        type: 'error',
        text1: 'PIN error',
        text2: err.message,
      });
    } finally {
      // setInitLoading(false);
    }
  };

  useEffect(() => {
    checkPin();
  }, []);

  return (
    <>
      <View style={{...styles.root, ...backgroundStyle}}>
        {initLoading ? (
          <View
            style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            <View style={{flex: 2}}>
              <SimpleListItem
                title="Connection"
                onPress={() => navigate('Connect')}
                chevron
              />
              <SimpleListItem
                title="Currency"
                onPress={() => navigate('Currency')}
                chevron
              />
              <SimpleListItem
                title="Shop Name"
                onPress={() => navigate('Shop Name')}
                chevron
              />
              <SimpleListItem
                title="Printer Settings"
                onPress={() => navigate('Printer Settings')}
                chevron
              />
              <ListItem
                containerStyle={{backgroundColor: 'transparent'}}
                bottomDivider={true}>
                <ListItem.Content>
                  <ListItem.Title>Enable Manager Access PIN</ListItem.Title>
                </ListItem.Content>
                <Switch
                  value={pinEnabled}
                  onValueChange={async value => {
                    if (value) {
                      //enable PIN
                      setShowPinSetScreen(true);
                    } else {
                      //disable PIN
                      await AsyncStorage.setItem('manager-pin', '');
                      setPinEnabled(value);
                    }
                  }}
                />
              </ListItem>
              {pinEnabled && (
                <SimpleListItem
                  title="Reset PIN"
                  onPress={() => setShowPinSetScreen(true)}
                  chevron
                />
              )}
            </View>

            <View style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  backgroundColor: '#fff',
                  paddingTop: 20,
                  paddingBottom: 20,
                }}>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://onesandzeros.nz')}>
                  <Image
                    style={{width: 120, height: 50}}
                    source={require('../../img/OAZ-Logo.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://www.whitewolftech.com')
                  }>
                  <Image
                    style={{width: 170, height: 50}}
                    source={require('../../img/wwt-on-white-sample.png')}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.text}>
                {getApplicationName() +
                  ' ver ' +
                  getVersion() +
                  ' (build ' +
                  getBuildNumber() +
                  ')'}
              </Text>
              <Text style={styles.text}>
                {'Built: ' + new Date(getBuildNumber() * 1000).toString()}
              </Text>
            </View>
          </>
        )}
        <PinSetScreen
          showBaseModal={showPinSetScreen}
          onClose={() => setShowPinSetScreen(false)}
          successCallback={() => setPinEnabled(true)}
        />
        <PinCodeModal
          showModal={showPinScreen}
          onCancel={() => {
            setShowPinScreen(false);
            setTimeout(() => {
              navigate('Home');
            }, 500);
          }}
          onEnter={async () => {
            try {
              const managerPin = await AsyncStorage.getItem('manager-pin');
              if (pinCode == managerPin) {
                setShowPinScreen(false);
                setInitLoading(false);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Wrong PIN',
                });
                setPinCode('');
              }
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'PIN error',
                text2: err.message,
              });
            }
          }}
          pinCode={pinCode}
          setPinCode={setPinCode}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignContent: 'space-between',
  },
  text: {
    padding: 10,
    textAlign: 'center',
  },
});

export default Settings;
