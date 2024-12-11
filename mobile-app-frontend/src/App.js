import "react-native-gesture-handler";
import {AppNavigator} from "./navigation/AppNavigator";


import React, {useCallback} from "react";
import {StyleSheet} from "react-native";
import {StatusBar} from "expo-status-bar";
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold, Poppins500Medium} from '@expo-google-fonts/poppins';



function App() {
  useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins500Medium,
    Poppins_600SemiBold
    // Load the Poppins bold font
  });
  return (
    <>
    <StatusBar backgroundColor="#ffffff" style="dark"/>
    <AppNavigator />
    </>
  );
}

export const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    // alignItems: 'center',
    padding: 20,
    paddingTop: 0,
    marginTop: 36,
  },

  wrapperCenter: {
    backgroundColor: "#FDFDFD",
    height: "100%",
    alignItems: "center",
    padding: 20,
    paddingTop: 0,
  },
  inputForm: {
    marginTop: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    fontFamily: 'Poppins_600SemiBold',

    // backgroundColor: "#485096",
    borderColor: 'rgba(33,37,41,0.12)',
    borderWidth: 2,
    width: "90%",
    borderRadius: 12,
    height: 52,
    paddingLeft: 20,
    marginBottom: 16,
    color: "#212529",
    fontSize: 16,
  },
  h1: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: "#212529",
    marginTop: 64,
    marginLeft: 20,
  },

  h1Center: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: "#212529",
    marginTop: 64,
    // marginLeft: 20,
  },

  h2: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "rgba(33,37,41,0.72)",
    marginTop: 4,
    marginLeft: 20,
  },

  h2Normal: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "rgba(33,37,41,0.07)",
    marginTop: 14,
  },

  h2Color: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "#212529",
    marginTop: 14,
    marginLeft: 20,
  },
  buttOuter: {
    // backgroundColor: "#F3AE8B",
    width: "90%",
    borderRadius: 16,
    height: 52,
    marginTop: 16,
    justifyContent: 'center',
  },

  wrapper2: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  buttTitle: {
    fontFamily: 'Poppins_600SemiBold',
    color: "white",
    textAlign: "center",
  },

  bodyText: {
    fontFamily: 'Poppins_400Regular',
    color: "black",
    fontSize: 14,
    // marginTop: 14,
    marginLeft: 20,
    marginBottom: 10,
  },
  noMargin: {
    margin: 0,
    textAlign: "center",
    // color: "#",
    fontSize: 14,
  },

  bodyText2: {
    fontFamily: 'Poppins_400Regular',
    color: "black",
    fontSize: 14,
    // marginTop: 14,
    marginLeft: 20,
    marginBottom: 10,
  },

  info: {
    width: "100%",
    // height: 120,
    backgroundColor: "#f2f2f2",
    // padding: 10,
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "center",
    // alignItems: "center",
    marginTop: 16,
  },

  cardText: {
    width: "65%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingBottom: 10,
  },

  cardText2: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingBottom: 10,
  },

  img: {
    width: 110,
    height: 120,
    resizeMode: "contain",
  },

  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    // marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  iconImg: {
    width: 25,
    height: 25,
    // marginRight: 55,
  },
  botContainer: {
    height: '99%'
  },
  messageContainer: {
    flex: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#164D82',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    maxWidth: '70%',
    borderBottomRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8E9EB',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    padding: 10,
    margin: 5,
    maxWidth: '70%',
  },
  messageText: {
    fontFamily: 'Poppins_400Regular',
    color: 'white',
  },
  botMessageText: {
    fontFamily: 'Poppins_400Regular',
    color: 'black'
  },
  boldText: {
    fontFamily: 'Poppins_900Bold',

  },
  rowDirection: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  smallInput: {
    fontFamily: 'Poppins_400Regular',
    display: 'flex',
    justifyContent: 'center',
    // backgroundColor: "#485096",
    borderRadius: 12,
    height: 52,
    color: "#212529",
    borderColor: 'rgba(33,37,41,0.12)',
    borderWidth: 2,
    paddingLeft: 20,
    margin: 20,
    // marginBottom: 16,
    width: '70%',
    padding:10,
    // marginRight: 10
  },
  fullWidth: {
    width: "100%",

    alignItems: "center",
  },

  caption: {
    marginTop: '90%',
    fontSize: 12,
    color: "#9D9AB5",

  },

  mainCap: {
    color: '#164D82',
    fontWeight: 'bold'
  },

  fiveMargin: {
    margin: 5
  },
  bottomMarg: {
    marginBottom: 40,
  },

  dropdown: {
    // borderWidth: 1,
    borderColor: '#ccc',
    // borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff'
  },
  dropdownText: {
    fontFamily: 'Poppins_600SemiBold',

    // backgroundColor: "#485096",
    // borderColor: 'rgba(33,37,41,0.12)',
    // borderWidth: 2,
    // width: "90%",
    // borderRadius: 12,
    // height: 52,
    // paddingLeft: 20,
    // marginBottom: 16,
    color: "#212529",

  },
  dropdownList: {
    borderColor: '#ccc',
    maxHeight: 150,
    fontFamily: 'Poppins_600SemiBold',

    // backgroundColor: "#485096",
    // borderColor: 'rgba(33,37,41,0.12)',
    borderWidth: 2,
    width: "90%",
    borderRadius: 12,
    paddingLeft: 20,
    marginBottom: 16,
    color: "#212529",
    fontSize: 16,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    alignSelf: 'flex-start',
    marginLeft: 30,
  }


});
export default App;
