import React from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SimpleListItem } from '../../SimpleComponents';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const Settings = (props) => {

  const { navigate } = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  return (
    <>
      <View />
      <ScrollView style={{...styles.root, ...backgroundStyle}}>
        <Text>CURRENCY</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});


export default Settings;