import { useState, useEffect } from 'react'
import axios from 'axios'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'
const API = 'https://fondness-chafe-campfire.ngrok-free.dev' // <-- change this to your backend URL

const s = {
  wrap: { minHeight: '100vh', background: '#f8f9fb' },
  nav: { background: '#fff', borderBottom: '1px solid #ede9fe', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: { fontWeight: 800, fontSize: 22, color: '#6c47ff', letterSpacing: '-0.5px' },
  logoBadge: { background: '#ede9fe', color: '#6c47ff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 },
  main: { maxWidth: 1200, margin: '0 auto', padding: '36px 24px' },
  pageTitle: { fontSize: 30, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 },
  pageSub: { color: '#888', fontSize: 15, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: { background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', padding: 28, boxShadow: '0 2px 12px rgba(108,71,255,0.04)' },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 18, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 },
  tabRow: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: (active) => ({ padding: '8px 18px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: active ? '#6c47ff' : '#f3f0ff', color: active ? '#fff' : '#6c47ff', transition: 'all .2s' }),
  input: { width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e8e0ff', fontSize: 14, marginBottom: 12, outline: 'none', transition: 'border .2s', background: '#fdfcff' },
  uploadArea: (hovering) => ({ border: hovering ? '2px dashed #6c47ff' : '2px dashed #c4b5fd', borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: hovering ? '#f5f0ff' : '#faf8ff', transition: 'all .2s', marginBottom: 16 }),
  uploadIcon: { fontSize: 44, marginBottom: 12 },
  uploadTitle: { fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1a1a1a' },
  uploadSub: { color: '#999', fontSize: 13 },
  btn: (disabled) => ({ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: disabled ? '#e0d9ff' : '#6c47ff', color: '#fff', fontSize: 15, fontWeight: 700, transition: 'all .2s', cursor: disabled ? 'not-allowed' : 'pointer' }),
  progressWrap: { marginTop: 14 },
  progressLabel: { fontSize: 13, color: '#6c47ff', marginBottom: 6, fontWeight: 500 },
  progressBar: { width: '100%', height: 8, background: '#f0ebff', borderRadius: 99, overflow: 'hidden' },
  progressFill: (p) => ({ height: '100%', width: p + '%', background: 'linear-gradient(90deg, #6c47ff, #a78bfa)', borderRadius: 99, transition: 'width 0.5s ease' }),
  resultCard: { background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', padding: 28, marginTop: 20, boxShadow: '0 2px 12px rgba(108,71,255,0.04)' },
  langBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 99, background: '#d1fae5', color: '#065f46', fontSize: 12, fontWeight: 700, marginBottom: 14 },
  summaryText: { fontSize: 14, color: '#444', lineHeight: 1.8, marginBottom: 16 },
  kwWrap: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  kw: { padding: '5px 14px', borderRadius: 99, background: '#f0ebff', color: '#6c47ff', fontSize: 12, fontWeight: 600 },
  shareBox: { background: '#f9f7ff', borderRadius: 14, padding: 18, border: '1px solid #ede9fe' },
  shareTitle: { fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  shareLink: { fontFamily: 'monospace', fontSize: 13, color: '#6c47ff', wordBreak: 'break-all', marginBottom: 12 },
  shareBtns: { display: 'flex', gap: 10 },
  copyBtn: { flex: 1, padding: '9px', borderRadius: 10, border: '1.5px solid #6c47ff', background: '#fff', color: '#6c47ff', fontSize: 13, fontWeight: 700 },
  waBtn: { flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: '#25d366', color: '#fff', fontSize: 13, fontWeight: 700 },
  qWrap: { marginTop: 20 },
  qCard: { background: '#faf8ff', borderRadius: 12, padding: 16, marginBottom: 10, border: '1px solid #ede9fe' },
  qText: { fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1a1a1a' },
  qOpt: (correct) => ({ fontSize: 13, padding: '5px 0', color: correct ? '#6c47ff' : '#555', fontWeight: correct ? 700 : 400 }),
  videoList: { display: 'flex', flexDirection: 'column', gap: 2 },
  videoItem: (sel) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', background: sel ? '#f0ebff' : 'transparent', border: sel ? '1.5px solid #c4b5fd' : '1.5px solid transparent', transition: 'all .15s' }),
  videoName: { fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 2 },
  videoMeta: { fontSize: 12, color: '#aaa' },
  arrow: { color: '#6c47ff', fontWeight: 700, fontSize: 14 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 },
  stat: (color) => ({ background: color + '15', borderRadius: 12, padding: '14px', textAlign: 'center', border: '1px solid ' + color + '30' }),
  statNum: (color) => ({ fontSize: 26, fontWeight: 800, color: color }),
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, fontWeight: 500 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f9f7ff', color: '#888', fontSize: 11, fontWeight: 700, borderBottom: '1px solid #f0f0f0', textTransform: 'uppercase', letterSpacing: '0.04em' },
  td: { padding: '12px 14px', borderBottom: '1px solid #f8f8f8', color: '#1a1a1a' },
  grade: (g) => ({ display: 'inline-block', padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: g==='A'?'#d1fae5':g==='B'?'#dbeafe':g==='C'?'#fef9c3':'#fee2e2', color: g==='A'?'#065f46':g==='B'?'#1e40af':g==='C'?'#854d0e':'#991b1b' }),
  empty: { textAlign: 'center', padding: '48px 0', color: '#ccc', fontSize: 14 },
  pdfBtn: { padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e0d9ff', background: '#fff', color: '#6c47ff', fontSize: 13, fontWeight: 700, marginTop: 12 },
}

const getGrade = (pct) => pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'F'

export default function App() {
  const [tab, setTab] = useState('file')
  const [file, setFile] = useState(null)
  const [ytUrl, setYtUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState(null)
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState(null)
  const [hovering, setHovering] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchVideos() }, [])

  const fetchVideos = async () => {
    try { const r = await axios.get(API + '/api/videos'); setVideos(r.data) } catch(e) {}
  }

  const fetchResults = async (vid) => {
    try { const r = await axios.get(API + '/api/results/' + vid); setResults(r.data) } catch(e) {}
  }

  const simulate = (labels) => {
    let i = 0
    const steps = [15, 30, 55, 80, 95]
    labels.forEach((label, idx) => {
      setTimeout(() => { setProgress(steps[idx]); setProgressLabel(label) }, idx * 800)
    })
  }

  const handleUpload = async () => {
    if (tab === 'file' && !file) return
    if (tab === 'youtube' && !ytUrl.trim()) return
    setLoading(true); setResult(null); setProgress(5)
    simulate(['Uploading...', 'Transcribing with Whisper AI...', 'Summarizing with BART...', 'Extracting keywords...', 'Generating quiz with T5...'])
    try {
      let r
      if (tab === 'file') {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('title', title || file.name)
        r = await axios.post(API + '/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 })
      } else {
        r = await axios.post(API + '/api/upload-youtube', { url: ytUrl, title }, { timeout: 300000 })
      }
      setProgress(100); setProgressLabel('Done!')
      setResult(r.data)
      fetchVideos()
    } catch(e) {
      alert('Error: ' + (e.response?.data?.error || e.message))
    }
    setLoading(false)
  }

  const copyLink = (link) => {
    navigator.clipboard.writeText(link)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const shareWA = (link, t) => {
    window.open('https://wa.me/?text=' + encodeURIComponent('Attempt this quiz on "' + t + '": ' + link))
  }

  const selectVideo = (v) => {
    setSelected(v.id); setResult(null); fetchResults(v.id)
  }

  const exportPdf = async (vid) => {
  const response = await axios.get(API + '/api/export/' + vid, {
    responseType: 'blob',
    headers: { 'ngrok-skip-browser-warning': 'true' }
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', vid + '_quiz.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
}

  return (
    <div style={s.wrap}>
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.logo}>LectureAI</span>
          <span style={s.logoBadge}>Admin</span>
        </div>
        <span style={{ fontSize: 13, color: '#aaa' }}>Lecture Summarizer & Quiz Generator</span>
      </nav>

      <div style={s.main}>
        <h1 style={s.pageTitle}>Admin Dashboard</h1>
        <p style={s.pageSub}>Upload a lecture or paste a YouTube link — get AI summary, keywords, and shareable quiz instantly.</p>

        <div style={s.grid}>
          <div>
            <div style={s.card}>
              <p style={s.cardTitle}>📤 Upload Lecture</p>
              <div style={s.tabRow}>
                <button style={s.tab(tab==='file')} onClick={() => setTab('file')}>Audio / Video File</button>
                <button style={s.tab(tab==='youtube')} onClick={() => setTab('youtube')}>YouTube Link</button>
              </div>
              <input style={s.input} placeholder="Lecture title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
              {tab === 'file' ? (
                <div
                  style={s.uploadArea(hovering)}
                  onDragOver={e => { e.preventDefault(); setHovering(true) }}
                  onDragLeave={() => setHovering(false)}
                  onDrop={e => { e.preventDefault(); setHovering(false); setFile(e.dataTransfer.files[0]) }}
                  onClick={() => document.getElementById('fi').click()}
                >
                  <div style={s.uploadIcon}>🎙️</div>
                  <p style={s.uploadTitle}>{file ? file.name : 'Drop audio or video here'}</p>
                  <p style={s.uploadSub}>mp3, mp4, wav, aiff supported • click to browse</p>
                  <input id="fi" type="file" accept="audio/*,video/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                </div>
              ) : (
                <input style={{ ...s.input, marginBottom: 16 }} placeholder="https://youtube.com/watch?v=..." value={ytUrl} onChange={e => setYtUrl(e.target.value)} />
              )}
              {loading && (
                <div style={s.progressWrap}>
                  <p style={s.progressLabel}>{progressLabel}</p>
                  <div style={s.progressBar}><div style={s.progressFill(progress)} /></div>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <button style={s.btn(loading || (tab==='file'?!file:!ytUrl.trim()))} onClick={handleUpload} disabled={loading || (tab==='file'?!file:!ytUrl.trim())}>
                  {loading ? 'Processing... please wait' : 'Generate Summary + Quiz'}
                </button>
              </div>
            </div>

            {result && (
              <div style={s.resultCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontWeight: 800, fontSize: 17 }}>{result.title}</p>
                  <span style={s.langBadge}>{result.language?.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</p>
                <p style={s.summaryText}>{result.summary}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keywords</p>
                <div style={s.kwWrap}>{result.keywords?.map(k => <span key={k} style={s.kw}>{k}</span>)}</div>
                <div style={s.shareBox}>
                  <p style={s.shareTitle}>Share Quiz Link</p>
                  <p style={s.shareLink}>{result.quiz_link}</p>
                  <div style={s.shareBtns}>
                    <button style={s.copyBtn} onClick={() => copyLink(result.quiz_link)}>{copied ? '✓ Copied!' : 'Copy Link'}</button>
                    <button style={s.waBtn} onClick={() => shareWA(result.quiz_link, result.title)}>Share on WhatsApp</button>
                  </div>
                  <button style={s.pdfBtn} onClick={() => exportPdf(result.video_id)}>Download PDF</button>
                </div>
                <div style={s.qWrap}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#888' }}>Generated Questions ({result.questions?.length})</p>
                  {result.questions?.map((q, i) => (
                    <div key={i} style={s.qCard}>
                      <p style={s.qText}>Q{i+1}. {q.question}</p>
                      {q.options.map((o, j) => (
                        <p key={j} style={s.qOpt(j === q.answer)}>{String.fromCharCode(65+j)}) {o} {j === q.answer ? '✓' : ''}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={s.card}>
              <p style={s.cardTitle}>📚 All Lectures</p>
              {videos.length === 0
                ? <div style={s.empty}>No lectures uploaded yet</div>
                : <div style={s.videoList}>
                    {videos.map(v => (
                      <div key={v.id} style={s.videoItem(selected === v.id)} onClick={() => selectVideo(v)}>
                        <div>
                          <p style={s.videoName}>{v.title}</p>
                          <p style={s.videoMeta}>{v.submissions} submissions · {v.language?.toUpperCase()} · {new Date(v.created_at).toLocaleDateString()}</p>
                        </div>
                        <span style={s.arrow}>→</span>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {results && (
              <div style={{ ...s.card, marginTop: 20 }}>
                <p style={s.cardTitle}>📊 Results — {results.title}</p>
                <div style={s.statGrid}>
                  <div style={s.stat('#6c47ff')}>
                    <div style={s.statNum('#6c47ff')}>{results.total_submissions}</div>
                    <div style={s.statLabel}>Students</div>
                  </div>
                  <div style={s.stat('#f59e0b')}>
                    <div style={s.statNum('#f59e0b')}>{results.average_score}</div>
                    <div style={s.statLabel}>Avg Score</div>
                  </div>
                  <div style={s.stat('#10b981')}>
                    <div style={s.statNum('#10b981')}>{results.students?.filter(s => (s.score/s.total) >= 0.6).length}</div>
                    <div style={s.statLabel}>Passed</div>
                  </div>
                </div>
                {results.students?.length === 0
                  ? <div style={s.empty}>No submissions yet — share the quiz link!</div>
                  : <div style={s.tableWrap}>
                      <table style={s.table}>
                        <thead>
                          <tr>
                            <th style={s.th}>#</th>
                            <th style={s.th}>Name</th>
                            <th style={s.th}>Roll No</th>
                            <th style={s.th}>Score</th>
                            <th style={s.th}>Grade</th>
                            <th style={s.th}>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.students?.map((st, i) => {
                            const pct = Math.round((st.score / st.total) * 100)
                            const g = getGrade(pct)
                            return (
                              <tr key={i}>
                                <td style={s.td}>{i+1}</td>
                                <td style={s.td}><b>{st.student_name}</b></td>
                                <td style={s.td}>{st.roll_no}</td>
                                <td style={s.td}>{st.score}/{st.total} <span style={{color:'#888'}}>({pct}%)</span></td>
                                <td style={s.td}><span style={s.grade(g)}>{g}</span></td>
                                <td style={s.td}>{new Date(st.submitted_at).toLocaleTimeString()}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}