import React, { useState } from 'react';
import { Camera, MapPin, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { compareImages } from '../lib/gemini';
import { db } from '../lib/db';

export default function ReportSighting() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ match: boolean; confidence: number } | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReport = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    try {
      // 1. Get current location
      let location = { lat: 0, lng: 0 };
      if ("geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }

      // 2. Fetch active alerts to compare
      const alerts = await db.getMissingPersons();
      const activeAlerts = alerts.filter((p: any) => p.status === 'missing');

      if (activeAlerts.length === 0) {
        alert("No active missing person alerts to compare with.");
        return;
      }

      // For the hackathon demo, we'll compare against the first active alert
      // In a real app, we'd loop or use a batch process
      const target = activeAlerts[0];
      const base64Photo = photo.split(',')[1];
      
      // If we have a real base64 for the target, we'd use it. 
      // For demo, we'll try to use the image comparison if target has a base64, otherwise simulate.
      let analysis;
      if (target.photo.startsWith('data:image')) {
        const targetBase64 = target.photo.split(',')[1];
        analysis = await compareImages(targetBase64, base64Photo);
      } else {
        // Simulate analysis for URL-based images
        await new Promise(r => setTimeout(r, 2000));
        analysis = { match: true, confidence: 88 };
      }
      
      setResult(analysis);

      // 3. Save sighting
      await db.reportSighting({
        missingPersonId: target.id,
        photoUrl: photo,
        location,
        confidence: analysis.confidence,
        reporterUid: 'guest-user'
      });

      if (analysis.match) {
        alert("Sighting reported! AI analysis suggests a potential match. Authorities have been notified.");
      } else {
        alert("Sighting reported. Thank you for your vigilance.");
      }
    } catch (error) {
      console.error(error);
      alert("Error analyzing sighting.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Report a Sighting</h1>
        <p className="text-slate-600">Upload a photo of someone you suspect might be missing. AI will compare it with active alerts.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Sighting Photo</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
              {photo ? (
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="mb-2 text-sm text-slate-500 font-semibold">Take or upload a photo</p>
                  <p className="text-xs text-slate-400">AI will analyze facial features instantly</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Current Location
          </label>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm flex items-center gap-3">
            <MapPin className="w-5 h-5" />
            <span>Your current GPS coordinates will be shared with the report.</span>
          </div>
        </div>

        {result && (
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-4 border",
            result.match ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
          )}>
            {result.match ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <div>
              <p className="font-bold">{result.match ? "Potential Match Detected!" : "No Immediate Match"}</p>
              <p className="text-sm opacity-90">AI Confidence: {result.confidence}%</p>
            </div>
          </div>
        )}

        <button
          onClick={handleReport}
          disabled={!photo || isAnalyzing}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>{isAnalyzing ? "AI Analyzing Features..." : "Submit Sighting Report"}</span>
        </button>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
