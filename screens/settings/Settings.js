import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View, useColorScheme, Text, Image, TouchableOpacity, Linking} from 'react-native';
import { SimpleListItem } from '../../SimpleComponents';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { getApplicationName, getBuildNumber, getBundleId, getUniqueId, getVersion, hasGmsSync } from 'react-native-device-info';

const Settings = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const textStyle = {
    color: isDarkMode ? '#fff' : '#000',
    borderColor: isDarkMode ? '#fff' : '#000',
  };
  const {navigate} = useNavigation();
  return (
    <>
      <View style={{...styles.root, ...backgroundStyle}}>
        <View style={{flex:2}}>
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
        </View>
        <View style={{flex:1}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor:'#fff', paddingTop:20, paddingBottom:20}}>
            <TouchableOpacity onPress={() => Linking.openURL("https://onesandzeros.nz")}>
              <Image
                style={{width: 120, height: 50}}
                source={require('../../img/OAZ-Logo.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://www.whitewolftech.com")}>
              <Image
                style={{width: 170, height: 50}}
                source={require('../../img/wwt-on-white-sample.png')}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.text}>
            {getApplicationName() + ' ver ' + getVersion() + ' (build ' + getBuildNumber() + ')'}
          </Text>
          <Text style={styles.text}>
            {'Built: ' + new Date(getBuildNumber() * 1000).toString()}
          </Text>
        </View>
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
    padding:10,
    textAlign:'center'
  }
});

export default Settings;
