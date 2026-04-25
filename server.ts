import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local Store (Mock Database for Hackathon)
let missingPersons: any[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 8,
    gender: 'female',
    photo: 'https://picsum.photos/seed/child1/400/400',
    lastSeen: 'Central Park, NY',
    location: { lat: 40.785091, lng: -73.968285 },
    description: 'Wearing a red hoodie and blue jeans. Last seen near the playground.',
    status: 'missing',
    createdAt: new Date().toISOString(),
    contactPhone: '+1234567890'
  },
  {
    id: '2',
    name: 'Emily Davis',
    age: 24,
    gender: 'female',
    photo: 'https://picsum.photos/seed/woman1/400/400',
    lastSeen: 'Broadway St, NY',
    location: { lat: 40.758896, lng: -73.985130 },
    description: 'Floral dress, carrying a black handbag. Distinguishing mark: tattoo on left wrist.',
    status: 'missing',
    createdAt: new Date().toISOString(),
    contactPhone: '+0987654321'
  }
];

let sightings: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Twilio Client
  const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/missing-persons", (req, res) => {
    res.json(missingPersons);
  });

  app.post("/api/missing-persons", (req, res) => {
    const person = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'missing'
    };
    missingPersons.unshift(person);
    res.json(person);
  });

  app.post("/api/mark-found", (req, res) => {
    const { personId } = req.body;
    const person = missingPersons.find(p => p.id === personId);
    if (person) {
      person.status = 'found';
      res.json({ success: true, person });
    } else {
      res.status(404).json({ error: "Person not found" });
    }
  });

  app.post("/api/mark-found-broadcast", async (req, res) => {
    const { personId, name } = req.body;
    
    if (!twilioClient) {
      console.warn("Twilio not configured, skipping SMS broadcast.");
      return res.json({ success: true, message: "Broadcast simulated" });
    }

    try {
      console.log(`Broadcasting: ${name} (ID: ${personId}) has been found safely.`);
      
      if (process.env.TEST_PHONE_NUMBER) {
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER || "",
          to: process.env.TEST_PHONE_NUMBER || "",
          body: `GOOD NEWS: ${name} has been found safely! Thank you for your vigilance.`,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Broadcast error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sightings", (req, res) => {
    res.json(sightings);
  });

  app.post("/api/sightings", (req, res) => {
    const sighting = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      reportedAt: new Date().toISOString(),
    };
    sightings.unshift(sighting);
    res.json(sighting);
  });

  app.post("/api/send-alert", async (req, res) => {
    const { phone, message, type } = req.body;

    if (!twilioClient) {
      return res.status(500).json({ error: "Twilio not configured" });
    }

    try {
      if (type === "whatsapp") {
        await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${phone}`,
          body: message,
        });
      } else {
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER || "",
          to: phone,
          body: message,
        });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Twilio error:", error);
      res.status(500).json({ error: error.message });
    }
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
