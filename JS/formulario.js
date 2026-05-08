const form = document.getElementById("equipment-form");
const boton = document.getElementById("btnRegistrar");
const notificacion = document.getElementById("notificacion");

let inventario = null;

const esEdicion = localStorage.getItem("modoEdicion") === "true";
const registroEditar = JSON.parse(localStorage.getItem("registroEditar"));

async function cargarFormulario() {
  const tipo = localStorage.getItem("inventarioActivo");

  const res = await fetch(`api/obtener_inventarios.php`);
  const inventarios = await res.json();

  inventario = inventarios[tipo];

  const contenedor = document.getElementById("formDinamico");
  contenedor.innerHTML = "";

  if (!inventario) {
    alert("Inventario no encontrado");
    return;
  }

  const columnas = obtenerColumnasInventario();

  columnas.forEach((campo) => {
    contenedor.appendChild(crearCampoFormulario(campo));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarFormulario();

  const titulo = document.getElementById("tituloForm");

  if (esEdicion) {
    if (titulo) titulo.textContent = "Editar equipo";
    boton.textContent = "Guardar cambios";
  }

  if (esEdicion && registroEditar) {
    Object.keys(registroEditar).forEach((key) => {
      const input = document.getElementById(key);

      if (input) {
        if (key.toLowerCase() === "id") return;
        if (input.type === "checkbox") {
          input.checked = registroEditar[key];
        } else {
          input.value = registroEditar[key];
        }
      }
    });
  }
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const tipo = localStorage.getItem("inventarioActivo");

  const registro = {};

  if (!inventario) {
    alert("No se ha cargado el inventario.");
    return;
  }

  const columnas = obtenerColumnasInventario();

  const errores = validarFormulario(columnas);

  if (errores.length > 0) {
    mostrarToast(errores[0], "error");
    return;
  }

  columnas.forEach((campo) => {
    if (campo.nombre.toLowerCase() !== "id") {
      const input = document.getElementById(campo.nombre);

      registro[campo.nombre] =
        input.type === "checkbox" ? input.checked : input.value;
    }
  });

  boton.textContent = esEdicion ? "Guardando cambios..." : "Guardando...";
  boton.disabled = true;

  try {
    const url = esEdicion
      ? "api/editar_registro.php"
      : "api/guardar_registro.php";

    const body = esEdicion
      ? { tipo, id: registroEditar.id, datos: registro }
      : { tipo, registro };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.status === "success") {
      notificacion.textContent = esEdicion
        ? "Registro editado."
        : "Equipo registrado.";

      notificacion.classList.remove("hidden", "bg-red-500");
      notificacion.classList.add("bg-green-500");

      form.reset();

      localStorage.removeItem("modoEdicion");
      localStorage.removeItem("registroEditar");

      setTimeout(() => {
        notificacion.classList.add("hidden");

        boton.textContent = "Registrar equipo";
        boton.disabled = false;

        window.location.href = "index.html";
      }, 2000);
    }
  } catch (error) {
    console.error("Error:", error);

    notificacion.textContent = "Error al guardar.";
    notificacion.classList.remove("hidden", "bg-green-500");
    notificacion.classList.add("bg-red-500");

    boton.disabled = false;
    boton.textContent = "Registrar equipo";
  }
});

function mostrarCheck(checkId) {
  document.getElementById(checkId).classList.remove("hidden");
}

function limpiarFormulario() {
  form.reset();
  document
    .querySelectorAll("[id^='check']")
    .forEach((c) => c.classList.add("hidden"));
}

window.mostrarCheck = mostrarCheck;
window.limpiarFormulario = limpiarFormulario;

function obtenerColumnasInventario() {
  let columnas = [];

  if (inventario.campos) {
    columnas = inventario.campos;
  } else if (inventario.columnas) {
    columnas = inventario.columnas.map((col) => ({
      nombre: col,
      tipo: "text",
    }));
  }

  return columnas.filter(
    (campo, index, self) =>
      index === self.findIndex((c) => c.nombre === campo.nombre),
  );
}

function crearInputPorTipo(tipo) {
  let elemento = document.createElement("input");

  switch (tipo) {
    case "checkbox":
      elemento.type = "checkbox";
      break;

    case "date":
      elemento.type = "date";
      break;

    case "number":
      elemento.type = "number";
      break;

    default:
      elemento.type = "text";
      break;
  }

  elemento.className = "w-full border p-2 rounded";

  return elemento;
}

function crearWrapper() {
  return document.createElement("div");
}

function crearLabel(nombre) {
  const label = document.createElement("label");

  label.textContent = nombre;
  label.className = "text-sm text-gray-600";

  return label;
}

function crearCampoID(nombre) {
  const wrapper = crearWrapper();

  const label = crearLabel(nombre);

  const span = document.createElement("div");

  span.className = "w-full p-2 rounded bg-gray-200 text-gray-600 font-semibold";

  span.textContent = esEdicion
    ? `ID: ${registroEditar.id}`
    : "ID: Auto generado";

  wrapper.appendChild(label);
  wrapper.appendChild(span);

  return wrapper;
}

function crearCampoFormulario(campo) {
  const nombre = campo.nombre;
  const tipo = campo.tipo;

  if (nombre.toLowerCase() === "id") {
    return crearCampoID(nombre);
  }

  const elemento = crearInputPorTipo(tipo);
  elemento.id = nombre;

  const wrapper = crearWrapper();
  const label = crearLabel(nombre);

  wrapper.appendChild(label);
  wrapper.appendChild(elemento);

  return wrapper;
}

// validaciones
function limpiarErrores() {
  document.querySelectorAll(".input-error").forEach((el) => {
    el.classList.remove("border-red-500");
  });
}

function marcarError(input) {
  input.classList.add("border-red-500", "input-error");
}

function validarFormulario(columnas) {
  limpiarErrores();

  let errores = [];

  columnas.forEach((campo) => {
    if (campo.nombre.toLowerCase() === "id") return;

    const input = document.getElementById(campo.nombre);
    const valor =
      input.type === "checkbox" ? input.checked : input.value.trim();

    // vacios
    if (input.type !== "checkbox" && valor === "") {
      errores.push(`El campo ${campo.nombre} no puede estar vacío.`);
      marcarError(input);
      return;
    }

    // números
    if (input.type === "number" && isNaN(valor)) {
      errores.push(`El campo ${campo.nombre} debe ser un número.`);
      marcarError(input);
      return;
    }
  });

  return errores;
}

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
    <span>${iconos[tipo]} ${mensaje}</span>
  `;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
