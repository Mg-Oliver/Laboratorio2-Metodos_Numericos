# Métodos de Ecuaciones Lineales Simultáneas - Laboratorio N°2
**Universidad Tecnológica de Panamá (UTP) - Centro Regional de Azuero**  
**Facultad de Ingeniería de Sistemas Computacionales**  
*Materia:* Métodos Numéricos para Ingenieros (Prof. Mariluz Centella)  
*Estudiantes:* Miguel Oliver (8-1050-1381) • Juan Rodríguez (6-728-1695)

---

## 🌐 Despliegue en Vercel
Este repositorio está optimizado para **Vercel** como aplicación web estática directa. Al acceder a la raíz del sitio se sirve inmediatamente la **presentación web interactiva** con todos sus estilos, gráficos SVG y simulador Vue 3.

---

## 📁 Estructura del Repositorio

El proyecto contiene únicamente los archivos que influyen directamente en la ejecución y presentación:

```
├── algoritmos/                      # Algoritmos numéricos generales (N x N) en JavaScript
│   ├── gauss.js                     # Eliminación Gaussiana con sustitución hacia atrás
│   ├── gauss-jordan.js              # Reducción de Gauss-Jordan a Matriz Identidad [I | x]
│   ├── gauss-seidel.js              # Gauss-Seidel iterativo con criterio Ea <= 5%
│   └── index.js                     # Ejecutable principal en consola con tablas formateadas
│
├── assets/apuntes/                  # Capturas de apuntes de clase manuscritos
├── index.html                       # Interfaz interactiva de la presentación
├── styles.css                       # Sistema de diseño sobrio (Paleta Obsidian & Índigo)
├── app.js                           # Lógica reactiva en Vue 3 y simulador en vivo
├── vercel.json                      # Configuración de URLs y redirecciones limpias
├── package.json                     # Metadatos del proyecto y scripts
├── .gitignore                       # Filtro de exclusión de archivos locales no esenciales
└── README.md                        # Documentación general
```

---

## 🚀 Ejecución Local

### 1. Ejecutar Algoritmos en Consola (Node.js)
```bash
npm start
```
O directamente:
```bash
node algoritmos/index.js
```

### 2. Abrir la Presentación Web
Abre directamente en tu navegador el archivo `index.html`.
