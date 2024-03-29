// import { createDrawerNavigator } from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useContext} from 'react';
import {Image, View, Text, useColorScheme} from 'react-native';
import Home from './screens/Home';

import {ShopSettingsContext} from './contexts/ShopSettingsContext';
import {useNavigation} from '@react-navigation/native';

import ConnectToHub from './screens/settings/ConnectToHub';
import Currency from './screens/settings/Currency';
import Settings from './screens/settings/Settings';
import ShopName from './screens/settings/ShopName';
import PrintSettings from './screens/settings/PrintSettings';
import {TouchableOpacity} from 'react-native-gesture-handler';
import RecentInvoices from './screens/recentInvoices/RecentInvoices';
import InvoiceDetail from './screens/recentInvoices/InvoiceDetail';
import ScanInvoice from './screens/recentInvoices/ScanInvoice';

const boltPosLogo = require('./img/bolt-card-pos.png');

const InvoiceStack = createNativeStackNavigator();
const InvoiceRoot = () => {
  return (
    <InvoiceStack.Navigator
      screenOptions={{headerHideShadow: true, headerShown: false}}
      initialRouteName="Recent Invoice List">
      <InvoiceStack.Screen
        name="Recent Invoice List"
        component={RecentInvoices}
      />
      <InvoiceStack.Screen name="Invoice Detail" component={InvoiceDetail} />
      <InvoiceStack.Screen name="ScanInvoice" component={ScanInvoice} />
    </InvoiceStack.Navigator>
  );
};

const SettingsStack = createNativeStackNavigator();
const SettingsRoot = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{headerHideShadow: true, headerShown: false}}
      initialRouteName="Settings">
      <SettingsStack.Screen name="Settings" component={Settings} />
      <SettingsStack.Screen name="Connect" component={ConnectToHub} />
      <SettingsStack.Screen name="Currency" component={Currency} />
      <SettingsStack.Screen name="Shop Name" component={ShopName} />
      <SettingsStack.Screen name="Printer Settings" component={PrintSettings} />
    </SettingsStack.Navigator>
  );
};

function LogoTitle() {
  const isDarkMode = useColorScheme() === 'dark';
  const {navigate} = useNavigation();

  const {shopName, lndhub, lndhubUser} = useContext(ShopSettingsContext);

  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };

  return (
    <TouchableOpacity
      style={{flexDirection: 'row'}}
      onPress={() => {
        console.log('hi');
        navigate('Home');
      }}>
      <Image source={boltPosLogo} style={{width: 50, height: 50}} />
      <View style={{alignItems: 'flex-start', flexDirection: 'column'}}>
        <Text style={{...textStyle, fontSize: 20}}>{shopName}</Text>
        <Text style={{...textStyle, fontSize: 13, color: '#999'}}>
          Bolt Card POS
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const HomeStack = createNativeStackNavigator();
const NavigationDefaultOptions = {
  // headerShown:false,

  // stackPresentation: 'modal',
  headerTitle: props => <LogoTitle {...props} />,
};
const HomeRoot = () => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={{headerHideShadow: false}}>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{...NavigationDefaultOptions, headerBackTitleVisible: false}}
      />
      <HomeStack.Screen
        name="SettingsRoot"
        component={SettingsRoot}
        options={{
          ...NavigationDefaultOptions,
          headerStyle: {backgroundColor: isDarkMode ? '#666' : '#fff'},
        }}
      />
      <HomeStack.Screen
        name="Recent Invoices"
        component={InvoiceRoot}
        options={{
          ...NavigationDefaultOptions,
          headerStyle: {backgroundColor: isDarkMode ? '#666' : '#fff'},
        }}
      />
    </HomeStack.Navigator>
  );
};

const InitStack = createNativeStackNavigator();
const Navigation = () => {
  return (
    <InitStack.Navigator initialRouteName="HomeRoot">
      <InitStack.Screen
        name="HomeRoot"
        component={HomeRoot}
        options={{headerShown: false, replaceAnimation: 'push'}}
      />
    </InitStack.Navigator>
  );
};
export default Navigation;
