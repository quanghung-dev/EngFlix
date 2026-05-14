const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const lessonsRoutes = require('./routes/lessonsRoutes.js');
const { errorHandler } = require('./middlewares/errorHandler.js');
app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/lessons', lessonsRoutes);

app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Parroto đang chạy tại cổng http://localhost:${PORT}`);
});
