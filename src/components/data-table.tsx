type DataTableProps = {
  columns: string[];
  rows: React.ReactNode[][];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-100 dark:border-slate-800">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-4 align-top text-sm text-slate-700 dark:text-slate-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
