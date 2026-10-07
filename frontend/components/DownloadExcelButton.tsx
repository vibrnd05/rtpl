"use client";

type Props = {
  /** Column header -> value, in the order they should appear in the sheet. */
  rows: Record<string, string | number>[];
  /** File name, without extension. */
  filename: string;
  sheetName: string;
};

export function DownloadExcelButton({ rows, filename, sheetName }: Props) {
  async function handleClick() {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={rows.length === 0}
      className="btn btn-secondary"
    >
      Download Excel
    </button>
  );
}
