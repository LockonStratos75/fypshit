import "react-native-gesture-handler";
import {AppNavigator} from "./navigation/AppNavigator";

import React, {useCallback} from "react";
import {StyleSheet} from "react-native";
import {StatusBar} from "expo-status-bar";




function App() {
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
    // backgroundColor: "#485096",
    borderColor: 'rgba(33,37,41,0.12)',
    borderWidth: 2,
    width: "90%",
    borderRadius: 12,
    height: 52,
    paddingLeft: 20,
    marginBottom: 16,
    color: "#212529",
    fontWeight: 'bold',
    fontSize: 16,
  },
  h1: {
    fontSize: 32,
    fontWeight: "900",
    color: "#212529",
    marginTop: 64,
    marginLeft: 20,
  },

  h1Center: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    marginTop: 64,
    // marginLeft: 20,
  },

  h2: {
    fontSize: 16,
    color: "rgba(33,37,41,0.72)",
    marginTop: 4,
    marginLeft: 20,
    fontWeight: "bold",
  },

  h2Normal: {
    fontSize: 16,
    color: "rgba(33,37,41,0.07)",
    marginTop: 14,
    fontWeight: "bold",
  },

  h2Color: {
    fontSize: 16,
    color: "#212529",
    marginTop: 14,
    marginLeft: 20,
    fontWeight: "bold",
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
  },

  buttTitle: {
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },

  bodyText: {
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
    height: '94%'
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
    color: 'white',
  },
  botMessageText: {
    color: 'black'
  },
  boldText: {
    fontWeight: 'bold',
  },
  rowDirection: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },

  smallInput: {
    // backgroundColor: "#485096",
    borderRadius: 12,
    height: 52,
    color: "#212529",
    borderColor: 'rgba(33,37,41,0.12)',
    borderWidth: 2,
    paddingLeft: 20,
    // marginBottom: 16,
    width: '70%',
    marginRight: 10
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
  }
});
export default App;
