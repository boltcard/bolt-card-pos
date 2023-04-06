import React from 'react';

import {StyleSheet, View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SimpleListItem} from '../../SimpleComponents';

const Settings = () => {
  const {navigate} = useNavigation();
  return (
    <>
      <View />
      <ScrollView style={styles.root}>
        <SimpleListItem
          title="LNBIT"
          onPress={() => console.log('TODO: navigate to QR code scan screen')}
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
