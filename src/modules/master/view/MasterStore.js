import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableHighlight,
  TextInput
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {QUERY_STORE} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import _s from '../Styles';
import _style from '../../../styles/';
import ErrorText from '../../../components/ErrorText';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {setStore as setStoreAction} from '../MasterAction'
import { apiGetStore } from '../../../config/Api';

const formList = [
  {
    key: 'password',
    value: 'Password',
  },
];

const otherScheme = Yup.object().shape({
  password: Yup.string().required('Required'),
});

function MasterStore() {  
  const query = useSelector(state => state.query);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [storeList, setStoreList] = useState([]);
  const [store, setStore] = useState({});
  const [dataTableFocus, setDataTableFocus] = useState(0);
  const [passwordDialog, setPasswordDialog] = useState(true);

  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: otherScheme,
    onSubmit: async values => {
      if (values.password != store.password) {
        formik.setFieldError('password', 'Wrong password');
      } else {
        setPasswordDialog(false);
      }
    },
  });

  const headerTable = [
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

  //api call only run once
  useEffect(async () => {
    await showPasswordDialog();
    await apiGetStore(dispatch);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = apiGetStore(dispatch);
      const unsubscribe1 = showPasswordDialog();
      formik.resetForm();
      return () => {
        unsubscribe, unsubscribe1;
      };
    }, []),
  );

  function showPasswordDialog() {
    setPasswordDialog(true);
  }

  //get updated data
  useEffect(() => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_STORE.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          dispatch(setStoreAction(resultList[0]))          
          setStore(resultList[0]);
          setStoreList(resultList);
          setDataTableFocus(0);
        } else {
          setStore(null);
          setStoreList([]);
        }
      }
    }
  }, [query]);

  function dataRender({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[
          _style.rowTable,
          dataTableFocus == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setStore(item);
          setDataTableFocus(index);
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (
            <View key={i} style={v.key == 'api_url' ? {flex: 2} : _style.flex1}>
              <Text style={_style.rowTableText}>{item[v.key]}</Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function storeHeaderRender() {
    return (
      <View style={_style.headerTable}>
        {headerTable.map((item, index) => (
          <View key={index} style={item.key == 'api_url' ? {flex: 2} : _style.flex1}>
            <Text style={_style.headerTableText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Container>
      {passwordDialog ? (
        <Header
          drawerBtn
          name="Master Store"
          submitBtn
          submitBtnFunc={formik.handleSubmit}
          submitBtnName="Submit"
        />
      ) : (
        <Header drawerBtn name="Master Store" />
      )}

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
      {!passwordDialog && (
        <View style={_style.flexRow}>
          <View
            style={[_style.flex2, _style.tableSeparator]}>
            <FlatList
              ListHeaderComponent={storeHeaderRender}
              showsVerticalScrollIndicator={false}
              renderItem={dataRender}
              data={storeList}
              extraData={storeList}
              keyExtractor={item => item.id}
              stickyHeaderIndices={[0]}
            />
          </View>
          <View style={_style.flex1}>
            {store != null ? (
              <>
                <View style={_style.flex1}>
                  <View style={_style.categoryDetailContainer}>
                    <Text style={_style.categoryDetailText}>Store Detail</Text>
                  </View>
                  {headerTable.map((item, index) => (
                    <View key={index} style={_style.categoryDetailChildContainer}>
                      <View style={_style.flex1}>
                        <Text
                          style={[
                            _style.categoryDetailChildText,
                            _style.listItemHeaderText,
                          ]}>
                          {item.value}
                        </Text>
                      </View>
                      <View>
                        <Text style={_style.categoryDetailChildText}>
                          {store[item.key]}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                <View>
                  <Button
                    btnText="edit"
                    onPress={() =>
                      navigation.navigate('MasterStoreEdit', store)
                    }
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      )}
    </Container>
  );
}

export default MasterStore;
