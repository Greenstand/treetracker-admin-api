import { dispatch } from '@rematch/core'

const appFrame = {
  state: {
    currentView: 'trees',
    appDrawer: {
      'isOpen': false
    }
  },
  reducers: {
    toggleAppDrawer(state) {
      return { currentView: state.currentView, appDrawer: { isOpen: !state.isOpen }}
    },
    openAppDrawer(state) {
      return { currentView: state.currentView, appDrawer: { isOpen: true }}
    },
    closeAppDrawer(state) {
      return { currentView: state.currentView, appDrawer: { isOpen: false }}
    },
    changeCurrentView(state, payload) {
      console.log('| reduceer | changeCurrentView | » |', payload)
      return { currentView: payload.newView, appDrawer: { isOpen: state.isOpen } }
    }
  }
}

export default appFrame
