let inventarios = {};

async function cargarInventarios() {
  try {
    const res = await fetch("/api/obtener_inventarios.php");
    inventarios = (await res.json()) || {};

    generarCards();
  } catch (error) {
    console.error("Error cargando inventarios:", error);
    inventarios = {};
  }
}

async function guardarInventario() {
  const nombre = document.getElementById("nombreInventario").value;

  const inputs = document.querySelectorAll("#contenedorColumnas input");

  const columnas = [];

  inputs.forEach((input) => {
    if (input.value.trim() !== "") {
      columnas.push(input.value.trim());
    }
  });

  if (!nombre || columnas.length === 0) {
    alert("Completa nombre y columnas.");
    return;
  }

  // clave interna
  const key = nombre.toLowerCase().replace(/\s+/g, "_");

  await fetch("/api/guardar_inventario.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      nombre,
      columnas,
    }),
  });

  //actualizar vista
  await cargarInventarios();
  alert("Inventario guardado.");

  cerrarModal();

  document.getElementById("nombreInventario").value = "";
  document.getElementById("contenedorColumnas").innerHTML = "";
}

function cargarListado(tipo) {
  if (!inventarios[tipo]) {
    alert("Inventario no encontrado.");
    return;
  }

  const inventario = inventarios[tipo];

  document.getElementById("listadoEquipos").classList.remove("hidden");
  document.getElementById("tituloListado").textContent =
    "Listado de " + inventario.nombre;

  const tabla = document.getElementById("tablaEquipos");
  const thead = document.querySelector("thead tr");

  tabla.innerHTML = "";
  thead.innerHTML = "";

  // columnas dinámicas
  inventario.columnas.forEach((col) => {
    thead.innerHTML += `<th class="text-left p-2">${col}</th>`;
  });

  thead.innerHTML += `
    <th class="p-2">Editar</th>
    <th class="p-2">Eliminar</th>
  `;

  // datos de prueba (temporal)
  const datos = [
    // { a: "PC-01", b: "IT", c: "Dell", d: "Optiplex" },
    // { a: "PC-02", b: "Ventas", c: "HP", d: "EliteDesk" },
  ];

  datos.forEach((fila) => {
    let row = `<tr class="border-t">`;

    inventario.columnas.forEach((col) => {
      row += `<td class="p-2">${fila[col]}</td>`;
    });

    row += `
      <td class="text-center">
        <button class="text-blue-500">
          <i data-lucide="pencil"></i>
        </button>
      </td>
      <td class="text-center">
        <button class="text-red-500">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    </tr>`;

    tabla.innerHTML += row;
  });

  lucide.createIcons();
}

function generarCards() {
  const contenedor = document.getElementById("contenedorCards");
  contenedor.innerHTML = "";

  Object.keys(inventarios).forEach((key) => {
    const inv = inventarios[key];

    contenedor.innerHTML += `
      <div onclick="cargarListado('${key}')"
        class="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg hover:scale-105 transition">

        <i data-lucide="box" class="w-8 h-8 mb-2"></i>
        <h2 class="text-lg font-semibold">${inv.nombre}</h2>
        <p class="text-sm text-gray-500">Ver ${inv.nombre}</p>

      </div>
    `;
  });

  lucide.createIcons();
}
function abrirModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
}

function agregarCampo() {
  const contenedor = document.getElementById("contenedorColumnas");

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Nombre de la columna";
  input.className = "w-full border p-2 rounded mb-2";
  contenedor.appendChild(input);
}

function abrirFormulario() {
  const tipo = document.getElementById("tituloListado").textContent;
  localStorage.setItem("tipoInventario", tipo);

  window.location.href = "formulario.html";
}
cargarInventarios();
