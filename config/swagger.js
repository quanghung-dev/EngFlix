const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EngFlix API Documentation',
      version: '1.0.0',
      description: 'Tài liệu hướng dẫn sử dụng API cho dự án học tiếng Anh qua video - EngFlix',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Transcript: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            content: {
              type: 'string',
            },
            end_timestamp: {
              type: 'number',
            },
            lesson_id: {
              type: 'integer',
            },
            phonetic: {
              type: 'string',
            },
            sequence: {
              type: 'integer',
            },
            start_timestamp: {
              type: 'number',
            },
            vietnamese: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  // Đường dẫn đến các file chứa chú thích Swagger (docs)
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
