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
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)

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

  const generateAudio = async () => {
    if (!elevenLabsKey) {
      setError('Please enter your ElevenLabs API key')
      return
    }
    
    setGeneratingAudio(true)
    setError(null)
    
    try {
      // Extract the TTS-ready script from Agent 5 output
      const agent5Output = getEffectiveOutput(5)
      // Simple extraction - get text between "Output 1:" and "Output 2:" or end
      let ttsText = agent5Output
      const output1Match = agent5Output.match(/Output 1:[\s\S]*?(?=Output 2:|$)/i)
      if (output1Match) {
        ttsText = output1Match[0].replace(/Output 1:.*?\n/i, '').trim()
      }
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey
        },
        body: JSON.stringify({
          text: ttsText.slice(0, 5000), // Limit to 5000 chars
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail?.message || 'ElevenLabs API error')
      }
      
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
    } catch (err) {
      setError(`Audio generation error: ${err.message}`)
    } finally {
      setGeneratingAudio(false)
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
    setAudioUrl(null)
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
                        <div style={styles.audioSection}>
                          <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                            🔊 Generate Audio with ElevenLabs
                          </label>
                          <input
                            type="password"
                            placeholder="Enter your ElevenLabs API key"
                            value={elevenLabsKey}
                            onChange={(e) => setElevenLabsKey(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              marginBottom: '0.75rem'
                            }}
                          />
                          <button
                            style={{
                              ...styles.button,
                              ...styles.successButton,
                              ...(generatingAudio ? styles.disabledButton : {})
                            }}
                            onClick={generateAudio}
                            disabled={generatingAudio || !elevenLabsKey}
                          >
                            {generatingAudio ? 'Generating Audio...' : '🎧 Generate Audio Preview'}
                          </button>
                          
                          {audioUrl && (
                            <div style={{ marginTop: '1rem' }}>
                              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Audio Preview:</p>
                              <audio controls src={audioUrl} style={{ width: '100%' }} />
                              <a
                                href={audioUrl}
                                download="oral-hindi-preview.mp3"
                                style={{
                                  display: 'inline-block',
                                  marginTop: '0.5rem',
                                  color: '#2563eb',
                                  textDecoration: 'underline'
                                }}
                              >
                                Download Audio
                              </a>
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
