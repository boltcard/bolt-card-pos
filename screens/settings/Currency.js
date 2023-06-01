import React, {useState, useEffect, useContext} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  FlatList,
  ListItem,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SimpleListItem} from '../../SimpleComponents';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';
const data = Object.values(FiatUnit);
const currency = require('../../helper/currency');
import {FiatUnit, FiatUnitSource, getFiatRate} from '../../models/fiatUnit';

const CurrencySettings = (props) => {

  const { navigate } = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  
  const {setPreferredFiatCurrency} = useContext(ShopSettingsContext);
  const [isSavingNewPreferredCurrency, setIsSavingNewPreferredCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [currencyRate, setCurrencyRate] = useState({ LastUpdated: null, Rate: null });
  
  const fetchCurrency = async () => {
    let preferredCurrency = FiatUnit.USD;
    try {
      preferredCurrency = await currency.getPreferredCurrency();
      if (preferredCurrency === null) {
        throw Error('preferredCurrency === null');
      }
      setSelectedCurrency(preferredCurrency);
    } catch (_error) {
      setSelectedCurrency(preferredCurrency);
    }
    const mostRecentFetchedRate = await currency.mostRecentFetchedRate();
    setCurrencyRate(mostRecentFetchedRate);
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  if (selectedCurrency !== null && selectedCurrency !== undefined) {
    return (
      <>
        <View />
        <ScrollView style={{...styles.root, ...backgroundStyle}}>
          <Text>CURRENCY</Text>

          <FlatList
            style={styles.flex}
            keyExtractor={(_item, index) => `${index}`}
            data={data}
            initialNumToRender={50}
            extraData={data}
            renderItem={({item}) => {
              return (
                <ListItem
                  disabled={isSavingNewPreferredCurrency}
                  title={`${item.endPointKey} (${item.symbol})`}
                  checkmark={selectedCurrency.endPointKey === item.endPointKey}
                  onPress={async () => {
                    setIsSavingNewPreferredCurrency(true);
                    try {
                      await getFiatRate(item.endPointKey);
                      await currency.setPrefferedCurrency(item);
                      await currency.init(true);
                      await fetchCurrency();
                      setSelectedCurrency(item);
                      setPreferredFiatCurrency();
                    } catch (error) {
                      console.log(error);
                      alert(loc.settings.currency_fetch_error);
                    } finally {
                      setIsSavingNewPreferredCurrency(false);
                    }
                  }}
                />
              );
            }}
          />
        </ScrollView>
      </>
    );
  }
  return (
    <View style={styles.activity}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});


export default CurrencySettings;