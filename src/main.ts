import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/table-core";
import { SignalMutation, SignalQuery } from "./signal-query";
import { QueryClient } from "@tanstack/query-core";
import { SignalTable } from "./signal-table";
import { effect } from "signal-utils/subtle/microtask-effect";
import { html, render } from "lit-html";
import { SignalForm } from "./signal-form";

export const flexRender = <TProps extends object>(comp: any, props: TProps) => {
  if (typeof comp === "function") {
    return comp(props);
  }
  return comp;
};

const client = new QueryClient();

type Person = {
  name: string;
  height: string;
};

const people = new SignalQuery(
  () => client,
  () => ({
    queryKey: ["people"],
    queryFn: async () => {
      return (await fetch("https://swapi.dev/api/people/"))
        .json()
        .then((data) => data.results);
    },
    initialData: [],
  })
);

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("height", {
    cell: (info) => html`<i>${info.getValue()}</i>`,
    header: () => html`<span>Height</span>`,
    footer: (info) => info.column.id,
  }),
];

const tableSignal = new SignalTable<Person>(() => ({
  data: people.get().data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
}));

const renderTable = () => {
  const table = tableSignal.get();

  return html`
    <table>
      <thead>
        ${table.getHeaderGroups().map(
          (headerGroup) => html`
            <tr>
              ${headerGroup.headers.map(
                (header) => html`
                  <th @click=${header.column.getToggleSortingHandler()}>
                    ${header.isPlaceholder
                      ? ""
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                `
              )}
            </tr>
          `
        )}
      </thead>
      <tbody>
        ${table.getRowModel().rows.map(
          (row) => html`
            <tr>
              ${row
                .getVisibleCells()
                .map(
                  (cell) => html`
                    <td>
                      ${flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  `
                )}
            </tr>
          `
        )}
      </tbody>
    </table>
  `;
};

const addPerson = new SignalMutation(
  () => client,
  () => ({
    mutationKey: ["people"],
    mutationFn: async (person: Person) => {
      return person;
    },
    onSuccess: (val) => {
      client.setQueryData(["people"], (old: Person[]) => [...old, val]);
    },
  })
);
 
const form = new SignalForm<Person>(()=>({
  onSubmit: (result) => {
    console.log(result);
    addPerson.get().mutate(result.value);
  },
  defaultValues: {
    name: "",
    height: "",
  },
}));

const fields = {
  name: form.field(()=>({ name: "name" })),
  height: form.field(()=>({ name: "height" })), 
}

function renderForm() {

  return html`
    <div>
      <input @input=${e=>fields.name.api.handleChange(e.target.value)} .value=${fields.name.state.value} type="text" name="name" />
      <input @input=${e=>fields.height.api.handleChange(e.target.value)} .value=${fields.height.state.value} type="text" name="height" />
      <button @click=${form.api.handleSubmit} type="submit">Submit</button>
    </div>
  `;
}

effect(() => {
  render([renderTable(),renderForm()], document.body);
});
