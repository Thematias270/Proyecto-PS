# Proyecto - PS

<<<<<<< HEAD
# Manual de instalación y uso del software de Inventario
=======
# Manual de Instalación y Uso del Sistema de Inventario
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d

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
<<<<<<< HEAD
C:\xampp\htdocs\inventario
=======
C:\xampp\htdocs\Proyecto-PS
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
```

---

# 🚀 Instalación rápida en otra PC

<<<<<<< HEAD
## Opción recomendada (más limpia)

Subir o compartir el proyecto **sin archivos innecesarios**.

=======
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
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

<<<<<<< HEAD
# 🗑️ Archivos/carpetas que podés eliminar antes de compartir

## 1. node_modules/

Se puede borrar sin problema.

Contiene dependencias de Tailwind / Vite usadas en desarrollo.
=======
# # 🗑️ Archivos/carpetas opcionales

## 1. node_modules/

Contiene dependencias de Tailwind / Vite.
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d

```text
node_modules/
```

<<<<<<< HEAD
Ocupa mucho espacio y no hace falta para ejecutar el sistema si ya está el CSS generado.

=======
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
---

## 2. package-lock.json

<<<<<<< HEAD
Opcional.

=======
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
```text
package-lock.json
```

Solo sirve para npm.

---

## 3. package.json

<<<<<<< HEAD
Opcional si no se va a editar Tailwind.

=======
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
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

<<<<<<< HEAD
# 🔥 Si querés compartir versión completa lista para usar:

Solo comprimí la carpeta del proyecto y listo.
=======
# 🔥 Lista para usar:
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d

La otra persona debe:

## 1. Copiar carpeta a htdocs

```text
<<<<<<< HEAD
C:\xampp\htdocs\inventario
=======
C:\xampp\htdocs\Proyecto-PS
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
```

## 2. Abrir XAMPP

Iniciar:

✅ Apache

## 3. Entrar al navegador

```text
<<<<<<< HEAD
http://localhost/inventario
=======
http://localhost/Proyecto-PS
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
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

<<<<<<< HEAD
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
=======
# 🖥️ Uso básico del sistema

- Crear inventarios personalizados
- Agregar registros
- Editar registros existentes
- Eliminar registros
- Buscar información
- Filtrar por columnas
- Importar datos desde Excel
- Exportar registros a Excel

---

# 💾 Copia de seguridad

Se recomienda respaldar periódicamente la carpeta:

data/

Ya que allí se almacenan todos los registros e inventarios.

---

# ✅ Sistema instalado correctamente

Si Apache está iniciado y la carpeta se encuentra dentro de htdocs,
el sistema funcionará correctamente ingresando desde:

http://localhost/Proyecto-PS
>>>>>>> ef7d6c1b338ad4cdc01189cb73f61b92ed0b5a8d
