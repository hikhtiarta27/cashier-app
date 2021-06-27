import React, { useEffect, useState } from 'react';
import {View, TextInput, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import {Formik, useFormik} from 'formik';
import * as Yup from 'yup';
import _style from '../../../styles/Typrograhpy';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { queryFetch } from '../../database/DBAction';
import { QUERY_CATEGORY, QUERY_ITEM } from '../../../config/StaticQuery';
import {Picker} from '@react-native-picker/picker';
import ErrorText from '../../../components/ErrorText';

const itemsScheme = Yup.object().shape({
  code: Yup.string().required('Required'),
  // category_code: Yup.string().required('Required'),
  name: Yup.string().required('Required'),  
  price: Yup.string().matches(/^[0-9]+$/, "Only number").required('Required'),
  discount: Yup.string().matches(/^[0-9]+$/, "Only number").required('Required'),
});

const formList = [
  {
    key: 'code',
    value: 'Code',
  },
  // {
  //   key: 'category_code',
  //   value: 'Category',
  // },
  {
    key: 'name',
    value: 'Name',
  },    
  {
    key: 'price',
    value: 'Price',
  },
  {
    key: 'discount',
    value: 'Discount',
  },  
  {
    key: 'created_date',
    value: 'Created Date',
  },
];

function MasterItemEdit() {
  const query = useSelector(state => state.query);
  const route = useRoute()
  const [items, setItems] = useState(route.params)
  const dispatch = useDispatch()
  const navigation = useNavigation();
  const [categoryCode, setCategoryCode] = useState(items.category_code)
  const [categoryList, setCategoryList] = useState([]);

  useEffect(()=>{
    apiGetCategoryList()
  }, [])

  useEffect(()=>{
    if (query.send.sql == QUERY_CATEGORY.SELECT) {
      let rows = query.res.rows;
      if (rows.length > 0) {
        let resultList = [];
        for (let i = 0; i < rows.length; i++) {
          resultList.push(rows.item(i));
        }
        setCategoryList(resultList);
      } else {        
        setCategoryList([]);
      }
    }
  }, [query])

  function apiGetCategoryList(){
    dispatch(queryFetch({
      sql: QUERY_CATEGORY.SELECT
    }))
  }

  const formik = useFormik({
    initialValues: {
      code: items.code,
      // category_code: items.category_code,
      name: items.name,
      price: items.price.toString(),
      discount: items.discount.toString(),
      created_date: items.created_date,
    },
    validationSchema: itemsScheme,
    onSubmit: async (values) => {
      let param = []     
      param.push(categoryCode) 
      param.push(values.name)
      param.push(parseInt(values.price))
      param.push(parseInt(values.discount))
      param.push(values.code)
      await apiUpdateItems(param)
      Alert.alert("Information", "Master Items successfully updated!", 
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

  function apiUpdateItems(param){
    dispatch(queryFetch({
      sql: QUERY_ITEM.UPDATE,
      param
    }))
  }

  return (
    <Container>
      <Header
        backBtn={true}
        name="Master Items Edit"
        submitBtn
        submitBtnFunc={formik.handleSubmit}
        submitBtnName="Save"
      />
      <ScrollView>
      {formList.map((item, index) => (
        <View key={index}>
          {index == 1 ? 
          <View style={_s.fieldContainer} >
            <Text style={_s.fieldHeaderText}>Category</Text>          
            <View style={{marginHorizontal: 10}}>
              <Picker
                style={{marginLeft: -15}}
                selectedValue={categoryCode}
                onValueChange={(v, i) =>
                  setCategoryCode(v)
                }>
                {categoryList.map((cat, i)=>(
                  <Picker.Item key={i} label={cat.name} value={cat.code} />
                ))}
              </Picker>
            </View>
          </View>
          : null }
          <View style={_s.fieldContainer} >
            <Text style={_s.fieldHeaderText}>{item.value}</Text>          
            <View style={{marginHorizontal: 10}}>
              <TextInput
                style={_s.fieldText}
                key={index}
                editable={item.key == 'code' || item.key == 'created_date' ? false : true}
                selectTextOnFocus={item.key == 'code' || item.key == 'created_date' ? false : true}
                onChangeText={formik.handleChange(item.key)}
                onBlur={formik.handleBlur(item.key)}
                value={formik.values[item.key]}
                clearButtonMode="always"              
                keyboardType={item.key == 'price' || item.key == 'discount' ? "numeric" : "default"}
              />
              {formik.errors[item.key] && formik.touched[item.key] ? (
                <ErrorText text={formik.errors[item.key]}/>
              ) : null}
            </View>
          </View>
        </View>
      ))}   
      </ScrollView>   
    </Container>
  );
}

const _s = StyleSheet.create({
  fieldContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,    
  },
  fieldHeaderText: {
    ..._style.bodyText,
    paddingHorizontal: 10,
    color: "#888"
  },
  fieldText: {
    ..._style.listItemHeaderText,
    paddingHorizontal: 0,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});

export default MasterItemEdit;
