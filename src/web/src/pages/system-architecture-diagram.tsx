"use client"

export default function SystemArchitectureDiagram() {
  return (
    <div className="w-full bg-white rounded-xl shadow-2xl p-8 overflow-x-auto">
      <svg viewBox="0 0 1600 1300" className="w-full h-auto" style={{ minWidth: "1200px" }}>
        <defs>
          {/* Gradients */}
          <linearGradient id="inputGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="outputGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="moduleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="diagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>

        {/* INPUT SECTION */}
        <g id="input-section">
          <rect x="20" y="20" width="200" height="280" fill="url(#inputGrad)" stroke="#f59e0b" strokeWidth="3" rx="8" />
          <text x="120" y="50" textAnchor="middle" className="font-bold text-xl" fill="#92400e">
            Input
          </text>

          {/* User Icon */}
          <circle cx="120" cy="90" r="20" fill="#fff" stroke="#f59e0b" strokeWidth="2" />
          <text x="120" y="97" textAnchor="middle" fontSize="24">
            👤
          </text>
          <text x="120" y="125" textAnchor="middle" fontSize="14" fill="#78350f">
            User
          </text>

          {/* Food Photo */}
          <rect x="50" y="145" width="140" height="50" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="120" y="165" textAnchor="middle" fontSize="12" fill="#78350f">
            📸 Upload Food
          </text>
          <text x="120" y="182" textAnchor="middle" fontSize="12" fill="#78350f">
            Photo
          </text>

          {/* EHR Input */}
          <rect x="50" y="210" width="140" height="50" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="120" y="230" textAnchor="middle" fontSize="12" fill="#78350f">
            📋 EHR Input
          </text>
          <text x="120" y="247" textAnchor="middle" fontSize="12" fill="#78350f">
            & Text
          </text>
        </g>

        {/* FOOD MODULE */}
        <g id="food-module">
          <rect
            x="260"
            y="20"
            width="380"
            height="280"
            fill="url(#moduleGrad)"
            stroke="#6366f1"
            strokeWidth="3"
            rx="8"
          />
          <text x="450" y="50" textAnchor="middle" className="font-bold text-lg" fill="#312e81">
            Food Module
          </text>

          {/* Backend */}
          <rect x="280" y="70" width="160" height="80" fill="#fff" stroke="#6366f1" strokeWidth="2" rx="6" />
          <text x="360" y="95" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#312e81">
            Backend
          </text>
          <text x="360" y="112" textAnchor="middle" fontSize="11" fill="#4338ca">
            (Node.js)
          </text>
          <text x="360" y="130" textAnchor="middle" fontSize="10" fill="#4338ca">
            Food Controller
          </text>

          {/* ML Service */}
          <rect x="280" y="165" width="160" height="80" fill="#fff" stroke="#8b5cf6" strokeWidth="2" rx="6" />
          <text x="360" y="190" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#581c87">
            ML Service
          </text>
          <text x="360" y="207" textAnchor="middle" fontSize="11" fill="#6b21a8">
            (FastAPI, PyTorch)
          </text>
          <text x="360" y="224" textAnchor="middle" fontSize="10" fill="#6b21a8">
            Food-101 Model
          </text>
          <text x="360" y="238" textAnchor="middle" fontSize="9" fill="#6b21a8">
            (top-5 labels)
          </text>

          {/* USDA API */}
          <ellipse cx="550" cy="110" rx="70" ry="50" fill="#fff" stroke="#10b981" strokeWidth="2" />
          <text x="550" y="105" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#065f46">
            USDA
          </text>
          <text x="550" y="120" textAnchor="middle" fontSize="10" fill="#065f46">
            API
          </text>
        </g>

        {/* MEAL/CHAT MODULE */}
        <g id="meal-module">
          <rect
            x="260"
            y="320"
            width="380"
            height="280"
            fill="url(#moduleGrad)"
            stroke="#6366f1"
            strokeWidth="3"
            rx="8"
          />
          <text x="450" y="350" textAnchor="middle" className="font-bold text-lg" fill="#312e81">
            Meal/Chat Module
          </text>

          {/* Backend Components */}
          <rect x="280" y="370" width="160" height="200" fill="#fff" stroke="#6366f1" strokeWidth="2" rx="6" />
          <text x="360" y="390" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#312e81">
            Backend (Node.js)
          </text>

          <rect x="290" y="405" width="140" height="30" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="4" />
          <text x="360" y="424" textAnchor="middle" fontSize="10" fill="#312e81">
            🔐 Auth & Profile
          </text>

          <rect x="290" y="445" width="140" height="35" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="4" />
          <text x="360" y="460" textAnchor="middle" fontSize="10" fill="#312e81">
            🍽️ Meal Planning
          </text>
          <text x="360" y="472" textAnchor="middle" fontSize="9" fill="#4338ca">
            (BMI/BMR/TDEE)
          </text>

          <rect x="290" y="490" width="140" height="30" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="4" />
          <text x="360" y="509" textAnchor="middle" fontSize="10" fill="#312e81">
            📊 Tracking
          </text>

          <rect x="290" y="530" width="140" height="30" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="4" />
          <text x="360" y="549" textAnchor="middle" fontSize="10" fill="#312e81">
            💬 Chat Controller
          </text>

          {/* Gemini API */}
          <ellipse cx="550" cy="460" rx="70" ry="60" fill="#fff" stroke="#ec4899" strokeWidth="2" />
          <text x="550" y="450" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#831843">
            Gemini
          </text>
          <text x="550" y="465" textAnchor="middle" fontSize="10" fill="#831843">
            API
          </text>
          <text x="550" y="478" textAnchor="middle" fontSize="8" fill="#9f1239">
            AI Assistant
          </text>
        </g>

        {/* DIAGNOSTIC MODULE */}
        <g id="diagnostic-module">
          <rect x="680" y="20" width="680" height="580" fill="url(#diagGrad)" stroke="#8b5cf6" strokeWidth="3" rx="8" />
          <text x="1020" y="50" textAnchor="middle" className="font-bold text-xl" fill="#4c1d95">
            Diagnostic Module - KG-elicited Reasoning RAG
          </text>

          {/* Preprocessing */}
          <rect x="700" y="70" width="140" height="60" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="6" />
          <text x="770" y="95" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">
            Preprocessing
          </text>
          <text x="770" y="112" textAnchor="middle" fontSize="10" fill="#92400e">
            Patient Info
          </text>

          {/* EHR DB */}
          <g transform="translate(700, 150)">
            <ellipse cx="70" cy="40" rx="60" ry="25" fill="#1e293b" />
            <ellipse cx="70" cy="40" rx="60" ry="25" fill="none" stroke="#1e293b" strokeWidth="2" />
            <ellipse cx="70" cy="35" rx="60" ry="25" fill="#334155" />
            <path d="M 10 35 L 10 40 A 60 25 0 0 0 130 40 L 130 35" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <text x="70" y="40" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">
              EHR DB
            </text>
          </g>

          {/* EHR Indexing */}
          <rect x="870" y="150" width="120" height="50" fill="#fff" stroke="#6366f1" strokeWidth="2" rx="4" />
          <text x="930" y="170" textAnchor="middle" fontSize="11" fill="#312e81">
            EHR Indexing
          </text>
          <text x="930" y="185" textAnchor="middle" fontSize="9" fill="#4338ca">
            📑 ━━━━━
          </text>

          {/* Patient Embeddings */}
          <rect x="1010" y="150" width="120" height="50" fill="#fff" stroke="#6366f1" strokeWidth="2" rx="4" />
          <text x="1070" y="170" textAnchor="middle" fontSize="11" fill="#312e81">
            Patient
          </text>
          <text x="1070" y="185" textAnchor="middle" fontSize="11" fill="#312e81">
            Embeddings
          </text>
          <text x="1070" y="195" textAnchor="middle" fontSize="9" fill="#4338ca">
            🟩🟩🟩
          </text>

          {/* FAISS Index Search */}
          <rect x="1150" y="150" width="120" height="50" fill="#fff" stroke="#6366f1" strokeWidth="2" rx="4" />
          <text x="1210" y="170" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#312e81">
            FAISS
          </text>
          <text x="1210" y="185" textAnchor="middle" fontSize="10" fill="#4338ca">
            Index Search
          </text>

          {/* Top-k relevant EHR */}
          <rect x="1290" y="150" width="50" height="60" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="1315" y="170" textAnchor="middle" fontSize="10" fill="#78350f">
            📄
          </text>
          <text x="1315" y="185" textAnchor="middle" fontSize="9" fill="#78350f">
            Top-k
          </text>
          <text x="1315" y="198" textAnchor="middle" fontSize="9" fill="#78350f">
            EHR
          </text>

          {/* Backbone LLM */}
          <rect x="1150" y="240" width="180" height="100" fill="#fff" stroke="#8b5cf6" strokeWidth="3" rx="8" />
          <text x="1240" y="265" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4c1d95">
            Backbone LLM
          </text>

          <rect x="1170" y="280" width="60" height="45" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" rx="4" />
          <text x="1200" y="295" textAnchor="middle" fontSize="9" fill="#78350f">
            Patient
          </text>
          <text x="1200" y="307" textAnchor="middle" fontSize="9" fill="#78350f">
            Info
          </text>
          <text x="1200" y="318" textAnchor="middle" fontSize="8" fill="#78350f">
            📋
          </text>

          <rect x="1245" y="280" width="70" height="45" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="4" />
          <text x="1280" y="295" textAnchor="middle" fontSize="9" fill="#312e81">
            Reasoning
          </text>
          <text x="1280" y="307" textAnchor="middle" fontSize="9" fill="#312e81">
            Engine
          </text>
          <text x="1280" y="318" textAnchor="middle" fontSize="8" fill="#312e81">
            🧠
          </text>

          {/* KG Component */}
          <rect x="1245" y="295" width="25" height="25" fill="#fde68a" stroke="#f59e0b" strokeWidth="1" rx="2" />
          <text x="1257" y="310" textAnchor="middle" fontSize="10" fill="#78350f">
            KG
          </text>

          {/* Clinical Features Decomposition */}
          <rect x="700" y="360" width="200" height="120" fill="#fff" stroke="#f97316" strokeWidth="2" rx="6" />
          <text x="800" y="375" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7c2d12">
            Clinical Features
          </text>
          <text x="800" y="390" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7c2d12">
            Decomposition
          </text>

          <rect x="720" y="405" width="160" height="20" fill="#fed7aa" stroke="#f97316" strokeWidth="1" rx="3" />
          <text x="800" y="419" textAnchor="middle" fontSize="10" fill="#7c2d12">
            Symptoms
          </text>

          <rect x="720" y="430" width="160" height="20" fill="#fed7aa" stroke="#f97316" strokeWidth="1" rx="3" />
          <text x="800" y="444" textAnchor="middle" fontSize="10" fill="#7c2d12">
            Locations
          </text>

          <rect x="720" y="455" width="160" height="20" fill="#fed7aa" stroke="#f97316" strokeWidth="1" rx="3" />
          <text x="800" y="469" textAnchor="middle" fontSize="10" fill="#7c2d12">
            Geographic
          </text>

          {/* Embeddings SE/LE/GE */}
          <rect x="920" y="360" width="100" height="120" fill="#fff" stroke="#6366f1" strokeWidth="2" rx="6" />
          <text x="970" y="380" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#312e81">
            Embeddings
          </text>

          <rect x="935" y="390" width="70" height="25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="3" />
          <text x="970" y="406" textAnchor="middle" fontSize="10" fill="#312e81">
            SE 🟧🟧🟧
          </text>

          <rect x="935" y="420" width="70" height="25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="3" />
          <text x="970" y="436" textAnchor="middle" fontSize="10" fill="#312e81">
            LE 🟧🟧🟧
          </text>

          <rect x="935" y="450" width="70" height="25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" rx="3" />
          <text x="970" y="466" textAnchor="middle" fontSize="10" fill="#312e81">
            GE 🟧🟧🟧
          </text>

          {/* Clinical Features Matching - Knowledge Graph */}
          <g transform="translate(1040, 360)">
            <rect x="0" y="0" width="140" height="120" fill="#fff" stroke="#10b981" strokeWidth="2" rx="6" />
            <text x="70" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">
              Clinical Features
            </text>
            <text x="70" y="35" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">
              Matching
            </text>

            {/* Simple KG visualization */}
            <circle cx="70" cy="70" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="40" cy="95" r="10" fill="#fb923c" stroke="#f97316" strokeWidth="2" />
            <circle cx="100" cy="95" r="10" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="55" cy="50" r="8" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1" />
            <circle cx="85" cy="50" r="8" fill="#34d399" stroke="#10b981" strokeWidth="1" />

            <line x1="70" y1="58" x2="70" y2="70" stroke="#64748b" strokeWidth="1.5" />
            <line x1="70" y1="82" x2="50" y2="90" stroke="#64748b" strokeWidth="1.5" />
            <line x1="70" y1="82" x2="90" y2="90" stroke="#64748b" strokeWidth="1.5" />
            <line x1="62" y1="65" x2="58" y2="52" stroke="#64748b" strokeWidth="1" />
            <line x1="78" y1="65" x2="82" y2="52" stroke="#64748b" strokeWidth="1" />
          </g>

          {/* Upward Traversal - Knowledge Graph */}
          <g transform="translate(1200, 360)">
            <rect x="0" y="0" width="140" height="120" fill="#fff" stroke="#10b981" strokeWidth="2" rx="6" />
            <text x="70" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">
              Upward
            </text>
            <text x="70" y="35" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">
              Traversal
            </text>

            {/* Hierarchical KG */}
            <circle cx="70" cy="55" r="10" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
            <circle cx="45" cy="75" r="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="70" cy="75" r="9" fill="#fb923c" stroke="#f97316" strokeWidth="2" />
            <circle cx="95" cy="75" r="9" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="35" cy="95" r="7" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1" />
            <circle cx="55" cy="95" r="7" fill="#34d399" stroke="#10b981" strokeWidth="1" />
            <circle cx="85" cy="95" r="7" fill="#fcd34d" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="105" cy="95" r="7" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1" />

            <line x1="70" y1="65" x2="45" y2="75" stroke="#64748b" strokeWidth="1.5" />
            <line x1="70" y1="65" x2="70" y2="75" stroke="#64748b" strokeWidth="1.5" />
            <line x1="70" y1="65" x2="95" y2="75" stroke="#64748b" strokeWidth="1.5" />
            <line x1="45" y1="84" x2="35" y2="95" stroke="#64748b" strokeWidth="1" />
            <line x1="45" y1="84" x2="55" y2="95" stroke="#64748b" strokeWidth="1" />
            <line x1="95" y1="84" x2="85" y2="95" stroke="#64748b" strokeWidth="1" />
            <line x1="95" y1="84" x2="105" y2="95" stroke="#64748b" strokeWidth="1" />
          </g>

          {/* Diagnostic Differences KG */}
          <g transform="translate(1040, 500)">
            <rect x="0" y="0" width="140" height="80" fill="#fff" stroke="#eab308" strokeWidth="2" rx="6" />
            <text x="70" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#713f12">
              Diagnostic
            </text>
            <text x="70" y="32" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#713f12">
              Differences KG
            </text>

            {/* Final KG visualization */}
            <circle cx="70" cy="55" r="10" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="45" cy="55" r="8" fill="#fde047" stroke="#facc15" strokeWidth="2" />
            <circle cx="95" cy="55" r="8" fill="#bef264" stroke="#a3e635" strokeWidth="2" />
            <circle cx="35" cy="70" r="6" fill="#fef08a" stroke="#fde047" strokeWidth="1" />
            <circle cx="55" cy="70" r="6" fill="#d9f99d" stroke="#bef264" strokeWidth="1" />
            <circle cx="85" cy="70" r="6" fill="#86efac" stroke="#4ade80" strokeWidth="1" />
            <circle cx="105" cy="70" r="6" fill="#6ee7b7" stroke="#34d399" strokeWidth="1" />

            <line x1="53" y1="55" x2="62" y2="55" stroke="#64748b" strokeWidth="1.5" />
            <line x1="78" y1="55" x2="87" y2="55" stroke="#64748b" strokeWidth="1.5" />
            <line x1="45" y1="63" x2="38" y2="68" stroke="#64748b" strokeWidth="1" />
            <line x1="48" y1="60" x2="53" y2="66" stroke="#64748b" strokeWidth="1" />
            <line x1="92" y1="60" x2="87" y2="66" stroke="#64748b" strokeWidth="1" />
            <line x1="98" y1="60" x2="103" y2="66" stroke="#64748b" strokeWidth="1" />
          </g>
        </g>

        {/* DIAGNOSTIC KG CONSTRUCTION SECTION */}
        <g id="diagnostic-kg-construction" transform="translate(0, 100)">
          <rect x="680" y="520" width="680" height="160" fill="#f0fdf4" stroke="#10b981" strokeWidth="3" rx="8" />
          <text x="1020" y="545" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#065f46">
            Diagnostic KG Construction
          </text>

          {/* EHR DB 2 */}
          <g transform="translate(700, 560)">
            <ellipse cx="50" cy="30" rx="45" ry="20" fill="#1e293b" />
            <ellipse cx="50" cy="30" rx="45" ry="20" fill="none" stroke="#1e293b" strokeWidth="2" />
            <ellipse cx="50" cy="27" rx="45" ry="20" fill="#334155" />
            <path d="M 5 27 L 5 30 A 45 20 0 0 0 95 30 L 95 27" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <text x="50" y="32" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
              EHR DB
            </text>
          </g>

          {/* Disease Clustering */}
          <rect x="810" y="560" width="110" height="60" fill="#fff" stroke="#ec4899" strokeWidth="2" rx="4" />
          <text x="865" y="578" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#831843">
            Disease
          </text>
          <text x="865" y="592" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#831843">
            Clustering
          </text>
          <text x="865" y="610" textAnchor="middle" fontSize="16" fill="#ec4899">
            ⊕ ⊕ ⊕
          </text>

          {/* Hierarchical Aggregation */}
          <rect x="940" y="560" width="110" height="60" fill="#fff" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="995" y="578" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4c1d95">
            Hierarchical
          </text>
          <text x="995" y="592" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4c1d95">
            Aggregation
          </text>
          <text x="995" y="610" textAnchor="middle" fontSize="14" fill="#8b5cf6">
            🌳
          </text>

          {/* Disease Knowledge Graph */}
          <g transform="translate(1090, 560)">
            <rect x="-20" y="0" width="100" height="60" fill="#fff" stroke="#10b981" strokeWidth="2" rx="4" />
            <text x="30" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065f46">
              Disease KG
            </text>

            <circle cx="30" cy="35" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="10" cy="48" r="5" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
            <circle cx="30" cy="48" r="5" fill="#34d399" stroke="#10b981" strokeWidth="1" />
            <circle cx="50" cy="48" r="5" fill="#f87171" stroke="#ef4444" strokeWidth="1" />

            <line x1="30" y1="41" x2="15" y2="45" stroke="#64748b" strokeWidth="1" />
            <line x1="30" y1="41" x2="30" y2="43" stroke="#64748b" strokeWidth="1" />
            <line x1="30" y1="41" x2="45" y2="45" stroke="#64748b" strokeWidth="1" />
          </g>

          {/* LLM */}
          <rect x="1190" y="560" width="60" height="60" fill="#fff" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="1220" y="580" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4c1d95">
            LLM
          </text>
          <text x="1220" y="605" textAnchor="middle" fontSize="20" fill="#8b5cf6">
            🤖
          </text>

          {/* Final Diagnostic KG */}
          <g transform="translate(1290, 560)">
            <rect x="-30" y="0" width="90" height="60" fill="#fff" stroke="#eab308" strokeWidth="2" rx="4" />
            <text x="20" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#713f12">
              Diagnostic KG
            </text>

            <circle cx="20" cy="35" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="0" cy="48" r="5" fill="#fde047" stroke="#facc15" strokeWidth="1" />
            <circle cx="20" cy="48" r="5" fill="#bef264" stroke="#a3e635" strokeWidth="1" />
            <circle cx="40" cy="48" r="5" fill="#86efac" stroke="#4ade80" strokeWidth="1" />

            <line x1="20" y1="41" x2="5" y2="45" stroke="#64748b" strokeWidth="1" />
            <line x1="20" y1="41" x2="20" y2="43" stroke="#64748b" strokeWidth="1" />
            <line x1="20" y1="41" x2="35" y2="45" stroke="#64748b" strokeWidth="1" />
          </g>
        </g>

        {/* DATABASE */}
        <g id="database">
          <g transform="translate(400, 650)">
            <ellipse cx="100" cy="60" rx="90" ry="35" fill="#1e293b" />
            <ellipse cx="100" cy="60" rx="90" ry="35" fill="none" stroke="#1e293b" strokeWidth="3" />
            <ellipse cx="100" cy="55" rx="90" ry="35" fill="#334155" />
            <path d="M 10 55 L 10 80 A 90 35 0 0 0 190 80 L 190 55" fill="#334155" stroke="#1e293b" strokeWidth="3" />
            <ellipse cx="100" cy="80" rx="90" ry="35" fill="none" stroke="#1e293b" strokeWidth="2" />

            <text x="100" y="60" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">
              PostgreSQL
            </text>
            <text x="100" y="78" textAnchor="middle" fontSize="10" fill="#cbd5e1">
              Database
            </text>
            <text x="100" y="92" textAnchor="middle" fontSize="8" fill="#94a3b8">
              users • nutrition • plans
            </text>
            <text x="100" y="103" textAnchor="middle" fontSize="8" fill="#94a3b8">
              chat • diagnostics
            </text>
          </g>
        </g>

        

        {/* OUTPUT SECTION */}
        <g id="output-section">
          <rect
            x="1380"
            y="20"
            width="200"
            height="600"
            fill="url(#outputGrad)"
            stroke="#f59e0b"
            strokeWidth="3"
            rx="8"
          />
          <text x="1480" y="50" textAnchor="middle" className="font-bold text-xl" fill="#92400e">
            Output
          </text>

          {/* Diagnose */}
          <rect x="1410" y="80" width="140" height="60" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="1480" y="105" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">
            🔍 Diagnose
          </text>
          <text x="1480" y="122" textAnchor="middle" fontSize="10" fill="#92400e">
            Medical Analysis
          </text>

          {/* Treatment */}
          <rect x="1410" y="155" width="140" height="60" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="1480" y="180" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">
            💊 Treatment
          </text>
          <text x="1480" y="197" textAnchor="middle" fontSize="10" fill="#92400e">
            Care Plan
          </text>

          {/* Medication */}
          <rect x="1410" y="230" width="140" height="60" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="1480" y="255" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">
            💉 Medication
          </text>
          <text x="1480" y="272" textAnchor="middle" fontSize="10" fill="#92400e">
            Prescriptions
          </text>

          {/* Follow-up */}
          <rect x="1410" y="305" width="140" height="60" fill="#fff" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="1480" y="330" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">
            ❓ Follow-up
          </text>
          <text x="1480" y="347" textAnchor="middle" fontSize="10" fill="#92400e">
            Questions
          </text>

          {/* Nutrition Info */}
          <rect x="1410" y="380" width="140" height="60" fill="#fff" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="1480" y="405" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#065f46">
            🥗 Nutrition
          </text>
          <text x="1480" y="422" textAnchor="middle" fontSize="10" fill="#047857">
            Info & Plans
          </text>

          {/* Meal Tracking */}
          <rect x="1410" y="455" width="140" height="60" fill="#fff" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="1480" y="480" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#065f46">
            📊 Tracking
          </text>
          <text x="1480" y="497" textAnchor="middle" fontSize="10" fill="#047857">
            Progress
          </text>

          {/* AI Chat */}
          <rect x="1410" y="535" width="140" height="60" fill="#fff" stroke="#ec4899" strokeWidth="2" rx="4" />
          <text x="1480" y="560" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#831843">
            💬 AI Chat
          </text>
          <text x="1480" y="577" textAnchor="middle" fontSize="10" fill="#9f1239">
            Assistant
          </text>
        </g>
      </svg>
    </div>
  )
}
