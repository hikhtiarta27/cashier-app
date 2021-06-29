import {StyleSheet} from 'react-native'
import _style from '../../styles/Typrograhpy';

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

export default _s;