import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import adminRoutes from "./admin/admin.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

// The frontend (Next.js, default port 3000) is a different origin from
// this service, so cookie-based auth needs explicit CORS: a literal
// origin (not "*") plus credentials, or the browser won't send/accept
// the accessToken cookie at all.
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.get("/" , (req , res)=>{
    console.log("runnig /")
    res.json({
        msg:"running",
        success: true
    })
})
app.use("/admin", adminRoutes)
app.use("/auth", authRoutes)
app.listen(5000, () => {
  console.log("Server running on 5000");
});
export default app;