import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Pipeline from '../components/Pipeline'

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    color: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem'
  },
  subtitle: {
    fontSize: '0.95rem',
    opacity: '0.9',
    fontWeight: '400'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  email: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.9rem'
  },
  signOutBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'white',
    transition: 'background 0.2s'
  },
  main: {
    padding: '2rem',
    flex: '1'
  },
  infoCard: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    maxWidth: '1000px',
    margin: '0 auto 1.5rem'
  },
  infoTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.75rem'
  },
  infoText: {
    color: '#4b5563',
    lineHeight: '1.6'
  },
  featureList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#374151'
  },
  checkmark: {
    color: '#16a34a',
    fontWeight: 'bold'
  },
  footer: {
    background: '#1f2937',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    padding: '1.25rem 2rem',
    fontSize: '0.85rem'
  },
  footerOrgs: {
    marginBottom: '0.25rem'
  }
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Oral Bridge</h1>
          <p style={styles.subtitle}>An AI-Assisted Pipeline for Hindi Oral Scriptures</p>
        </div>
        <div style={styles.userSection}>
          <span style={styles.email}>{user?.email}</span>
          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Info Card */}
        <div style={styles.infoCard}>
          <h2 style={styles.infoTitle}>Translation Pipeline</h2>
          <p style={styles.infoText}>
            This tool transforms Biblical source texts into natural spoken Hindi, 
            ready for text-to-speech rendering. Each agent handles a specific stage 
            of the translation and verification process. You can review, edit, and 
            provide feedback at each stage.
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              Process vs. Content boundaries
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              Subtraction Rule verification
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              Oral style optimization
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              Theological accuracy check
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              ElevenLabs TTS integration
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              User editing & feedback
            </div>
          </div>
        </div>

        {/* Pipeline Component */}
        <Pipeline />
      </main>
      
      <footer style={styles.footer}>
        <div style={styles.footerOrgs}>
          Shema Bible Translation • OBT Lab • YWAM Kansas City
        </div>
        <div>© 2026</div>
      </footer>
    </div>
  )
}
