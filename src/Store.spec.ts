import {expect} from 'chai'
import {spy} from 'sinon'

import {Store} from './store'

type ExampleState = {
  integers?: number[]
  letters?: string[]
}

describe('Store', () => {
  let initialState: ExampleState
  let store: Store<ExampleState>

  beforeEach(() => {
    initialState = {
      integers: [1, 2, 3],
      letters: ['a', 'b', 'c']
    }

    store = new Store(initialState)
  })

  describe('initial state', () => {
    it('is created from the given value', () => {
      expect(store.getState()).to.deep.equal(initialState)
    })

    it('defaults to an empty object when not given a value', () => {
      store = new Store<ExampleState>()
      expect(store.getState()).to.deep.equal({})
    })

    it('stores a duplicate instance of the given initial state', () => {
      expect(store.getState()).not.to.equal(initialState)
    })
  })

  describe('#setState()', () => {
    it('updates the state in the store', () => {
      store.setState({integers: [4, 5, 6]})
      const {integers} = store.getState()
      expect(integers).to.deep.equal([4, 5, 6])
    })

    it('preserves unrelated content in the store', () => {
      store.setState({integers: [4, 5, 6]})
      const {letters} = store.getState()
      expect(letters).to.deep.equal(['a', 'b', 'c'])
    })

    it('stores a duplicate instance of the given state', () => {
      const state = {integers: [4, 5, 6]}
      store.setState(state)
      expect(store.getState()).not.to.equal(state)
    })
  })

  describe('#replaceState()', () => {
    it('updates the state in the store', () => {
      store.replaceState({integers: [4, 5, 6]})
      const {integers} = store.getState()
      expect(integers).to.deep.equal([4, 5, 6])
    })

    it('replaces the existing content in the store', () => {
      const integers = [4, 5, 6]
      store.replaceState({integers})
      expect(store.getState()).to.deep.equal({integers})
    })

    it('stores a duplicate instance of the given state', () => {
      const state = {integers: [4, 5, 6]}
      store.replaceState(state)
      expect(store.getState()).not.to.equal(state)
    })
  })

  describe('subscription', () => {
    let observed: ExampleState[]

    beforeEach(() => {
      observed = []
      store.subscribe(state => {
        observed.push(state)
      })
    })

    it('updates listeners when the state is updated', () => {
      store.setState({integers: [4, 5, 6]})
      expect(observed).to.have.length(1)
    })

    it('updates listeners with the current state', () => {
      store.setState({integers: [4, 5, 6]})
      const [value] = observed
      expect(value).to.deep.equal(store.getState())
    })
  })

  describe('#inTransaction()', () => {
    let letters: string[], integers: number[]
    let observed: ExampleState[]

    beforeEach(() => {
      letters = ['d', 'e', 'f']
      integers = [4, 5, 6]
      observed = []
      store.subscribe(state => {
        observed.push(state)
      })
    })

    it('calls the given update function', () => {
      const transactionSpy = spy()
      store.inTransaction(transactionSpy)
      expect(transactionSpy.callCount).to.equal(1)
    })

    it('accepts updates from within the update function', () => {
      store.inTransaction(() => {
        store.setState({integers})
      })
      expect(store.getState().integers).to.deep.equal([4, 5, 6])
    })

    it('accepts multiple updates from within the update function', () => {
      store.inTransaction(() => {
        store.setState({integers})
        store.setState({letters})
      })
      expect(store.getState()).to.deep.equal({letters, integers})
    })

    it('updates listeners once per inTransaction', () => {
      store.inTransaction(() => {
        store.setState({integers})
        store.setState({letters})
      })
      expect(observed).to.have.length(1)
    })

    it('updates listeners with the state after the transaction completes', () => {
      store.inTransaction(() => {
        store.setState({integers})
        store.setState({letters})
      })
      const [value] = observed
      expect(value).to.deep.equal(store.getState())
    })
  })
})
