import React from 'react';
import {TouchableHighlight, StyleSheet, Text} from 'react-native';
import _style from '../styles/Typrograhpy';
import PropTypes from 'prop-types';

function Button(props) {
  return (
    <TouchableHighlight
      underlayColor="#5395B5"
      {...props}
      style={[
        _s.container,
        props.type == 'primary' ? {backgroundColor: '#68BBE3'} : {paddingHorizontal: 0,},
      ]}>
      <Text style={[
        _s.btnText,
        props.type == 'primary' ? {color: 'white'} : {color: '#9FA0AB'},
      ]}>
        {props.btnText}</Text>
    </TouchableHighlight>
  );
}


const _s = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,        
  },
  btnText: {
    ..._style.btnText,
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
});

Button.propTypes = {
  btnText: PropTypes.string,
  type: PropTypes.string,
  onPress: PropTypes.func
};

Button.defaultProps = {
  type: "primary"
}

export default Button;
