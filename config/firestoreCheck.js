import firestore from '@react-native-firebase/firestore';


export async function checkFireStore(){
    return  await firestore().collection('chat_sessions').get();
}

