import { useMemo } from "react";
import { useGlobalFilter, usePagination, useTable } from "react-table";
import GlobalFilter from "./globalFilter";
import { Link } from "react-router-dom";

import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";

export default function TableComponent({ COLUMNS, Data }) {
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => Data, []);

  const pageRowSize = 16;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    gotoPage,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: pageRowSize },
    },
    usePagination
  );

  const { pageIndex } = state;

  // const { globalFilter } = state;

  // console.log("globalFilter:", globalFilter);
  // console.log("columns:", columns);
  // console.log("data:", data);

  return (
    <>
      {/* <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} /> */}
      <table {...getTableProps()} className="border border-black">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((header) => (
                <th {...header.getHeaderProps()}>{header.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>
                      {/* <Link to={`./${row.original._id}`} className=""> */}
                      {cell.render("Cell")}
                      {/* </Link> */}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {Data.length - 1 > pageRowSize && (
        <div className="flex flex-col items-center justify-center text-xl mt-4">
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <div className="flex justify-center items-center">
            <span
              onClick={() => gotoPage(0)}
              className={`font-bold ${
                canPreviousPage
                  ? "text-green-800 hover:cursor-pointer"
                  : "text-gray-300  hover:cursor-not-allowed"
              }`}
            >
              {"<<"}
            </span>
            <GrFormPrevious
              size={40}
              onClick={() => previousPage()}
              className={`${
                canPreviousPage
                  ? "text-green-800 hover:cursor-pointer"
                  : "text-gray-300 hover:cursor-not-allowed"
              }`}
            />
            <GrFormNext
              size={40}
              onClick={() => nextPage()}
              className={`${
                canNextPage
                  ? "text-green-800 hover:cursor-pointer"
                  : "text-gray-300 hover:cursor-not-allowed"
              }`}
            />
            <span
              onClick={() => gotoPage(pageOptions.length - 1)}
              className={`font-bold ${
                canNextPage
                  ? "text-green-800 hover:cursor-pointer"
                  : "text-gray-300 hover:cursor-not-allowed"
              }`}
            >
              {">>"}
            </span>
          </div>
          <div className="flex justify-center items-center">
            <label htmlFor="page">Goto Page</label>
            <input
              type="number"
              name="page"
              id="page"
              onChange={(e) => {
                const pageNumber = e.target.value
                  ? Number(e.target.value) - 1
                  : 0;
                gotoPage(pageNumber);
              }}
              className="m-2 outline-none border-2 border-green-600 rounded-md p-2 w-[100px]"
            />
          </div>
        </div>
      )}
    </>
  );
}
