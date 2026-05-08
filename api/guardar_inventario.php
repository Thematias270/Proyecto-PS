<?php

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if(!$data){
    echo json_encode([
        "status"=>"error",
        "message"=>"No llegaron datos"
    ]);
    exit;
}

$ruta = "../data/inventarios.json";

if(!file_exists($ruta)){
    file_put_contents($ruta, json_encode([]));
}

$inventarios = json_decode(file_get_contents($ruta), true);

$key = $data["key"];

$inventarios[$key] = [
    "nombre" => $data["nombre"],
    "icono" => $data["icono"],
    "campos" => $data["campos"]
];

if(file_put_contents($ruta, json_encode($inventarios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))){

    echo json_encode([
        "status"=>"success"
    ]);

}else{

    echo json_encode([
        "status"=>"error",
        "message"=>"No se pudo guardar"
    ]);
}