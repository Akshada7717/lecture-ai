import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://fondness-chafe-campfire.ngrok-free.dev' // <-- change this to your backend URL

export default function QuizPage() {
  const { videoId } = useParams()
  const nav = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [step, setStep] = useState('info')
  const [name, setName] = useState('')
  const [roll, setRoll] = useState('')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(API + '/api/quiz/' + videoId)
      .then(r => setQuiz(r.data))
      .catch(() => setError('Quiz not found. Please check the link.'))
  }, [videoId])

  const startQuiz = () => {
    if (!name.trim()) return alert('Please enter your name')
    if (!roll.trim()) return alert('Please enter your roll number')
    setAnswers(new Array(quiz.questions.length).fill(null))
    setStep('quiz')
  }

  const select = (idx) => {
    const a = [...answers]; a[current] = idx; setAnswers(a)
  }

  const submit = async () => {
    if (answers.includes(null)) return alert('Please answer all questions')
    setSubmitting(true)
    try {
      const r = await axios.post(API + '/api/submit', { video_id: videoId, name, roll, answers })
      nav('/result', { state: { ...r.data, total: quiz.questions.length } })
    } catch(e) { alert('Submission failed. Please try again.') }
    setSubmitting(false)
  }

  const wrap = { minHeight: '100vh', background: 'linear-gradient(135deg, #f8f7ff 0%, #f0ebff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
  const card = { background: '#fff', borderRadius: 24, border: '1px solid #ede9fe', padding: 36, width: '100%', maxWidth: 580, boxShadow: '0 8px 40px rgba(108,71,255,0.08)' }

  if (error) return (
    <div style={wrap}>
      <div style={{ ...card, textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>❌</p>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{error}</p>
        <a href="/" style={{ color: '#6c47ff' }}>Go to home</a>
      </div>
    </div>
  )

  if (!quiz) return (
    <div style={wrap}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #f0ebff', borderTop: '4px solid #6c47ff', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#888', fontSize: 14 }}>Loading quiz...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (step === 'info') return (
    <div style={wrap}>
      <div style={card}>
        <p style={{ fontWeight: 800, fontSize: 20, color: '#6c47ff', marginBottom: 4 }}>LectureAI</p>
        <p style={{ fontWeight: 800, fontSize: 22, marginBottom: 6, color: '#1a1a1a' }}>{quiz.title}</p>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>{quiz.total} questions · Enter your details to begin</p>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Full Name</label>
        <input style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e8e0ff', fontSize: 15, marginBottom: 14, outline: 'none' }} placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
        <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Roll Number</label>
        <input style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e8e0ff', fontSize: 15, marginBottom: 24, outline: 'none' }} placeholder="Enter your roll number" value={roll} onChange={e => setRoll(e.target.value)} />
        <button style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#6c47ff', color: '#fff', fontSize: 16, fontWeight: 800 }} onClick={startQuiz}>
          Start Quiz →
        </button>
      </div>
    </div>
  )

  const q = quiz.questions[current]
  const progress = Math.round(((answers.filter(a => a !== null).length) / quiz.questions.length) * 100)

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#6c47ff' }}>LectureAI</p>
          <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{current+1} / {quiz.questions.length}</span>
        </div>
        <div style={{ width: '100%', height: 6, background: '#f0ebff', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg,#6c47ff,#a78bfa)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, lineHeight: 1.5, color: '#1a1a1a' }}>{q.question}</p>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => select(i)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: 12, border: answers[current] === i ? '2px solid #6c47ff' : '1.5px solid #f0f0f0', background: answers[current] === i ? '#f0ebff' : '#fff', fontSize: 14, fontWeight: answers[current] === i ? 700 : 400, marginBottom: 10, cursor: 'pointer', transition: 'all .15s' }}>
            <span style={{ color: '#6c47ff', fontWeight: 800, marginRight: 10 }}>{String.fromCharCode(65+i)}</span>{opt}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {current > 0 && <button onClick={() => setCurrent(c => c-1)} style={{ flex: 1, padding: 13, borderRadius: 12, border: '1.5px solid #e0d9ff', background: '#fff', color: '#6c47ff', fontSize: 14, fontWeight: 700 }}>← Back</button>}
          {current < quiz.questions.length - 1
            ? <button onClick={() => setCurrent(c => c+1)} disabled={answers[current] === null} style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: answers[current] === null ? '#e0d9ff' : '#6c47ff', color: '#fff', fontSize: 14, fontWeight: 700 }}>Next →</button>
            : <button onClick={submit} disabled={submitting || answers.includes(null)} style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: answers.includes(null) ? '#e0d9ff' : '#6c47ff', color: '#fff', fontSize: 14, fontWeight: 700 }}>{submitting ? 'Submitting...' : 'Submit Quiz ✓'}</button>
          }
        </div>
      </div>
    </div>
  )
}