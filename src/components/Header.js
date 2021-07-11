import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import _style from '../styles';
import PropTypes from 'prop-types';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import OctoIcon from 'react-native-vector-icons/Octicons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import { setLoading} from '../modules/master/MasterAction';
import {QUERY_TRX_DETAIL, QUERY_TRX_HEADER} from '../config/StaticQuery';
import { apiRequestAxios} from '../util';
import {runSqlQuery} from '../modules/database/DBSaga';
import { apiUpdateTrxDetailFlagToY, apiUpdateTrxHeaderFlagToY } from '../config/Api';

function Header(props) {
  const user = useSelector(state => state.user);
  const query = useSelector(state => state.query);
  const db = useSelector(state => state.database);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [trxHeaderList, setTrxHeaderList] = useState([]);
  const [trxDetailList, setTrxDetailList] = useState([]);

  function goBack() {
    navigation.goBack();
  }

  function toggleDrawer() {
    navigation.toggleDrawer();
  }

  useEffect(async () => {
    if (!query.fetchQuery) {
      if (query.send.sql == QUERY_TRX_DETAIL.UPDATE_FLAG_Y_ALL) {
        await dispatch(setLoading(false));
      }
      if (query.send.sql == QUERY_TRX_HEADER.UPDATE_FLAG_Y_ALL) {
        await dispatch(setLoading(false));
      }
    }
  }, [query]);

  useEffect(async () => {
    if (trxHeaderList.length != 0) {
      dispatch(setLoading(true));
      apiRequestAxios(user.store.api_url + '/transactionHeader/batch', 'POST', {
        data: trxHeaderList,
      })
        .then(res => {
          apiUpdateTrxHeaderFlagToY(dispatch)          
        })
        .catch(err => {
          dispatch(setLoading(false));
        });
    }
  }, [trxHeaderList]);

  useEffect(async () => {
    if (trxDetailList.length != 0) {
      dispatch(setLoading(true));
      apiRequestAxios(user.store.api_url + '/transactionDetail/batch', 'POST', {
        data: trxDetailList,
      })
        .then(res => {
          dispatch(
            apiUpdateTrxDetailFlagToY(dispatch)            
          );
        })
        .catch(err => {
          dispatch(setLoading(false));
        });
    }
  }, [trxDetailList]);

  function syncFunc() {
    Alert.alert('Confirmation', 'Are you to synchronize the data?', [
      {
        text: 'NO',
        style: 'cancel',
      },
      {
        text: 'YES',
        style: 'default',
        onPress: async () => {
          getTrxHeaderList();
          getTrxDetailList();
        },
      },
    ]);
  }

  async function getTrxHeaderList() {
    let result = await runSqlQuery(
      db.database,
      QUERY_TRX_HEADER.SELECT_ALL_FLAG_NOT_Y,
    );
    let rows = result.rows;
    if (rows.length > 0) {
      let resultList = [];
      for (let i = 0; i < rows.length; i++) {
        // if (rows.item(i).flag == 'Y') continue;
        resultList.push(rows.item(i));
      }
      console.log('Header List: ');
      console.log(resultList);
      setTrxHeaderList(resultList);
    }
  }

  async function getTrxDetailList() {
    let result = await runSqlQuery(
      db.database,
      QUERY_TRX_DETAIL.SELECT_ALL_FLAG_NOT_Y,
    );
    let rows = result.rows;
    if (rows.length > 0) {
      let resultList = [];
      for (let i = 0; i < rows.length; i++) {
        // if (rows.item(i).flag == 'Y') continue;
        resultList.push(rows.item(i));
      }
      setTrxDetailList(resultList);
    }
  }

  return (
    <View style={_s.container}>
      {props.backBtn ? (
        <TouchableOpacity style={_s.btnContainer} onPress={goBack}>
          <AntDesignIcon name="arrowleft" size={20} color={'#000'} />
        </TouchableOpacity>
      ) : null}
      {props.drawerBtn ? (
        <TouchableOpacity style={_s.btnContainer} onPress={toggleDrawer}>
          <OctoIcon name="three-bars" size={20} color={'#000'} />
        </TouchableOpacity>
      ) : null}
      <Text style={[_style.h6, _style.flex1]}>{props.name}</Text>
      {props.syncBtn ? (
        <TouchableOpacity style={_s.btnContainer} onPress={syncFunc}>
          <OctoIcon name="sync" size={20} color={'#000'} />
        </TouchableOpacity>
      ) : null}
      {props.submitBtn ? (
        <TouchableOpacity style={_s.btnContainer} onPress={props.submitBtnFunc}>
          {props.submitBtnComponent ? (
            props.submitBtnComponent
          ) : (
            <Text style={_s.btnSubmitText}>{props.submitBtnName}</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const _s = StyleSheet.create({
  container: {
    // ..._style.my10,
    ..._style.px10,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  btnContainer: {
    ..._style.mr10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  btnSubmitText: {
    color: '#68BBE3',
    ..._style.btnText,
  },
});

Header.propTypes = {
  backBtn: PropTypes.bool,
  drawerBtn: PropTypes.bool,
  name: PropTypes.string,
  submitBtn: PropTypes.bool,
  submitBtnFunc: PropTypes.func,
  submitBtnName: PropTypes.string,
  submitBtnComponent: PropTypes.element,
};

export default memo(Header);
