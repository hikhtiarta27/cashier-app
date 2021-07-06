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
import { queryFetch } from '../../database/DBAction';
import { QUERY_STORE } from '../../../config/StaticQuery';

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
  "Database Report"
];

function Other() {
  const query = useSelector(state => state.query)
  const dispatch = useDispatch()
  const [store, setStore] = useState({});
  const [passwordDialog, setPasswordDialog] = useState(true);
  const navigation = useNavigation()
  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: otherScheme,
    onSubmit: async values => {
      if(values.password != store.password){
        formik.setFieldError("password", "Wrong password")
      }else{
        setPasswordDialog(false)        
      }
    },
  });

  function apiGetStoreList() {
    dispatch(
      queryFetch({
        sql: QUERY_STORE.SELECT,
      }),
    );
  }

  useEffect(async() => {
    await showPasswordDialog();
    await apiGetStoreList();
  }, []);

  useFocusEffect(
    useCallback(() => {      
      const unsubscribe = apiGetStoreList();
      const unsubscribe1 = showPasswordDialog();
      formik.resetForm();
      return () => {
        unsubscribe, unsubscribe1;
      };
    }, []),
  );

  useEffect(() => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_STORE.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {          
          setStore(rows.item(0))
        } else {
          setStore(null);          
        }
      }
    }
  }, [query]);

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
            <View style={_style.fieldContainer} key={index}>
              <Text style={_style.fieldHeaderText}>{item.value}</Text>
              <View style={_style.mx10}>
                <TextInput
                  style={_style.fieldText}
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
              <Text style={_style.hint}>You need password to use this menu</Text>              
            </View>
          ))}          
        </ScrollView>
      )}
      <View style={_style.flex1}>
      {!passwordDialog && (     
        menuList.map((item, index)=>(
          <TouchableHighlight key={index} style={_style.py15} onPress={()=>navigation.navigate(index == 0 ? 'OtherHistory' : 'OtherDatabaseReport')} underlayColor="#eee">
            <View style={[_style.rowDirectionCenter, _style.px20]}>
              <View style={_style.flex1}>
                <Text style={_style.listItemHeaderText}>{item}</Text>
              </View>
              <AntDesignIcon name="right" size={20} color="#888" />
            </View>
          </TouchableHighlight>
        ))           
      )}
      </View>
    </Container>
  );
}

export default Other;
