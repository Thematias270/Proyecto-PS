let inventarios = {};
let registros = [];
let inventarioActual = null;
let columnaOrden = null;
let ordenAsc = true;
let registrosFiltrados = [];
let paginaActual = 1;
let registrosPorPagina = 10;
let filtrosColumnas = {};
let seleccionados = new Set();
let registrosOriginales = [];
let resolverImportacion = null;

async function cargarInventarios() {
  try {
    const res = await fetch("api/obtener_inventarios.php");
    inventarios = (await res.json()) || {};

    Object.keys(inventarios).forEach((key) => {
      const inv = inventarios[key];

      // convertir viejos -> nuevos
      if (!inv.campos && inv.columnas) {
        inv.campos = inv.columnas
          .filter((col, i, arr) => arr.indexOf(col) === i) // elimina repetidos
          .map((col) => ({
            nombre: col,
            tipo: col.toLowerCase() === "id" ? "number" : "text",
          }));
      }

      // icono default
      if (!inv.icono) {
        inv.icono = "box";
      }
    });

    generarCards();
  } catch (error) {
    console.error("Error cargando inventarios:", error);
    inventarios = {};
  }
}

async function guardarInventario() {
  const nombre = document.getElementById("nombreInventario").value.trim();

  const icono = document.getElementById("iconoInventario").value;

  const filas = document.querySelectorAll("#contenedorColumnas > div");

  let campos = [];

  const btn = document.getElementById("btnGuardarInventario");
  setBotonLoading(btn, "Guardando...");

  filas.forEach((fila) => {
    const input = fila.querySelector("input");
    const select = fila.querySelector("select");

    const nombreCampo = input.value.trim();
    const tipo = select.value;

    if (nombreCampo !== "") {
      campos.push({
        nombre: nombreCampo,
        tipo: tipo,
      });
    }
  });

  campos = campos.filter((c) => c.nombre.toLowerCase() !== "id");

  // forzar id siempre primero
  campos.unshift({
    nombre: "id",
    tipo: "number",
  });

  if (!nombre || campos.length === 0) {
    mostrarToast("Completa nombre y columnas.", "error");
    return;
  }

  // clave interna
  let key = localStorage.getItem("editandoKey");

  if (!key) {
    key = nombre.toLowerCase().replace(/\s+/g, "_");
  }

  const res = await fetch("api/guardar_inventario.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      nombre,
      campos,
      icono,
    }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    mostrarToast("Error: " + data.message, "error");
    return;
  }

  //actualizar vista
  await cargarInventarios();
  if (localStorage.getItem("editandoKey")) {
    mostrarToast("Inventario actualizado", "success");
  } else {
    mostrarToast("Inventario creado", "success");
  }

  cerrarModal();

  document.getElementById("nombreInventario").value = "";
  document.getElementById("iconoInventario").value = "box";
  document.getElementById("contenedorColumnas").innerHTML = "";

  localStorage.removeItem("editandoKey");

  restaurarBoton(btn);
}

async function cargarListado(tipo) {
  paginaActual = 1;

  mostrarLoader();

  // quitar selección anterior
  document.querySelectorAll(".card-inventario").forEach((card) => {
    card.classList.remove("card-activa");
  });

  const cardActiva = document.getElementById(`card-${tipo}`);
  if (cardActiva) {
    cardActiva.classList.add("card-activa");
  }

  localStorage.setItem("inventarioActivo", tipo);
  filtrosColumnas = {};
  document.getElementById("buscador").value = "";

  if (!inventarios[tipo]) {
    mostrarToast("Inventario no encontrado.", "error");
    ocultarLoader();
    return;
  }

  inventarioActual = inventarios[tipo];

  const listado = document.getElementById("listadoEquipos");

  listado.classList.remove("hidden");
  listado.classList.remove("animar-listado");

  setTimeout(() => {
    listado.classList.add("animar-listado");
  }, 10);

  document.getElementById("tituloListado").textContent =
    "Listado de " + inventarioActual.nombre;

  const tabla = document.getElementById("tablaEquipos");
  tabla.innerHTML = "";

  renderizarHeaders();

  try {
    const res = await fetch(`api/obtener_registros.php?tipo=${tipo}`);
    registros = await res.json();

    registrosOriginales = [...registros];

    // ESTADO VACÍO
    if (registros.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="100%" class="text-center p-6 text-gray-500">
            📭 No hay registros en este inventario
          </td>
        </tr>
      `;
    } else {
      renderizarTabla(registros, inventarioActual);
    }
  } catch (error) {
    console.error(error);
    mostrarToast("Error al cargar registros", "error");
  }

  ocultarLoader();

  lucide.createIcons();

  listado.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

let timeoutBuscador;

document.getElementById("buscador").addEventListener("input", function () {
  clearTimeout(timeoutBuscador);

  timeoutBuscador = setTimeout(() => {
    aplicarFiltros();
  }, 300);
});

function aplicarFiltros() {
  const textoGlobal = document.getElementById("buscador").value.toLowerCase();

  let filtrados = registros.filter((fila) => {
    // filtro global
    const cumpleGlobal = Object.values(fila).some((valor) =>
      String(valor).toLowerCase().includes(textoGlobal),
    );

    // filtros por columna
    const cumpleColumnas = Object.keys(filtrosColumnas).every((col) => {
      const valorFiltro = filtrosColumnas[col];
      if (!valorFiltro) return true;

      return String(fila[col] || "")
        .toLowerCase()
        .includes(valorFiltro.toLowerCase());
    });

    return cumpleGlobal && cumpleColumnas;
  });

  paginaActual = 1;

  renderizarTabla(filtrados, inventarioActual);
}

function generarCards() {
  const contenedor = document.getElementById("contenedorCards");
  contenedor.innerHTML = "";

  Object.keys(inventarios).forEach((key) => {
    const inv = inventarios[key];

    contenedor.innerHTML += `
    <div class="bg-white p-6 rounded-xl shadow card-inventario" id="card-${key}">
    
      <div onclick="cargarListado('${key}')"
        class="cursor-pointer hover:scale-105 transition">

        <i data-lucide="${inv.icono || "box"}" class="w-8 h-8 mb-2"></i>
        <h2 class="text-lg font-semibold">${inv.nombre}</h2>
        <p class="text-sm text-gray-500">Ver ${inv.nombre}</p>
        </div>

        <div class="flex gap-2 mt-4">
          <button
            onclick="editarInventario('${key}')"
            class="p-2 rounded-lg bg-gray-100 hover:bg-blue-500 hover:text-white transition duration-200 hover:scale-110 shadow-sm"
            title="Editar inventario"
          >
            ✏️
          </button>

          <button
            onclick="eliminarInventario('${key}')"
            class="p-2 rounded-lg bg-gray-100 hover:bg-red-500 hover:text-white transition duration-200 hover:scale-110 shadow-sm"
            title="Eliminar inventario"
          >
            🗑️
          </button>
        </div>

      </div>
    `;
  });

  lucide.createIcons();
}
function abrirModal() {
  const modal = document.getElementById("modal");
  const contenido = document.getElementById("modalContenido");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  contenido.classList.remove("scale-100", "opacity-100");
  contenido.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    contenido.classList.remove("scale-95", "opacity-0");
    contenido.classList.add("scale-100", "opacity-100");

    // renderizar iconos
    lucide.createIcons();
  }, 10);

  if (!localStorage.getItem("editandoKey")) {
    document.getElementById("tituloModal").textContent = "Nuevo Inventario";
    document.getElementById("contenedorColumnas").innerHTML = "";
    document.getElementById("nombreInventario").value = "";

    agregarCampo("id", "number");
    renderizarSelectorIconos("box");
  }
}

function cerrarModal() {
  const modal = document.getElementById("modal");
  const contenido = document.getElementById("modalContenido");

  contenido.classList.remove("scale-100", "opacity-100");
  contenido.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 200);

  localStorage.removeItem("editandoKey");

  document.getElementById("nombreInventario").value = "";
  document.getElementById("contenedorColumnas").innerHTML = "";
}

function agregarCampo(valor = "", tipo = "text") {
  const contenedor = document.getElementById("contenedorColumnas");

  const div = document.createElement("div");
  div.className = "grid grid-cols-12 gap-2 items-center";

  // INPUT NOMBRE
  const input = document.createElement("input");
  input.type = "text";
  input.value = valor;
  input.placeholder = "Nombre del campo";
  input.className = "col-span-7 border p-2 rounded";

  // SELECT TIPO
  const select = document.createElement("select");
  select.className = "col-span-4 border p-2 rounded";

  const tipos = [
    { value: "text", label: "Texto" },
    { value: "date", label: "Fecha" },
    { value: "checkbox", label: "Checkbox" },
    { value: "number", label: "Número" },
  ];

  tipos.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.value;
    option.textContent = t.label;

    if (t.value === tipo) option.selected = true;

    select.appendChild(option);
  });

  // BOTON BORRAR
  const btn = document.createElement("button");
  btn.innerHTML = "❌";
  btn.className = "col-span-1 text-red-500";

  if (valor.toLowerCase() === "id") {
    input.disabled = true;
    select.disabled = true;
    input.classList.add("bg-gray-200");
    select.classList.add("bg-gray-200");
    btn.remove();
  } else {
    btn.onclick = () => div.remove();
  }

  div.appendChild(input);
  div.appendChild(select);

  if (valor.toLowerCase() !== "id") {
    div.appendChild(btn);
  }

  contenedor.appendChild(div);
}

function abrirFormulario() {
  localStorage.removeItem("modoEdicion");
  localStorage.removeItem("registroEditar");

  window.location.href = "formulario.html";
}
cargarInventarios();

function editarRegistro(id) {
  const registro = registros.find((r) => r.id == id);

  localStorage.setItem("modoEdicion", "true");
  localStorage.setItem("registroEditar", JSON.stringify(registro));

  window.location.href = "formulario.html";
}

function setBotonLoading(boton, texto = "Procesando...") {
  if (!boton) return;

  boton.dataset.textoOriginal = boton.innerHTML;
  boton.dataset.loadingInicio = Date.now();

  boton.disabled = true;

  boton.innerHTML = `
    <span class="flex items-center gap-2 justify-center">
      <span class="animate-spin">⏳</span>
      ${texto}
    </span>
  `;
}

async function exportarExcel() {
  const fecha = new Date().toISOString().split("T")[0];
  const btn = document.getElementById("btnExportarExcel");
  setBotonLoading(btn, "Exportando...");

  fetch("api/exportar_excel.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datos: registrosFiltrados,
      columnas: inventarioActual.campos.map((c) => c.nombre),
      nombre: inventarioActual.nombre,
    }),
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inventarioActual.nombre}_${fecha}.xlsx`;
      a.click();
    });
}

async function eliminarRegistro(id, btn) {
  confirmarEliminacion(async () => {
    setBotonLoading(btn, "⏳");

    const tipo = localStorage.getItem("inventarioActivo");

    await fetch("api/eliminar_registro.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, tipo }),
    });

    mostrarToast("Registro eliminado.", "success");

    await cargarListado(tipo);

    restaurarBoton(btn);
  }, "¿Eliminar este registro?");
}

function renderizarTabla(registrosFiltradosParam, inventario) {
  registrosFiltrados = registrosFiltradosParam;
  const totalPaginas =
    Math.ceil(registrosFiltrados.length / registrosPorPagina) || 1;

  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const datosPagina = obtenerRegistrosPaginados();

  const tabla = document.getElementById("tablaEquipos");
  tabla.innerHTML = "";

  datosPagina.forEach((fila) => {
    let row = `<tr class="border-t">`;

    row = `<tr class="border-t">
      <td>
        <input 
          type="checkbox" 
          ${seleccionados.has(fila.id) ? "checked" : ""}
          onchange="toggleSeleccion(${fila.id})"
        >
      </td>
    `;

    inventarioActual.campos.forEach((campo) => {
      let valor = fila[campo.nombre] ?? "";

      // aplicar filtros de resaltado
      const filtroColumna = filtrosColumnas[campo.nombre] || "";
      const textoGlobal = document.getElementById("buscador").value;

      if (filtroColumna) {
        valor = resaltarTexto(valor, filtroColumna);
      }

      if (textoGlobal) {
        valor = resaltarTexto(valor, textoGlobal);
      }

      row += `<td class="p-2 whitespace-nowrap">${valor}</td>`;
    });

    row += `
      <td class="text-center flex justify-center gap-2">
        
        <button 
          onclick="editarRegistro(${fila.id})"
          class="p-2 rounded-lg bg-gray-100 hover:bg-blue-500 hover:text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          ✏️
        </button>

        <button 
          onclick="eliminarRegistro(${fila.id})"
          class="p-2 rounded-lg bg-gray-100 hover:bg-red-500 hover:text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          🗑️
        </button>

      </td>
    `;
    tabla.innerHTML += row;
  });
  renderizarPaginacion();
  actualizarBotonEliminar();
}

function obtenerTipoDato(valor) {
  if (valor === null || valor === undefined) return "texto";

  const v = String(valor).trim();

  // número puro (ej: 10, 123)
  if (!isNaN(v) && v !== "") return "numero";

  // texto con números (ej: DESKBCAS010)
  if (/\d/.test(v)) return "numeroTexto";

  // fecha
  if (!isNaN(Date.parse(v))) return "fecha";

  return "texto";
}

function detectarTipoColumna(columna) {
  for (let fila of registros) {
    const valor = fila[columna];

    if (valor !== null && valor !== undefined && valor !== "") {
      return obtenerTipoDato(valor);
    }
  }

  return "texto";
}

function compararNatural(a, b) {
  const regex = /(\d+|\D+)/g;

  const partesA = String(a ?? "").match(regex);
  const partesB = String(b ?? "").match(regex);

  for (let i = 0; i < Math.max(partesA.length, partesB.length); i++) {
    const parteA = partesA[i];
    const parteB = partesB[i];

    if (parteA === undefined) return -1;
    if (parteB === undefined) return 1;

    const numA = parseInt(parteA, 10);
    const numB = parseInt(parteB, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    } else {
      if (parteA !== parteB) return parteA.localeCompare(parteB);
    }
  }

  return 0;
}

function obtenerValorComparable(valor, tipo) {
  if (valor === null || valor === undefined) return "";

  const v = String(valor).trim();

  switch (tipo) {
    case "numero":
      return Number(v);

    case "numeroTexto":
      const match = v.match(/\d+/);
      return match ? Number(match[0]) : 0;

    case "fecha":
      return new Date(v).getTime();

    default:
      return v.toLowerCase();
  }
}

function ordenarTabla(columna) {
  if (columnaOrden === columna) {
    if (ordenAsc === true) {
      ordenAsc = false; // ASC → DESC
    } else if (ordenAsc === false) {
      columnaOrden = null; // DESC → SIN ORDEN
    }
  } else {
    columnaOrden = columna;
    ordenAsc = true; // nuevo → ASC
  }

  // 🔄 SI NO HAY ORDEN → volver al original
  if (!columnaOrden) {
    registros = [...registrosOriginales]; // volver al orden original
    aplicarFiltros();
    renderizarHeaders();
    return;
  }

  const tipoColumna = detectarTipoColumna(columna);

  registros.sort((a, b) => {
    let resultado;

    if (tipoColumna === "numeroTexto") {
      resultado = compararNatural(a[columna], b[columna]);
    } else {
      const compA = obtenerValorComparable(a[columna], tipoColumna);
      const compB = obtenerValorComparable(b[columna], tipoColumna);

      if (compA < compB) resultado = -1;
      else if (compA > compB) resultado = 1;
      else resultado = 0;
    }

    return ordenAsc ? resultado : -resultado;
  });

  aplicarFiltros();
  renderizarHeaders();
}

function renderizarHeaders() {
  const thead = document.querySelector("thead");
  thead.innerHTML = "";

  // FILA DE TÍTULOS
  let filaTitulos = "<tr>";

  //  linea vacia para checkbox
  filaTitulos += `<th class="p-2 text-center">
  <input type="checkbox" onclick="seleccionarTodos(this)">
  </th>`;

  inventarioActual.campos.forEach((col) => {
    let flecha = "";

    if (columnaOrden === col.nombre) {
      flecha = ordenAsc ? " 🔼" : " 🔽";
    }

    filaTitulos += `
      <th class="text-left p-2 whitespace-nowrap cursor-pointer select-none"
          onclick="ordenarTabla('${col.nombre}')">
        ${col.nombre}${flecha}
      </th>
    `;
  });

  filaTitulos += `<th class="text-center">Acciones</th>`;

  // FILA DE FILTROS
  let filaFiltros = "<tr>";

  filaFiltros += `<th></th>`;

  inventarioActual.campos.forEach((col) => {
    filaFiltros += `
      <th>
        <input 
          type="text"
          value="${filtrosColumnas[col.nombre] || ""}" 
          placeholder="Buscar..."
          class="w-full border p-1 text-sm"
          oninput="filtrarColumna('${col.nombre}', this.value)"
        >
      </th>
    `;
  });

  filaFiltros += "<th></th><th></th></tr>";

  thead.innerHTML = filaTitulos + filaFiltros;
}

function resaltarTexto(texto, busqueda) {
  if (!busqueda) return texto;

  const escapeRegex = busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapeRegex})`, "gi");

  return String(texto).replace(regex, "<mark>$1</mark>");
}

function filtrarColumna(columna, valor) {
  filtrosColumnas[columna] = valor;
  aplicarFiltros();
}

async function exportarTodoExcel() {
  const btn = document.getElementById("btnExportarTodoExcel");
  setBotonLoading(btn, "Exportando...");

  try {
    const res = await fetch("api/exportar_todo_excel.php");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    const fecha = new Date().toISOString().split("T")[0];

    a.href = url;
    a.download = `inventario_completo_${fecha}.xlsx`;

    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    mostrarToast("Error al exportar", "error");
  } finally {
    restaurarBoton(btn);
  }
}

function cerrarListado() {
  document.getElementById("listadoEquipos").classList.add("hidden");
  inventarioActual = null;
}

function eliminarInventario(key) {
  confirmarEliminacion(async () => {
    const btn = event.target;
    setBotonLoading(btn, "Eliminando...");

    await fetch("api/eliminar_inventario.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    mostrarToast("Inventario eliminado.", "success");
    cerrarListado();
    await cargarInventarios();

    restaurarBoton(btn);
  }, "¿Eliminar este inventario completo?");
}

function editarInventario(key) {
  const inv = inventarios[key];

  localStorage.setItem("editandoKey", key);

  abrirModal();

  document.getElementById("nombreInventario").value = inv.nombre;
  document.getElementById("iconoInventario").value = inv.icono || "box";
  renderizarSelectorIconos(inv.icono || "box");

  const contenedor = document.getElementById("contenedorColumnas");
  contenedor.innerHTML = "";

  inv.campos.forEach((campo) => {
    agregarCampo(campo.nombre, campo.tipo);
  });

  document.getElementById("tituloModal").textContent = "Editar Inventario";
}

async function importarExcel() {
  const input = document.getElementById("inputExcel");
  const archivo = input.files[0];

  if (!archivo) {
    mostrarToast("Seleccioná un archivo Excel", "error");
    return;
  }

  let modo = await pedirModoImportacion();

  if (!modo) return;

  if (modo === null || modo === "3") return;

  if (modo !== "1" && modo !== "2") modo = "1";

  const btn = document.getElementById("btnImportarExcel");
  setBotonLoading(btn, "Importando...");

  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("modo", modo);

  try {
    const res = await fetch("api/importar_excel.php", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.status === "success") {
      mostrarToast("Importación completa 📊", "success");

      input.value = "";
      cerrarModal();
      await cargarInventarios();

      const activo = localStorage.getItem("inventarioActivo");

      if (activo) {
        await cargarListado(activo);
      }
    } else {
      mostrarToast(data.message, "error");
    }
  } catch (error) {
    mostrarToast("Error al importar", "error");
  }

  restaurarBoton(btn);
}

function obtenerRegistrosPaginados() {
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;

  return registrosFiltrados.slice(inicio, fin);
}

function renderizarPaginacion() {
  const totalPaginas = Math.ceil(
    registrosFiltrados.length / registrosPorPagina,
  );

  document.getElementById("infoPagina").textContent =
    `Página ${paginaActual} de ${totalPaginas || 1}`;

  document.querySelector("button[onclick='paginaAnterior()']").disabled =
    paginaActual === 1;

  document.querySelector("button[onclick='paginaSiguiente()']").disabled =
    paginaActual === totalPaginas || totalPaginas === 0;
}

function cambiarPagina(pagina) {
  paginaActual = pagina;
  renderizarTabla(registrosFiltrados, inventarioActual);
  renderizarPaginacion();
}

function paginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    renderizarTabla(registrosFiltrados, inventarioActual);
  }
}

function paginaSiguiente() {
  const totalPaginas = Math.ceil(
    registrosFiltrados.length / registrosPorPagina,
  );

  if (paginaActual < totalPaginas) {
    paginaActual++;
    renderizarTabla(registrosFiltrados, inventarioActual);
  }
}

document
  .getElementById("selectCantidad")
  .addEventListener("change", function () {
    registrosPorPagina = parseInt(this.value);
    paginaActual = 1;
    renderizarTabla(registrosFiltrados, inventarioActual);
  });

function mostrarToast(mensaje, tipo = "success") {
  const contenedor = document.getElementById("toastContainer");

  const colores = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };
  const iconos = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const toast = document.createElement("div");
  toast.className = `
    ${colores[tipo]} text-white px-4 py-2 rounded shadow-lg
    animate-slide-in flex justify-between items-center gap-3
  `;

  toast.innerHTML = `
    <span>${iconos[tipo]}${mensaje}</span>
  `;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function confirmarEliminacion(
  callback,
  mensaje = "¿Seguro que querés eliminar?",
) {
  const overlay = document.createElement("div");

  overlay.className = `
    fixed inset-0 bg-black bg-opacity-50
    flex items-center justify-center z-50
    opacity-0 transition-opacity duration-200
  `;

  overlay.innerHTML = `
    <div id="modalConfirm"
      class="
        bg-white rounded-xl shadow-2xl p-6 w-80 text-center
        scale-95 opacity-0 transition-all duration-200
      ">

      <div class="text-5xl mb-3">⚠️</div>

      <p class="text-gray-700 font-medium mb-5">
        ${mensaje}
      </p>

      <div class="flex justify-center gap-3">
        <button id="btnSi"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
          Sí
        </button>

        <button id="btnNo"
          class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">
          Cancelar
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  const modal = overlay.querySelector("#modalConfirm");

  // animación entrada
  setTimeout(() => {
    overlay.classList.remove("opacity-0");
    modal.classList.remove("scale-95", "opacity-0");
    modal.classList.add("scale-100", "opacity-100");
  }, 10);

  function cerrarModal() {
    overlay.classList.add("opacity-0");
    modal.classList.remove("scale-100", "opacity-100");
    modal.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
      overlay.remove();
      document.removeEventListener("keydown", cerrarEsc);
    }, 200);
  }

  function cerrarEsc(e) {
    if (e.key === "Escape") cerrarModal();
  }

  document.addEventListener("keydown", cerrarEsc);

  // botones
  document.getElementById("btnSi").onclick = () => {
    callback();
    cerrarModal();
  };

  document.getElementById("btnNo").onclick = cerrarModal;

  // click fondo
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarModal();
  });
}

function toggleSeleccion(id) {
  if (seleccionados.has(id)) {
    seleccionados.delete(id);
  } else {
    seleccionados.add(id);
  }

  actualizarBotonEliminar();
}

function seleccionarTodos(checkbox) {
  seleccionados.clear();

  if (checkbox.checked) {
    registrosFiltrados.forEach((r) => seleccionados.add(r.id));
  }
  actualizarBotonEliminar();
  renderizarTabla(registrosFiltrados, inventarioActual);
}

async function eliminarSeleccionados() {
  if (seleccionados.size === 0) {
    mostrarToast("No hay registros seleccionados.", "warning");
    return;
  }

  confirmarEliminacion(async () => {
    const tipo = localStorage.getItem("inventarioActivo");
    const btn = document.getElementById("btnEliminarSeleccionados");

    setBotonLoading(btn, "Eliminando...");

    await fetch("api/eliminar_multiple.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: Array.from(seleccionados),
        tipo,
      }),
    });

    mostrarToast("Registros eliminados.", "success");

    seleccionados.clear();
    actualizarBotonEliminar();
    await cargarListado(tipo);

    restaurarBoton(btn);
  }, `¿Eliminar ${seleccionados.size} registros seleccionados?`);
}

const iconosDisponibles = [
  "box",
  "laptop",
  "monitor",
  "printer",
  "server",
  "cpu",
  "hard-drive",
  "tablet",
  "smartphone",
  "router",
  "wifi",
  "usb",
  "camera",
  "database",
  "shield",
  "archive",
  "folder",
  "keyboard",
  "mouse",
  "scan",
];

function renderizarSelectorIconos(iconoActivo = "box") {
  const contenedor = document.getElementById("selectorIconos");

  contenedor.innerHTML = "";

  iconosDisponibles.forEach((icono) => {
    contenedor.innerHTML += `
      <button
        type="button"
        onclick="seleccionarIcono('${icono}')"
        class="icono-btn border rounded-lg p-3 hover:bg-gray-100 transition ${
          icono === iconoActivo ? "activo" : ""
        }"
        data-icono="${icono}"
      >
        <i data-lucide="${icono}" class="w-5 h-5 mx-auto"></i>
      </button>
    `;
  });

  lucide.createIcons();
}

function seleccionarIcono(icono) {
  document.getElementById("iconoInventario").value = icono;
  renderizarSelectorIconos(icono);
}

function actualizarBotonEliminar() {
  const btn = document.getElementById("btnEliminarSeleccionados");
  const cantidad = seleccionados.size;

  if (cantidad > 1) {
    btn.classList.remove("opacity-0", "scale-95", "pointer-events-none");
    btn.classList.add("opacity-100", "scale-100");
    btn.textContent = `🗑️ Eliminar (${cantidad})`;
  } else {
    btn.classList.remove("opacity-100", "scale-100");
    btn.classList.add("opacity-0", "scale-95", "pointer-events-none");
  }
}

function mostrarLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function ocultarLoader() {
  document.getElementById("loader").classList.add("hidden");
}

function restaurarBoton(boton) {
  if (!boton) return;

  const inicio = parseInt(boton.dataset.loadingInicio || 0);
  const tiempo = Date.now() - inicio;

  const esperar = Math.max(500 - tiempo, 0);

  setTimeout(() => {
    boton.disabled = false;
    boton.innerHTML = boton.dataset.textoOriginal;
  }, esperar);
}

function abrirModalImportacion() {
  // ocultar modal principal
  document.getElementById("modal").classList.add("hidden");

  const modal = document.getElementById("modalImportacion");
  const box = document.getElementById("contenidoImportacion");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  setTimeout(() => {
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  }, 10);
}

function cerrarModalImportacion(cancelar = true) {
  const modal = document.getElementById("modalImportacion");
  const box = document.getElementById("contenidoImportacion");

  box.classList.remove("scale-100", "opacity-100");
  box.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    document.getElementById("modal").classList.remove("hidden");
  }, 200);

  if (cancelar && resolverImportacion) {
    resolverImportacion(null);
    resolverImportacion = null;
  }
}

function seleccionarModoImportacion(valor) {
  if (!resolverImportacion) return;

  const resolve = resolverImportacion;
  resolverImportacion = null;

  cerrarModalImportacion(false); // cerrar sin cancelar
  resolve(valor);
}

function pedirModoImportacion() {
  return new Promise((resolve) => {
    resolverImportacion = resolve;
    abrirModalImportacion();
  });
}
