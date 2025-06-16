// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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