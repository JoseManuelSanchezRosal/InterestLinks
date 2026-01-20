# 🚀 ClassHub_ (v2.3)

> **Plataforma colaborativa para compartir recursos educativos en tiempo real.**

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Descripción

**ClassHub** es una aplicación web tipo SPA (Single Page Application) diseñada para centralizar y democratizar el acceso a recursos de programación. Permite a estudiantes y profesores compartir enlaces de interés, organizarlos por categorías y visualizarlos en una interfaz moderna y personalizable.

La aplicación utiliza una arquitectura **Serverless** conectándose directamente a **Supabase** desde el cliente, permitiendo actualizaciones en tiempo real sin necesidad de configurar un backend complejo.

---

## 🛠️ Stack Tecnológico

El proyecto ha sido construido utilizando estándares modernos de desarrollo web, priorizando el rendimiento y la simplicidad (Vanilla JS).

* **Frontend:**
    * ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) **HTML5 Semántico**
    * ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) **CSS3 Moderno** (Variables CSS, Flexbox, Diseño Responsive)
    * ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) **JavaScript (ES6+)**
* **Backend & Base de Datos:**
    * ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) **Supabase** (PostgreSQL as a Service)
* **Despliegue:**
    * ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white) **Netlify**

---

## ✨ Funcionalidades Clave

1.  **Publicación en Tiempo Real:** Añade títulos, enlaces y categorías que se sincronizan instantáneamente.
2.  **Sistema de Filtrado:** Navegación por pestañas (Tabs) para filtrar recursos por temas:
    * Frontend, Backend, Herramientas, Empleo, Recursos, Otros.
3.  **Temas Visuales (Dark/Light/Afternoon):**
    * 🌙 **Modo Hacker:** Oscuro y contrastado.
    * ☀️ **Modo Día:** Claro y limpio.
    * 🌅 **Modo Tarde:** Tonos sepia/cálidos para lectura relajada.
4.  **Gestión de Contenido:**
    * Posibilidad de **eliminar recursos**.
    * 🔐 **Seguridad básica:** Protegido mediante contraseña de administrador (Demo: `admin123`).
5.  **Diseño Responsive:** Adaptado a móviles, tablets y escritorio.

---

## 📂 Estructura del Proyecto

```text
/
├── index.html      # Estructura principal y maquetación
├── style.css       # Estilos, variables de temas y diseño responsive
├── script.js       # Lógica de negocio, conexión a Supabase y DOM
├── logo.svg        # Logotipo vectorial optimizado
└── README.md       # Documentación del proyecto
