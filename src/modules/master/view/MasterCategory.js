import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight,
  Alert,
} from 'react-native';
import {writeFile, readFile} from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import XLSX from 'xlsx';
import {queryFetch} from '../../database/DBAction';
import {QUERY_CATEGORY} from '../../../config/StaticQuery';
import Container from '../../../components/Container';
import Button from '../../../components/Button';
import Header from '../../../components/Header';
import DocumentPicker from 'react-native-document-picker';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import _s from '../Styles';
import _style from '../../../styles';
import { dateTimeToFormat } from '../../../util';

function MasterCategory() {
  const query = useSelector(state => state.query);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState({});
  const [dataTableFocus, setDataTableFocus] = useState(0);

  const headerTable = [
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

  function apiGetCategoryList() {
    dispatch(
      queryFetch({
        sql: QUERY_CATEGORY.SELECT,
      }),
    );
  }

  function apiInsertCategoryList(param) {
    dispatch(
      queryFetch({
        sql: QUERY_CATEGORY.INSERT,
        param: param,
      }),
    );
  }

  function apiDeleteCategoryList() {
    dispatch(
      queryFetch({
        sql: QUERY_CATEGORY.DELETE,
      }),
    );
  }

  //api call only run once
  useEffect(() => {
    apiGetCategoryList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = apiGetCategoryList();
      return () => unsubscribe;
    }, []),
  );

  //get updated data
  useEffect(() => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_CATEGORY.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }
          setCategory(resultList[0]);
          setCategoryList(resultList);
          setDataTableFocus(0);
        } else {
          setCategory(null);
          setCategoryList([]);
        }
      }
    }
  }, [query]);

  async function importData() {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
      });

      readFile(res.uri, 'ascii').then(res => {
        const workbook = XLSX.read(res, {type: 'binary'});
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        let dataParse = XLSX.utils.sheet_to_json(ws, {header: 1});
        Alert.alert(
          'Confirmation',
          'Are you sure to import all the data?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: async () => {
                let today = dateTimeToFormat(new Date())
                await apiDeleteCategoryList();
                for (let i = 1; i < dataParse.length; i++) {
                  dataParse[i].push(today)
                  await apiInsertCategoryList(dataParse[i]);
                }
                await apiGetCategoryList();
                Alert.alert(
                  'Information',
                  'Master Category successfully imported!',
                  [
                    {
                      text: 'Ok',
                      style: 'default',
                    },
                  ],
                );
              },
              style: 'default',
            },
          ],
          {
            cancelable: false,
          },
        );
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  }

  function dataRender({item, index}) {
    return (
      <TouchableHighlight
        key={index}
        style={[
          _style.rowTable,
          dataTableFocus == index ? {backgroundColor: '#eee'} : null,
        ]}
        onPress={() => {
          setCategory(item);
          setDataTableFocus(index);
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (
            <View key={i} style={_style.flex1}>
              <Text style={_style.rowTableText}>{item[v.key]}</Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function categoryHeaderRender() {
    return (
      <View style={_style.headerTable}>
        {headerTable.map((item, index) => (
          <View key={index} style={_style.flex1}>
            <Text style={_style.headerTableText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Container>
      <Header drawerBtn={true} name="Master Category" />
      <View style={_style.flexRow}>
        <View style={[_style.flex2, _style.tableSeparator]}>
          <FlatList
            ListHeaderComponent={categoryHeaderRender}
            showsVerticalScrollIndicator={false}
            renderItem={dataRender}
            data={categoryList}
            extraData={categoryList}
            keyExtractor={item => item.code}
            stickyHeaderIndices={[0]}
          />
          <Button btnText="Import" onPress={importData} />
        </View>
        <View style={_style.flex1}>
          <View style={_style.flex1}>
            <View style={_style.categoryDetailContainer}>
              <Text style={_style.categoryDetailText}>Category Detail</Text>
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
                {category != null && (
                  <View>
                    <Text style={_style.categoryDetailChildText}>
                      {category[item.key]}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          {category != null && (
            <View>
              <Button
                btnText="edit"
                onPress={() =>
                  navigation.navigate('MasterCategoryEdit', category)
                }
              />
            </View>
          )}
        </View>
      </View>
    </Container>
  );
}

export default MasterCategory;
