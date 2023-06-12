import { Pressable, Text } from 'react-native';

export default function App(props): JSX.Element {
    return  (
        <Pressable 
            style={{flex: 1}} 
            onPress={()=>{ props.onPress() }}>
                <Text
                    style={{
                        backgroundColor:'#FF9900',
                        fontSize:30,
                        textAlign:'center',
                        padding:10,
                        borderWidth:1, 
                        borderColor:'#fff',
                        fontWeight:'bold',
                        borderRadius:20,
                        borderColor: 'transparent',
                        margin:1
                }}>
                    {props.number}
                </Text>
        </Pressable>
    );
}