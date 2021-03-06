import {useNavigation} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {Animated, View, Text} from 'react-native';
import Container from '../../../components/Container';
import _style from '../../../styles/';

function Splash() {
  const [fade, setFade] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: true,
    }).start();
  });
  return (
    <View style={_style.flex1}>
      <Animated.View
        style={[
          {padding: 20, justifyContent: 'center', alignItems: 'center', flex: 1,},
          {
            opacity: fade
          },
        ]}>
        <Text style={_style.h6}>POS APP</Text>
      </Animated.View>
    </View>
  );
}

export default Splash;
