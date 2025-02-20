import { createColumnHelper, getCoreRowModel } from "@tanstack/table-core";
import { SignalQuery } from "./signal-query";
import { QueryClient } from "@tanstack/query-core";
import { SignalTable } from "./signal-table";
import { effect } from "signal-utils/subtle/microtask-effect";

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

const people = new SignalQuery(client, {
  queryKey: ["people"],
  queryFn: async () => {
    return (await fetch("https://swapi.dev/api/people/")).json().then((data) =>data.results);
  },
  initialData:[]
});

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("height", {
    cell: (info) => `<i>${info.getValue()}</i>`,
    header: () => "<span>Height</span>",
    footer: (info) => info.column.id,
  }),
];

const renderTable = () => {
   const table = tableSignal.get()

  // Create table elements
  const tableElement = document.createElement("table");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const tfootElement = document.createElement("tfoot");

  tableElement.appendChild(theadElement);
  tableElement.appendChild(tbodyElement);
  tableElement.appendChild(tfootElement);

  // Render table headers
  table.getHeaderGroups().forEach((headerGroup) => {
    const trElement = document.createElement("tr");
    headerGroup.headers.forEach((header) => {
      const thElement = document.createElement("th");
      thElement.innerHTML = header.isPlaceholder
        ? ""
        : flexRender(header.column.columnDef.header, header.getContext());
      trElement.appendChild(thElement);
    });
    theadElement.appendChild(trElement);
  });

  // Render table rows
  table.getRowModel().rows.forEach((row) => {
    const trElement = document.createElement("tr");
    row.getVisibleCells().forEach((cell) => {
      const tdElement = document.createElement("td");
      tdElement.innerHTML = flexRender(
        cell.column.columnDef.cell,
        cell.getContext()
      );
      trElement.appendChild(tdElement);
    });
    tbodyElement.appendChild(trElement);
  });

  // Render table footers
  table.getFooterGroups().forEach((footerGroup) => {
    const trElement = document.createElement("tr");
    footerGroup.headers.forEach((header) => {
      const thElement = document.createElement("th");
      thElement.innerHTML = header.isPlaceholder
        ? ""
        : flexRender(header.column.columnDef.footer, header.getContext());
      trElement.appendChild(thElement);
    });
    tfootElement.appendChild(trElement);
  });

  // Clear previous content and append new content
  const wrapperElement = document.getElementById("wrapper") as HTMLDivElement;
  wrapperElement.innerHTML = "";
  wrapperElement.appendChild(tableElement);
};

const tableSignal = new SignalTable<Person>(()=>({
  data: people.get().data,
  columns,
  getCoreRowModel: getCoreRowModel(),
}));

effect(()=>{
    renderTable();
})

effect(()=>{
    console.log(people.get().data)
})

