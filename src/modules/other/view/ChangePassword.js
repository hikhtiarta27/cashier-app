import React, {useCallback, useEffect, useState} from 'react';
import _s from '../Styles';
import Container from '../../../components/Container';
import Header from '../../../components/Header';
import {
  Alert,
  TextInput,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableHighlight,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/core';
import Modal from 'react-native-modal';
import {View} from 'react-native-animatable';
import Button from '../../../components/Button';
import ErrorText from '../../../components/ErrorText';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import _style from '../../../styles';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {setPassword} from '../OtherAction'

const changePasswordScheme = Yup.object().shape({
  password: Yup.string().required('Required'),
  retypePassword: Yup.string().required('Required').oneOf([Yup.ref('password'), null], "Password didn't match"),
});

const formList = [
  {
    key: 'password',
    value: 'Password',
  },
  {
    key: 'retypePassword',
    value: 'Re-type Password',
  },
];

function ChangePassword(){

  const user = useSelector(state => state.user)  
  const navigation = useNavigation();

  const dispatch = useDispatch() 
  const formik = useFormik({
    initialValues: {
      password: '',
      retypePassword: '',
    },
    validationSchema: changePasswordScheme,
    onSubmit: async values => {
      Alert.alert(
        "Information",
        "Password succesfully changed",
        [
          {
            text: "Ok",
            onPress: ()=> {
              dispatch(setPassword(values.password))
              navigation.goBack()
            }
          }          
        ]
      )
    },
  });


  return(
    <Container>
      <Header
        backBtn        
        name="Change Password"
      />
      <ScrollView>
          {formList.map((item, index) => (
            <View style={_s.fieldContainer} key={index}>
              <Text style={_s.fieldHeaderText}>{item.value}</Text>
              <View style={{marginHorizontal: 10}}>
                <TextInput
                  style={_s.fieldText}
                  contextMenuHidden={true}
                  key={index}
                  onChangeText={formik.handleChange(item.key)}
                  onBlur={formik.handleBlur(item.key)}
                  value={formik.values[item.key]}
                  clearButtonMode="while-editing"
                  returnKeyType="done"   
                  secureTextEntry           
                  onSubmitEditing={formik.handleSubmit}    
                />
                {formik.errors[item.key] && formik.touched[item.key] ? (
                  <ErrorText text={formik.errors[item.key]} />
                ) : null}
              </View>              
            </View>
          ))}        
          <Button btnText="Submit" onPress={formik.handleSubmit} />  
        </ScrollView>
    </Container>
  );
}

export default ChangePassword;