# Mesero360 - Sistema de Gestión de Restaurante

Una solución móvil y de backend que gestiona la toma de pedidos, la comunicación con la cocina y la facturación en un restaurante mediante unas comandas digitales.

## Contexto Académico

Este proyecto integra conocimientos de dos asignaturas:
* **Desarrollo de Apps Móviles:** Implementación del frontend con Flutter.
* **Cloud Computing:** Diseño y despliegue del backend en la nube (AWS EC2).

---

## 🚀 Arquitectura del Repositorio

Este es un **monorepo** que contiene dos proyectos principales. Encontrarás instrucciones detalladas (dependencias, instalación y ejecución) dentro del `README.md` de cada subcarpeta:

* [**`/backend/`**](./backend/README.md): Contiene la API REST desarrollada en Node.js, responsable de toda la lógica de negocio.
* [**`/flutter_app/`**](./flutter_app/README.md): Contiene la aplicación móvil desarrollada en Flutter, consumidora de la API.
* [**`/deployment/`**](./deployment/): Contiene scripts y archivos de configuración para el despliegue en EC2.

---

## ✨ Características Principales

* **Gestión de Roles:** Perfiles definidos para Cajeros, Meseros y Cocineros, cada uno con permisos y vistas específicas.
* **Toma de Pedidos Digital:** Los meseros pueden tomar pedidos desde la app móvil, enviándolos directamente a la cocina.
* **Comandas Digitales:** La cocina recibe las comandas en tiempo real para su preparación.
* **Gestión de Estado:** Seguimiento del ciclo de vida del pedido (Pendiente, En Cocina, Listo, Servido, Pagado).
* **Facturación:** Generación de facturas en PDF para los clientes desde el perfil de Cajero.

---

## 🛠️ Stack Tecnológico

| Área | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend Móvil** | ![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white) | Desarrollo de la aplicación nativa para iOS y Android. |
| **Backend API** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | Entorno de ejecución para la API REST (usando Express.js). |
| **Base de Datos** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) | Base de datos relacional para almacenar usuarios, pedidos y productos. |
| **Despliegue (Cloud)** | ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white) | Servidor virtual en la nube para alojar y ejecutar el backend. |

---

## 🏁 Primeros Pasos (Getting Started)

Para correr este proyecto completo localmente, necesitarás tener instalado el siguiente software:

* [Flutter SDK](https://flutter.dev/docs/get-started/install) (Versión 3.x.x o superior)
* [Node.js](https://nodejs.org/en/) (Versión 18.x o superior)
* Un gestor de base de datos (Ej: PostgreSQL)
* *(Otros pre-requisitos por definir)*

### Instrucciones Generales

1.  Clona el repositorio:
    ```bash
    git clone [URL_DE_TU_REPO]
    cd Mesero360
    ```

2.  **Para correr el Backend:**
    * Navega a la carpeta `backend/`.
    * Sigue las instrucciones del `README.md` interno.

3.  **Para correr la App Móvil:**
    * Navega a la carpeta `flutter_app/`.
    * Sigue las instrucciones del `README.md` interno.

---

## 👨‍💻 Autores

Este proyecto fue desarrollado por:

* Carlos Javier Ramos
* Edward Leandro Sanchez
* Samuel David Gómez

**Institución:**
* UNIMINUTO