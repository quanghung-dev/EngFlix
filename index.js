const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const lessonsRoutes = require('./routes/lessonsRoutes.js');
const transcriptRoutes = require('./routes/transcriptRoutes.js');
const { errorHandler } = require('./middlewares/errorHandler.js');
app.use(cors()); 
app.use(express.json()); 

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/lessons', lessonsRoutes);
app.use('/api/v1/transcripts', transcriptRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Parroto đang chạy tại cổng http://localhost:${PORT}`);
});
