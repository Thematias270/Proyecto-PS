<?php

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data["key"])) {
    echo "Error";
    exit;
}

$ruta = "../data/inventarios.json";

$inventarios = json_decode(file_get_contents($ruta), true);

$key = $data["key"];

// eliminar inventario
unset($inventarios[$key]);

file_put_contents($ruta, json_encode($inventarios, JSON_PRETTY_PRINT));

// eliminar archivo de datos también
$archivoDatos = "../data/$key.json";
if (file_exists($archivoDatos)) {
    unlink($archivoDatos);
}

echo "ok";