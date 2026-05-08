<?php

require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

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

        // Si el Excel tiene una sola hoja → usar nombre archivo
        if (count($sheets) === 1) {
            $nombreHoja = $nombreArchivo;
        }

        // IGNORAR HOJAS BASURA
        $hojasIgnorar = ['bkp', 'hoja1', 'desplegables'];

        foreach ($hojasIgnorar as $bloqueada) {
            if (stripos($nombreHoja, $bloqueada) !== false) {
                continue 2;
            }
        }

        $rows = $sheet->toArray(null, true, true, false);

        if (count($rows) < 2) continue;

        // DETECTAR HEADER REAL
        $filaHeaderIndex = 0;

        foreach ($rows as $i => $fila) {

            $cantidadDatos = count(array_filter($fila, function ($v) {
                return trim((string)$v) !== '';
            }));

            if ($cantidadDatos >= 3) {
                $filaHeaderIndex = $i;
                break;
            }
        }

        $headersOriginales = $rows[$filaHeaderIndex];

        // quitar filas basura previas
        $rows = array_slice($rows, $filaHeaderIndex);

        // key interna
        $key = strtolower($nombreHoja);
        $key = preg_replace('/[^a-z0-9áéíóúñ ]/iu', '', $key);
        $key = preg_replace('/\s+/', '_', $key);

        // LIMPIAR HEADERS
        $headers = [];
        $indicesValidos = [];

        foreach ($headersOriginales as $index => $col) {

            $col = trim((string)$col);
            $col = str_replace(["\n", "\r", "\t"], '', $col);
            $col = preg_replace('/\s+/', ' ', $col);
            $col = strtolower($col);

            if ($col !== '') {
                $headers[] = $col;
                $indicesValidos[] = $index;
            }
        }

        if (empty($headers)) continue;

        // Si no existe nombre / serial / id → probablemente hoja basura
        $headerTexto = implode('|', $headers);

        if (
            stripos($headerTexto, 'nombre') === false &&
            stripos($headerTexto, 'serial') === false &&
            stripos($headerTexto, 'id') === false
        ) {
            continue;
        }

        // agregar id
        array_unshift($headers, 'id');

        // guardar inventario
        $inventarios[$key] = [
            "nombre"   => $nombreHoja,
            "columnas" => $headers
        ];

        $rutaJson = "../data/" . $key . ".json";

        if (!file_exists($rutaJson)) {
            file_put_contents($rutaJson, json_encode([]));
        }

        $registros = json_decode(file_get_contents($rutaJson), true);

        if (!is_array($registros)) {
            $registros = [];
        }

        // ultimo id
        $ultimoId = 0;

        if (!empty($registros)) {
            $ids = array_column($registros, 'id');
            $ultimoId = max($ids);
        }

        // sacar fila header
        array_shift($rows);

        // RECORRER FILAS
        foreach ($rows as $fila) {

            $filaFiltrada = [];

            foreach ($indicesValidos as $indexReal) {
                $filaFiltrada[] = isset($fila[$indexReal])
                    ? trim((string)$fila[$indexReal])
                    : null;
            }

            if (count(array_filter($filaFiltrada)) === 0) continue;

            $nuevo = [];

            foreach ($headers as $i => $col) {

                if ($col === 'id') continue;

                $nuevo[$col] = $filaFiltrada[$i - 1] ?? null;
            }

            // BUSCAR EXISTENTE:
            // prioridad serial > nombre
            $registroExistente = null;

            foreach ($registros as $k => $r) {

                if (
                    !empty($nuevo['serial']) &&
                    !empty($r['serial']) &&
                    strtolower($nuevo['serial']) === strtolower($r['serial'])
                ) {
                    $registroExistente = $k;
                    break;
                }

                if (
                    !empty($nuevo['nombre']) &&
                    !empty($r['nombre']) &&
                    strtolower($nuevo['nombre']) === strtolower($r['nombre'])
                ) {
                    $registroExistente = $k;
                    break;
                }
            }

            // SI EXISTE → ACTUALIZA
            if ($registroExistente !== null) {

                foreach ($nuevo as $campo => $valor) {

                    if ($valor !== null && $valor !== '') {
                        $registros[$registroExistente][$campo] = $valor;
                    }
                }

            } else {

                // nuevo registro
                $ultimoId++;
                $nuevo['id'] = $ultimoId;

                $registros[] = $nuevo;
            }
        }

        file_put_contents(
            $rutaJson,
            json_encode(
                $registros,
                JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            )
        );
    }

    file_put_contents(
        $rutaInventarios,
        json_encode(
            $inventarios,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        )
    );

    echo json_encode([
        "status" => "success",
        "message" => "Importación inteligente completada"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}