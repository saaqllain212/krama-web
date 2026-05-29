'use client'
import { FileText, Key, Target, Zap, Upload, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AIMCQSection() {
  return (
    <section className="relative px-6 py-24 md:px-12 bg-gray-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary-500/10 via-purple-500/8 to-cyan-500/10 rounded-full blur-3xl"/>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 px-4 py-2 rounded-full mb-5">
            <Zap className="w-4 h-4 text-primary-400"/><span className="text-xs font-black text-primary-400 uppercase tracking-wider">AI-Powered · Zero Extra Cost</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Practice questions from<br/><span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">your own notes.</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium">Paste any text. Get MCQs instantly. Your own Gemini key — Krama charges you ₹0 for AI.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {icon:Upload, c:'from-primary-400 to-primary-600', s:'shadow-primary-500/20', step:'1', title:'Paste your notes', desc:'Copy any text from textbook, PDF, or notes. Drop into Krama.'},
            {icon:Settings, c:'from-purple-400 to-purple-600', s:'shadow-purple-500/20', step:'2', title:'Pick your exam', desc:'Select UPSC, JEE, NEET etc. Set difficulty. Connect your free Gemini key once.'},
            {icon:Target, c:'from-green-400 to-green-600', s:'shadow-green-500/20', step:'3', title:'Practice instantly', desc:'Get 10–20 MCQs from YOUR material. Attempt, check, track your score.'},
          ].map((s,i)=>(
            <motion.div key={s.step} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 hover:bg-white/8 transition-all">
              <div className={`w-16 h-16 bg-gradient-to-br ${s.c} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${s.s} hover:scale-110 transition-transform`}>
                <s.icon className="w-8 h-8 text-white"/>
              </div>
              <div className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-2">Step {s.step}</div>
              <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-black text-white mb-5">Why it's different</h3>
            <div className="space-y-4">
              {[
                {icon:FileText, c:'bg-green-500/15 text-green-400', title:'Your notes → your questions', desc:'Other apps use generic banks. This uses YOUR actual study material.'},
                {icon:Key, c:'bg-primary-500/15 text-primary-400', title:'Your key, your control', desc:'You bring a free Gemini key. Krama never stores it. You pay Google ₹0.'},
                {icon:Target, c:'bg-purple-500/15 text-purple-400', title:'Exam-pattern questions', desc:'Questions match your specific exam style — UPSC statements, JEE calculations, NEET NCERT.'},
              ].map((item,i)=>(
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${item.c} rounded-xl flex items-center justify-center shrink-0`}><item.icon size={15}/></div>
                  <div>
                    <p className="font-black text-sm text-white">{item.title}</p>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 font-mono text-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"/><div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"/><div className="w-2.5 h-2.5 bg-green-500 rounded-full"/>
              <span className="text-white/30 text-[10px] ml-1">MCQ Generator</span>
            </div>
            <div className="space-y-2 text-[11px] leading-relaxed">
              <p className="text-green-400">✓ Notes loaded: "Revolt of 1857"</p>
              <p className="text-blue-400">⟳ Generating 10 MCQs for UPSC Prelims...</p>
              <div className="mt-3 bg-black/40 rounded-lg p-3 border border-white/10">
                <p className="text-yellow-300 font-bold mb-2">Q3. Who was called "The Last Mughal"?</p>
                <p className="text-white/40">A) Aurangzeb</p>
                <p className="text-green-400">B) Bahadur Shah Zafar ✓</p>
                <p className="text-white/40">C) Shah Alam II</p>
                <p className="text-white/40">D) Akbar II</p>
              </div>
              <p className="text-white/30 mt-2">Score: 7/10 · Time: 4m 12s</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
