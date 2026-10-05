import React, { useState } from 'react';
import { 
  Mail, Send, Instagram, ExternalLink, Copy, Check, 
  ShieldCheck, Award, MessageSquare, Dumbbell, Sparkles, 
  Flame, CheckCircle2, User, ArrowRight, Shield
} from 'lucide-react';
import { PatrolReadyLogo, IssaCertifiedBadge, PatrolReadyCompanyEmblem } from './BrandingLogos';

export const ContactTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [inquiryType, setInquiryType] = useState('coaching');
  const [senderName, setSenderName] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [trainingGoal, setTrainingGoal] = useState('patrol_officer');

  const coachEmail = 'risnerathletics@gmail.com';
  const instagramUrl = 'https://www.instagram.com/ajrisner';
  const buckedUpUrl = 'https://bckd.co/87uJC2e';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(coachEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectMap: Record<string, string> = {
      coaching: '1-on-1 Tactical LEO Coaching Inquiry',
      programming: 'Custom Tactical Programming & Protocol Question',
      form_check: 'Duty Movement & Lift Form Review',
      supplements: 'Bucked Up Duty Nutrition & Supplement Advice',
      general: 'Inquiry for Patrol Ready Performance',
    };

    const subject = encodeURIComponent(
      `[Patrol Ready Performance] ${subjectMap[inquiryType] || 'Coaching Inquiry'} - ${senderName || 'Officer'}`
    );

    const bodyText = `Hi Coach,

Name: ${senderName || 'Officer'}
Duty / Role: ${trainingGoal}
Inquiry Type: ${subjectMap[inquiryType] || inquiryType}

Message:
${senderMessage || 'I would like to inquire about law enforcement tactical fitness programming or coaching with Patrol Ready Performance.'}

---
Sent via Patrol Ready Performance (Tactical fitness for the Frontline)`;

    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${coachEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header Card: Patrol Ready Performance & Coaching */}
      <div className="bg-[#0f172a] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-blue-500/50 p-2 flex items-center justify-center shadow-lg shadow-blue-950/30 overflow-hidden">
                <PatrolReadyCompanyEmblem size="md" />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow">
                PRP
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Patrol Ready Performance
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Tactical fitness for the Frontline.
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-athletic uppercase tracking-wide">
                Patrol Ready <span className="text-blue-400">Performance</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Elite law enforcement tactical conditioning, duty readiness, combat chassis durability, and foot pursuit speed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={`mailto:${coachEmail}`}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-950/50 cursor-pointer active:scale-95 border border-blue-400/40"
            >
              <Mail className="w-4 h-4" />
              <span>Email Patrol Ready</span>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0f172a] hover:bg-[#162238] text-slate-100 hover:text-white border border-blue-500/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Instagram className="w-4 h-4 text-blue-400" />
              <span>Instagram: @ajrisner</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 3 Quick Highlight Cards: Email, Instagram, Bucked Up Supplements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email Card */}
        <div className="bg-[#0c1322] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Direct Contact</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Email Coach AJ</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Have questions regarding programs, 1RM calculator, custom coaching, or training feedback? Send an email directly.
            </p>
            <div className="mt-3.5 p-2.5 bg-[#060b14] rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-200 truncate select-all">
                {coachEmail}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy email to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Response: &lt;24 hours</span>
            <a
              href={`mailto:${coachEmail}`}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Mail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Instagram Card */}
        <div className="bg-[#0c1322] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
              <Instagram className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Social Media</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Instagram: AJ Risner</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Follow Coach AJ Risner for daily workout execution, lifting tips, foot pursuit conditioning, and frontline duty fitness insights.
            </p>
            <div className="mt-3.5 p-2.5 bg-[#060b14] rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-mono text-xs text-white font-bold">@ajrisner</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">AJ Risner</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Daily training updates</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bucked Up Supplement Link Card */}
        <div className="bg-gradient-to-b from-[#0c1322] to-[#080e18] border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg font-mono border-b border-l border-blue-400/40">
            Official Supps
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Official Partner</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Bucked Up Supplements</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Fuel your hybrid workouts with Coach AJ Risner&apos;s recommended Bucked Up pre-workouts, creatine, hydration electrolytes, and recovery protein.
            </p>
            <div className="mt-3.5 p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300">Athlete Discount Link</span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                bckd.co/87uJC2e
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-blue-400/80 font-medium">Peak Performance Fuel</span>
            <a
              href={buckedUpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Shop Bucked Up</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Coaching & Message Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Email Composer Form */}
        <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white font-athletic uppercase tracking-wide">
              Send an Inquiry Directly to Coach AJ
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Fill out the form below to construct and launch an email message directly to <strong className="text-slate-200">risnerathletics@gmail.com</strong>.
          </p>

          <form onSubmit={handleSendEmail} className="space-y-4">
            {/* Inquiry Type Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                What are you inquiring about?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'coaching', label: '1-on-1 Hybrid Coaching', icon: Dumbbell },
                  { id: 'programming', label: 'Custom 12-Week Protocol', icon: ShieldCheck },
                  { id: 'form_check', label: 'Lift Form & Technique Check', icon: Award },
                  { id: 'supplements', label: 'Bucked Up & Nutrition Advice', icon: Flame },
                  { id: 'general', label: 'General Athletic Inquiry', icon: User },
                ].map((item) => {
                  const isSelected = inquiryType === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInquiryType(item.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500 text-white shadow-sm'
                          : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#060b14] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Primary Athletic Goal
                </label>
                <select
                  value={trainingGoal}
                  onChange={(e) => setTrainingGoal(e.target.value)}
                  className="w-full bg-[#060b14] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                >
                  <option value="Tactical Strength & Pursuit Stamina">Tactical Strength & Pursuit Stamina</option>
                  <option value="Push-Up & Upper Body Density">Push-Up & Upper Body Density</option>
                  <option value="Dumbbell Power & Hypertrophy">Dumbbell Power & Hypertrophy</option>
                  <option value="Zone 2 Running & Aerobic Engine">Zone 2 Running & Aerobic Engine</option>
                  <option value="Body Recomposition & Fat Loss">Body Recomposition & Fat Loss</option>
                </select>
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Message / Details
              </label>
              <textarea
                value={senderMessage}
                onChange={(e) => setSenderMessage(e.target.value)}
                rows={4}
                placeholder="Describe your current training background, injuries or constraints, or specific questions for Coach AJ..."
                className="w-full bg-[#060b14] border border-slate-800 focus:border-blue-500 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors resize-none"
              />
            </div>

            {/* Send Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-blue-400/40"
              >
                <Send className="w-4 h-4" />
                <span>Send Email to risnerathletics@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full sm:w-auto py-3 px-4 bg-[#060b14] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Copied Email!' : 'Copy Email Address'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Coach Credentials & Bucked Up Spotlight */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coach Standards Box */}
          <div className="bg-[#0f172a] border border-blue-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <PatrolReadyCompanyEmblem size="sm" />
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-athletic">
                  Patrol Ready Performance
                </h3>
                <span className="text-[11px] text-blue-400 font-semibold">Tactical fitness for the Frontline.</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              {[
                'Law enforcement tactical physical conditioning & duty readiness',
                'ISSA Certified Fitness & Tactical Conditioning Specialist',
                'Duty vest, belt, and body armor structural load adaptation',
                'Officer foot pursuit speed, anaerobic power, and suspect control endurance',
                'POST / Academy Physical Assessment preparation & benchmark standards',
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Direct Inquiries:</span>
              <a
                href={`mailto:${coachEmail}`}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 underline font-mono"
              >
                {coachEmail}
              </a>
            </div>
          </div>

          {/* Bucked Up Featured Recommendation Box */}
          <div className="bg-[#0c1322] border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-athletic">
                  Official Supplement Sponsor
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Bucked Up
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Coach AJ recommends pairing the 12-Week Hybrid Protocol with Bucked Up&apos;s clinically dosed essentials:
            </p>

            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2.5 bg-[#060b14] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Bucked Up Pre-Workout</span>
                  <span className="text-[11px] text-slate-400">Citrulline, Beta-Alanine, and focused CNS energy</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">Training Days</span>
              </div>

              <div className="p-2.5 bg-[#060b14] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Creatine Monohydrate</span>
                  <span className="text-[11px] text-slate-400">Cellular hydration, ATP resynthesis & power output</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">5g Daily</span>
              </div>

              <div className="p-2.5 bg-[#060b14] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Hydration Electrolytes</span>
                  <span className="text-[11px] text-slate-400">Essential minerals for patrol shifts and threshold runs</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">Duty / Run Days</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <a
                href={buckedUpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-950/40 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/40"
              >
                <span>Shop Bucked Up Supplements</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="block text-center text-[10px] text-slate-500 font-mono mt-1.5">
                Support Coach AJ via link: bckd.co/87uJC2e
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
