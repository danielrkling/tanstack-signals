import { FieldApi, FormApi } from "@tanstack/form-core";

import type {
  DeepKeys,
  DeepValue,
  FieldApiOptions,
  FieldOptions,
  FieldState,
  FormOptions,
  FormState,
  Validator,
} from "@tanstack/form-core";
import { Signal } from "signal-polyfill";

export class SignalForm<
  TParentData,
  TFormValidator extends Validator<TParentData, unknown> | undefined = undefined
> {
  #unsubscribe?: () => void;
  #state: Signal.State<FormState<TParentData>>;
  #api: Signal.Computed<FormApi<TParentData, TFormValidator>>;
  #computed: Signal.Computed<void>;

  get state() {
    return this.#state.get();
  }

  get api() {
    return this.#api.get();
  }

  constructor(options: () => FormOptions<TParentData, TFormValidator>) {
    const api = new FormApi(options());
    this.#state = new Signal.State(api.store.state);
    this.#unsubscribe = api.store.subscribe((val) => {
      this.#state.set(val.currentVal);
    });
    this.#api = new Signal.Computed(() => {
      api.update(options());
      return api;
    });
  }

  field<
    TName extends DeepKeys<TParentData>,
    TFieldValidator extends
      | Validator<DeepValue<TParentData, TName>, unknown>
      | undefined = undefined,
    TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>
  >(
    options: () => FieldOptions<
      TParentData,
      TName,
      TFieldValidator,
      TFormValidator,
      TData
    >
  ): SignalField<TParentData, TName, TFieldValidator, TFormValidator, TData> {
    return new SignalField(() => ({ form: this.api, ...options() }));
  }
}

class SignalField<
  TParentData,
  TName extends DeepKeys<TParentData>,
  TFieldValidator extends
    | Validator<DeepValue<TParentData, TName>, unknown>
    | undefined = undefined,
  TFormValidator extends
    | Validator<TParentData, unknown>
    | undefined = undefined,
  TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>
> {
  #unsubscribe?: () => void;
  #state: Signal.State<FieldState<TData>>;
  #api: Signal.Computed<
    FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>
  >;
  #computed: Signal.Computed<void>;

  get state() {
    return this.#state.get();
  }

  get api() {
    return this.#api.get();
  }

  constructor(
    options: () => FieldApiOptions<
      TParentData,
      TName,
      TFieldValidator,
      TFormValidator,
      TData
    >
  ) {
    const api = new FieldApi(options());
    api.mount();
    this.#state = new Signal.State(api.store.state);
    this.#unsubscribe = api.store.subscribe((val) => {
      this.#state.set(val.currentVal);
    });
    this.#api = new Signal.Computed(() => {
      api.update(options());
      return api;
    });
  }
}
