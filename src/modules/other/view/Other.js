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
import { useSelector } from 'react-redux';

const otherScheme = Yup.object().shape({
  password: Yup.string().required('Required'),
});

const formList = [
  {
    key: 'password',
    value: 'Password',
  },
];

const menuList = [
  "History Report",
  "Change Password"
];

function Other() {
  const user = useSelector(state => state.user)
  const [passwordDialog, setPasswordDialog] = useState(false);
  const navigation = useNavigation()
  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: otherScheme,
    onSubmit: async values => {
      if(values.password != user.password){
        formik.setFieldError("password", "Wrong password")
      }else{
        setPasswordDialog(false)        
      }
    },
  });

  useEffect(() => {
    showPasswordDialog();
  }, []);

  useFocusEffect(
    useCallback(() => {      
      const subscribe = showPasswordDialog();
      formik.resetForm()
      return () => subscribe;
    }, []),
  );

  function showPasswordDialog() {
    setPasswordDialog(true);
  }

  return (
    <Container>
      {passwordDialog ? <Header
        drawerBtn        
        name="Other"
        submitBtn
        submitBtnFunc={formik.handleSubmit}
        submitBtnName="Submit"
      />
      : 
      <Header
        drawerBtn        
        name="Other"        
      />
      }
      {passwordDialog && (
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
              <Text style={_s.hint}>You need password to use this menu</Text>              
            </View>
          ))}          
        </ScrollView>
      )}
      {!passwordDialog && (     
        menuList.map((item, index)=>(
          <TouchableHighlight key={index} style={{paddingVertical: 15,}} onPress={()=>navigation.navigate(index == 0 ? 'OtherHistory' : 'ChangePassword')} underlayColor="#eee">
            <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,}}>
              <View style={{flex: 1,}}>
                <Text style={_style.listItemHeaderText}>{item}</Text>
              </View>
              <AntDesignIcon name="right" size={20} color="#888" />
            </View>
          </TouchableHighlight>
        ))           
      )}
    </Container>
  );
}

export default Other;
