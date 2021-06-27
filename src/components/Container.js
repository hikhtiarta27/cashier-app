import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar
} from 'react-native'
import Snackbar from 'react-native-snackbar';

function Container(props){
  return (
    <View style={_style.container}>      
      {/* <StatusBar backgroundColor="white" barStyle="dark-content" /> */}

      {props.children}
    </View>
  );
}

const _style = StyleSheet.create({
  container: {
    backgroundColor: "white",
    // paddingHorizontal: 10,
    flex: 1,
  }
})

export default Container;