import React from 'react'
import {Text, StyleSheet} from 'react-native'
import PropTypes from 'prop-types'
import _style from '../styles/Typrograhpy';

function ErrorText(props){
  return(
    <Text style={_s.errorText}>{props.text}</Text>
  );
}

const _s = StyleSheet.create({
  errorText: {
    ..._style.errorText,
    color: "red",
    marginTop: 8
  }
})

ErrorText.propTypes = {
  text: PropTypes.string
}

export default ErrorText;