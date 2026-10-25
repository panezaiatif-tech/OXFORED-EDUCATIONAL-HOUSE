import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Atom,
  Calculator,
  Languages,
  Binary,
  Compass,
  Cpu,
} from 'lucide-react';
import { api } from '../utils/api';

interface SmartAiAssistantProps {
  studentName: string;
  studentClass: string;
  rollNumber: string;
}

export const SmartAiAssistant: React.FC<SmartAiAssistantProps> = ({
  studentName,
  studentClass,
  rollNumber,
}) => {
  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    { q: string; a: string; subject: string; time: string }[]
  >([
    {
      q: 'Explain Newton’s Second Law of Motion and its mathematical derivation F = ma.',
      a: 'Newton’s Second Law of Motion states that when a net external force acts on an object, it produces an acceleration directly proportional to the magnitude of the force and inversely proportional to the mass of the object.\n\nMathematical Derivation:\n1. Acceleration (a) ∝ Force (F)\n2. Acceleration (a) ∝ 1 / Mass (m)\nCombining both relationships:\na ∝ F / m\n=> F ∝ ma\n=> F = k · m · a\nIn SI units, the constant k = 1 when Force is measured in Newtons (N), mass in kg, and acceleration in m/s².\nTherefore: F = ma\n\nExample at Oxfored Educational House Physics Lab: If a vehicle of 1000 kg accelerates at 2 m/s², the engine force is 2000 N.',
      subject: 'Physics',
      time: '10:15 AM',
    },
    {
      q: 'How do you balance chemical equations for complete combustion of Methane (CH4)?',
      a: 'To balance the complete combustion of Methane in Oxygen:\n\nUnbalanced Equation:\nCH₄ + O₂ → CO₂ + H₂O\n\nStep 1: Balance Carbon (C):\n1 Carbon on left, 1 Carbon on right (Balanced).\n\nStep 2: Balance Hydrogen (H):\n4 Hydrogen on left, 2 Hydrogen on right in H₂O. Place coefficient 2 in front of H₂O:\nCH₄ + O₂ → CO₂ + 2H₂O\n\nStep 3: Balance Oxygen (O):\nLeft side has 2 Oxygen atoms. Right side has 2 (from CO₂) + 2 (from 2H₂O) = 4 Oxygen atoms.\nPlace coefficient 2 in front of O₂ on the left:\nCH₄ + 2O₂ → CO₂ + 2H₂O\n\nFinal Balanced Chemical Equation:\nCH₄ (g) + 2O₂ (g) → CO₂ (g) + 2H₂O (g) + Heat energy.',
      subject: 'Chemistry',
      time: 'Yesterday',
    },
  ]);

  const subjects = [
    { name: 'Physics', icon: Atom },
    { name: 'Chemistry', icon: Compass },
    { name: 'Mathematics', icon: Calculator },
    { name: 'Biology', icon: Sparkles },
    { name: 'English Literature', icon: Languages },
    { name: 'Computer Science', icon: Binary },
    { name: 'Islamic Studies', icon: BookOpen },
    { name: 'Pakistan Studies', icon: Cpu },
  ];

  const suggestedQuestions: Record<string, string[]> = {
    Physics: [
      'Explain Pascal’s Principle and its hydraulic application',
      'What is the difference between speed and velocity with examples?',
      'State Ohm’s law and describe series vs parallel resistance',
    ],
    Chemistry: [
      'Define Electronegativity and its periodic trend in Balochistan board',
      'What is the difference between Ionic and Covalent bonding?',
      'Explain Boyle’s Law with graphical representation',
    ],
    Mathematics: [
      'Solve quadratic equation by factorization method with steps',
      'Explain Pythagoras Theorem and practical examples',
      'Find the determinant and inverse of a 2x2 matrix',
    ],
    'Computer Science': [
      'Difference between Compiler and Interpreter',
      'What is an algorithm and write a flowchart for finding prime numbers',
      'Explain Primary Memory (RAM) vs Secondary Memory (SSD)',
    ],
    'English Literature': [
      'Summary and theme of William Wordsworth poem "Daffodils"',
      'Rules for Active to Passive Voice conversion in Past Tense',
      'Write a formal application to the Principal for 3 days sick leave',
    ],
    'Islamic Studies': [
      'Significance of Zakat in an Islamic economic system',
      'Explain the rights of parents and neighbors in Islam',
      'Brief summary of the Treaty of Hudaibiyyah',
    ],
    Biology: [
      'Describe the stages of Photosynthesis: Light and Dark reactions',
      'Difference between Mitosis and Meiosis',
      'Explain the function of human kidneys and nephrons',
    ],
  };

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || question).trim();
    if (!q || loading) return;

    setLoading(true);
    setQuestion('');

    try {
      const answer = await api.askStudentAi(q, studentClass, selectedSubject);
      setHistory((prev) => [
        {
          q,
          a: answer,
          subject: selectedSubject,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    } catch (err) {
      setHistory((prev) => [
        {
          q,
          a: 'Unable to connect to Smart AI tutor. Please check your internet or consult your subject teacher at Oxfored Educational House.',
          subject: selectedSubject,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border-2 border-emerald-100 overflow-hidden">
      {/* Smart AI Header in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white p-6 border-b-2 border-yellow-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 border-2 border-yellow-300 flex items-center justify-center text-emerald-950 shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                  Smart AI — 24/7 Academic Assistant
                </h2>
                <span className="bg-yellow-400 text-emerald-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Always Online
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Personalized study guidance, formula breakdowns & homework explanations for{' '}
                <strong className="text-yellow-300">{studentName}</strong> ({studentClass} • {rollNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-yellow-400/40 text-xs text-yellow-300 font-bold">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span>Balochistan & Federal Board Curriculum</span>
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            const isSelected = selectedSubject === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => setSelectedSubject(sub.name)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-yellow-400 text-emerald-950 shadow-md scale-105 font-black'
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white border border-emerald-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Form */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Ask Any Question in {selectedSubject}:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder={`e.g., Explain how to solve quadratic equations, or define photosynthesis with chemical equation...`}
              className="flex-1 text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent resize-none"
              disabled={loading}
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-yellow-300"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-950" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-950" />
                  <span>Ask Smart AI</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggested Questions */}
          {suggestedQuestions[selectedSubject] && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
              </span>
              {suggestedQuestions[selectedSubject].map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(sq)}
                  disabled={loading}
                  className="text-[11px] bg-slate-100 hover:bg-yellow-50 text-slate-700 hover:text-emerald-950 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Q&A Stream & History */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Academic Solutions & Explanations ({history.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Powered by Gemini 3.8 Flash</span>
          </div>

          {history.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-yellow-300">
                    {item.subject}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{item.q}</h4>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                {item.a}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Oxfored Educational House Syllabus
                </span>
                <span>Class: {studentClass}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
