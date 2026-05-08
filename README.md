# Proyecto - PS

# Manual de instalación y uso del software de Inventario

## 📌 Requisitos previos

Antes de usar el sistema en otra PC, se necesita:

- **XAMPP** instalado (Apache obligatorio).
- PHP habilitado desde XAMPP.
- Navegador web (Chrome recomendado).
- El proyecto copiado dentro de:

```text
C:\xampp\htdocs\
```

Ejemplo:

```text
C:\xampp\htdocs\inventario
```

---

# 🚀 Instalación rápida en otra PC

## Opción recomendada (más limpia)

Subir o compartir el proyecto **sin archivos innecesarios**.

## 📂 Archivos/carpetas IMPORTANTES que sí deben estar:

```text
api/
css/
JS/
data/
vendor/
index.html
formulario.html
composer.json
composer.lock
```

---

# 🗑️ Archivos/carpetas que podés eliminar antes de compartir

## 1. node_modules/

Se puede borrar sin problema.

Contiene dependencias de Tailwind / Vite usadas en desarrollo.

```text
node_modules/
```

Ocupa mucho espacio y no hace falta para ejecutar el sistema si ya está el CSS generado.

---

## 2. package-lock.json

Opcional.

```text
package-lock.json
```

Solo sirve para npm.

---

## 3. package.json

Opcional si no se va a editar Tailwind.

```text
package.json
```

---

# ⚠️ IMPORTANTE: carpeta vendor/

## NO borrar `vendor/`

La carpeta:

```text
vendor/
```

es necesaria porque contiene **PhpSpreadsheet**, librería usada para:

✅ Importar Excel
✅ Exportar Excel

Si la borrás, esas funciones dejan de andar.

---

# 🔥 Si querés compartir versión completa lista para usar:

Solo comprimí la carpeta del proyecto y listo.

La otra persona debe:

## 1. Copiar carpeta a htdocs

```text
C:\xampp\htdocs\inventario
```

## 2. Abrir XAMPP

Iniciar:

✅ Apache

## 3. Entrar al navegador

```text
http://localhost/inventario
```

---

# 📊 Base de datos del sistema

Este sistema usa archivos JSON en:

```text
data/
```

Ahí se guardan inventarios y registros.

No necesita MySQL.

---

# 🔧 Si algún día borran vendor/

Se recupera así:

```bash
composer install
```

(Requiere Composer instalado)

---

# 💡 Recomendación profesional para GitHub

Agregar `.gitignore`

```text
node_modules/
```

Así no subís basura pesada.

---

# ✅ Conclusión

## Para que funcione en otra PC alcanza con:

- Descargar proyecto
- Ponerlo en htdocs
- Levantar Apache
- Entrar por localhost

## No hace falta tocar nada más.

---

# 🚀 Mi consejo final

Antes de compartir:

Eliminar:

```text
node_modules/
package-lock.json
```

Y dejar todo lo demás.

Queda más liviano y profesional.
