const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EngFlex API Documentation',
      version: '1.0.0',
      description: 'API documentation for the EngFlex video-based English learning project',
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
          description: 'Paste only the Firebase idToken. Swagger will add the Bearer prefix automatically.',
        },
      },
      schemas: {
        Lesson: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            category_id: {
              type: 'integer',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            video_url: {
              type: 'string',
            },
            thumbnail_url: {
              type: 'string',
              nullable: true,
            },
            level: {
              type: 'string',
              nullable: true,
            },
            duration: {
              type: 'integer',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
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
        Bookmark: {
          type: 'object',
          required: ['user_id', 'lesson_id', 'created_at'],
          properties: {
            user_id: {
              type: 'string',
            },
            lesson_id: {
              type: 'integer',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        BookmarkWithLesson: {
          allOf: [
            {
              $ref: '#/components/schemas/Bookmark',
            },
            {
              type: 'object',
              properties: {
                category_id: {
                  type: 'integer',
                  nullable: true,
                },
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                  nullable: true,
                },
                video_url: {
                  type: 'string',
                },
                thumbnail_url: {
                  type: 'string',
                  nullable: true,
                },
                level: {
                  type: 'string',
                  nullable: true,
                },
                duration: {
                  type: 'integer',
                  nullable: true,
                },
              },
            },
          ],
        },
        BookmarkGroupedByLesson: {
          type: 'object',
          properties: {
            lesson_id: {
              type: 'integer',
            },
            lesson_title: {
              type: 'string',
            },
            transcripts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  transcript_id: {
                    type: 'integer',
                  },
                  content: {
                    type: 'string',
                  },
                  phonetic: {
                    type: 'string',
                    nullable: true,
                  },
                  vietnamese: {
                    type: 'string',
                    nullable: true,
                  },
                  note: {
                    type: 'string',
                    nullable: true,
                  },
                  created_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                },
              },
            },
          },
        },
        BookmarkMutationResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                lesson_id: {
                  type: 'integer',
                },
                transcript_id: {
                  type: 'integer',
                },
                note: {
                  type: 'string',
                  nullable: true,
                },
                created_at: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        LearningHistory: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            user_id: {
              type: 'string',
            },
            lesson_id: {
              type: 'integer',
            },
            completed_dictation: {
              type: 'boolean',
            },
            completed_pronunciation: {
              type: 'boolean',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        VocabularyItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            deck_id: {
              type: 'integer',
            },
            lesson_id: {
              type: 'integer',
              nullable: true,
            },
            transcript_id: {
              type: 'integer',
              nullable: true,
            },
            phrase: {
              type: 'string',
            },
            normalized_phrase: {
              type: 'string',
            },
            meaning: {
              type: 'string',
            },
            example_sentence: {
              type: 'string',
              nullable: true,
            },
            note: {
              type: 'string',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  // Paths to route files that contain Swagger comments.
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
