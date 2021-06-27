import React, {useEffect, useState} from 'react';
import _style from '../../../styles';
import Container from '../../../components/Container';
import Header from '../../../components/Header';
import {
  RefreshControl,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

function Setting() {

  return (
    <Container>
      <Header name="Settings" />
      
    </Container>
  );
}

const _s = StyleSheet.create({
  btnContainer: {
    paddingVertical: 10,
    // paddingHorizontal: 15,
  },
  btnText: {
    ..._style.listItemText,
    flex: 1,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    ..._style.mx10
  },
});

export default Setting;
