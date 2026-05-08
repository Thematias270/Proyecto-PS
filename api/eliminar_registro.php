<?php

$data = json_decode(file_get_contents("php://input"), true);

$tipo = $data["tipo"];
$id = $data["id"];

$archivo = "../data/" . $tipo . ".json";

if (!file_exists($archivo)){
    echo json_encode(["status" => "error", "message" => "Archivo no encontrado"]);
    exit;
}

$registros = json_decode(file_get_contents($archivo), true);

$registros = array_values(array_filter($registros, function($r) use ($id) {
    return $r["id"] != $id;
}));

file_put_contents($archivo, json_encode($registros, JSON_PRETTY_PRINT));

echo json_encode(["status" => "success", "message" => "Registro eliminado"]);