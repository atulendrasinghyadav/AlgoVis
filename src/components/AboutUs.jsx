import React from 'react';
import { ArrowLeft, Users, Zap, Terminal } from 'lucide-react';
import './AboutUs.css';

const GithubIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

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
                      <GithubIcon size={20} />
                    </a>
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={`${dev.name} LinkedIn`}>
                      <LinkedinIcon size={20} />
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
