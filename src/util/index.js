export const stringToCurrency = (x) =>{
  if (x == undefined) return 
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * 
 * @param {Date} x 
 * @returns 
 */
export const dateToFormat = (x) =>{  
  let day = x.getDate()
  let month = x.getMonth() + 1
  day = day < 10 ? `0${day}` : day
  month = month < 10 ? `0${month}` : month
  let formatted = `${x.getFullYear()}-${month}-${day}`
  return formatted
}

/**
 * 
 * @param {Date} x 
 * @returns 
 */
 export const dateTimeToFormat = (x) =>{    
  let month = x.getMonth() + 1;
  let hour = x.getHours()
  let minute = x.getMinutes()
  let second = x.getSeconds()
  month = month < 10 ? `0${month}` : month;    
  hour = hour < 10 ? `0${hour}` : hour;
  minute = minute < 10 ? `0${minute}` : minute;
  second = second < 10 ? `0${second}` : second;
  let currentDateTimeFormatted = `${x.getFullYear()}-${month}-${x.getDate()} ${hour}:${minute}:${second}`;
  return currentDateTimeFormatted
}