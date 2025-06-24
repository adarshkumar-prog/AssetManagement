const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Asset Management API',
      version: '1.0.0',
      description: 'API for users, profiles, assets, assignments, and reports'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        User: {
          type: 'object',
  required: ['firstName', 'lastName', 'email', 'password'], 
  properties: {
    firstName: { type: 'string', example: 'John' },
    lastName: { type: 'string', example: 'Doee' },
    email: { type: 'string', example: 'john@example.com' },
    password: { type: 'string', example: 'Secret@123' },  
    role: { type: 'string', example: 'employee' },
    department: { type: 'string', example: 'Engineering' }         
  }
        },
        Asset: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: {
              type: 'string',
              enum: ['Laptop','Desktop','Monitor','Phone','Tablet','Furniture','Other']
            },
            serialNumber: { type: 'string' },
            status: {
              type: 'string',
              enum: ['Available','Assigned','Maintenance','Retired']
            },
            assignedTo: { type: 'string', nullable: true }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJSDoc(options);
