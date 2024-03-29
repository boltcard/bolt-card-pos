import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  ActivityIndicator
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ListItem, Text, Badge, Button} from 'react-native-elements';
import Toast from 'react-native-toast-message';
import {ShopSettingsContext} from '../../contexts/ShopSettingsContext';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { LightningCustodianWallet } from '../../wallets/lightning-custodian-wallet.js';
import moment from 'moment';

const queryLimit = 10;

const RecentInvoices = () => {
  const {navigate} = useNavigation();
  
  const {shopName, lndhub, lndhubUser, shopWallet} = useContext(ShopSettingsContext);
  const [invoices, setInvoices] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  //pagination
  const [queryOffset, setQueryOffset] = useState(0);
  const [queryEndReached, setQueryEndReached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const textStyle = {
    color: isDarkMode ? "#fff" : "#000",
  };

  const fetchInvoices = useCallback(async (offset = 0) => {
      try{
        await shopWallet.authorize();
        const foundInvoices = await shopWallet?.getUserInvoices(queryLimit, offset);
        if (foundInvoices && Array.isArray(foundInvoices)) {
          if(foundInvoices.length < offset + queryLimit) setQueryEndReached(true);
          setInvoices(foundInvoices);
        }
        setRefreshing(false)
      } catch(err) {
        Toast.show({
          type: 'error',
          text1: 'Fetch invoice error',
          text2: err.message
        });
        setRefreshing(false)
        console.log(err);
      } finally {
        setIsLoading(false);
      }

  }, [shopWallet, invoices])

  const onRefresh = () => {
    setRefreshing(true);
    setQueryEndReached(false);
    if(queryOffset == 0) {
      fetchInvoices();
    } else {
      setQueryOffset(0);
    }
  }

  useEffect(() => {
    if(shopWallet) fetchInvoices(queryOffset);
  }, [queryOffset])

  useEffect(()=> {
    if(shopWallet) fetchInvoices();

  }, [shopWallet])

  return (
    <>
      <View />
      <View style={{...styles.root, ...backgroundStyle}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text h3 h3Style={{...textStyle, marginBottom: 20}}>Recent Invocies</Text>
          <Button
            icon={{
              name: 'qrcode-scan',
              type: 'material-community',
              color: isDarkMode ? "#fff" : "#000"
            }}
            type="clear"
            onPress={() => navigate('ScanInvoice')}
          ></Button>
        </View>
        { isLoading
          ?
          <ActivityIndicator size="large" />
          :
          <FlatList
            data={invoices}
            ListEmptyComponent={<Text style={textStyle}>There are no invoices to show</Text>}
            renderItem={({item: inv}) => {
              const formattedDate = moment(inv.timestamp * 1000).format('DD/MM/YY HH:mm:ss');
              return (
                <ListItem bottomDivider onPress={() => navigate('Invoice Detail', {invoice: inv})} containerStyle={{...backgroundStyle}}>
                  <ListItem.Content>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                      <ListItem.Title style={textStyle}>{formattedDate}</ListItem.Title>
                      <ListItem.Subtitle style={{...textStyle, textAlign: 'right'}}>
                        {inv.amt} sats
                      </ListItem.Subtitle>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                      <ListItem.Subtitle numberOfLines={1} style={{...textStyle, flex: 1}}>{inv.payment_hash}</ListItem.Subtitle>
                      <ListItem.Subtitle style={{textAlign: 'right'}}>
                        {inv.ispaid ? <Badge status="success" value="Paid" /> : <Badge status="warning" value="Pending" />}
                      </ListItem.Subtitle>
                    </View>
                  </ListItem.Content>
                </ListItem>
              );
            }}
            keyExtractor={(item, index) => index}
            extraData={shopWallet}
            getItemLayout={(data, index) =>(
              {length: 72.5, offset: 72.5 * index, index}
            )}
            onEndReached={() => {
              if(!queryEndReached) setQueryOffset((prevOffset) => prevOffset + queryLimit)
            }}
            onEndReachedThreshold={0.2}
            refreshing={refreshing}
            onRefresh={onRefresh}
            style={backgroundStyle}
          />

        }
        <View style={{paddingVertical: 30}}></View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10
  },
  saveButton: {
    backgroundColor: '#f90',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#000',
    textAlign: 'center',
  },
});

export default RecentInvoices;
