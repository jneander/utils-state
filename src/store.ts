export type StoreListener<State> = (state: State) => void

export class Store<State extends Record<string, any>> {
  private state: State
  private isBroadcasting: boolean
  private isInTransaction: boolean
  private listeners: StoreListener<State>[]

  constructor(initialState: State = {} as State) {
    this.listeners = []
    this.state = {...initialState}

    this.isInTransaction = false
    this.isBroadcasting = false
  }

  inTransaction(updateFn: () => void): void {
    this.isInTransaction = true
    updateFn()
    this.isInTransaction = false
    this.updateListeners()
  }

  getState(): State {
    return this.state
  }

  setState(state: Partial<State>): void {
    this.replaceState({...this.state, ...state})
  }

  replaceState(state: State): void {
    if (this.isBroadcasting) {
      console.warn('Store cannot be updated while publishing updates to listeners.')
      return
    }

    this.state = {...state}

    if (!this.isInTransaction) {
      this.updateListeners()
    }
  }

  subscribe(listenerFn: StoreListener<State>): () => void {
    this.listeners.push(listenerFn)

    return () => {
      this.listeners = this.listeners.filter(fn => fn !== listenerFn)
    }
  }

  private updateListeners(): void {
    if (!this.isInTransaction && !this.isBroadcasting) {
      this.isBroadcasting = true
      const listeners = [...this.listeners]
      for (let i = 0; i < listeners.length; i++) {
        listeners[i](this.state)
      }
      this.isBroadcasting = false
    }
  }
}
