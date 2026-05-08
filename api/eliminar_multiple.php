<?php
header("Content-Type: application/json");

// leer datos
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["ids"]) || !isset($data["tipo"])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

$ids = $data["ids"];
$tipo = $data["tipo"];

// sanitizar nombre de archivo (MUY IMPORTANTE)
$tipo = preg_replace('/[^a-zA-Z0-9_]/', '', $tipo);

$archivo = "../data/" . $tipo . ".json";

// verificar que exista
if (!file_exists($archivo)) {
    echo json_encode(["status" => "error", "message" => "Archivo no encontrado"]);
    exit;
}

// leer registros
$contenido = file_get_contents($archivo);
$registros = json_decode($contenido, true);

// si no hay datos
if (!is_array($registros)) {
    $registros = [];
}

// filtrar registros (eliminar los seleccionados)
$registrosFiltrados = array_filter($registros, function($registro) use ($ids) {
    return !in_array($registro["id"], $ids);
});

// reindexar array
$registrosFiltrados = array_values($registrosFiltrados);

// guardar archivo actualizado
file_put_contents($archivo, json_encode($registrosFiltrados, JSON_PRETTY_PRINT));

// respuesta
echo json_encode([
    "status" => "success",
    "eliminados" => count($ids)
]);