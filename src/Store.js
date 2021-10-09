function updateListeners() {
  if (!this._inTransaction && !this._isBroadcasting) {
    this._isBroadcasting = true
    const listeners = [...this._listeners]
    for (let i = 0; i < listeners.length; i++) {
      listeners[i](this._state)
    }
    this._isBroadcasting = false
  }
}

export default class Store {
  constructor(initialState = {}) {
    this._listeners = []
    this._state = {...initialState}

    this._inTransaction = false
    this._isBroadcasting = false
  }

  inTransaction(updateFn) {
    this._inTransaction = true
    updateFn()
    this._inTransaction = false
    updateListeners.call(this)
  }

  getState() {
    return this._state
  }

  setState(state) {
    this.replaceState({...this._state, ...state})
  }

  replaceState(state) {
    if (this._isBroadcasting) {
      console.warn('Store cannot be updated while publishing updates to listeners.')
      return
    }

    this._state = {...state}

    if (!this._inTransaction) {
      updateListeners.call(this)
    }
  }

  subscribe(listenerFn) {
    this._listeners.push(listenerFn)
    return () => {
      this._listeners = this._listeners.filter(fn => fn !== listenerFn)
    }
  }

  transaction(updateFn) {
    this._inTransaction = true
    updateFn()
    this._inTransaction = false
    updateListeners.call(this)
  }
}
