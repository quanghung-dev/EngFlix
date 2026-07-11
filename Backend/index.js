const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler.js');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');

const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const lessonsRoutes = require('./routes/lessonsRoutes.js');
const transcriptRoutes = require('./routes/transcriptRoutes.js');
const bookmarkRoutes = require('./routes/bookmarkRoutes.js');
const transcriptBookmarksRoutes = require('./routes/transcriptBookmarksRoutes.js');
const transcriptProgressRoutes = require('./routes/transcriptProgressRoutes.js');
const learningHistoryRoutes = require('./routes/learningHistoryRoutes.js');
const dictationStatusRoutes = require('./routes/dictationStatusRoutes.js');
const shadowingStatusRoutes = require('./routes/shadowingStatusRoutes.js');
const vocabularyRoutes = require('./routes/vocabularyRoutes.js');
const vocabularyDecksRoutes = require('./routes/vocabularyDecksRoutes.js');
const pronunciationAttemptsRoutes = require('./routes/pronunciationAttemptsRoutes.js');
const pronunciationProgressRoutes = require('./routes/pronunciationProgressRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const friendshipRoutes = require('./routes/friendshipRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const progressRoutes = require('./routes/progressRoutes.js');

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/lessons', lessonsRoutes);
app.use('/api/v1/transcripts', transcriptRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/transcript-bookmarks', transcriptBookmarksRoutes);
app.use('/api/v1/transcript-progress', transcriptProgressRoutes);
app.use('/api/v1/learning-history', learningHistoryRoutes);
app.use('/api/v1/dictation-status', dictationStatusRoutes);
app.use('/api/v1/shadowing-status', shadowingStatusRoutes);
app.use('/api/v1/vocabulary-categories', vocabularyRoutes);
app.use('/api/v1/vocabulary-decks', vocabularyDecksRoutes);
app.use('/api/v1/pronunciation-attempts', pronunciationAttemptsRoutes);
app.use('/api/v1/pronunciation', pronunciationAttemptsRoutes);
app.use('/api/v1/pronunciation', pronunciationProgressRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/friendships', friendshipRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server EngFlex is running at http://localhost:${PORT}`);
        console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;
