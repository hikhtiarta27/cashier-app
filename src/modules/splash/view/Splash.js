import {useNavigation} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {Animated, View, Text} from 'react-native';
import Container from '../../../components/Container';
import _style from '../../../styles/Typrograhpy';

function Splash() {
  const [fade, setFade] = useState(new Animated.Value(0));
  // const navigation = useNavigation();
  // const dispatch = useDispatch()

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: true,
    }).start();
  });
  return (
    <Container>
      <Animated.View
        style={[
          {padding: 20, justifyContent: 'center', alignItems: 'center', flex: 1,},
          {
            opacity: fade
          },
        ]}>
        <Text style={_style.h6}>Cashier APP</Text>
      </Animated.View>
    </Container>
  );
}

export default Splash;
