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
  #tableInstance: Table<TData>;
  #state: Signal.State<TableState>;
  #computed: Signal.Computed<void>;

  get() {
    this.#computed.get();
    return this.#tableInstance;
  }

  constructor(optionsFn: () => TableOptions<TData>) {
    if (!this.#tableInstance) {
      const options = Signal.subtle.untrack(optionsFn);
      const resolvedOptions: TableOptionsResolved<TData> = {
        state: {},
        onStateChange: () => {}, // noop
        renderFallbackValue: null,
        ...options,
      };

      this.#tableInstance = createTable(resolvedOptions);
      this.#state = new Signal.State({
        ...this.#tableInstance.initialState,
        ...options.state,
      });
    }

    this.#computed = new Signal.Computed(() => {
      const state = this.#state.get();
      const options = optionsFn();
      this.#tableInstance.setOptions((prev) => ({
        ...prev,
        ...options,
        state: { ...state, ...options.state },
        onStateChange: (updater: any) => {
          this.#state.set(updater(state));
          options.onStateChange?.(updater);
        },
      }));
    });
  }
}
