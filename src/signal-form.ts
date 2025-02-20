import { FieldApi, FormApi } from "@tanstack/form-core";

import type {
  DeepKeys,
  DeepValue,
  FieldApiOptions,
  FieldOptions,
  FormOptions,
  Validator,
} from "@tanstack/form-core";
import { Signal } from "signal-polyfill";

export class SignalForm<
  TParentData,
  TFormValidator extends Validator<TParentData, unknown> | undefined = undefined
> {
  #unsubscribe?: () => void;
  #state = new Signal.State<null>(null, { equals: () => false });
  api: FormApi<TParentData, TFormValidator>;

  get() {
    this.#state.get();
    return this.api;
  }

  constructor(options: FormOptions<TParentData, TFormValidator>) {
    this.api = new FormApi(options);
    this.#unsubscribe = this.api.store.subscribe((val) => {
      this.#state.set(null);
    });
  }

  dispose() {
    this.#unsubscribe?.();
  }

  field<
    TName extends DeepKeys<TParentData>,
    TFieldValidator extends
      | Validator<DeepValue<TParentData, TName>, unknown>
      | undefined = undefined,
    TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>
  >(
    options: FieldOptions<
      TParentData,
      TName,
      TFieldValidator,
      TFormValidator,
      TData
    >
  ): SignalField<TParentData, TName, TFieldValidator, TFormValidator, TData> {
    return new SignalField({ form: this.api, ...options });
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
  #state = new Signal.State<null>(null, { equals: () => false });
  api: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;

  get() {
    this.#state.get();
    return this.api;
  }

  constructor(
    options: FieldApiOptions<
      TParentData,
      TName,
      TFieldValidator,
      TFormValidator,
      TData
    >
  ) {
    this.api = new FieldApi(options);
    this.#unsubscribe = this.api.store.subscribe((val) => {
      this.#state.set(null);
    });
    this.api.mount();
  }

  dispose() {
    this.#unsubscribe?.();
  }
}
