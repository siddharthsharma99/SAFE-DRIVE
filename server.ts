import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Twilio client
let twilioClient: any = null;
function getTwilio() {
  if (!twilioClient) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    
    // Validate that SID starts with 'AC' as required by Twilio SDK
    if (sid && token && sid.startsWith('AC')) {
      try {
        twilioClient = twilio(sid, token);
      } catch (error) {
        console.error("Failed to initialize Twilio client:", error);
        twilioClient = null;
      }
    } else if (sid && !sid.startsWith('AC')) {
      console.warn("Invalid TWILIO_ACCOUNT_SID format. Must start with 'AC'.");
    }
  }
  return twilioClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Accident Detection Heuristic (Mocking model.pkl behavior)
  function predictBehavior(speed: number, acceleration: number[], impact: number[]): { severity: string; confidence: number } {
    const maxAccel = Math.max(...acceleration.map(Math.abs));
    const maxImpact = Math.max(...impact.map(Math.abs));
    
    let severity = "Low";
    let baseConfidence = 0.85;

    if (maxImpact > 15 || maxAccel > 10 || speed > 100) {
      severity = "Critical";
      // Higher impact/speed = higher confidence of it being critical
      baseConfidence = Math.min(0.99, 0.9 + (maxImpact / 100));
    } else if (maxImpact > 5 || maxAccel > 4 || speed > 60) {
      severity = "Moderate";
      baseConfidence = Math.min(0.89, 0.8 + (maxAccel / 20));
    } else {
      severity = "Low";
      // If speed is very low and impact is tiny, confidence in "Low" is high
      baseConfidence = Math.max(0.7, 1 - (maxImpact / 10) - (speed / 200));
    }

    return { severity, confidence: parseFloat(baseConfidence.toFixed(4)) };
  }

  // Global API Logger
  app.use("/api", (req, res, next) => {
    console.log(`[API CALL] ${req.method} ${req.url}`);
    next();
  });

  // Accident Detection (Direct Registration)
  app.post("/api/accidents/detect", async (req, res) => {
    try {
      const { speed, acceleration, impact, location, phoneNumber } = req.body;
      
      if (speed === undefined || !acceleration || !impact) {
        return res.status(400).json({ error: "Telemetric data incomplete" });
      }

      const { severity, confidence } = predictBehavior(speed, acceleration, impact);
      
      // Notification Logic
      if (severity === "Critical" || (speed > 80 && phoneNumber)) {
        const client = getTwilio();
        const from = process.env.TWILIO_FROM_NUMBER;
        
        if (client && from && phoneNumber) {
          try {
            // 1. Send SMS as secondary notification
            const message = severity === "Critical" 
              ? `🚨 CRITICAL: Accident detected at ${speed} KM/H.` 
              : `⚠️ OVERSPEED: Vehicle at ${speed} KM/H.`;
            await client.messages.create({ body: message, from, to: phoneNumber });

            // 2. TRIGGER EMERGENCY CALL if Critical
            if (severity === "Critical") {
              await client.calls.create({
                twiml: `<Response>
                          <Say voice="alice" language="en-US">
                            Emergency Alert! A critical accident has been detected involving your contact. 
                            The vehicle was traveling at ${speed} kilometers per hour. 
                            Please check the system dashboard immediately. 
                            I repeat, this is a critical emergency alarm.
                          </Say>
                          <Play loop="2">https://demo.twilio.com/docs/classic.mp3</Play>
                        </Response>`,
                from: from,
                to: phoneNumber
              });
              console.log(`Voice Alarm triggered for ${phoneNumber}`);
            }
          } catch (e) {
            console.error("Twilio Emergency Protocol Failed:", e);
          }
        }
      }

      res.json({ severity, confidence, timestamp: new Date().toISOString(), location });
    } catch (err: any) {
      console.error("Detection Error:", err);
      res.status(500).json({ error: "Model Inference Failure", details: err.message });
    }
  });

  // Other API Routes
  app.get("/api/config", (req, res) => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    res.json({
      smsActive: !!(sid && token && sid.startsWith('AC')),
      region: "Asia-Southeast1"
    });
  });

  app.get("/api/dashboard/stats", (req, res) => {
    res.json({ totalAccidents: 12, criticalEvents: 3, alertsSent: 28 });
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Error/404 handling for /api
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "API Route Not Found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
