import { StyleSheet } from 'react-native'
import * as Font from './Font'

const _style = StyleSheet.create({
  h6:{
    fontFamily: Font.RobotoMedium,
    fontSize: 20,  
  },
  bodyText:{  
    fontFamily: Font.RobotoRegular,
    fontSize: 14,
  },
  listItemText:{
    fontFamily: Font.RobotoRegular,
    fontSize: 16,    
  },
  listItemHeaderText:{
    fontFamily: Font.RobotoMedium,
    fontSize: 14,
  },
  btnText:{
    fontFamily: Font.RobotoMedium,
    fontSize: 14,    
  },
  formText:{
    fontFamily: Font.RobotoRegular,
    fontSize: 16,
  },
  errorText:{
    fontFamily: Font.RobotoRegular,
    fontSize: 12,
  }
})

export default _style;