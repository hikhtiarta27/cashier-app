import React, {useEffect} from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native'
import _style from '../styles';
import PropTypes from 'prop-types'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import OctoIcon from 'react-native-vector-icons/Octicons'
import {useNavigation} from '@react-navigation/native'
import { useDispatch } from 'react-redux';
import { queryFetch } from '../modules/database/DBAction';

function Header(props){

  const navigation = useNavigation()
  const dispatch = useDispatch()

  function goBack(){
    navigation.goBack()
  }

  function toggleDrawer(){
    navigation.toggleDrawer()
  }

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('drawerClose', (e) => {
  //     // Do something
  //     dispatch(queryFetch({
  //       sql: "",
  //     }))
  //   });
  
  //   return unsubscribe;
  // }, [navigation]);

  return (
    <View style={_s.container}>
      {props.backBtn ? 
        <TouchableOpacity style={_s.btnContainer} onPress={goBack}>
          <AntDesignIcon name="arrowleft" size={20} color={"#000"}/>
        </TouchableOpacity>
      : null}
      {props.drawerBtn ? 
        <TouchableOpacity style={_s.btnContainer} onPress={toggleDrawer}>
          <OctoIcon name="three-bars" size={20} color={"#000"}/>
        </TouchableOpacity>
      : null}      
      <Text style={[_style.h6, {flex: 1,}]}>
        {props.name}
      </Text>
      {props.submitBtn? 
        <TouchableOpacity style={_s.btnContainer} onPress={props.submitBtnFunc}>
          {props.submitBtnComponent ? props.submitBtnComponent : <Text style={_s.btnSubmitText}>{props.submitBtnName}</Text>}
        </TouchableOpacity>
      : null}
    </View>
  );
}

const _s = StyleSheet.create({
  container:{
    // ..._style.my10,
    ..._style.px10,    
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    backgroundColor: "#fff"
  },
  btnContainer:{
    ..._style.mr10,
    paddingHorizontal: 8,
    paddingVertical: 5,  
  },
  btnSubmitText:{
    color: '#68BBE3',    
    ..._style.btnText
  }
})

Header.propTypes = {
  backBtn: PropTypes.bool,
  drawerBtn: PropTypes.bool,
  name: PropTypes.string,
  submitBtn: PropTypes.bool,
  submitBtnFunc: PropTypes.func,
  submitBtnName: PropTypes.string,
  submitBtnComponent: PropTypes.element
}

export default Header;