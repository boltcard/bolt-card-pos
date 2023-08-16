import { Pressable, Text, View } from 'react-native';

export default function PinCodeButton(props): JSX.Element {
    return  (
        <Pressable 
            style={{flex: 1, alignItems: 'center'}} 
            onPress={()=>{ props.onPress() }}>
                <View
                    style={{
                        backgroundColor:'#fff',
                        opacity: 0.6,
                        borderWidth:1, 
                        borderColor:'#fff',
                        borderRadius: 85,
                        borderColor: 'transparent',
                        padding: 5,
                        textAlign: 'center',
                        height: 85,
                        width: 85,
                        justifyContent: 'center'
                    }}>
                        <>
                            {props.childComponent && props.childComponent}
                        </>
                        {props.number && 
                            <Text
                                style={{
                                    opacity: 1,
                                    fontSize:30,
                                    textAlign:'center',
                                    padding:10,
                                    fontWeight:'bold',
                                    margin:1,
                                    color:'#000',
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    ...props.textStyle
                            }}>
                                {props.number}
                            </Text>
                        }
                    

                </View>
        </Pressable>
    );
}