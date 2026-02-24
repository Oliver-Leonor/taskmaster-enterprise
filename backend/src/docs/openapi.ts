export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "TaskMaster Enterprise API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:4000" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "array", items: { type: "object" } },
            },
            required: ["code", "message"],
          },
        },
      },
      AuthRequest: {
        type: "object",
        properties: { email: { type: "string" }, password: { type: "string" } },
        required: ["email", "password"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              role: { type: "string" },
            },
          },
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      RefreshRequest: {
        type: "object",
        properties: { refreshToken: { type: "string" } },
        required: ["refreshToken"],
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          ownerId: { type: "string" },
          title: { type: "string" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          deletedAt: { type: ["string", "null"], format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/v1/health": {
      get: {
        security: [],
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/auth/register": {
      post: {
        security: [],
        summary: "Register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Conflict",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        security: [],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Auth error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        security: [],
        summary: "Refresh tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "401": {
            description: "Auth error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        summary: "Get current user",
        responses: {
          "200": { description: "OK" },
          "401": {
            description: "Auth error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        summary: "List tasks",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["todo", "in_progress", "done"] },
          },
          { name: "q", in: "query", schema: { type: "string" } },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "updatedAt", "title"],
            },
          },
          {
            name: "sortDir",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
          {
            name: "deleted",
            in: "query",
            schema: { type: "string", enum: ["exclude", "include", "only"] },
          },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create task",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { "201": { description: "Created" } },
      },
    },
  },
} as const;
