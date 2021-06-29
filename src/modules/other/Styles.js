import { StyleSheet } from "react-native";
import _style from "../../styles";

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
  hint:{
    ..._style.bodyText,
    marginTop: 10,
    paddingHorizontal: 10,
    color: '#888',
  }
})

export default _s;