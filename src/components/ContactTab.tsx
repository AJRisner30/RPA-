import React, { useState } from 'react';
import { 
  Mail, Send, Instagram, ExternalLink, Copy, Check, 
  ShieldCheck, Award, MessageSquare, Dumbbell, Sparkles, 
  Flame, CheckCircle2, User, ArrowRight
} from 'lucide-react';
import { OverlandLogo, IssaCertifiedBadge, OverlandCompanyEmblem } from './BrandingLogos';

export const ContactTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [inquiryType, setInquiryType] = useState('coaching');
  const [senderName, setSenderName] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [trainingGoal, setTrainingGoal] = useState('hybrid_athlete');

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
      coaching: '1-on-1 Overland Hybrid Coaching Inquiry',
      programming: 'Custom Programming & Protocol Question',
      form_check: 'Lift Form & Movement Review',
      supplements: 'Bucked Up Supplement & Nutrition Advice',
      general: 'Inquiry for Overland Athletics',
    };

    const subject = encodeURIComponent(
      `[Overland Athletics] ${subjectMap[inquiryType] || 'Coaching Inquiry'} - ${senderName || 'Athlete'}`
    );

    const bodyText = `Hi Coach,

Name: ${senderName || 'Athlete'}
Primary Goal: ${trainingGoal}
Inquiry Type: ${subjectMap[inquiryType] || inquiryType}

Message:
${senderMessage || 'I would like to inquire about training, programming, or coaching with Overland Athletics.'}

---
Sent via Overland Athletics App (Run • Lift • Ruck)`;

    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${coachEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header Card: Overland Athletics & Coaching */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border-2 border-amber-500/50 p-2 flex items-center justify-center shadow-lg shadow-amber-950/30 overflow-hidden">
                <OverlandCompanyEmblem size="md" />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded-md shadow">
                OVERLAND
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Overland Athletics
                </span>
                <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Run • Lift • Ruck • Go The Distance
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-athletic uppercase tracking-wide">
                Overland <span className="text-amber-400">Athletics</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl leading-relaxed">
                Elite performance conditioning, hybrid compound strength, rucking endurance, and progressive overload periodization.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={`mailto:${coachEmail}`}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Email Overland Athletics</span>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white border border-zinc-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram: @ajrisner</span>
              <ExternalLink className="w-3 h-3 text-zinc-400 ml-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 3 Quick Highlight Cards: Email, Instagram, Bucked Up Supplements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Direct Contact</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Email Coach AJ</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Have questions regarding programs, 1RM calculator, custom coaching, or training feedback? Send an email directly.
            </p>
            <div className="mt-3.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-zinc-200 truncate select-all">
                {coachEmail}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy email to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-medium">Response: &lt;24 hours</span>
            <a
              href={`mailto:${coachEmail}`}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Mail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Instagram Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-3">
              <Instagram className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">Social Media</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Instagram: AJ Risner</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Follow Coach AJ Risner for daily workout execution, lifting tips, rucking milestones, and hybrid training insights.
            </p>
            <div className="mt-3.5 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="font-mono text-xs text-white font-bold">@ajrisner</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">AJ Risner</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-medium">Daily training updates</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bucked Up Supplement Link Card */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg font-mono">
            Official Supps
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Official Partner</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Bucked Up Supplements</h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Fuel your hybrid workouts with Coach AJ Risner&apos;s recommended Bucked Up pre-workouts, creatine, hydration electrolytes, and recovery protein.
            </p>
            <div className="mt-3.5 p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Athlete Discount Link</span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                bckd.co/87uJC2e
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] text-amber-400/80 font-medium">Peak Performance Fuel</span>
            <a
              href={buckedUpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white font-athletic uppercase tracking-wide">
              Send an Inquiry Directly to Coach AJ
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Fill out the form below to construct and launch an email message directly to <strong className="text-zinc-200">risnerathletics@gmail.com</strong>.
          </p>

          <form onSubmit={handleSendEmail} className="space-y-4">
            {/* Inquiry Type Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
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
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Primary Athletic Goal
                </label>
                <select
                  value={trainingGoal}
                  onChange={(e) => setTrainingGoal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                >
                  <option value="Hybrid Strength & Ruck Stamina">Hybrid Strength & Ruck Stamina</option>
                  <option value="Push-Up & Upper Body Density">Push-Up & Upper Body Density</option>
                  <option value="Dumbbell Power & Hypertrophy">Dumbbell Power & Hypertrophy</option>
                  <option value="Zone 2 Running & Aerobic Engine">Zone 2 Running & Aerobic Engine</option>
                  <option value="Body Recomposition & Fat Loss">Body Recomposition & Fat Loss</option>
                </select>
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Message / Details
              </label>
              <textarea
                value={senderMessage}
                onChange={(e) => setSenderMessage(e.target.value)}
                rows={4}
                placeholder="Describe your current training background, injuries or constraints, or specific questions for Coach AJ..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors resize-none"
              />
            </div>

            {/* Send Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Send Email to risnerathletics@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full sm:w-auto py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Email!' : 'Copy Email Address'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Coach Credentials & Bucked Up Spotlight */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coach Standards Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <OverlandCompanyEmblem size="sm" />
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-athletic">
                  Overland Athletics
                </h3>
                <span className="text-[11px] text-amber-400 font-semibold">Run • Lift • Ruck</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              {[
                'Evidence-based hybrid strength & endurance concurrent training',
                'ISSA Certified Personal Trainer (ISSA-CPT) verified credentials',
                'Individualized progressive overload tracking and load prescription',
                'Rotator cuff, scapular, and hip capsule injury prevention protocols',
                'Tactical rucking pace and load progression mechanics',
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Direct Inquiries:</span>
              <a
                href={`mailto:${coachEmail}`}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline font-mono"
              >
                {coachEmail}
              </a>
            </div>
          </div>

          {/* Bucked Up Featured Recommendation Box */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-athletic">
                  Official Supplement Sponsor
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Bucked Up
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Coach AJ recommends pairing the 12-Week Hybrid Protocol with Bucked Up&apos;s clinically dosed essentials:
            </p>

            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Bucked Up Pre-Workout</span>
                  <span className="text-[11px] text-zinc-400">Citrulline, Beta-Alanine, and focused CNS energy</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">Training Days</span>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Creatine Monohydrate</span>
                  <span className="text-[11px] text-zinc-400">Cellular hydration, ATP resynthesis & power output</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">5g Daily</span>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Hydration Electrolytes</span>
                  <span className="text-[11px] text-zinc-400">Essential minerals for long rucks and threshold runs</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">Ruck Days</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800">
              <a
                href={buckedUpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Shop Bucked Up Supplements</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="block text-center text-[10px] text-zinc-500 font-mono mt-1.5">
                Support Coach AJ via link: bckd.co/87uJC2e
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
