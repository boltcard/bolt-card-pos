// import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Home from './screens/Home';

import Settings from './screens/settings/Settings';
import Currency from './screens/settings/Currency';
import ShopName from './screens/settings/ShopName';

const SettingsStack = createNativeStackNavigator();
const SettingsRoot = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{headerHideShadow: true}}
      initialRouteName="Settings">
      <SettingsStack.Screen name="Settings" component={Settings} />
      <SettingsStack.Screen name="Currency" component={Currency} />
      <SettingsStack.Screen name="Shop Name" component={ShopName} />
    </SettingsStack.Navigator>
  );
};
const HomeStack = createNativeStackNavigator();
const NavigationDefaultOptions = {
  headerShown: false,
  stackPresentation: 'modal',
};
const HomeRoot = () => {
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={{headerHideShadow: false}}>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={NavigationDefaultOptions}
      />
      <HomeStack.Screen
        name="SettingsRoot"
        component={SettingsRoot}
        options={NavigationDefaultOptions}
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
