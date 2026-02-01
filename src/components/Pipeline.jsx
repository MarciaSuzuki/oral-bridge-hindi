import { useState } from 'react'
import { AGENT_INFO } from '../prompts/index.js'
import { useAuth } from '../context/AuthContext'

// Simple Markdown renderer for tables and formatting
function FormattedOutput({ content }) {
  if (!content) return null;
  
  // Process the content into formatted HTML
  const formatContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];
    let tableHeaders = [];
    
    const processLine = (line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={index} style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#1f2937', fontSize: '1.1rem' }}>{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#111827', fontSize: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>{line.slice(3)}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={index} style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#111827', fontSize: '1.4rem' }}>{line.slice(2)}</h2>;
      }
      
      // Bold text
      let processedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic text
      processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
      
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={index} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: processedLine.slice(2) }} />;
      }
      
      // Numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
      if (numberedMatch) {
        return <li key={index} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />;
      }
      
      // Regular paragraph
      if (line.trim()) {
        return <p key={index} style={{ marginBottom: '0.5rem', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: processedLine }} />;
      }
      
      return <br key={index} />;
    };
    
    // Process tables specially
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Detect table start (line with |)
      if (line.includes('|') && line.trim().startsWith('|')) {
        const tableData = [];
        let headers = [];
        let j = i;
        
        // Collect all table rows
        while (j < lines.length && lines[j].includes('|')) {
          const row = lines[j].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
          if (row.length > 0) {
            // Skip separator rows (---)
            if (!row[0].match(/^[-:]+$/)) {
              if (headers.length === 0) {
                headers = row;
              } else {
                tableData.push(row);
              }
            }
          }
          j++;
        }
        
        // Render table
        if (headers.length > 0) {
          elements.push(
            <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: '1rem', marginTop: '0.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    {headers.map((h, hi) => (
                      <th key={hi} style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #d1d5db', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#f9fafb' }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        
        i = j;
        continue;
      }
      
      elements.push(processLine(line, i));
      i++;
    }
    
    return elements;
  };
  
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {formatContent(content)}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  inputSection: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  hint: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginTop: '0.5rem'
  },
  pipelineStages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  stageCard: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  stageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer'
  },
  stageInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  stageNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  stagePending: {
    background: '#f3f4f6',
    color: '#6b7280'
  },
  stageActive: {
    background: '#dbeafe',
    color: '#2563eb'
  },
  stageComplete: {
    background: '#dcfce7',
    color: '#16a34a'
  },
  stageError: {
    background: '#fee2e2',
    color: '#dc2626'
  },
  stageName: {
    fontWeight: '600'
  },
  stageDescription: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  stageStatus: {
    fontSize: '0.85rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px'
  },
  stageContent: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    background: '#fafafa'
  },
  outputBox: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '1.25rem',
    maxHeight: '500px',
    overflow: 'auto',
    fontSize: '0.95rem',
    lineHeight: '1.6'
  },
  editBox: {
    width: '100%',
    minHeight: '300px',
    padding: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'ui-monospace, monospace',
    resize: 'vertical',
    lineHeight: '1.5'
  },
  feedbackBox: {
    width: '100%',
    minHeight: '80px',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginTop: '0.5rem'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '1rem'
  },
  tab: {
    padding: '0.75rem 1.25rem',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px'
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb'
  },
  feedbackSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#fffbeb',
    borderRadius: '6px',
    border: '1px solid #fcd34d'
  },
  successButton: {
    background: '#16a34a',
    color: 'white'
  },
  audioSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f0fdf4',
    borderRadius: '6px',
    border: '1px solid #86efac'
  },
  buttonRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none'
  },
  primaryButton: {
    background: '#2563eb',
    color: 'white'
  },
  secondaryButton: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginRight: '0.5rem'
  },
  errorMessage: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '6px',
    marginTop: '1rem',
    fontSize: '0.9rem'
  },
  usageInfo: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '0.5rem'
  }
}

// Add keyframes for spinner
const spinKeyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`

export default function Pipeline() {
  const { user } = useAuth()
  const [sourceInput, setSourceInput] = useState('')
  const [outputs, setOutputs] = useState({})
  const [editedOutputs, setEditedOutputs] = useState({})
  const [expandedStage, setExpandedStage] = useState(null)
  const [runningAgent, setRunningAgent] = useState(null)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({})
  const [viewMode, setViewMode] = useState({}) // 'formatted' or 'edit'
  
  // ElevenLabs state
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [generatingFull, setGeneratingFull] = useState(false)
  const [generatingScripture, setGeneratingScripture] = useState(false)
  const [generatingFraming, setGeneratingFraming] = useState(false)
  const [fullAudioUrl, setFullAudioUrl] = useState(null)
  const [scriptureAudioUrl, setScriptureAudioUrl] = useState(null)
  const [framingAudioUrl, setFramingAudioUrl] = useState(null)
  const [ttsFullText, setTtsFullText] = useState('')
  const [ttsScriptureText, setTtsScriptureText] = useState('')
  const [ttsFramingText, setTtsFramingText] = useState('')
  const [ttsTab, setTtsTab] = useState('full') // 'full', 'scripture', 'framing'

  const getStageStatus = (agentId) => {
    if (runningAgent === agentId) return 'active'
    if (outputs[`agent${agentId}`]) return 'complete'
    if (agentId === 1 && sourceInput.trim()) return 'ready'
    if (agentId > 1 && outputs[`agent${agentId - 1}`]) return 'ready'
    return 'pending'
  }

  const getStageStyle = (status) => {
    switch (status) {
      case 'active': return styles.stageActive
      case 'complete': return styles.stageComplete
      case 'error': return styles.stageError
      case 'ready': return { ...styles.stagePending, background: '#fef3c7', color: '#92400e' }
      default: return styles.stagePending
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Running...'
      case 'complete': return 'Complete'
      case 'ready': return 'Ready'
      default: return 'Waiting'
    }
  }

  const runAgent = async (agentId, withFeedback = false) => {
    setError(null)
    setRunningAgent(agentId)
    setExpandedStage(agentId)

    try {
      // Use edited output if available, otherwise original
      const getPreviousOutput = (id) => {
        return editedOutputs[`agent${id}`] || outputs[`agent${id}`]
      }

      let inputText = agentId === 1 ? sourceInput : getPreviousOutput(agentId - 1)
      
      // Add feedback if re-running with feedback
      if (withFeedback && feedback[`agent${agentId}`]) {
        inputText = `Previous output:\n${getPreviousOutput(agentId)}\n\nUser feedback for revision:\n${feedback[`agent${agentId}`]}\n\nPlease revise the output based on this feedback.`
      }

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          input: inputText,
          previousOutputs: { ...outputs, ...editedOutputs }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Agent request failed')
      }

      setOutputs(prev => ({
        ...prev,
        [`agent${agentId}`]: data.output,
        [`agent${agentId}_usage`]: data.usage
      }))
      
      // Clear feedback after successful run
      setFeedback(prev => ({ ...prev, [`agent${agentId}`]: '' }))
      // Reset view to formatted
      setViewMode(prev => ({ ...prev, [agentId]: 'formatted' }))

    } catch (err) {
      setError(`Agent ${agentId} error: ${err.message}`)
    } finally {
      setRunningAgent(null)
    }
  }

  const handleEditChange = (agentId, value) => {
    setEditedOutputs(prev => ({
      ...prev,
      [`agent${agentId}`]: value
    }))
  }

  const getEffectiveOutput = (agentId) => {
    return editedOutputs[`agent${agentId}`] || outputs[`agent${agentId}`]
  }

  // Parse Agent 5 output to extract scripts
  const parseAgent5Output = (output) => {
    if (!output) return { fullScript: '', scriptureContent: '', framingContent: '' }
    
    let fullScript = ''
    let scriptureContent = ''
    let framingContent = ''
    
    // Extract Full Script (Output 1)
    const output1Match = output.match(/Output 1:[\s\S]*?```([\s\S]*?)```/i)
    if (output1Match) {
      fullScript = output1Match[1].trim()
    }
    
    // Extract Scripture Content (File A from Output 2)
    const fileAMatch = output.match(/File A:[\s\S]*?```([\s\S]*?)```/i)
    if (fileAMatch) {
      scriptureContent = fileAMatch[1].trim()
    }
    
    // Extract Framing Content (File B from Output 2)
    const fileBMatch = output.match(/File B:[\s\S]*?```([\s\S]*?)```/i)
    if (fileBMatch) {
      framingContent = fileBMatch[1].trim()
    }
    
    // Fallback: if no code blocks, try to find content another way
    if (!fullScript && !scriptureContent) {
      // Try without code blocks
      const simpleOutput1 = output.match(/Output 1:[^\n]*\n([\s\S]*?)(?=Output 2:|$)/i)
      if (simpleOutput1) {
        fullScript = simpleOutput1[1].replace(/```/g, '').trim()
      }
    }
    
    return { fullScript, scriptureContent, framingContent }
  }

  const generateAudio = async (textType = 'full') => {
    if (!elevenLabsKey) {
      setError('Please enter your ElevenLabs API key')
      return
    }
    
    const agent5Output = getEffectiveOutput(5)
    const parsed = parseAgent5Output(agent5Output)
    
    let textToSpeak = ''
    let settings = {}
    let filename = ''
    
    switch (textType) {
      case 'scripture':
        textToSpeak = ttsScriptureText || parsed.scriptureContent
        settings = { stability: 0.55, similarity_boost: 0.75, style: 0.10 }
        filename = 'scripture-content.mp3'
        setGeneratingScripture(true)
        break
      case 'framing':
        textToSpeak = ttsFramingText || parsed.framingContent
        settings = { stability: 0.75, similarity_boost: 0.70, style: 0.00 }
        filename = 'performance-framing.mp3'
        setGeneratingFraming(true)
        break
      default:
        textToSpeak = ttsFullText || parsed.fullScript
        settings = { stability: 0.60, similarity_boost: 0.75, style: 0.05 }
        filename = 'full-script.mp3'
        setGeneratingFull(true)
    }
    
    if (!textToSpeak.trim()) {
      setError(`No ${textType} text found. Please check Agent 5 output or enter text manually.`)
      setGeneratingFull(false)
      setGeneratingScripture(false)
      setGeneratingFraming(false)
      return
    }
    
    setError(null)
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey
        },
        body: JSON.stringify({
          text: textToSpeak.slice(0, 5000),
          model_id: 'eleven_multilingual_v2',
          voice_settings: settings
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail?.message || errorData.detail || 'ElevenLabs API error')
      }
      
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      
      switch (textType) {
        case 'scripture':
          setScriptureAudioUrl(url)
          break
        case 'framing':
          setFramingAudioUrl(url)
          break
        default:
          setFullAudioUrl(url)
      }
      
    } catch (err) {
      setError(`Audio generation error: ${err.message}`)
    } finally {
      setGeneratingFull(false)
      setGeneratingScripture(false)
      setGeneratingFraming(false)
    }
  }

  const runFullPipeline = async () => {
    for (let i = 1; i <= 5; i++) {
      if (i === 1 && !sourceInput.trim()) {
        setError('Please enter a source passage first')
        return
      }
      await runAgent(i)
      if (error) break
    }
  }

  const resetPipeline = () => {
    setOutputs({})
    setEditedOutputs({})
    setError(null)
    setExpandedStage(null)
    setFeedback({})
    setViewMode({})
    setFullAudioUrl(null)
    setScriptureAudioUrl(null)
    setFramingAudioUrl(null)
    setTtsFullText('')
    setTtsScriptureText('')
    setTtsFramingText('')
  }

  return (
    <div style={styles.container}>
      <style>{spinKeyframes}</style>
      
      {/* Source Input */}
      <div style={styles.inputSection}>
        <label style={styles.label}>Source Passage</label>
        <textarea
          style={styles.textarea}
          value={sourceInput}
          onChange={(e) => setSourceInput(e.target.value)}
          placeholder="Enter the Biblical passage reference and/or source text...&#10;&#10;Example:&#10;John 1:1-3&#10;&#10;Or paste the Greek/Hebrew text directly."
        />
        <p style={styles.hint}>
          Enter a passage reference (e.g., "John 1:1-5") or paste the source text directly.
        </p>
        <div style={styles.buttonRow}>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...((!sourceInput.trim() || runningAgent) ? styles.disabledButton : {})
            }}
            onClick={() => runAgent(1)}
            disabled={!sourceInput.trim() || runningAgent}
          >
            {runningAgent === 1 && <span style={styles.spinner} />}
            Start Pipeline
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              ...((!sourceInput.trim() || runningAgent) ? styles.disabledButton : {})
            }}
            onClick={runFullPipeline}
            disabled={!sourceInput.trim() || runningAgent}
          >
            Run All Agents
          </button>
          {Object.keys(outputs).length > 0 && (
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={resetPipeline}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Pipeline Stages */}
      <div style={styles.pipelineStages}>
        {AGENT_INFO.map((agent) => {
          const status = getStageStatus(agent.id)
          const isExpanded = expandedStage === agent.id
          const hasOutput = outputs[`agent${agent.id}`]

          return (
            <div key={agent.id} style={styles.stageCard}>
              <div 
                style={styles.stageHeader}
                onClick={() => setExpandedStage(isExpanded ? null : agent.id)}
              >
                <div style={styles.stageInfo}>
                  <div style={{ ...styles.stageNumber, ...getStageStyle(status) }}>
                    {agent.id}
                  </div>
                  <div>
                    <div style={styles.stageName}>{agent.name}</div>
                    <div style={styles.stageDescription}>{agent.description}</div>
                  </div>
                </div>
                <div style={{
                  ...styles.stageStatus,
                  ...getStageStyle(status)
                }}>
                  {getStatusText(status)}
                </div>
              </div>

              {isExpanded && (
                <div style={styles.stageContent}>
                  {hasOutput ? (
                    <>
                      {/* View/Edit Tabs */}
                      <div style={styles.tabContainer}>
                        <button
                          style={{
                            ...styles.tab,
                            ...(viewMode[agent.id] !== 'edit' ? styles.activeTab : {})
                          }}
                          onClick={() => setViewMode(prev => ({ ...prev, [agent.id]: 'formatted' }))}
                        >
                          📄 Formatted View
                        </button>
                        <button
                          style={{
                            ...styles.tab,
                            ...(viewMode[agent.id] === 'edit' ? styles.activeTab : {})
                          }}
                          onClick={() => {
                            setViewMode(prev => ({ ...prev, [agent.id]: 'edit' }))
                            if (!editedOutputs[`agent${agent.id}`]) {
                              setEditedOutputs(prev => ({ ...prev, [`agent${agent.id}`]: outputs[`agent${agent.id}`] }))
                            }
                          }}
                        >
                          ✏️ Edit Output
                        </button>
                      </div>
                      
                      {/* Output Display */}
                      {viewMode[agent.id] === 'edit' ? (
                        <textarea
                          style={styles.editBox}
                          value={editedOutputs[`agent${agent.id}`] || outputs[`agent${agent.id}`]}
                          onChange={(e) => handleEditChange(agent.id, e.target.value)}
                          placeholder="Edit the output here..."
                        />
                      ) : (
                        <div style={styles.outputBox}>
                          <FormattedOutput content={getEffectiveOutput(agent.id)} />
                        </div>
                      )}
                      
                      {editedOutputs[`agent${agent.id}`] && editedOutputs[`agent${agent.id}`] !== outputs[`agent${agent.id}`] && (
                        <p style={{ color: '#059669', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          ✓ You have edited this output. Your changes will be used for the next agent.
                        </p>
                      )}
                      
                      {outputs[`agent${agent.id}_usage`] && (
                        <div style={styles.usageInfo}>
                          Tokens: {outputs[`agent${agent.id}_usage`].inputTokens} in / {outputs[`agent${agent.id}_usage`].outputTokens} out
                        </div>
                      )}
                      
                      {/* Feedback Section for Re-runs */}
                      <div style={styles.feedbackSection}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                          💬 Feedback for Re-run (optional)
                        </label>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          Add specific instructions if you want the agent to revise its output.
                        </p>
                        <textarea
                          style={styles.feedbackBox}
                          value={feedback[`agent${agent.id}`] || ''}
                          onChange={(e) => setFeedback(prev => ({ ...prev, [`agent${agent.id}`]: e.target.value }))}
                          placeholder="E.g., 'Make the oral cues more natural' or 'Add more detail to section 4'"
                        />
                      </div>
                      
                      {/* ElevenLabs Integration for Agent 5 */}
                      {agent.id === 5 && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderRadius: '8px', border: '1px solid #86efac' }}>
                          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#166534' }}>
                            🔊 ElevenLabs Audio Generation
                          </h3>
                          <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Generate audio for Scripture content and Performance Framing separately, with optimized settings for each.
                          </p>
                          
                          {/* API Key Input */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                              ElevenLabs API Key
                            </label>
                            <input
                              type="password"
                              placeholder="Enter your ElevenLabs API key (from elevenlabs.io)"
                              value={elevenLabsKey}
                              onChange={(e) => setElevenLabsKey(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.6rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.9rem'
                              }}
                            />
                          </div>
                          
                          {/* TTS Tabs */}
                          <div style={{ display: 'flex', borderBottom: '2px solid #d1fae5', marginBottom: '1rem' }}>
                            {[
                              { id: 'full', label: '📜 Full Script', desc: 'Complete audio' },
                              { id: 'scripture', label: '📖 Scripture Only', desc: 'Biblical text' },
                              { id: 'framing', label: '🎭 Framing Only', desc: 'Oral cues' }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => {
                                  setTtsTab(tab.id)
                                  // Auto-populate text from Agent 5 output
                                  const parsed = parseAgent5Output(getEffectiveOutput(5))
                                  if (tab.id === 'full' && !ttsFullText) setTtsFullText(parsed.fullScript)
                                  if (tab.id === 'scripture' && !ttsScriptureText) setTtsScriptureText(parsed.scriptureContent)
                                  if (tab.id === 'framing' && !ttsFramingText) setTtsFramingText(parsed.framingContent)
                                }}
                                style={{
                                  padding: '0.75rem 1rem',
                                  border: 'none',
                                  background: ttsTab === tab.id ? '#dcfce7' : 'transparent',
                                  borderBottom: ttsTab === tab.id ? '2px solid #16a34a' : '2px solid transparent',
                                  marginBottom: '-2px',
                                  cursor: 'pointer',
                                  fontWeight: ttsTab === tab.id ? '600' : '400',
                                  color: ttsTab === tab.id ? '#166534' : '#6b7280',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                          
                          {/* Full Script Tab */}
                          {ttsTab === 'full' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Full Script Text</label>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  Settings: Stability 60% • Clarity 75% • Style 5%
                                </span>
                              </div>
                              <textarea
                                value={ttsFullText}
                                onChange={(e) => setTtsFullText(e.target.value)}
                                placeholder="The full script will appear here. You can edit it before generating audio."
                                style={{
                                  width: '100%',
                                  minHeight: '150px',
                                  padding: '0.75rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontFamily: 'inherit',
                                  lineHeight: '1.6'
                                }}
                              />
                              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button
                                  onClick={() => generateAudio('full')}
                                  disabled={generatingFull || !elevenLabsKey || !ttsFullText.trim()}
                                  style={{
                                    ...styles.button,
                                    background: '#16a34a',
                                    color: 'white',
                                    ...(generatingFull || !elevenLabsKey || !ttsFullText.trim() ? styles.disabledButton : {})
                                  }}
                                >
                                  {generatingFull ? '⏳ Generating...' : '🎧 Generate Full Audio'}
                                </button>
                                <button
                                  onClick={() => {
                                    const parsed = parseAgent5Output(getEffectiveOutput(5))
                                    setTtsFullText(parsed.fullScript)
                                  }}
                                  style={{ ...styles.button, ...styles.secondaryButton }}
                                >
                                  🔄 Reload from Agent 5
                                </button>
                              </div>
                              {fullAudioUrl && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                  <p style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>✅ Full Script Audio:</p>
                                  <audio controls src={fullAudioUrl} style={{ width: '100%' }} />
                                  <a href={fullAudioUrl} download="full-script.mp3" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
                                    ⬇️ Download MP3
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Scripture Tab */}
                          {ttsTab === 'scripture' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Scripture Content (Segment A)</label>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  Settings: Stability 55% • Clarity 75% • Style 10% (warmer)
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '0.5rem', background: '#dcfce7', padding: '0.5rem', borderRadius: '4px' }}>
                                💡 Scripture content uses warmer settings with slight style variation for theological gravitas.
                              </p>
                              <textarea
                                value={ttsScriptureText}
                                onChange={(e) => setTtsScriptureText(e.target.value)}
                                placeholder="Scripture content (biblical text, dialogue) will appear here."
                                style={{
                                  width: '100%',
                                  minHeight: '150px',
                                  padding: '0.75rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontFamily: 'inherit',
                                  lineHeight: '1.6'
                                }}
                              />
                              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button
                                  onClick={() => generateAudio('scripture')}
                                  disabled={generatingScripture || !elevenLabsKey || !ttsScriptureText.trim()}
                                  style={{
                                    ...styles.button,
                                    background: '#2563eb',
                                    color: 'white',
                                    ...(generatingScripture || !elevenLabsKey || !ttsScriptureText.trim() ? styles.disabledButton : {})
                                  }}
                                >
                                  {generatingScripture ? '⏳ Generating...' : '📖 Generate Scripture Audio'}
                                </button>
                                <button
                                  onClick={() => {
                                    const parsed = parseAgent5Output(getEffectiveOutput(5))
                                    setTtsScriptureText(parsed.scriptureContent)
                                  }}
                                  style={{ ...styles.button, ...styles.secondaryButton }}
                                >
                                  🔄 Reload from Agent 5
                                </button>
                              </div>
                              {scriptureAudioUrl && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                  <p style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>✅ Scripture Audio:</p>
                                  <audio controls src={scriptureAudioUrl} style={{ width: '100%' }} />
                                  <a href={scriptureAudioUrl} download="scripture-content.mp3" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
                                    ⬇️ Download MP3
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Framing Tab */}
                          {ttsTab === 'framing' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Performance Framing (Segment B)</label>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  Settings: Stability 75% • Clarity 70% • Style 0% (neutral)
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '0.5rem', background: '#dcfce7', padding: '0.5rem', borderRadius: '4px' }}>
                                💡 Framing uses more consistent settings for a neutral, invitational tone that contrasts with Scripture.
                              </p>
                              <textarea
                                value={ttsFramingText}
                                onChange={(e) => setTtsFramingText(e.target.value)}
                                placeholder="Performance framing (oral cues, transitions) will appear here."
                                style={{
                                  width: '100%',
                                  minHeight: '100px',
                                  padding: '0.75rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontFamily: 'inherit',
                                  lineHeight: '1.6'
                                }}
                              />
                              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button
                                  onClick={() => generateAudio('framing')}
                                  disabled={generatingFraming || !elevenLabsKey || !ttsFramingText.trim()}
                                  style={{
                                    ...styles.button,
                                    background: '#7c3aed',
                                    color: 'white',
                                    ...(generatingFraming || !elevenLabsKey || !ttsFramingText.trim() ? styles.disabledButton : {})
                                  }}
                                >
                                  {generatingFraming ? '⏳ Generating...' : '🎭 Generate Framing Audio'}
                                </button>
                                <button
                                  onClick={() => {
                                    const parsed = parseAgent5Output(getEffectiveOutput(5))
                                    setTtsFramingText(parsed.framingContent)
                                  }}
                                  style={{ ...styles.button, ...styles.secondaryButton }}
                                >
                                  🔄 Reload from Agent 5
                                </button>
                              </div>
                              {framingAudioUrl && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                  <p style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>✅ Framing Audio:</p>
                                  <audio controls src={framingAudioUrl} style={{ width: '100%' }} />
                                  <a href={framingAudioUrl} download="performance-framing.mp3" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem' }}>
                                    ⬇️ Download MP3
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Summary of all generated audio */}
                          {(fullAudioUrl || scriptureAudioUrl || framingAudioUrl) && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fefce8', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#854d0e' }}>📁 Generated Audio Files</h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {fullAudioUrl && (
                                  <a href={fullAudioUrl} download="full-script.mp3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '4px', color: '#166534', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #d1d5db' }}>
                                    📜 Full Script
                                  </a>
                                )}
                                {scriptureAudioUrl && (
                                  <a href={scriptureAudioUrl} download="scripture-content.mp3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '4px', color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #d1d5db' }}>
                                    📖 Scripture
                                  </a>
                                )}
                                {framingAudioUrl && (
                                  <a href={framingAudioUrl} download="performance-framing.mp3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '4px', color: '#7c3aed', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #d1d5db' }}>
                                    🎭 Framing
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#6b7280' }}>
                      {status === 'ready' 
                        ? `Ready to run. Click below to start Agent ${agent.id}.`
                        : `Waiting for Agent ${agent.id - 1} to complete.`}
                    </p>
                  )}
                  
                  <div style={styles.buttonRow}>
                    {hasOutput && feedback[`agent${agent.id}`] ? (
                      <button
                        style={{
                          ...styles.button,
                          background: '#f59e0b',
                          color: 'white',
                          ...(runningAgent ? styles.disabledButton : {})
                        }}
                        onClick={() => runAgent(agent.id, true)}
                        disabled={runningAgent}
                      >
                        {runningAgent === agent.id && <span style={styles.spinner} />}
                        🔄 Re-run with Feedback
                      </button>
                    ) : (
                      <button
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          ...((status !== 'ready' && status !== 'complete') || runningAgent ? styles.disabledButton : {})
                        }}
                        onClick={() => runAgent(agent.id)}
                        disabled={(status !== 'ready' && status !== 'complete') || runningAgent}
                      >
                        {runningAgent === agent.id && <span style={styles.spinner} />}
                        {hasOutput ? '🔄 Re-run' : '▶️ Run'} Agent {agent.id}
                      </button>
                    )}
                    
                    {agent.id < 5 && hasOutput && (
                      <button
                        style={{
                          ...styles.button,
                          ...styles.successButton,
                          ...(runningAgent ? styles.disabledButton : {})
                        }}
                        onClick={() => runAgent(agent.id + 1)}
                        disabled={runningAgent}
                      >
                        ✓ Approve & Continue to Agent {agent.id + 1}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
