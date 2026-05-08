# Proyecto - PS

# Manual de Instalación y Uso del Sistema de Inventario

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
C:\xampp\htdocs\Proyecto-PS
```

---

# 🚀 Instalación rápida en otra PC

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

# # 🗑️ Archivos/carpetas opcionales

## 1. node_modules/

Contiene dependencias de Tailwind / Vite.

```text
node_modules/
```

---

## 2. package-lock.json

```text
package-lock.json
```

Solo sirve para npm.

---

## 3. package.json

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

# 🔥 Lista para usar:

La otra persona debe:

## 1. Copiar carpeta a htdocs

```text
C:\xampp\htdocs\Proyecto-PS
```

## 2. Abrir XAMPP

Iniciar:

✅ Apache

## 3. Entrar al navegador

```text
http://localhost/Proyecto-PS
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
