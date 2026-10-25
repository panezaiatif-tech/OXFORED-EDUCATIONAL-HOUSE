import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  Building2,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo';

export const ContactUsPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Admission Inquiry for Academic Session 2026',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Campus Visit & Official Inquiries</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — CONTACT US
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Get in touch with our admissions office, principal desk, or finance department. We welcome parents and students to visit our campus in Quetta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Official Institutional Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* MANDATORY EXACT ADDRESS BOX */}
          <div className="bg-gradient-to-br from-emerald-950 to-green-950 text-white p-6 rounded-3xl border-2 border-yellow-400 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size="sm" showText={false} variant="light" />
              <div>
                <h3 className="font-serif font-black text-lg text-white">
                  OXFORED EDUCATIONAL HOUSE
                </h3>
                <p className="text-xs text-yellow-300 font-bold">Quetta Campus • Estd 2026</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-900/80 border border-yellow-400/60 space-y-2">
              <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider block">
                Official Campus Location:
              </span>
              <p className="text-xs font-bold text-white tracking-wide leading-relaxed">
                Location: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
              </p>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:03327185311" className="text-yellow-300 font-black text-sm hover:underline tracking-wider">
                    03327185311
                  </a>
                  <span className="text-[10px] text-emerald-300">Official Mobile, WhatsApp & EasyPaisa Account</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>info@oxfored.edu.pk</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Monday – Saturday: 08:00 AM – 02:00 PM (PKT)</span>
              </div>
            </div>
          </div>

          {/* Developer Credit Box */}
          <div className="p-5 rounded-2xl bg-yellow-50 border-2 border-yellow-300 text-xs space-y-2">
            <span className="font-bold text-yellow-900 block flex items-center gap-1.5 uppercase text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
              Developer & System Architect
            </span>
            <p className="font-bold text-emerald-950 text-sm">
              MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN
            </p>
            <p className="text-[11px] text-slate-600">
              For system inquiries, custom educational ERP implementations, or technical support, please contact the developer office.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border-2 border-emerald-100 shadow-md space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold font-serif text-emerald-950">
              Send an Official Inquiry
            </h3>
            <p className="text-xs text-slate-500">
              Our admission staff will reply within 24 hours during working days.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Message Delivered Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Thank you for contacting Oxfored Educational House Quetta. Our admissions coordinator will reach out to you at {form.phone}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-4 py-2 bg-emerald-800 text-yellow-300 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name:</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Tariq Khan"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number:</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +92 333 1234567"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address:</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. parent@gmail.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Message / Query:</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Ask about class admission availability, fee payment arrangements, or school transport..."
                  className="w-full border border-slate-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-yellow-300"
              >
                <Send className="w-4 h-4 text-emerald-950" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Google Map Location: Brewery Road near SBK University Quetta */}
      <div className="bg-white rounded-3xl border-2 border-emerald-900/20 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 p-6 text-white border-b-2 border-yellow-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-yellow-400 text-emerald-950 font-black">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-serif font-black text-white">
                  Official Campus Google Map Location
                </h3>
                <p className="text-xs text-yellow-300 font-semibold">
                  Brewery Road Quetta near SBK Women's University (Opposite Micro Coloni)
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-200 pl-11">
              Easily accessible via Brewery Road, Sardar Bahadur Khan Women's University entrance, and Western Bypass.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sardar+Bahadur+Khan+Women's+University+Brewery+Road+Quetta"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-950" />
              <span>Get Live Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-950" />
            </a>
            <a
              href="tel:03327185311"
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-yellow-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-yellow-400/50 transition-all"
            >
              <Phone className="w-4 h-4 text-yellow-400" />
              <span>03327185311</span>
            </a>
          </div>
        </div>

        {/* Map Embed and Landmark Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Interactive Google Map Iframe */}
          <div className="lg:col-span-8 h-[400px] w-full bg-slate-100 relative">
            <iframe
              src="https://maps.google.com/maps?q=Sardar+Bahadur+Khan+Women's+University+Brewery+Road+Quetta&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OXFORED EDUCATIONAL HOUSE Location - Brewery Road near SBK University Quetta"
              className="w-full h-full"
            />
            <div className="absolute bottom-3 left-3 bg-emerald-950/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-[11px] font-bold border border-yellow-400 shadow-lg flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              <span>Brewery Road Campus • Quetta, Balochistan</span>
            </div>
          </div>

          {/* Landmarks & Transit Guide */}
          <div className="lg:col-span-4 p-6 bg-gradient-to-b from-emerald-50/60 to-white space-y-4 border-t lg:border-t-0 lg:border-l border-emerald-100 text-xs">
            <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-xs flex items-center gap-1.5 pb-2 border-b border-emerald-200">
              <Building2 className="w-4 h-4 text-emerald-800" />
              Prominent Nearby Landmarks
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-950 block">1. SBK Women's University</span>
                <p className="text-[11px] text-slate-600">
                  Major university campus located directly along Brewery Road, approximately 200 meters from our main gate.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-950 block">2. Micro Coloni</span>
                <p className="text-[11px] text-slate-600">
                  Directly opposite Micro Coloni residential area with ample designated school parking and safe drop-off zone.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-950 block">3. Public Transport & Vans</span>
                <p className="text-[11px] text-slate-600">
                  Brewery Road local buses, Rickshaws, and private school contract vans connect directly from Quetta City Center, Bolan Medical Complex, and Zarghoon Road.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-300 text-[11px] text-yellow-950 space-y-1">
              <span className="font-bold block flex items-center gap-1 text-emerald-950">
                <Clock className="w-3.5 h-3.5 text-yellow-600" />
                Campus Visiting Hours
              </span>
              <p>Monday to Saturday: 8:00 AM to 2:00 PM</p>
              <p className="font-bold text-emerald-900">Official Mobile: 03327185311</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
