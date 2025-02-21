import {
  type RowData,
  Table,
  type TableOptions,
  type TableOptionsResolved,
  TableState,
  createTable,
} from "@tanstack/table-core";
import { Signal } from "signal-polyfill";


export class SignalTable<TData extends RowData> {
  api: Table<TData>;
  #state: Signal.State<TableState>;
  #computed: Signal.Computed<void>;

  get() {
    this.#computed.get();
    return this.api;
  }

  constructor(optionsFn: () => TableOptions<TData>) {
    const options = Signal.subtle.untrack(optionsFn);
    const resolvedOptions: TableOptionsResolved<TData> = {
      state: {},
      onStateChange: () => { }, // noop
      renderFallbackValue: null,
      ...options,
    };

    this.api = createTable(resolvedOptions);
    this.#state = new Signal.State({
      ...this.api.initialState,
      ...options.state,
    });

    this.#computed = new Signal.Computed(() => {
      
      const state = this.#state.get();
      const options = optionsFn();
      this.api.setOptions((prev) => ({
        ...prev,
        ...options,
        state: { ...state, ...options.state },
        onStateChange: (updater: any) => {
          this.#state.set(updater(state));
          options.onStateChange?.(updater);
        },
      }));
    },{equals: ()=> false});
  }
}
