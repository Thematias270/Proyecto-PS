<?php

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No hay datos"]);
    exit;
}

$tipo = $data['tipo'];
$registro = $data['registro'];

$ruta = "../data/" . $tipo . ".json";

if (!file_exists($ruta)) {
    file_put_contents($ruta, json_encode([]));
}

$datos = json_decode(file_get_contents($ruta), true);

// generar ID
$ultimoId = 0;

if (!empty($datos)) {
    $ids = array_column($datos, 'id');
    $ultimoId = max($ids);
}

$registro['id'] = $ultimoId + 1;

$datos[] = $registro;

file_put_contents($ruta, json_encode($datos, JSON_PRETTY_PRINT));

echo json_encode(["status" => "success", "message" => "Registro guardado correctamente"]);