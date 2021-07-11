import React, { useState } from 'react';
import {View, TextInput, Text, StyleSheet, Alert} from 'react-native';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import {Formik, useFormik} from 'formik';
import * as Yup from 'yup';
import _style from '../../../styles/';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { queryFetch } from '../../database/DBAction';
import { QUERY_CATEGORY } from '../../../config/StaticQuery';

const categoryScheme = Yup.object().shape({
  code: Yup.string().required('Required'),
  name: Yup.string().required('Required'),
});

const formList = [
  {
    key: 'code',
    value: 'Code',
  },
  {
    key: 'name',
    value: 'Name',
  },
  {
    key: 'created_date',
    value: 'Created Date',
  },
];

function MasterCategoryEdit() {
  
  const route = useRoute()
  const [items, setItems] = useState(route.params)
  const dispatch = useDispatch()
  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: {
      code: items.code,
      name: items.name,
      created_date: items.created_date
    },
    validationSchema: categoryScheme,
    onSubmit: async (values) => {
      let param = []     
      param.push(values.name) 
      param.push(values.code)
      await apiUpdateCategory(param)
      Alert.alert("Information", "Master Category successfully updated!", 
        [
          {
            text: 'Ok',
            onPress: () => navigation.goBack(),
            style: 'default',
          },
        ]
      )
    },
  });

  function apiUpdateCategory(param){
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.UPDATE,
      param
    }))
  }
  

  return (
    <Container>
      <Header
        backBtn={true}
        name="Master Category Edit"
        submitBtn
        submitBtnFunc={formik.handleSubmit}
        submitBtnName="Submit"
      />
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
          </View>
        </View>
      ))}      
    </Container>
  );
}

export default MasterCategoryEdit;
