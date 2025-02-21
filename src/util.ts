import { Signal } from "signal-polyfill"




export function signalProxy<TInput extends Record<string | symbol, any>>(
  inputSignal: ()=> TInput,
): TInput {
  const internalState = {} as Record<string | symbol, Signal.Computed<any>>

  return new Proxy<TInput>({} as TInput, {
    get(target, prop) {
      // first check if we have it in our internal state and return it
      const computedField = internalState[prop]
      if (computedField) return computedField.get()

      // then, check if it's a function on the resultState and return it
      const targetField = Signal.subtle.untrack(inputSignal)[prop]
      if (typeof targetField === 'function') return targetField

      // finally, create a computed field, store it and return it
      internalState[prop] = new Signal.Computed(() => inputSignal()[prop])

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