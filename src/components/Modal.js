import React from 'react';
import Modal from 'react-native-modal';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types'
import _style from '../styles/Typrograhpy';
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

function ModalComp(props) {
  return (
    <Modal
      {...props}
      isVisible={props.isVisible}
      onBackdropPress={props.closeBtn}
      onBackButtonPress={props.closeBtn}
      style={_s.container}>
      <View style={_s.childContainer}>                  
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={_s.btnContainer} onPress={props.closeBtn}>
            <AntDesignIcon name="close" size={25} color={"#000"}/>
          </TouchableOpacity>
          <View style={{marginLeft: 15,}}>
            <Text style={_s.nameText}>{props.name}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const _s = StyleSheet.create({
  container:{
    // ..._style.my10,     
    margin: 0,  
    flex: 1,  
  },
  btnContainer:{
    ..._style.mr10,
    paddingHorizontal: 8,
    paddingVertical: 5,  
  },
  childContainer:{
    flex: 1, backgroundColor: "white",
    ..._style.px10,    
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  nameText:{
    ..._style.bodyText,
    fontSize: 20,
  }
})

ModalComp.propTypes = {
  closeBtn: PropTypes.func,
  isVisible: PropTypes.bool
}

export default ModalComp;
