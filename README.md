# Blog API

API REST para gestionar **autores** y **publicaciones (posts)** de un blog. Construida con Node.js, Express y PostgreSQL, con tests de integración en Vitest y Supertest.

## Tecnologías

- [Node.js](https://nodejs.org/) (v20.12 o superior, por el uso de `loadEnvFile`)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) con el driver [`pg`](https://node-postgres.com/)
- [dotenv](https://github.com/motdotla/dotenv)
- [Vitest](https://vitest.dev/) y [Supertest](https://github.com/ladjs/supertest) para los tests

## Estructura del proyecto

```
.
├── src/
│   ├── app.js                  # Configuración de Express (middlewares, rutas, errores)
│   ├── index.js                # Punto de entrada: carga .env y levanta el servidor
│   ├── controllers/
│   │   ├── authorsController.js
│   │   └── postsController.js
│   ├── services/
│   │   ├── authorsService.js
│   │   └── postsService.js
│   ├── routes/
│   │   ├── indexRouter.js
│   │   ├── authorsRouter.js
│   │   └── postsRouter.js
│   ├── middlewares/
│   │   └── errorHandler.js     # Manejo centralizado de errores
│   │── docs/
│   │   └── openapi.yaml        # Documentación OpenAPI de la API
│   ├── utils/
│   │   ├── errors.js           # Helpers: badRequest, notFound, conflict...
│   │   └── validators.js       # Validaciones de campos
│   └── db/
│       ├── config.js           # Pool de conexión a PostgreSQL
│       ├── setup.sql           # Creación de tablas
│       ├── seed.sql            # Datos de ejemplo
│       └── test-connection.js  # Script para probar la conexión
├── tests/
│   ├── authors.test.js
│   ├── posts.test.js
│   └── validators.test.js
│
├──package.json
├──.gitignore
├──readme.md
├──vitest.config.js
├──.env.example
└──.env


```


## Requisitos previos

- Node.js 20.12 o superior
- PostgreSQL (local o alojado)

## Instalación

```bash
npm install
```

Si empezás desde cero, estas son las dependencias principales:

```bash
npm install express pg dotenv
npm install -D vitest supertest
```

## Configuración

Creá un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DATABASE_URL=postgres://USUARIO:PASSWORD@localhost:5432/nombre_db
```

| Variable       | Descripción                                   | Por defecto |
|----------------|-----------------------------------------------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (obligatoria) | —           |
| `PORT`         | Puerto en el que escucha el servidor          | `3000`      |

Si la contraseña tiene caracteres especiales (`@`, `#`, `/`, `:`, `%`), codificalos en la URL (`@` → `%40`, `#` → `%23`).

> **Importante:** no subas el archivo `.env` al repositorio. Verificá que esté en `.gitignore`.

En producción (`NODE_ENV=production`) el archivo `.env` no se carga: las variables deben venir del entorno del servidor.

## Base de datos

### 1. Crear la base de datos

```bash
psql -U postgres -h localhost -c "CREATE DATABASE nombre_db;"
```

### 2. Crear las tablas

```bash
psql -U postgres -h localhost -d nombre_db -f src/db/setup.sql
```

Esto crea dos tablas:

- **`authors`**: `id`, `name`, `email` (único), `bio`, `created_at`
- **`posts`**: `id`, `title`, `content`, `author_id`, `published`, `created_at`

Los posts referencian a un autor con `ON DELETE CASCADE`: al eliminar un autor se eliminan también sus posts.

### 3. Cargar datos de ejemplo (opcional)

```bash
psql -U postgres -h localhost -d nombre_db -f src/db/seed.sql
```

El seed inserta 3 autores y 5 posts. No borra datos previos, por lo que ejecutarlo dos veces falla por emails duplicados.

### 4. Probar la conexión

```bash
node src/db/test-connection.js
```

Imprime la hora del servidor si la conexión funciona.

## Ejecutar el servidor

```bash
node src/index.js
```

El servidor queda disponible en `http://localhost:3000`. Para comprobar que está funcionando:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

## Endpoints

### General

| Método | Ruta      | Descripción                       |
|--------|-----------|-----------------------------------|
| GET    | `/`       | Mensaje de que la API funciona    |
| GET    | `/health` | Estado del servicio               |

### Autores

| Método | Ruta            | Descripción                  | Respuestas              |
|--------|-----------------|------------------------------|-------------------------|
| GET    | `/authors`      | Lista todos los autores      | 200, 500                |
| GET    | `/authors/:id`  | Obtiene un autor por ID      | 200, 400, 404, 500      |
| POST   | `/authors`      | Crea un autor                | 201, 400, 409, 500      |
| PUT    | `/authors/:id`  | Actualiza un autor (parcial) | 200, 400, 404, 409, 500 |
| DELETE | `/authors/:id`  | Elimina un autor             | 204, 400, 404, 500      |

### Posts

| Método | Ruta                       | Descripción                  | Respuestas         |
|--------|----------------------------|------------------------------|--------------------|
| GET    | `/posts`                   | Lista todos los posts        | 200, 500           |
| GET    | `/posts/:id`               | Obtiene un post por ID       | 200, 400, 404, 500 |
| GET    | `/posts/author/:authorId`  | Lista los posts de un autor  | 200, 400, 500      |
| POST   | `/posts`                   | Crea un post                 | 201, 400, 500      |
| PUT    | `/posts/:id`               | Actualiza un post (parcial)  | 200, 400, 404, 500 |
| DELETE | `/posts/:id`               | Elimina un post              | 204, 400, 404, 500 |

`GET /posts` devuelve los posts ordenados por autor y fecha de creación. `GET /posts/author/:authorId` los devuelve ordenados por ID.

### Reglas de validación

**Autores**

| Campo   | Regla                                              |
|---------|----------------------------------------------------|
| `name`  | Obligatorio al crear. Texto de 2 a 100 caracteres  |
| `email` | Obligatorio al crear. Formato válido, máx. 150 caracteres, único |
| `bio`   | Opcional. Texto de hasta 500 caracteres            |

**Posts**

| Campo       | Regla                                             |
|-------------|---------------------------------------------------|
| `title`     | Obligatorio al crear. Texto de 3 a 200 caracteres |
| `content`   | Obligatorio al crear. Texto no vacío              |
| `author_id` | Obligatorio al crear. Entero positivo de un autor existente |
| `published` | Opcional. Booleano (`true` o `false`). Por defecto `false` |

**Reglas generales**

- Los IDs de las rutas deben ser números enteros positivos.
- En `PUT` se pueden enviar solo los campos que se quieren cambiar, pero se requiere al menos uno.
- Los textos se guardan sin espacios al inicio y al final.
- No se puede dejar `bio` vacía (`null`) mediante `PUT`: un valor nulo conserva el valor anterior.

### Formato de errores

Todos los errores responden con JSON:

```json
{
  "error": "El formato del email es inválido",
  "status": 400
}
```

| Código | Significado                                                      |
|--------|------------------------------------------------------------------|
| 400    | Datos o ID inválidos, o autor inexistente al crear/editar un post |
| 404    | Recurso o ruta no encontrados                                    |
| 409    | Email ya registrado                                              |
| 500    | Error interno (el mensaje real solo se registra en el servidor)  |

## Ejemplos de uso

Crear un autor:

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Martin Lopez", "email": "martin@example.com", "bio": "Backend developer"}'
```

Crear un post:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primer post", "content": "Hola mundo", "author_id": 1, "published": true}'
```

Actualizar solo el título de un post:

```bash
curl -X PUT http://localhost:3000/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Título actualizado"}'
```

Eliminar un autor:

```bash
curl -X DELETE http://localhost:3000/authors/1
```

## Tests

Los tests son de integración: usan Supertest contra la app de Express y una base de datos PostgreSQL real.

```bash
npm test
```

Asegurate de tener este script en `package.json`:

```json
"scripts": {
  "test": "vitest run"
}
```

### Advertencia sobre la base de datos

Antes de cada test, los archivos de tests ejecutan `TRUNCATE ... RESTART IDENTITY CASCADE` sobre las tablas y vuelven a insertar datos de prueba. **Eso borra todos los datos de la base a la que apunte `DATABASE_URL`.**

- Usá una base de datos exclusiva para tests (por ejemplo `nombre_db_test`) con las tablas ya creadas con `setup.sql`.
- Nunca apuntes los tests a una base de desarrollo o producción con datos reales.

### Ejecución en serie

Como `authors.test.js` y `posts.test.js` comparten la misma base de datos, deben ejecutarse uno a la vez. Creá un `vitest.config.js` en la raíz:

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
  },
});
```

### Qué se prueba

| Archivo                  | Contenido                                                       |
|--------------------------|-----------------------------------------------------------------|
| `tests/authors.test.js`  | GET, POST, PUT y DELETE de `/authors` con casos válidos e inválidos |
| `tests/posts.test.js`    | GET, POST, PUT y DELETE de `/posts` con casos válidos e inválidos   |
| `tests/validators.test.js` | Funciones de validación de `utils/validators.js`              |

## Documentación de la API

La especificación completa en formato OpenAPI está en [`openapi.yaml`](./openapi.yaml). Podés visualizarla con herramientas como [Swagger Editor](https://editor.swagger.io/) pegando el contenido del archivo.

## Solución de problemas

| Error                                              | Causa probable                                                         |
|----------------------------------------------------|------------------------------------------------------------------------|
| `SASL: client password must be a string`           | `DATABASE_URL` no se cargó o no incluye contraseña                     |
| `password authentication failed for user`          | Usuario o contraseña incorrectos en `DATABASE_URL`                     |
| `ECONNREFUSED`                                     | PostgreSQL no está corriendo o el puerto es incorrecto                 |
| `database "..." does not exist`                    | Falta crear la base de datos                                           |
| `relation "authors" does not exist`                | Falta ejecutar `setup.sql` en esa base de datos                        |
| `Missing script: "test"`                           | Falta el script `test` en `package.json`                               |
| `SSL/TLS required`                                 | El servidor de base de datos exige conexiones cifradas                 |
