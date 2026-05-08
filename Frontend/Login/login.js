const form = document.getElementById("loginForm");

const email = document.getElementById("email");
const password = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const togglePassword = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");

let showPassword = false;

// Mostrar / ocultar contraseña
togglePassword.addEventListener("click", () => {
  showPassword = !showPassword;

  password.type = showPassword ? "text" : "password";

  togglePassword.innerHTML = `<i data-lucide="${showPassword ? "eye-off" : "eye"}"></i>`;

  lucide.createIcons();
});

// Validación email
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  emailError.textContent = "";
  passwordError.textContent = "";

  let valid = true;

  if (email.value.trim() === "") {
    emailError.textContent = "El correo electrónico es requerido";
    valid = false;
  } else if (!validateEmail(email.value)) {
    emailError.textContent = "Ingresa un correo electrónico válido";
    valid = false;
  }

  if (password.value === "") {
    passwordError.textContent = "La contraseña es requerida";
    valid = false;
  } else if (password.value.length < 6) {
    passwordError.textContent =
      "La contraseña debe tener al menos 6 caracteres";
    valid = false;
  }

  if (!valid) return;

  loginBtn.disabled = true;
  loginBtn.textContent = "Iniciando sesión...";

  // simulación de login
  setTimeout(() => {
    console.log("Login con:", {
      email: email.value,
      password: password.value,
    });

    alert("Login exitoso");

    loginBtn.disabled = false;
    loginBtn.textContent = "Iniciar sesión";

    form.reset();
  }, 1500);
});
