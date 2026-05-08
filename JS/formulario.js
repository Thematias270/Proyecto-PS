const form = document.getElementById("equipment-form");
const boton = document.getElementById("btnRegistrar");
const notificacion = document.getElementById("notificacion");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    nombreAsignado: document.getElementById("nombreAsignado").value,
    nombreActual: document.getElementById("nombreActual").value,
    nombreOriginal: document.getElementById("nombreOriginal").value,
    dominio: document.getElementById("dominio").checked,

    ubicacion: document.getElementById("ubicacion").value,
    instalacion: document.getElementById("instalacion").value,
    area: document.getElementById("area").value,
    empresa: document.getElementById("empresa").value,

    marca: document.getElementById("marca").value,
    modelo: document.getElementById("modelo").value,
    sistemaOperativo: document.getElementById("sistemaOperativo").value,
    numeroSerie: document.getElementById("numeroSerie").value,

    cpu: document.getElementById("cpu").value,
    ram: document.getElementById("memoria").value,
    almacenamiento: document.getElementById("almacenamiento").value,

    responsable: document.getElementById("responsable").value,
  };

  console.log("Equipo registrado:", data);

  boton.textContent = "Guardando...";
  boton.disabled = true;

  setTimeout(() => {
    notificacion.classList.remove("hidden");

    boton.textContent = "Registrar Equipo";
    boton.disabled = false;

    form.reset();
    limpiarFormulario();

    setTimeout(() => {
      notificacion.classList.add("hidden");
    }, 3000);
  }, 1200);
});

function limpiarFormulario() {
  form.reset();

  document.querySelectorAll('[id^="check"]').forEach((check) => {
    check.classList.add("hidden");
  });
}

function mostrarCheck(checkId) {
  const check = document.getElementById(checkId);
  check.classList.remove("hidden");
}
