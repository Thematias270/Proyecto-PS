<?php

$tipo = $_GET['tipo'];

$ruta = "../data/" . $tipo . ".json";

if (!file_exists($ruta)) {
    echo json_encode([]);
    exit;
}

$contenido = file_get_contents($ruta);
echo $contenido;
