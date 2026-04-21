import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ResultPage() {
  const { state } = useLocation()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!state) return
    let count = 0
    const interval = setInterval(() => {
      count += 1
      setDisplay(count)
      if (count >= state.score) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [state])

  if (!state) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p>No result found.</p><br />
      <a href="/" style={{ color: '#6c47ff' }}>Go home</a>
    </div>
  )

  const pct = state.percentage
  const grade = pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'F'
  const msg = pct >= 80 ? 'Excellent work! 🎉' : pct >= 60 ? 'Good job! 👍' : pct >= 40 ? 'Keep practicing! 📚' : 'Better luck next time! 💪'
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#6c47ff' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const gradeBg = pct >= 80 ? '#d1fae5' : pct >= 60 ? '#ede9fe' : pct >= 40 ? '#fef9c3' : '#fee2e2'
  const gradeColor = pct >= 80 ? '#065f46' : pct >= 60 ? '#4c1d95' : pct >= 40 ? '#854d0e' : '#991b1b'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f7ff 0%, #f0ebff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 28, border: '1px solid #ede9fe', padding: 44, width: '100%', maxWidth: 460, textAlign: 'center', boxShadow: '0 8px 40px rgba(108,71,255,0.10)' }}>
        <p style={{ fontWeight: 800, fontSize: 18, color: '#6c47ff', marginBottom: 24 }}>LectureAI</p>
        <div style={{ width: 130, height: 130, borderRadius: '50%', border: '5px solid ' + color, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: color }}>{display}</span>
        </div>
        <p style={{ fontSize: 15, color: '#aaa', marginBottom: 4 }}>out of {state.total} questions</p>
        <p style={{ fontSize: 36, fontWeight: 900, color: '#1a1a1a', marginBottom: 10 }}>{pct}%</p>
        <span style={{ display: 'inline-block', padding: '6px 24px', borderRadius: 99, background: gradeBg, color: gradeColor, fontWeight: 900, fontSize: 22, marginBottom: 14 }}>Grade {grade}</span>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{msg}</p>
        <p style={{ color: '#aaa', fontSize: 14, marginBottom: 28 }}>Hi {state.name}, your result has been recorded.</p>
        <div style={{ background: '#f9f7ff', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: '#555' }}>Correct answers</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>{state.score} ✓</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: '#555' }}>Wrong answers</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>{state.total - state.score} ✗</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#555' }}>Percentage</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#6c47ff' }}>{pct}%</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#ccc' }}>You may close this window now.</p>
      </div>
    </div>
  )
}