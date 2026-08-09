import "dotenv/config";
import { app } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[ai-interview-agent] backend listening on port ${PORT}`);
});

export default app;
