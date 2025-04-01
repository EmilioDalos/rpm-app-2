import app from './index';
import categoriesRouter from './routes/categories/route';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});

app.use(categoriesRouter);