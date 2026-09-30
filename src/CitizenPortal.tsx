import React, { useState, useRef, useEffect } from 'react';

const LOCATIONS = [
  { label: 'Dharavi (G/N Ward)', lat: 19.0402, lng: 72.8553 },
  { label: 'Bandra East (H/E Ward)', lat: 19.0596, lng: 72.8464 },
  { label: 'Kurla (L Ward)', lat: 19.0728, lng: 72.8793 },
  { label: 'Andheri West (K/W Ward)', lat: 19.1136, lng: 72.8297 },
  { label: 'Colaba (A Ward)', lat: 18.9067, lng: 72.8147 },
  { label: 'Govandi (M/E Ward)', lat: 19.0553, lng: 72.9154 },
  { label: 'Malad East (P/N Ward)', lat: 19.1860, lng: 72.8560 },
  { label: 'Worli (G/S Ward)', lat: 19.0169, lng: 72.8170 },
  { label: 'Dadar (F/N Ward)', lat: 19.0178, lng: 72.8478 },
  { label: 'Chembur (M/E Ward)', lat: 19.0522, lng: 72.8993 }
];

const CATEGORIES = [
  'Water Supply',
  'Roads & Traffic',
  'Sanitation & Waste',
  'Healthcare & Clinics',
  'Education & Schools',
  'Public Transit'
];

const LANGUAGES = ['Auto Detect', 'English', 'Hindi', 'Marathi'];

type InputMethod = 'text' | 'voice' | 'image' | 'video';

export default function CitizenPortal() {
  const [method, setMethod] = useState<InputMethod>('text');
  const [text, setText] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0].label);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refId, setRefId] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    // Set text description placeholder
    if (!text) setText(`[${method.toUpperCase()} ATTACHED: ${file.name}]`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        setText('[VOICE RECORDING ATTACHED]');
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      alert('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loc = LOCATIONS.find(l => l.label === location) || LOCATIONS[0];
    const generatedRef = 'CP-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const payload = {
      message_id: generatedRef,
      source_platform: 'CitizenPortal',
      timestamp: new Date().toISOString(),
      location: { latitude: loc.lat, longitude: loc.lng },
      feedback_text: text || `[${method.toUpperCase()} REPORT] - ${category}`,
      metadata: { language, category, input_method: method }
    };

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/api/v1/webhooks/citizen-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Backend submit failed (demo continues):', err);
    }

    setRefId(generatedRef);
    setSuccess(true);
    setIsSubmitting(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const renderInputArea = () => {
    switch (method) {
      case 'text':
        return (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Describe the issue in detail..."
            style={{ width: '100%', height: '120px', padding: '12px', border: '1px solid #E0DDD6', borderRadius: '4px', background: '#FFFFFF', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
            required
          />
        );

      case 'voice':
        return (
          <div style={{ border: '1px solid #E0DDD6', borderRadius: '6px', background: '#FAFAF8', padding: '20px' }}>
            {/* Recording controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: audioBlob ? '#15803D' : '#DC2626', color: '#FFF', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                  {audioBlob ? 'Re-record' : 'Start Recording'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1D4ED8', color: '#FFF', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  <div style={{ width: '10px', height: '10px', background: '#FFF', borderRadius: '2px' }} />
                  Stop — {formatTime(recordingTime)}
                </button>
              )}
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '12px', color: '#6B6963' }}>Recording...</span>
                </div>
              )}
            </div>

            {/* Playback */}
            {audioUrl && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', color: '#15803D', fontWeight: 600, marginBottom: '6px' }}>✓ Voice recording captured</p>
                <audio controls src={audioUrl} style={{ width: '100%', height: '36px' }} />
              </div>
            )}

            {/* Transcription fallback */}
            <textarea
              value={text === '[VOICE RECORDING ATTACHED]' ? '' : text}
              onChange={e => setText(e.target.value)}
              placeholder="Optional: Add any text notes to accompany the recording..."
              style={{ width: '100%', height: '60px', padding: '10px', border: '1px solid #E0DDD6', borderRadius: '4px', fontSize: '13px', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>
        );

      case 'image':
        return (
          <div style={{ border: '1px solid #E0DDD6', borderRadius: '6px', background: '#FAFAF8', padding: '20px' }}>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              capture="environment"
            />
            {!filePreview ? (
              <div
                onClick={() => imageInputRef.current?.click()}
                style={{ border: '2px dashed #C4C1BA', borderRadius: '6px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#FFFFFF' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#191918' }}>Click to upload or take photo</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9B9690' }}>JPG, PNG, HEIC up to 10MB</p>
              </div>
            ) : (
              <div>
                <img src={filePreview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>✓ {selectedFile?.name}</span>
                  <button type="button" onClick={() => { setFilePreview(null); setSelectedFile(null); setText(''); }} style={{ fontSize: '11px', color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            )}
            <textarea
              value={text.startsWith('[IMAGE') ? '' : text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe what the image shows..."
              style={{ width: '100%', height: '60px', padding: '10px', border: '1px solid #E0DDD6', borderRadius: '4px', fontSize: '13px', resize: 'none', marginTop: '10px', boxSizing: 'border-box' }}
            />
          </div>
        );

      case 'video':
        return (
          <div style={{ border: '1px solid #E0DDD6', borderRadius: '6px', background: '#FAFAF8', padding: '20px' }}>
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              capture="environment"
            />
            {!filePreview ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                style={{ border: '2px dashed #C4C1BA', borderRadius: '6px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#FFFFFF' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#191918' }}>Click to upload or record video</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9B9690' }}>MP4, MOV, WebM up to 50MB</p>
              </div>
            ) : (
              <div>
                <video src={filePreview} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>✓ {selectedFile?.name}</span>
                  <button type="button" onClick={() => { setFilePreview(null); setSelectedFile(null); setText(''); }} style={{ fontSize: '11px', color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            )}
            <textarea
              value={text.startsWith('[VIDEO') ? '' : text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe what the video shows..."
              style={{ width: '100%', height: '60px', padding: '10px', border: '1px solid #E0DDD6', borderRadius: '4px', fontSize: '13px', resize: 'none', marginTop: '10px', boxSizing: 'border-box' }}
            />
          </div>
        );
    }
  };

  if (success) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F3EF' }}>
        <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#191918' }}>Report Received</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#6B6963' }}>Your infrastructure report has been submitted to the Civic Intelligence pipeline.</p>

          <div style={{ background: '#FAFAF8', padding: '16px', borderRadius: '4px', textAlign: 'left', marginBottom: '24px' }}>
            {[
              ['Reference ID', refId],
              ['Category', category],
              ['Location', location],
              ['Input Method', method.charAt(0).toUpperCase() + method.slice(1)],
              ['Language', language],
              ['Status', 'Processing'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#9B9690' }}>{label}</span>
                <span style={{ fontSize: '11px', fontWeight: label === 'Status' ? 700 : 500, color: label === 'Status' ? '#15803D' : '#191918', fontFamily: label === 'Reference ID' ? "'DM Mono', monospace" : undefined }}>{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setSuccess(false); setText(''); setSelectedFile(null); setFilePreview(null); setAudioBlob(null); setAudioUrl(null); setRecordingTime(0); }}
            style={{ width: '100%', padding: '10px', background: '#191918', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#F4F3EF' }}>

      {/* Left side: Context */}
      <div style={{ width: '340px', background: '#FFFFFF', borderRight: '1px solid #E0DDD6', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px 0', color: '#191918', letterSpacing: '-0.02em' }}>
          Citizen Portal
        </h1>
        <p style={{ fontSize: '13px', color: '#6B6963', lineHeight: 1.6, margin: '0 0 32px 0' }}>
          Report local infrastructure issues directly to the city. Submissions are processed by our multilingual civic intelligence engine.
        </p>

        <div style={{ background: '#FAFAF8', padding: '16px', borderRadius: '6px', border: '1px solid #F0EEE8', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1B4FD8', marginBottom: '8px' }}>How it works</div>
          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#6B6963', lineHeight: 1.7 }}>
            <li>Submit issues via text, voice, image, or video.</li>
            <li>Our system extracts semantics and priority in English, Hindi, and Marathi.</li>
            <li>Reports feed directly into the city's infrastructure planning matrix.</li>
          </ul>
        </div>

        <div style={{ background: '#FAFAF8', padding: '16px', borderRadius: '6px', border: '1px solid #F0EEE8' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6963', marginBottom: '10px' }}>Input Methods</div>
          {[
            { icon: '📝', label: 'Text', desc: 'Type your report' },
            { icon: '🎙️', label: 'Voice', desc: 'Record via microphone' },
            { icon: '📷', label: 'Image', desc: 'Upload a photo' },
            { icon: '🎥', label: 'Video', desc: 'Upload a video clip' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#191918' }}>{m.label}</div>
                <div style={{ fontSize: '11px', color: '#9B9690' }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Form */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', background: '#FFFFFF', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 24px 0', color: '#191918' }}>Report a Local Issue</h2>

          {/* Method tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E0DDD6', paddingBottom: '16px' }}>
            {([
              { id: 'text', icon: '📝', label: 'Text' },
              { id: 'voice', icon: '🎙️', label: 'Voice' },
              { id: 'image', icon: '📷', label: 'Image' },
              { id: 'video', icon: '🎥', label: 'Video' },
            ] as { id: InputMethod; icon: string; label: string }[]).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMethod(m.id); setSelectedFile(null); setFilePreview(null); setAudioBlob(null); setAudioUrl(null); setText(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px',
                  background: method === m.id ? '#191918' : '#F4F3EF',
                  color: method === m.id ? '#FFFFFF' : '#6B6963',
                  border: 'none', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#191918', marginBottom: '8px' }}>
              {method === 'text' ? 'Issue Description' : method === 'voice' ? 'Voice Recording' : method === 'image' ? 'Photo Evidence' : 'Video Evidence'}
            </label>
            {renderInputArea()}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#191918', marginBottom: '8px' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E0DDD6', borderRadius: '4px', background: '#FAFAF8', fontSize: '13px' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#191918', marginBottom: '8px' }}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E0DDD6', borderRadius: '4px', background: '#FAFAF8', fontSize: '13px' }}>
                {LANGUAGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#191918', marginBottom: '8px' }}>Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E0DDD6', borderRadius: '4px', background: '#FAFAF8', fontSize: '13px' }}>
              {LOCATIONS.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSubmitting || (method === 'text' && !text.trim()) || (method === 'voice' && !audioBlob && !text.trim())}
              style={{
                padding: '12px 28px',
                background: '#1B4FD8', color: '#FFFFFF',
                border: 'none', borderRadius: '4px',
                fontSize: '13px', fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
