import {ActivityIndicator, StyleSheet, Text, View, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button, Card} from 'react-native-elements';

export const CardModal = (props: any) => {
  const {
    lndInvoice,
    invoiceIsPaid,
    boltLoading,
    retryBoltcardPayment,
    boltServiceCallback,
    boltServiceResponse,
  } = props;
  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });
  return (
    <Modal
      animationType="fade"
      visible={lndInvoice && !invoiceIsPaid && boltLoading}
      onRequestClose={retryBoltcardPayment}
      transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={{color: '#000', fontSize: 18}}>
            Card Detected. <Icon name="checkmark" color="darkgreen" size={20} />
          </Text>
          {boltServiceResponse && (
            <Text style={{color: '#000', fontSize: 18}}>
              Card Service connected{' '}
              <Icon name="checkmark" color="darkgreen" size={20} />
            </Text>
          )}
          {boltServiceCallback && (
            <>
              <Text style={{color: '#000', fontSize: 18}}>
                Card Service Callback{' '}
                <Icon name="checkmark" color="darkgreen" size={20} />
              </Text>
              <Text style={{color: '#000', fontSize: 18}}>
                Payment initiated...
              </Text>
            </>
          )}

          <ActivityIndicator size="large" color="#ff9900" />
          <View style={{padding: 20}}>
            <Button
              title="Retry Payment"
              onPress={retryBoltcardPayment}
              buttonStyle={{
                backgroundColor: '#ff9900',
              }}
              titleStyle={{
                fontSize: 20,
                fontWeight: 600,
                color: '#000',
              }}></Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
