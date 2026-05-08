const form = document.getElementById("form");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirm = document.getElementById("toggleConfirm");

const submitBtn = document.getElementById("submitBtn");

let showPassword = false;
let showConfirm = false;

// TOGGLE PASSWORD
togglePassword.addEventListener("click", () => {
  showPassword = !showPassword;

  password.type = showPassword ? "text" : "password";

  togglePassword.innerHTML = `<i data-lucide="${showPassword ? "eye-off" : "eye"}"></i>`;

  lucide.createIcons();
});

// TOGGLE CONFIRM PASSWORD
toggleConfirm.addEventListener("click", () => {
  showConfirm = !showConfirm;

  confirmPassword.type = showConfirm ? "text" : "password";

  toggleConfirm.innerHTML = `<i data-lucide="${showConfirm ? "eye-off" : "eye"}"></i>`;

  lucide.createIcons();
});

// 🔐 PASSWORD REQUIREMENTS
password.addEventListener("input", () => {
  const p = password.value;

  document.getElementById("req1").innerHTML =
    (p.length >= 8 ? "✅" : "❌") + " Al menos 8 caracteres";

  document.getElementById("req2").innerHTML =
    (/[A-Z]/.test(p) ? "✅" : "❌") + " Una letra mayúscula";

  document.getElementById("req3").innerHTML =
    (/[a-z]/.test(p) ? "✅" : "❌") + " Una letra minúscula";

  document.getElementById("req4").innerHTML =
    (/[0-9]/.test(p) ? "✅" : "❌") + " Un número";
});

function resetPasswordRequirements() {
  req1.innerHTML = "❌ Al menos 8 caracteres";
  req2.innerHTML = "❌ Una letra mayúscula";
  req3.innerHTML = "❌ Una letra minúscula";
  req4.innerHTML = "❌ Un número";
}

// 📧 EMAIL VALIDATION
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 🧠 FORM VALIDATION
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  let valid = true;

  document.getElementById("nameError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";
  document.getElementById("confirmError").textContent = "";

  if (name === "") {
    document.getElementById("nameError").textContent = "El nombre es requerido";
    valid = false;
  }

  if (email === "") {
    document.getElementById("emailError").textContent =
      "El correo es requerido";
    valid = false;
  } else if (!validEmail(email)) {
    document.getElementById("emailError").textContent = "Correo inválido";
    valid = false;
  }

  if (password.value === "") {
    document.getElementById("passwordError").textContent =
      "La contraseña es requerida";
    valid = false;
  }
  if (confirmPassword.value === "") {
    document.getElementById("confirmError").textContent =
      "La contraseña es requerida";
    valid = false;
  }

  if (password.value !== confirmPassword.value) {
    document.getElementById("confirmError").textContent =
      "Las contraseñas no coinciden";
    valid = false;
  }

  if (valid) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creando cuenta...";

    setTimeout(() => {
      alert("Cuenta creada correctamente");

      submitBtn.disabled = false;
      submitBtn.textContent = "Crear cuenta";

      form.reset();
      resetPasswordRequirements();
    }, 1500);
  }
});
