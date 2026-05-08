<?php
$data = json_decode(file_get_contents("php://input"), true);

$tipo = $data["tipo"];
$id = $data["id"];
$nuevosDatos = $data["datos"];

$archivo = "../data/" . $tipo . ".json";

if (!file_exists($archivo)) {
    echo json_encode(["status" => "error", "message" => "Archivo no existe"]);
    exit;
}

$registros = json_decode(file_get_contents($archivo), true);

foreach ($registros as &$r){
    if ($r["id"] == $id){
        $r = array_merge($r, $nuevosDatos);
        break;
    }
}

file_put_contents($archivo, json_encode($registros, JSON_PRETTY_PRINT));

echo json_encode([
    "status" => "success",
    "message" => "Registro actualizado"
]);