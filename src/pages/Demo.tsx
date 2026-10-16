import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Demo.css';

type Repository = { stargazers_count: number; forks_count: number; pushed_at: string; html_url: string };
const repositoryUrl = 'https://github.com/brunnojob/IoT-RF-Solucoes';
const clips = [
  { file: 'iot', title: 'Software & telemetry', description: 'Recorded MQTT bridge and dashboard workflow.', number: '01', className: 'software' },
  { file: 'iot2', title: 'Hardware in operation', description: 'ESP32, wired sensors and the monitoring dashboard on camera.', number: '02', className: 'hardware' },
];

export default function Demo() {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [apiError, setApiError] = useState(false);
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = 'IoT RF Soluções — Hardware meets telemetry';
    const controller = new AbortController();
    fetch('https://api.github.com/repos/brunnojob/IoT-RF-Solucoes', { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } })
      .then(response => { if (!response.ok) throw new Error('GitHub unavailable'); return response.json(); })
      .then(setRepository)
      .catch(error => { if (error.name !== 'AbortError') setApiError(true); });
    return () => { controller.abort(); document.documentElement.lang = 'pt-BR'; };
  }, []);
  return (
    <div className="demo-page">
      <nav className="demo-nav" aria-label="Main navigation">
        <Link to="/" className="demo-brand"><span className="demo-mark">RF</span> IOT / ENGINEERING</Link>
        <div><a href="#recordings">Recordings</a><a href={repositoryUrl}>Source code ↗</a></div>
      </nav>
      <main>
        <header className="demo-hero">
          <p className="demo-eyebrow"><span /> ESP32 · MQTT · REALTIME</p>
          <h1>Physical signals.<br /><em>Visible intelligence.</em></h1>
          <p className="demo-intro">An end-to-end IoT monitoring project. Temperature, humidity and presence travel from real sensors through MQTT to a web dashboard.</p>
          <div className="demo-actions"><a className="demo-primary" href="#recordings">Watch the system ↓</a><Link to="/dashboard">Open dashboard ↗</Link></div>
          <div className="demo-specs"><div><b>ESP32</b><span>Edge device</span></div><div><b>DHT11 + PIR</b><span>Sensor inputs</span></div><div><b>MQTT</b><span>Transport</span></div><div><b>Supabase</b><span>Data & realtime</span></div></div>
        </header>
        <section id="recordings" className="demo-recordings" aria-labelledby="recordings-title">
          <div className="demo-section-heading"><div><p className="demo-eyebrow">PROJECT RECORDINGS</p><h2 id="recordings-title">See the complete system.</h2></div><p>Two original recordings.<br />Hardware and software, together.</p></div>
          <div className="demo-video-grid">
            {clips.map(clip => <article className={`demo-video-card ${clip.className}`} key={clip.file}>
              <div className="demo-video-label"><span>{clip.number} / FIELD NOTES</span><span>RECORDED DEMO</span></div>
              <video autoPlay muted loop playsInline controls preload="metadata" poster={`${import.meta.env.BASE_URL}media/${clip.file}.jpg`} aria-label={clip.title}>
                <source src={`${import.meta.env.BASE_URL}media/${clip.file}.mp4`} type="video/mp4" />
                <a href={`${import.meta.env.BASE_URL}media/${clip.file}.mp4`}>Download recording</a>
              </video>
              <div className="demo-video-copy"><h3>{clip.title}</h3><p>{clip.description}</p><a href={`${import.meta.env.BASE_URL}media/${clip.file}.mp4`}>Open full recording ↗</a></div>
            </article>)}
          </div>
          <p className="demo-note">These videos show recorded operation. Live sensor readings require the configured hardware, MQTT bridge and database. Playback starts muted when permitted by your browser; player controls are always available.</p>
        </section>
        <section className="demo-source" aria-labelledby="source-title"><div><p className="demo-eyebrow">OPEN ENGINEERING</p><h2 id="source-title">Inspect the implementation.</h2><p>Firmware, Python bridge and React dashboard in one repository.</p></div><div className="demo-repo-data" aria-live="polite">{repository ? <><span><b>{repository.stargazers_count}</b> stars</span><span><b>{repository.forks_count}</b> forks</span><span>Updated {new Date(repository.pushed_at).toLocaleDateString('en-US')}</span></> : <span>{apiError ? 'Repository data unavailable. Source code remains accessible.' : 'Loading repository data…'}</span>}<a href={repositoryUrl}>View on GitHub ↗</a></div></section>
      </main>
      <footer className="demo-footer"><span>RF SOLUÇÕES / IOT</span><a href="https://brunnodev.store">Built by brunnodev.store ↗</a></footer>
    </div>
  );
}
