import {
    MutationObserver,
  MutationObserverResult,
  MutationOptions,
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverOptions,
  QueryObserverResult,
} from "@tanstack/query-core";
import { Signal } from "signal-polyfill";



export class SignalQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[]
> {
  get() {
    return this.#state.get();
  }

  #state: Signal.State<QueryObserverResult<TData, TError>>;

  constructor(
    client: QueryClient,
    options: QueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey,
      never
    >
  ) {
    const observer = new QueryObserver(client, options);
    this.#state = new Signal.State(observer.getCurrentResult());
    observer.subscribe((result) => {
      this.#state.set(result);
    });
  }
}

export class SignalMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> {
  get() {
    return this.#state.get();
  }

  #state: Signal.State<MutationObserverResult<TData, TError, TVariables, TContext>>;

  constructor(
    client: QueryClient,
    options: MutationOptions<TData, TError, TVariables, TContext>
  ) {
    const observer = new MutationObserver(client, options);
    this.#state = new Signal.State(observer.getCurrentResult());
    observer.subscribe((result) => {
      this.#state.set(result);
    });
  }
}
