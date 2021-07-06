import React, { useState } from 'react';
import {View, TextInput, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import {Formik, useFormik} from 'formik';
import * as Yup from 'yup';
import _style from '../../../styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { queryFetch } from '../../database/DBAction';
import { QUERY_STORE } from '../../../config/StaticQuery';
import ErrorText from '../../../components/ErrorText';
import { setStore } from '../MasterAction';

const storeScheme = Yup.object().shape({
  id: Yup.string().required('Required'),
  name: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
  api_url: Yup.string().required('Required')
});

const formList = [
  {
    key: 'id',
    value: 'ID',
  },
  {
    key: 'name',
    value: 'Name',
  },
  {
    key: 'password',
    value: 'Password',
  },
  {
    key: 'api_url',
    value: 'API Url'
  }
];

function MasterStoreEdit() {
  
  const route = useRoute()
  const [items, setItems] = useState(route.params)
  const dispatch = useDispatch()
  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: {
      id: items.id,
      name: items.name,
      password: items.password,
      api_url: items.api_url
    },
    validationSchema: storeScheme,
    onSubmit: async (values) => {
      if(values.name.toUpperCase() == 'DEFAULT_NAME') formik.setFieldError('name', "DEFAULT_NAME can't be used");
      if(values.id.toUpperCase() == 'DEFAULT_ID') formik.setFieldError('id', "DEFAULT_ID can't be used");
      if(values.name.toUpperCase() != 'DEFAULT_NAME' || values.id.toUpperCase() != 'DEFAULT_ID') {
        let param = []     
        param.push(values.id) 
        param.push(values.name)
        param.push(values.password)
        param.push(values.api_url)
        await apiDeleteStore()
        await apiInsertStore(param)
        await setStore(param)
        Alert.alert("Information", "Master Store successfully updated!", 
          [
            {
              text: 'Ok',
              onPress: () => navigation.goBack(),
              style: 'default',
            },
          ]
        )
      }      
    },
  });

  function apiInsertStore(param) {
    dispatch(
      queryFetch({
        sql: QUERY_STORE.INSERT,
        param: param,
      }),
    );
  }

  function apiDeleteStore() {
    dispatch(
      queryFetch({
        sql: QUERY_STORE.DELETE,
      }),
    );
  }

  return (
    <Container>
      <Header
        backBtn={true}
        name="Master Store Edit"
        submitBtn
        submitBtnFunc={formik.handleSubmit}
        submitBtnName="Submit"
      />
      <ScrollView>
      {formList.map((item, index) => (
        <View style={_style.fieldContainer} key={index}>
          <Text style={_style.fieldHeaderText}>{item.value}</Text>
          <View style={_style.mx10}>
            <TextInput
              style={_style.fieldText}
              key={index}
              editable={item.key == 'code' || item.key == 'created_date' ? false : true}
              selectTextOnFocus={item.key == 'code' || item.key == 'created_date' ? false : true}
              onChangeText={formik.handleChange(item.key)}
              onBlur={formik.handleBlur(item.key)}
              value={formik.values[item.key]}
              clearButtonMode="always"
            />
            {formik.errors[item.key] && formik.touched[item.key] ? (
              <ErrorText text={formik.errors[item.key]} />
            ) : null}
          </View>
        </View>
      ))}   
      </ScrollView>   
    </Container>
  );
}

export default MasterStoreEdit;
