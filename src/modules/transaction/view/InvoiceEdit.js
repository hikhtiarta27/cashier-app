import React, { useState} from 'react';
import {View, TextInput, Text, ScrollView} from 'react-native';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import ErrorText from '../../../components/ErrorText';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import _style from '../../../styles/';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {currencyToInteger} from '../../../util';
import {TextInputMask} from 'react-native-masked-text';

const invoiceScheme = Yup.object().shape({
  name: Yup.string().required('Required'),
  qty: Yup.string()
    .matches(/^[0-9]+$/, 'Only number')
    .transform(value => value.replace(/[^\d]/g, ''))
    .required('Required'),
  price: Yup.string()
    .matches(/^[0-9]+$/, 'Only number')
    .transform(value => value.replace(/[^\d]/g, ''))
    .required('Required'),
  discount: Yup.string()
    .matches(/^[0-9]+$/, 'Only number')
    .transform(value => value.replace(/[^\d]/g, ''))
    .required('Required'),
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
  const route = useRoute();
  const [items, setItems] = useState(route.params.item);  
  const navigation = useNavigation();
  const [deleted, setDeleted] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: items.name,
      qty: items.qty.toString(),
      price:
        items.priceNew != undefined
          ? items.priceNew.toString()
          : items.price.toString(),
      discount:
        items.discountNew != undefined
          ? items.discountNew.toString()
          : items.discount.toString(),
    },
    validationSchema: invoiceScheme,
    onSubmit: async values => {
      items['qty'] = deleted ? 0 : currencyToInteger(values.qty);
      items['priceNew'] = currencyToInteger(values.price);
      items['discountNew'] = currencyToInteger(values.discount);
      navigation.setParams({Transaction: route.params.onCallback()});
      navigation.goBack();
    },
  });

  function deleteInvoice() {
    formik.setFieldValue('qty', '0');
    formik.handleSubmit();
  }

  return (
    <Container>
      <Header
        backBtn={true}
        name="Detail Edit"
        submitBtn
        submitBtnFunc={deleteInvoice}
        submitBtnName="Hapus"
      />
      <ScrollView>
        {formList.map((item, index) => (
          <View style={_style.fieldContainer} key={index}>
            <Text style={_style.fieldHeaderText}>{item.value}</Text>
            <View style={_style.mx10}>
              {item.key == 'price' || item.key == 'discount' || item.key == 'qty'? (
                <TextInputMask
                  style={_style.fieldText}
                  key={index}
                  type={'money'}                  
                  options={{
                    precision: 0,
                    separator: '.',
                    delimiter: ',',
                    unit: '',
                    suffixUnit: '',
                  }}
                  onChangeText={formik.handleChange(item.key)}
                  onBlur={formik.handleBlur(item.key)}
                  value={formik.values[item.key]}
                />
              ) : (
                <TextInput
                  style={_style.fieldText}
                  contextMenuHidden={true}
                  key={index}
                  editable={item.key == 'name' ? false : true}
                  selectTextOnFocus={item.key == 'name' ? false : true}
                  onChangeText={formik.handleChange(item.key)}
                  onBlur={formik.handleBlur(item.key)}
                  value={formik.values[item.key]}
                  clearButtonMode="always"
                />
              )}
              {formik.errors[item.key] && formik.touched[item.key] ? (
                <ErrorText text={formik.errors[item.key]} />
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
      <Button btnText="Simpan" onPress={formik.handleSubmit} />
    </Container>
  );
}

export default InvoiceEdit;
