<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

// rutas
$carpeta = "../data/";
$archivos = glob($carpeta . "*.json");

$rutaInventarios = "../data/inventarios.json";
$inventarios = file_exists($rutaInventarios)
    ? json_decode(file_get_contents($rutaInventarios), true)
    : [];

if (!$archivos) {
    exit;
}

$spreadsheet = new Spreadsheet();
$indexHoja = 0;

foreach ($archivos as $archivo) {

    $nombreArchivo = basename($archivo, ".json");
    $registros = json_decode(file_get_contents($archivo), true);

    if (!$registros || count($registros) === 0) {
        continue;
    }

    if (!isset($registros[0]) || !is_array($registros[0])) {
        continue;
    }

    // columnas dinámicas
    $columnas = array_keys($registros[0]);

    // crear hoja nueva
    if ($indexHoja > 0) {
        $spreadsheet->createSheet();
    }

    $spreadsheet->setActiveSheetIndex($indexHoja);
    $sheet = $spreadsheet->getActiveSheet();

    // nombre real del inventario
    $nombreReal = isset($inventarios[$nombreArchivo]['nombre'])
        ? $inventarios[$nombreArchivo]['nombre']
        : $nombreArchivo;

    $sheet->setTitle(substr($nombreReal, 0, 31));

    // FECHA
    $sheet->setCellValue("A1", "Fecha: " . date("d/m/Y"));

    // ENCABEZADOS (fila 2)
    $colIndex = 1;
    foreach ($columnas as $col) {
        $celda = Coordinate::stringFromColumnIndex($colIndex) . '2';
        $sheet->setCellValue($celda, $col);
        $colIndex++;
    }

    // DATOS (desde fila 3)
    $rowIndex = 3;
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

    // última columna y fila
    $ultimaCol = Coordinate::stringFromColumnIndex(count($columnas));
    $ultimaFila = $rowIndex - 1;

    // aplicar colores por fila
    for ($filaNum = 3; $filaNum <= $ultimaFila; $filaNum++) {
        $color = (($filaNum - 3) % 2 == 0) ? "D9E1F2" : "F2F2F2";

        $sheet->getStyle("A{$filaNum}:{$ultimaCol}{$filaNum}")->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $color],
            ],
        ]);
    }

    // ESTILO HEADER
    $sheet->getStyle("A2:{$ultimaCol}2")->applyFromArray([
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

    // BORDES DATOS
    $sheet->getStyle("A2:{$ultimaCol}{$ultimaFila}")
        ->getBorders()
        ->getAllBorders()
        ->setBorderStyle(Border::BORDER_THIN);

    // AUTO FILTROS
    $sheet->setAutoFilter("A2:{$ultimaCol}{$ultimaFila}");

    // FREEZE HEADER
    $sheet->freezePane('A3');

    // AUTO ANCHO
    for ($i = 1; $i <= count($columnas); $i++) {
        $letra = Coordinate::stringFromColumnIndex($i);
        $sheet->getColumnDimension($letra)->setAutoSize(true);
    }

    $indexHoja++;
}

// nombre archivo
$fecha = date("Y-m-d");
$nombreFinal = "inventario_completo_$fecha.xlsx";

// limpiar buffer
if (ob_get_length()) {
    ob_end_clean();
}

// headers descarga
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment; filename=\"$nombreFinal\"");
header('Cache-Control: max-age=0');

// output
$writer = new Xlsx($spreadsheet);
$writer->save("php://output");
exit;