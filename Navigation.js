// import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/Home';
import Settings from './screens/Settings';

const RootStack = createNativeStackNavigator();
const NavigationDefaultOptions = { headerShown: false, stackPresentation: 'modal' };
const Navigation = () => {
  return (
    <RootStack.Navigator initialRouteName="Home" screenOptions={{ headerHideShadow: true }}>
     	<RootStack.Screen name="Home" component={Home} options={NavigationDefaultOptions} />
     	<RootStack.Screen name="Settings" component={Settings} options={NavigationDefaultOptions} />
    </RootStack.Navigator>
  );
};

export default Navigation;