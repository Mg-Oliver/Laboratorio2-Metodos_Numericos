# Métodos de Ecuaciones Lineales Simultáneas - Laboratorio N°2
**Universidad Tecnológica de Panamá (UTP) - Centro Regional de Azuero**  
**Facultad de Ingeniería de Sistemas Computacionales**  
*Materia:* Métodos Numéricos para Ingenieros (Prof. Mariluz Centella)  
*Estudiantes:* Miguel Oliver (8-1050-1381) • Juan Rodríguez (6-728-1695)

---

## 🌐 Despliegue en Vercel
Este repositorio está preconfigurado para **Vercel** mediante `vercel.json`. Al acceder a la raíz del sitio se sirve de forma directa y fluida la **presentación web interactiva**.

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
├── presentacion/                    # Presentación web interactiva en scroll continuo
│   ├── index.html                   # Interfaz, apuntes paso a paso y gráficas SVG
│   ├── styles.css                   # Sistema de diseño sobrio (Paleta Obsidian & Índigo)
│   ├── app.js                       # Lógica reactiva en Vue 3 y simulador en tiempo real
│   └── assets/                      # Capturas de apuntes de clase manuscritos
│
├── index.html                       # Redirección automática inmediata a la presentación
├── vercel.json                      # Enrutamiento y redirección en Vercel
├── package.json                     # Metadatos del proyecto y scripts de ejecución
├── .gitignore                       # Filtro de exclusión de archivos no esenciales
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
Abre directamente en tu navegador el archivo `presentacion/index.html` o corre cualquier servidor local estático.
