<?php

$data = json_decode(file_get_contents("php://input"), true);

$ruta = "/data/inventarios.json";

$inventarios = [];

if (file_exists($ruta)) {
    $inventarios = json_decode(file_get_contents($ruta), true);
}

$key = $data["key"];

$inventarios[$key] = [
    "nombre" => $data["nombre"],
    "columnas" => $data["columnas"]
];

file_put_contents($ruta, json_encode($inventarios, JSON_PRETTY_PRINT));

echo json_encode(["status" => "ok"]);