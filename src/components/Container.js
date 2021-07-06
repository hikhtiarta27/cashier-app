import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import { useSelector } from 'react-redux';
import _style from '../styles';
import Modal from 'react-native-modal'

function Container(props){
  const user = useSelector(state => state.user)  
  return (
    <View style={_s.container}>            
      {props.children}
      {user.store.name == "DEFAULT_NAME" && <View style={_s.storeContainer}>
        <Text style={_s.storeConfig}>You need to change store configuration in Master Store Menu</Text>
      </View>}

      
      <Modal isVisible={user.loading} style={_s.loadingContainer} backdropColor="rgba(0,0,0,0.15)">
        <View style={_style.rowDirectionCenter}>
          <ActivityIndicator size="small" color="white"/>
          <Text style={_s.loadingText}>Loading...</Text>
        </View>
      </Modal>      
    </View>
  );
}

const _s = StyleSheet.create({
  container: {
    backgroundColor: "white",    
    flex: 1,
  },
  storeConfig: {
    ..._style.bodyText,
    color: "white",
    textAlign: "center"
  },
  storeContainer:{
    paddingVertical: 3, backgroundColor: "#ff6961"
  },
  loadingContainer:{    
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    color: "white",
    ..._style.bodyText,
    marginLeft: 10,
  }
})

export default Container;