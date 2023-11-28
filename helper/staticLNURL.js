import {bech32} from 'bech32';
import Toast from 'react-native-toast-message';

export const handleStaticLNURL = (
  boltURL,
  lndInvoice,
  setBoltServiceCallback,
  setBoltLoading,
) => {
  const lnurlbetch = boltURL.substring(10);
  const decoded = bech32.decode(lnurlbetch, 2000);
  let requestByteArray = bech32.fromWords(decoded.words);
  const lnurl = Buffer.from(requestByteArray).toString();
  console.log('*** LNURL', lnurl);

  return fetch(lnurl)
    .then(response => {
      console.log(response);
      // setBoltServiceResponse(true);
      return response.json();
    })
    .then(async data => {
      console.log('lnurl request', data);
      if (data.callback && data.k1) {
        const callback = new URL(data.callback);
        callback.searchParams.set('k1', data.k1);
        callback.searchParams.set('pr', lndInvoice);
        console.log('callback.toString()', callback.toString());
        return await fetch(callback.toString())
          .then(cbResponse => cbResponse.json())
          .then(cbData => {
            if (cbData.status == 'ERROR') {
              Toast.show({
                type: 'error',
                text1: 'LNURL Error',
                text2: cbData.reason,
              });
              setBoltLoading(false);
              return 'failed';
            } else {
              setBoltServiceCallback(true);
              return 'success';
            }
          });
      } else {
        console.error('no callback or k1 specified!');
        return 'failed';
      }
    });
};
