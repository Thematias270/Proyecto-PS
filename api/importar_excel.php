<?php

require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

header('Content-Type: application/json');

try {

    if (!isset($_FILES['archivo'])) {
        echo json_encode([
            "status" => "error",
            "message" => "No se envió archivo"
        ]);
        exit;
    }

    $rutaArchivo   = $_FILES['archivo']['tmp_name'];
    $nombreArchivo = pathinfo($_FILES['archivo']['name'], PATHINFO_FILENAME);

    $spreadsheet = IOFactory::load($rutaArchivo);
    $sheets = $spreadsheet->getAllSheets();

    $rutaInventarios = "../data/inventarios.json";

    if (!file_exists($rutaInventarios)) {
        file_put_contents($rutaInventarios, json_encode([]));
    }

    $inventarios = json_decode(file_get_contents($rutaInventarios), true);

    if (!is_array($inventarios)) {
        $inventarios = [];
    }

    foreach ($sheets as $sheet) {

        $nombreHoja = trim($sheet->getTitle());

        if (count($sheets) === 1) {
            $nombreHoja = $nombreArchivo;
        }

        // ignorar hojas basura
        $bloqueadas = ['bkp', 'hoja1', 'desplegables'];

        foreach ($bloqueadas as $b) {
            if (stripos($nombreHoja, $b) !== false) {
                continue 2;
            }
        }

        $rows = $sheet->toArray(null, true, true, false);

        if (count($rows) < 2) continue;

        // detectar fila header real
        $filaHeaderIndex = 0;

        foreach ($rows as $i => $fila) {

            $cantidad = count(array_filter($fila, function ($v) {
                return trim((string)$v) !== '';
            }));

            if ($cantidad >= 3) {
                $filaHeaderIndex = $i;
                break;
            }
        }

        $headersOriginales = $rows[$filaHeaderIndex];

        $rows = array_slice($rows, $filaHeaderIndex);

        // key
        $key = strtolower($nombreHoja);
        $key = preg_replace('/[^a-z0-9áéíóúñ ]/iu', '', $key);
        $key = preg_replace('/\s+/', '_', $key);

        // limpiar headers
        $headers = [];
        $indicesValidos = [];

        foreach ($headersOriginales as $index => $col) {

            $col = trim((string)$col);
            $col = strtolower($col);
            $col = preg_replace('/\s+/', ' ', $col);

            if ($col !== '') {
                $headers[] = $col;
                $indicesValidos[] = $index;
            }
        }

        if (empty($headers)) continue;

        array_unshift($headers, 'id');

        // sacar header para analizar datos
        $rowsSinHeader = $rows;
        array_shift($rowsSinHeader);

        // crear campos inteligentes
        $campos = [];

        foreach ($headers as $i => $columna) {

            $tipo = detectarTipoColumna($columna, $rowsSinHeader, $i - 1, $indicesValidos);

            $campo = [
                "nombre" => $columna,
                "tipo"   => $tipo
            ];

            if ($tipo === "select") {
                $campo["opciones"] = obtenerOpciones($rowsSinHeader, $i - 1, $indicesValidos);
            }

            $campos[] = $campo;
        }

        $inventarios[$key] = [
            "nombre" => $nombreHoja,
            "campos" => $campos
        ];

        $rutaJson = "../data/" . $key . ".json";

        if (!file_exists($rutaJson)) {
            file_put_contents($rutaJson, json_encode([]));
        }

        $registros = json_decode(file_get_contents($rutaJson), true);

        if (!is_array($registros)) {
            $registros = [];
        }

        $ultimoId = 0;

        if (!empty($registros)) {
            $ids = array_column($registros, 'id');
            $ultimoId = max($ids);
        }

        // recorrer filas
        foreach ($rowsSinHeader as $fila) {

            $filaFiltrada = [];

            foreach ($indicesValidos as $indexReal) {
                $filaFiltrada[] = isset($fila[$indexReal]) ? $fila[$indexReal] : null;
            }

            if (count(array_filter($filaFiltrada)) === 0) continue;

            $nuevo = [];

            foreach ($headers as $i => $col) {

                if ($col === "id") continue;

                $valor = $filaFiltrada[$i - 1] ?? null;

                if ($valor instanceof DateTime) {
                    $valor = $valor->format("Y-m-d");
                }

                $nuevo[$col] = limpiarValor($valor);
            }

            $ultimoId++;
            $nuevo["id"] = $ultimoId;

            $registros[] = $nuevo;
        }

        file_put_contents(
            $rutaJson,
            json_encode($registros, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    file_put_contents(
        $rutaInventarios,
        json_encode($inventarios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );

    echo json_encode([
        "status" => "success",
        "message" => "Importación PRO completada"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

// Funciones

function detectarTipoColumna($nombre, $rows, $posicion, $indicesValidos)
{
    $nombre = strtolower($nombre);

    if ($nombre === "id") return "number";

    // fechas
    if (
        strpos($nombre, 'fecha') !== false ||
        strpos($nombre, 'vence') !== false ||
        strpos($nombre, 'entrega') !== false
    ) {
        return "date";
    }

    // checkbox reales
    if (
        strpos($nombre, '?') !== false ||
        strpos($nombre, 'dominio') !== false ||
        strpos($nombre, 'mouse') !== false ||
        strpos($nombre, 'teclado') !== false ||
        strpos($nombre, 'dhcp') !== false ||
        strpos($nombre, 'hdmi') !== false
    ) {
        return "checkbox";
    }

    // selects
    if (
        strpos($nombre, 'tipo') !== false ||
        strpos($nombre, 'marca') !== false ||
        strpos($nombre, 'empresa') !== false ||
        strpos($nombre, 'estado') !== false ||
        strpos($nombre, 'sector') !== false ||
        strpos($nombre, 'ubicacion') !== false
    ) {
        return "select";
    }

    return "text";
}

function obtenerOpciones($rows, $posicion, $indicesValidos)
{
    $lista = [];

    foreach ($rows as $fila) {

        $indexReal = $indicesValidos[$posicion] ?? null;

        if ($indexReal === null) continue;

        $valor = trim((string)($fila[$indexReal] ?? ''));

        if ($valor !== '') {
            $lista[] = $valor;
        }
    }

    $lista = array_unique($lista);
    sort($lista);

    return array_values($lista);
}

function limpiarValor($valor)
{
    if ($valor === null) return "";

    $valor = trim((string)$valor);

    if (
        strtolower($valor) === "si" ||
        strtolower($valor) === "sí"
    ) return "si";

    if (strtolower($valor) === "no") return "no";

    return $valor;
}