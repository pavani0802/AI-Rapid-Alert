import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, MapPin, Phone, User, Calendar, Send, Loader2 } from 'lucide-react';
import { generateAlertMessage } from '../lib/gemini';
import { db } from '../lib/db';

import MapPicker from '../components/MapPicker';

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.string().min(1, "Age is required"),
  gender: z.enum(["male", "female", "other"]),
  description: z.string().min(10, "Please provide a detailed description"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
});

export default function ReportMissing() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // 1. Generate AI Alert Message
      const alertMessage = await generateAlertMessage(data.description);
      
      // 2. Save to Local API
      const personData = { 
        ...data, 
        photo, 
        location, 
        alertMessage,
        reporterUid: 'guest-user' 
      };
      await db.reportMissing(personData);
      
      // 3. Trigger Radius Alerts
      if (data.contactPhone) {
        await fetch("/api/send-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: data.contactPhone,
            message: `EMERGENCY ALERT: ${data.name} (${data.age}y, ${data.gender}) is missing. Last seen: ${location?.lat}, ${location?.lng}. ${alertMessage}`,
            type: "sms"
          }),
        });
      }
      
      alert("Report submitted successfully! AI has generated an emergency alert and broadcasted it to nearby users.");
    } catch (error) {
      console.error(error);
      alert("Error submitting report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Report Missing Person</h1>
        <p className="text-slate-600">Please provide as much detail as possible to help AI generate accurate alerts.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Photo Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Recent Photo</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
              {photo ? (
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-400">PNG, JPG or JPEG (MAX. 800x400px)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Name
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="Full Name"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Age
            </label>
            <input
              {...register("age")}
              type="number"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="Age"
            />
            {errors.age && <p className="text-red-500 text-xs">{errors.age.message as string}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Gender</label>
          <div className="flex gap-4">
            {["male", "female", "other"].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register("gender")} value={g} className="text-red-600 focus:ring-red-500" />
                <span className="capitalize text-slate-600">{g}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Last Seen Location
          </label>
          <MapPicker onLocationSelect={setLocation} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            placeholder="What were they wearing? Any distinguishing marks?"
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact Phone Number
          </label>
          <input
            {...register("contactPhone")}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            placeholder="+1234567890"
          />
          {errors.contactPhone && <p className="text-red-500 text-xs">{errors.contactPhone.message as string}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>{isSubmitting ? "Processing Alert..." : "Broadcast Emergency Alert"}</span>
        </button>
      </form>
    </div>
  );
}
