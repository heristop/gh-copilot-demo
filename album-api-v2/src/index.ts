import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🎵 Album API v2 is running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📚 API endpoints available at http://localhost:${PORT}/albums`);
});
