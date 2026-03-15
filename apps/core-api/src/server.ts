import { app } from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.listen(PORT, () => {
  console.log(`[core-api] Server running on port ${PORT}`);
});
