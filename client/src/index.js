import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'typeface-roboto'
import { init } from '@rematch/core'
import './init'
import App from './App'
import * as models from './models'
import './index.css'
import * as log from 'loglevel'

log.info('init redux...')
const store = init({ models })

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
