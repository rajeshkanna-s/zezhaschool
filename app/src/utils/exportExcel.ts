import * as XLSX from 'xlsx';

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  filename: string,
  sheetName = 'Report'
) {
  const rows = data.map(row =>
    columns.reduce<Record<string, unknown>>((acc, col) => {
      acc[col.header] = row[col.key] ?? '';
      return acc;
    }, {})
  );

  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = columns.map(col => ({
    wch: Math.max(
      col.header.length + 2,
      ...rows.map(r => String(r[col.header] ?? '').length + 2).slice(0, 100)
    ),
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
