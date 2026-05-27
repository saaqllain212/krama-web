'use client'
import { FileText, Key, Target, Zap, Upload, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AIMCQSection() {
  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-16 bg-white overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary-100 via-purple-100 to-cyan-100 rounded-full blur-3xl opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 px-4 py-2 rounded-full mb-5">
            <Zap className="w-4 h-4 text-primary-600"/>
            <span className="text-xs font-black text-primary-700 uppercase tracking-wider">AI-Powered · Zero Extra Cost</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Practice questions from<br/><span className="text-gradient">your own notes.</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Paste any text. Get MCQs instantly. Use your own free Gemini key — Krama doesn't charge you a rupee for AI. Your notes, your questions, zero cost.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon:Upload, color:'from-primary-400 to-primary-600', shadow:'shadow-primary-200', hover:'group-hover:border-primary-300', step:'1', title:'Paste your notes', desc:'Copy any text from your textbook, PDF, or notes. Drop it into Krama.' },
            { icon:Settings, color:'from-purple-400 to-purple-600', shadow:'shadow-purple-200', hover:'group-hover:border-purple-300', step:'2', title:'Pick your exam type', desc:'Select UPSC, JEE, NEET, etc. Set difficulty. Connect your free Gemini API key once.' },
            { icon:Target, color:'from-green-400 to-green-600', shadow:'shadow-green-200', hover:'group-hover:border-green-300', step:'3', title:'Practice instantly', desc:'AI generates 10-20 MCQs from YOUR material. Attempt, check, track your score.' },
          ].map((s,i)=>(
            <motion.div key={s.step} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className={`card text-center group hover:${s.hover} transition-all`}>
              <div className={`w-16 h-16 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${s.shadow} group-hover:scale-110 transition-transform`}>
                <s.icon className="w-8 h-8 text-white"/>
              </div>
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Step {s.step}</div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="card bg-gradient-to-br from-gray-50 to-white max-w-4xl mx-auto border-2 border-gray-100">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-5">Why it's different</h3>
              <div className="space-y-4">
                {[
                  { icon:FileText, color:'bg-green-100 text-green-600', title:'Your notes → your questions', desc:"Other apps give you generic MCQs. This uses YOUR actual study material so questions feel relevant." },
                  { icon:Key, color:'bg-primary-100 text-primary-600', title:'Your key, your control', desc:"You bring a free Gemini API key. Krama never stores it. You pay Google ₹0 on the free tier." },
                  { icon:Target, color:'bg-purple-100 text-purple-600', title:'Exam-pattern questions', desc:"Questions are formatted to match your specific exam style — UPSC statements, JEE calculations, NEET NCERT format." },
                ].map((item,i)=>(
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <item.icon size={15}/>
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 font-mono text-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"/><div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"/><div className="w-2.5 h-2.5 bg-green-500 rounded-full"/>
                <span className="text-gray-500 text-[10px] ml-1">MCQ Generator</span>
              </div>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p className="text-green-400">✓ Notes loaded: "Revolt of 1857"</p>
                <p className="text-blue-400">⟳ Generating 10 MCQs for UPSC Prelims...</p>
                <div className="mt-3 bg-gray-800 rounded-lg p-3 text-gray-200">
                  <p className="text-yellow-300 font-bold mb-2">Q3. Who was called "The Last Mughal"?</p>
                  <p className="text-gray-400">A) Aurangzeb</p>
                  <p className="text-green-400">B) Bahadur Shah Zafar ✓</p>
                  <p className="text-gray-400">C) Shah Alam II</p>
                  <p className="text-gray-400">D) Akbar II</p>
                </div>
                <p className="text-gray-500 mt-2">Score: 7/10 · Time: 4m 12s</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
