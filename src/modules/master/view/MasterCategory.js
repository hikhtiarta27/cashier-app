import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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
import _style from '../../../styles/Typrograhpy';
import DocumentPicker from 'react-native-document-picker';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

function MasterCategory() {
  const query = useSelector(state => state.query);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState({});
  const [dataTableFocus, setDataTableFocus] = useState(0)

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
    if(!query.fetchQuery){
      if (query.send.sql == QUERY_CATEGORY.SELECT) {
        let rows = query.res.rows;
        if (rows.length > 0) {
          let resultList = [];
          for (let i = 0; i < rows.length; i++) {
            resultList.push(rows.item(i));
          }        
          setCategory(resultList[0]);
          setCategoryList(resultList);
          setDataTableFocus(0)
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
                await apiDeleteCategoryList();
                for (let i = 1; i < dataParse.length; i++) {
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
        style={[_s.listContainer, dataTableFocus == index ? {backgroundColor: "#eee"} : null]}
        onPress={() => {
          setCategory(item)
          setDataTableFocus(index)
        }}
        underlayColor="#eee">
        <>
          {headerTable.map((v, i) => (
            <View key={i} style={{flex: 1}}>
              <Text style={_s.listText}>{item[v.key]}</Text>
            </View>
          ))}
        </>
      </TouchableHighlight>
    );
  }

  function categoryHeaderRender() {
    return (
      <View style={_s.headerContainer}>
        {headerTable.map((item, index) => (
          <View key={index} style={{flex: 1}}>
            <Text style={_s.headerText}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Container>
      <Header drawerBtn={true} name="Master Category" />
      <View style={_s.flexRow}>
        <View style={{flex: 2, borderRightColor: '#eee', borderRightWidth: 3}}>
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
        <View style={{flex: 1}}>
          {category != null ? (
            <>
              <View style={{flex: 1}}>
                <View style={_s.categoryDetailContainer}>
                  <Text style={_s.categoryDetailText}>Category Detail</Text>
                </View>
                {headerTable.map((item, index) => (
                  <View key={index} style={_s.categoryDetailChildContainer}>
                    <View style={{flex: 1}}>
                      <Text
                        style={[
                          _s.categoryDetailChildText,
                          _style.listItemHeaderText,
                        ]}>
                        {item.value}
                      </Text>
                    </View>
                    <View>
                      <Text style={_s.categoryDetailChildText}>
                        {category[item.key]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View>
                <Button
                  btnText="edit"
                  onPress={() =>
                    navigation.navigate('MasterCategoryEdit', category)
                  }
                />
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Container>
  );
}

const _s = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: 'row',
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#274472',
  },
  headerText: {
    ..._style.listItemHeaderText,
    color: 'white',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  listText: {
    ..._style.bodyText,
  },
  categoryDetailContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#41729F',
  },
  categoryDetailText: {
    color: 'white',
    ..._style.listItemHeaderText,
  },
  categoryDetailChildContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  categoryDetailChildText: {
    ..._style.bodyText,
  },
});

export default MasterCategory;
