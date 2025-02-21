import { createColumnHelper, getCoreRowModel, getSortedRowModel } from "@tanstack/table-core";
import { SignalQuery } from "./signal-query";
import { QueryClient } from "@tanstack/query-core";
import { SignalTable } from "./signal-table";
import { effect } from "signal-utils/subtle/microtask-effect";
import { html, render } from 'lit-html';

export const flexRender = <TProps extends object>(comp: any, props: TProps) => {
    if (typeof comp === 'function') {
      return comp(props)
    }
    return comp
  }

const client = new QueryClient();

type Person = {
  name: string;
  height: string;
};

const people = new SignalQuery(()=>client,()=>({
  queryKey: ["people"],
  queryFn: async () => {
    return (await fetch("https://swapi.dev/api/people/")).json().then((data) =>data.results);
  },
  initialData:[]
}));

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

const tableSignal = new SignalTable<Person>(()=>({
    data: people.get().data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  }));

const renderTable = () => {
  const table = tableSignal.get();

  return html`
    <table>
      <thead>
        ${table.getHeaderGroups().map(headerGroup => html`
          <tr>
            ${headerGroup.headers.map(header => html`
              <th @click=${header.column.getToggleSortingHandler()}>
                ${header.isPlaceholder ? '' : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            `)}
          </tr>
        `)}
      </thead>
      <tbody>
        ${table.getRowModel().rows.map(row => html`
          <tr>
            ${row.getVisibleCells().map(cell => html`
              <td>
                ${flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            `)}
          </tr>
        `)}
      </tbody>

    </table>
  `;

  
};



effect(()=>{
    render(renderTable(), document.body);
})

