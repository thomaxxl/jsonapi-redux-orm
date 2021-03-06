import FormatterList from './components/formatters/FormatterList.jsx'
import APP from './Config.json';
import ActionList from './action/ActionList'
import InfoAction from './components/actions/InfoAction.jsx'

import './style/style.css'
import Cookies from 'universal-cookie';

const BaseUrl = 'http://thomaxxl.pythonanywhere.com'
const Timing = 5000
Object.keys(APP).map(function(key, index) {
    var initVal = {
        column: [],
        actions: Object.keys(ActionList),
        API: key,
        API_TYPE: key,
        path: "/" + key.toLocaleLowerCase(),
        menu: key,
        Title: key + " Page",
        Editor:true,
    }
    APP[key] = {...initVal, ...APP[key]};
    return 0;
});

ActionList['InfoAction'] = InfoAction


var URL = BaseUrl
export {APP}
export {URL}
export {ActionList}
export {Timing}
export {FormatterList}


export const config = {
  baseUrl: BaseUrl,
  configureHeaders(headers) {
    const cookies = new Cookies()
    var token = cookies.get('token')

    return {
      ...headers,
      //'Authorization': `Bearer ${store.getState().session.bearerToken}`,
      'Authorization': 'Bearer ' + token
    };
  },
  //ADDED In VERSION2
  afterResolve({ status, headers, body }) {
    return Promise.resolve({ status, headers, body: body });
  },

  afterReject({ status, headers, body }) {

    //document.location = '/login';
    if (status === 401) {
        // ie. redirect to login page
        //document.location = '/login';
        //toastr.error('Not Authorized')
    } else {
        //toastr.error('API Request Rejected', '' , TOASTR_POS)
        return Promise.reject({ status, headers, body: body });
    }
  },
};

export default config; 

