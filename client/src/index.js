import './init'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import 'typeface-roboto'
import { init } from '@rematch/core'
import * as models from './models'
import './index.css'
import * as log from 'loglevel';
import registerServiceWorker from 'registerServiceWorker';

log.info('init redux...');
const store = init({ models });

//check configration
function check(setting){
  if(!process.env[setting]){
    throw Error(`can not find the configration:${setting}`);
  }
}
check('REACT_APP_POLICY_SUPER_PERMISSION');
check('REACT_APP_POLICY_SUPER_PERMISSION');
check('REACT_APP_POLICY_LIST_USER');
check('REACT_APP_POLICY_MANAGER_USER');
check('REACT_APP_POLICY_LIST_TREE');
check('REACT_APP_POLICY_APPROVE_TREE');
check('REACT_APP_POLICY_LIST_PLANTER');
check('REACT_APP_POLICY_MANAGE_PLANTER');

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()
