<?php
require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Table;
use PhpOffice\PhpSpreadsheet\Worksheet\Table\TableStyle;

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data["datos"]) || count($data["datos"]) === 0) {
    echo "Sin datos para exportar";
    exit;
}

$registros = $data["datos"];
$columnas = $data["columnas"];
$nombreInventario = $data["nombre"] ?? "inventario";

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle("Datos");

// FECHA
$fecha = date("d/m/Y");
$sheet->setCellValue("A1", "Fecha: $fecha");

// ENCABEZADOS (fila 3)
$colIndex = 1;
foreach ($columnas as $col) {
    $celda = Coordinate::stringFromColumnIndex($colIndex) . '3';
    $sheet->setCellValue($celda, $col);
    $colIndex++;
}

// ESTILO HEADER
$ultimaCol = Coordinate::stringFromColumnIndex(count($columnas));

$sheet->getStyle("A3:{$ultimaCol}3")->applyFromArray([
    'font' => ['bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => '4F81BD'],
    ],
    'borders' => [
        'allBorders' => ['borderStyle' => Border::BORDER_THIN],
    ],
]);

// DATOS
$rowIndex = 4;

foreach ($registros as $fila) {
    $colIndex = 1;

    foreach ($columnas as $col) {
        $valor = isset($fila[$col]) ? (string)$fila[$col] : "";

        $celda = Coordinate::stringFromColumnIndex($colIndex) . $rowIndex;
        $sheet->setCellValue($celda, $valor);

        $colIndex++;
    }

    $rowIndex++;
}

// BORDES
$ultimaFila = $rowIndex - 1;

// colores filas
for ($fila = 4; $fila <= $ultimaFila; $fila++) {

    $color = (($fila - 4) % 2 == 0) ? "D9E1F2" : "F2F2F2";

    $sheet->getStyle("A{$fila}:{$ultimaCol}{$fila}")->applyFromArray([
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $color],
        ],
    ]);

}

$sheet->getStyle("A3:{$ultimaCol}{$ultimaFila}")
    ->getBorders()
    ->getAllBorders()
    ->setBorderStyle(Border::BORDER_THIN);

// AUTO ANCHO
for ($i = 1; $i <= count($columnas); $i++) {
    $letra = Coordinate::stringFromColumnIndex($i);
    $sheet->getColumnDimension($letra)->setAutoSize(true);
}

// FILTROS AUTOMÁTICOS
$sheet->setAutoFilter("A3:{$ultimaCol}{$ultimaFila}");

// FREEZE HEADER
$sheet->freezePane('A4');

// NOMBRE DINÁMICO
$fechaArchivo = date("Y-m-d");
$nombreArchivo = "{$nombreInventario}_{$fechaArchivo}.xlsx";

// DESCARGA
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment; filename=\"$nombreArchivo\"");

$writer = new Xlsx($spreadsheet);
$writer->save("php://output");
exit;