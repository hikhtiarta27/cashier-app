/* eslint-disable */
import React from 'react';
import {TouchableHighlight, StyleSheet, Text} from 'react-native';
import _style from '../styles/Typrograhpy';
import PropTypes from 'prop-types';

function Button(props) {
  return (
    <TouchableHighlight
      underlayColor="#5395B5"
      {...props}
      style={[_s.container(props.type), props.style]}>
      <Text style={_s.btnText(props.type)}>{props.btnText}</Text>
    </TouchableHighlight>
  );
}

const _s = StyleSheet.create({
  container: type => ({
    backgroundColor: type == 'primary' ? '#68BBE3' : null,
    paddingHorizontal: type == 'primary' ? 15 : 0,
    paddingVertical: 10,
  }),
  btnText: type => ({
    ..._style.btnText,
    color: type == 'primary' ? 'white' : '#9FA0AB',
    textAlign: 'center',
    textTransform: 'uppercase',
  }),
});

Button.propTypes = {
  /**
   * Button Text
   */
  btnText: PropTypes.string.isRequired,
  /**
   * Button Type: Primary | Secondary
   */
  type: PropTypes.string,
  /**
   * Button handler
   */
  onPress: PropTypes.func,
};

Button.defaultProps = {
  type: 'primary',
};

export default Button;
