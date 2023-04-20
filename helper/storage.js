import AsyncStorage from '@react-native-async-storage/async-storage';

export const updateArray = async (key, newVal) => {
  return AsyncStorage.getItem(key, (err, oldArr) => {
    if (!oldArr) oldArr = '[]';
    let newArr = [...JSON.parse(oldArr), newVal];
      AsyncStorage.setItem(key, JSON.stringify(newArr), () => {
        // AsyncStorage.getItem(key, (err, result) => {
        //     console.log(key, result, JSON.parse(result));
        // });
    });
  });
};
