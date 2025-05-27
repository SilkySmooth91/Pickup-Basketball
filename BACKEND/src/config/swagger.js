import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pickup Basketball API",
      version: "1.0.0",
      description: "API documentation for Pickup Basketball backend"
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local server"
      }
    ]
  },
  apis: [
    "./src/routes/**/*.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;