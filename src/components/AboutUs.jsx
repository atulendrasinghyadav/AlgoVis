import React from 'react';
import { ArrowLeft, Users, Zap, Terminal, Github, Linkedin } from 'lucide-react';
import './AboutUs.css';

const developers = [
  {
    name: 'Atulendra Singh Yadav',
    initials: 'AS',
    role: 'Co-Creator & Core Engineer',
    description: 'Passionate about front-end architecture and crafting smooth, high-frame-rate visualizations.',
    github: 'https://github.com/atulendrasinghyadav',
    linkedin: 'https://www.linkedin.com/in/atulendra-singh-yadav'
  },
  {
    name: 'Vidushi Singh',
    initials: 'VS',
    role: 'Co-Creator & Systems Engineer',
    description: 'Focused on the state-management engines and implementing the robust data-structure models.',
    github: 'https://github.com/vidushi-singh11',
    linkedin: 'https://www.linkedin.com/in/vidushi-singh-493097326/'
  }
];

export default function AboutUs({ onNavigate }) {
  return (
    <div className="about-container">
      <div className="about-content">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        <header className="about-header">
          <h1>About Algo Visualizer</h1>
          <p>Illuminating the logic behind algorithms through interactive experiences.</p>
        </header>

        <section className="about-section">
          <div className="section-icon"><Zap color="#eab308" /></div>
          <h2>Why Does This Exist?</h2>
          <p>
            Understanding algorithms and data structures is one of the most challenging hurdles for aspiring developers and computer science students. Traditional textbooks rely on static illustrations that fail to capture the dynamic, step-by-step nature of these core engineering concepts.
          </p>
          <p>
            Algo Visualizer exists to completely eliminate the friction in conceptual learning. We built this platform so that students can build an instant, visual intuition for how algorithms work—saving hours of frustration and dramatically improving retention during coding interviews.
          </p>
        </section>

        <section className="about-section">
          <div className="section-icon"><Terminal color="#eab308" /></div>
          <h2>How It Works</h2>
          <p>
            Our physics and animation engine breaks down complex operations—like sorting through pointers, inserting into trees, or finding the shortest path across a graph—into discrete, traceable frames.
          </p>
          <p>
            By controlling the execution speed, tweaking the array bounds, or stepping through the execution manually, users directly interface with the structural mechanics of an algorithm. Every component connects the raw, underlying mathematical operations directly to the visual element rendered on your screen.
          </p>
        </section>

        <section className="about-section developer-section">
          <div className="section-icon"><Users color="#eab308" /></div>
          <h2>Meet the Developers</h2>
          <p>This project is proudly built and maintained by two passionate software engineers dedicated to accessible education:</p>

          <div className="developer-grid">
            {developers.map((dev, idx) => (
              <div className="developer-card" key={idx}>
                <div className="dev-avatar">
                  <span>{dev.initials}</span>
                </div>
                <div className="dev-info">
                  <h3>{dev.name}</h3>
                  <span className="dev-role">{dev.role}</span>
                  <p>{dev.description}</p>
                  <div className="dev-socials">
                    <a href={dev.github} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={`${dev.name} GitHub`}>
                      <Github size={20} />
                    </a>
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={`${dev.name} LinkedIn`}>
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
