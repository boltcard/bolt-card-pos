import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SimpleListItem } from '../../SimpleComponents';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const Settings = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {navigate} = useNavigation();
  return (
    <>
      <View />
      <ScrollView style={{...styles.root, ...backgroundStyle}}>
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
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default Settings;
