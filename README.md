# Proyecto-PS

Sistema web de inventario desarrollado en **PHP + JavaScript + TailwindCSS** para la gestión interna de activos tecnológicos, registros e importación de datos desde Excel.

---

## 📘 Manual de Instalación y Uso del Sistema de Inventario

## 📌 Requisitos Previos

Antes de utilizar el sistema en otra PC, se requiere:

- XAMPP instalado
- Apache habilitado
- PHP operativo desde XAMPP
- Navegador web (Chrome recomendado)
- Composer (opcional, solo si se necesita reinstalar dependencias)

El proyecto debe estar ubicado dentro de:

```text
C:\xampp\htdocs\Proyecto-PS
```

---

## 🚀 Instalación Rápida

### 📂 Archivos necesarios

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

## 📦 Archivos opcionales

```text
node_modules/
package.json
package-lock.json
```

Estos archivos solo son necesarios para desarrollo frontend o recompilar estilos.

---

## ⚠️ Carpeta `vendor`

La carpeta `vendor/` contiene dependencias PHP necesarias para el funcionamiento del sistema.

Incluye librerías como:

- PhpSpreadsheet
- Dependencias auxiliares de Composer

### Funciones afectadas si falta:

- Importación de archivos Excel
- Exportación de datos a Excel

---

## ▶️ Puesta en Marcha

### 1. Abrir XAMPP

Iniciar los servicios:

- Apache

### 2. Verificar ubicación del proyecto

```text
C:\xampp\htdocs\Proyecto-PS
```

### 3. Abrir en navegador

```text
http://localhost/Proyecto-PS
```

---

## 📊 Base de Datos

El sistema utiliza almacenamiento mediante archivos JSON ubicados en:

```text
data/
```

### Ventajas:

- No requiere MySQL
- Instalación rápida
- Portabilidad sencilla
- Fácil respaldo

---

## 🖥️ Funcionalidades Principales

- Crear inventarios dinámicos
- Registrar equipos y activos
- Editar registros existentes
- Eliminar registros
- Buscar información rápidamente
- Filtrar por columnas
- Importar datos desde Excel
- Exportar registros a Excel
- Formularios automáticos según inventario
- Detección de tipos de campos

---

## 🧩 Tecnologías Utilizadas

- PHP
- JavaScript (Vanilla JS)
- TailwindCSS
- HTML5
- JSON
- PhpSpreadsheet
- XAMPP / Apache

---

## 📁 Estructura del Proyecto

```text
Proyecto-PS/
│── api/
│── css/
│── JS/
│── data/
│── vendor/
│── index.html
│── formulario.html
│── composer.json
│── composer.lock
```

---

## 🔧 Recuperar Dependencias

Si la carpeta `vendor/` fue eliminada, ejecutar:

```bash
composer install
```

(Requiere Composer instalado)

---

## 💾 Copias de Seguridad

Se recomienda respaldar periódicamente la carpeta:

```text
data/
```

Ya que contiene:

- Inventarios creados
- Registros cargados
- Configuración operativa

---

## 🔒 Recomendaciones de Uso

- No modificar archivos JSON manualmente si el sistema está en uso.
- Realizar backup antes de importar grandes volúmenes de Excel.
- Mantener una copia del proyecto completa.
- Verificar permisos de escritura en carpeta `data/`.

---

## ✅ Acceso Final

```text
http://localhost/Proyecto-PS
```

---

## 👨‍💻 Autor

Desarrollado por **Matías Moran**

---

## 📌 Estado del Proyecto

✅ Operativo
✅ Escalable
✅ Listo para uso interno empresarial
