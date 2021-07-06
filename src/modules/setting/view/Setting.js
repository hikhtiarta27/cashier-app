import React, {useCallback, useEffect, useState} from 'react';
import _style from '../../../styles';
import Container from '../../../components/Container';
import Header from '../../../components/Header';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,  
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  BluetoothManager,
} from 'react-native-bluetooth-escpos-printer';
import {setLoading} from '../../master/MasterAction';

function Setting() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [connectedDevice, setConnectedDevices] = useState({
    name: "",
    address: ""
  })

  async function checkPermissionBluetooth() {
    dispatch(setLoading(true));
    await BluetoothManager.isBluetoothEnabled().then(enabled => {
      if (enabled) scanDevices();
      else {
        dispatch(setLoading(false));
        Alert.alert('Error', 'Please turn on the bluetooth');
      }
    });
  }

  async function scanDevices() {
    await BluetoothManager.scanDevices().then(
      s => {
        let res = JSON.parse(s);        
        setPairedDevices(res.paired);
        dispatch(setLoading(false));
      },
      er => {
        console.error(er);
        dispatch(setLoading(false));
      },
    );
  }

  async function connectToPairedDevices(item) {   
    dispatch(setLoading(true)); 
    await BluetoothManager.connect(item.address) // the device address scanned.
      .then(
        s => {
          setConnectedDevices(item) 
          dispatch(setLoading(false));         
        },
        e => {
          Alert.alert('Error', 'Unable to connect device. Devices seems offline');
          console.error(e);
          setConnectedDevices({name: "", address: ""}) 
          dispatch(setLoading(false));
        },
      );
  }  

  return (
    <Container>
      <Header drawerBtn name="Printer Settings" submitBtn submitBtnName="Scan Devices" submitBtnFunc={checkPermissionBluetooth} />
      <View style={_style.flex1}>        
      {pairedDevices.length > 0 && <>
          <View style={_s.pairedHeaderContainer}>
            <Text style={_s.pairedHeader}>List Paired Devices</Text>
          </View>
          {pairedDevices.map((item, index)=>(
          <TouchableHighlight key={index} style={_style.px15} onPress={()=>connectToPairedDevices(item)} underlayColor="#eee">
            <View style={[_style.rowDirectionCenter, _style.px20]}>
              <View style={_style.flex1}>
                <Text style={_style.bodyText}>{item.name}</Text>
              </View>                            
              <Text style={[_style.listItemHeaderText, {marginRight: 10, color: '#68BBE3',}]}>{connectedDevice.address == item.address ? "Connected" : 'Connect'}</Text>
            </View>
          </TouchableHighlight>
        )) }  
        </>        
      }      
      </View>
    </Container>
  );
}

const _s = StyleSheet.create({  
  pairedHeaderContainer: {
    paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#274472'
  },
  pairedHeader:{
    ..._style.listItemHeaderText,
    color: "white"
  }
});

export default Setting;
