const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Parroto đang chạy tại cổng http://localhost:${PORT}`);
});
