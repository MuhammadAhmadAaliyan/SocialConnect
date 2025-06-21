import { View, Text, Pressable} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreatePostScreen = () => {

    let handleButton = async() => {
        try{
            await AsyncStorage.clear();
        }catch(e){}
    }

    return(
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 30}}>Welcome</Text>
            <Pressable onPress={() => handleButton()}><Text style={{fontSize: 30}}>Logout</Text></Pressable>
        </View>
    )
}

export default CreatePostScreen;