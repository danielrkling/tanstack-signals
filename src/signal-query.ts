import {
    InfiniteQueryObserver,
  InfiniteQueryObserverOptions,
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
    this.#observer.get();
    return this.#state.get();
  }

  #state: Signal.State<QueryObserverResult<TData, TError>>;
  #unsubscribe?: () => void;
  #observer: Signal.Computed<
    QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey>
  >;

  constructor(
    client: () => QueryClient,
    options: () => QueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey,
      never
    >
  ) {
    this.#state = new Signal.State(null!);
    this.#observer = new Signal.Computed(() => {
      this.#unsubscribe?.();
      const observer = new QueryObserver(client(), options());
      this.#state.set(observer.getCurrentResult());
      this.#unsubscribe = observer.subscribe((result) => {
        this.#state.set(result);
      });
      return observer;
    });
  }
}

export class SignalInfiniteQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
  TPageParam = unknown
> {
  get() {
    this.#observer.get();
    return this.#state.get();
  }

  #state: Signal.State<QueryObserverResult<TData, TError>>;
  #unsubscribe?: () => void;
  #observer: Signal.Computed<
  InfiniteQueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>
  >;

  constructor(
    client: () => QueryClient,
    options: () => InfiniteQueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey,
      TPageParam
    >
  ) {
    this.#state = new Signal.State(null!);
    this.#observer = new Signal.Computed(() => {
      this.#unsubscribe?.();
      const observer = new InfiniteQueryObserver(client(), options());
      this.#state.set(observer.getCurrentResult());
      this.#unsubscribe = observer.subscribe((result) => {
        this.#state.set(result);
      });
      return observer;
    });
  }
}

export class SignalMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> {
    #state: Signal.State<MutationObserverResult<TData, TError, TVariables, TContext>>;
    #unsubscribe?: () => void;
    #observer: Signal.Computed<
      MutationObserver<TData, TError, TVariables, TContext>
    >;

  constructor(
    client: ()=>QueryClient,
    options: ()=>MutationOptions<TData, TError, TVariables, TContext>
  ) {
    this.#state = new Signal.State(null!);
    this.#observer = new Signal.Computed(() => {
      this.#unsubscribe?.();
      const observer = new MutationObserver(client(), options());
      this.#state.set(observer.getCurrentResult());
      this.#unsubscribe = observer.subscribe((result) => {
        this.#state.set(result);
      });
      return observer;
    });
  }
}
