import { Signal } from "signal-polyfill"


export type MapToSignals<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] : Signal.Computed<T[K]>
}


export function signalProxy<TInput extends Record<string | symbol, any>>(
  inputSignal: ()=> TInput,
): TInput {
  const internalState = {} as MapToSignals<TInput>

  return new Proxy<TInput>(internalState, {
    get(target, prop) {
      // first check if we have it in our internal state and return it
      const computedField = target[prop]
      if (computedField) return computedField.get()

      // then, check if it's a function on the resultState and return it
      const targetField = Signal.subtle.untrack(inputSignal)[prop]
      if (typeof targetField === 'function') return targetField

      // finally, create a computed field, store it and return it
      target[prop] = new Signal.Computed(() => inputSignal()[prop])

      return (target[prop].get())
    },
    has(_, prop) {
      return !!Signal.subtle.untrack(inputSignal)[prop]
    },
    ownKeys() {
      return Reflect.ownKeys(Signal.subtle.untrack(inputSignal))
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      }
    },
  })
}