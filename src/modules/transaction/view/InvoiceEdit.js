import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import ErrorText from '../../../components/ErrorText';
import { useFormik} from 'formik';
import * as Yup from 'yup';
import _style from '../../../styles/Typrograhpy';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

const invoiceScheme = Yup.object().shape({
  name: Yup.string().required('Required'),
  qty: Yup.string().matches(/^[0-9]+$/, "Only number").required('Required'),
  price: Yup.string().matches(/^[0-9]+$/, "Only number").required('Required'),
  discount: Yup.string().matches(/^[0-9]+$/, "Only number").required('Required'),
});

const formList = [
  {
    key: 'name',
    value: 'Name',
  },
  {
    key: 'qty',
    value: 'Quantity',
  },
  {
    key: 'price',
    value: 'Price',
  },
  {
    key: 'discount',
    value: 'Discount',
  },
];

function InvoiceEdit() {
  const query = useSelector(state => state.query);
  const route = useRoute();
  const [items, setItems] = useState(route.params.item);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [deleted, setDeleted] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: items.name,      
      qty: items.qty.toString(),
      price: items.priceNew != undefined ?  items.priceNew.toString() : items.price.toString(),
      discount: items.discountNew != undefined ?  items.discountNew.toString() : items.discount.toString(),
    },
    validationSchema: invoiceScheme,
    onSubmit: async values => {                   
      items['qty'] = (deleted ? 0 : values.qty)
      items['priceNew'] = values.price
      items['discountNew'] = values.discount
      navigation.setParams({Transaction: route.params.onCallback()})      
      navigation.goBack()      
    },
  });

  function deleteInvoice(){
    formik.setFieldValue('qty','0')
    formik.handleSubmit()
  }
  
  return (
    <Container>
      <Header
        backBtn={true}
        name="Detail Edit"
        submitBtn
        submitBtnFunc={formik.handleSubmit}
        submitBtnName="Save"
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
                editable={
                  item.key == 'name'
                    ? false
                    : true
                }
                selectTextOnFocus={
                  item.key == 'name'
                    ? false
                    : true
                }
                onChangeText={formik.handleChange(item.key)}
                onBlur={formik.handleBlur(item.key)}
                value={formik.values[item.key]}
                clearButtonMode="always"
                keyboardType={
                  item.key == 'price' || item.key == 'discount' || item.key == 'qty' 
                    ? 'numeric'
                    : 'default'
                }
              />
              {formik.errors[item.key] && formik.touched[item.key] ? (
                <ErrorText text={formik.errors[item.key]}/>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
      <Button btnText="Hapus" onPress={deleteInvoice}/>
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
    color: '#888',
  },
  fieldText: {
    ..._style.listItemHeaderText,
    paddingHorizontal: 0,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    fontSize: 16,
  },
});

export default InvoiceEdit;
