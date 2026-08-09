import "dotenv/config";
import { app } from "./app.js";

export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = Number(process.env.PORT ?? 3000);

  app.listen(PORT, () => {
    console.log(
      `[ai-interview-agent] backend listening on http://localhost:${PORT}`
    );
  });
}
