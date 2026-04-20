import React, { useState, useEffect } from 'react';
import { Activity, Zap, Globe, Network, ChevronRight, BarChart2, Layers, Cpu, AlignLeft } from 'lucide-react';
import './Home.css';

export default function Home({ onNavigate }) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [timerKey, setTimerKey] = useState(Date.now());

  useEffect(() => {
    let animationFrame;
    let startTime = performance.now();
    const DURATION = 3000; // 3 seconds per step

    const animate = (time) => {
      const elapsed = time - startTime;
      const pct = (elapsed / DURATION) * 100;
      if (pct >= 100) {
        setActiveStep((prev) => (prev === 4 ? 1 : prev + 1));
        setTimerKey(Date.now()); // trigger reset for next step
      } else {
        setProgress(pct);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeStep, timerKey]);

  const handleStepClick = (id) => {
    setActiveStep(id);
    setTimerKey(Date.now());
  };

  const handleMouseMove = (e) => {
    // We bind coordinate state to track mouse exactly on the screen window
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="home-container" onMouseMove={handleMouseMove}>
      {/* Interactive Background Glow */}
      <div
        className="interactive-glow"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 179, 8, 0.08), transparent 50%)`
        }}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Activity size={14} color="#eab308" />
          <span>Interactive Visualization Engine • Open Access</span>
        </div>
        <h1 className="hero-title">
          Master Complex Algorithms<br />
          <span className="interactive-highlight">With Real-Time Precision</span>
        </h1>
        <p className="hero-subtitle">
          AlgoVis is a globally accessible learning assistant that keeps your engineering knowledge in orbit with seamless animations, instant playback, and smarter data structures.
        </p>
        <div className="hero-actions">
          <button className="h-btn-outline" onClick={() => onNavigate('sorting')}>
            Explore Features
          </button>
          <button className="h-btn-primary" onClick={() => onNavigate('sorting')}>
            Get Started <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="steps-main-title">Master any algorithm in 4 simple steps</h2>

        <div className="steps-wrapper">
          <div className="steps-list">
            {[
              {
                id: 1,
                title: 'Select an Category',
                desc: 'Navigate to Sorting, Trees, or Graphs. Pick specific algorithms like Quick Sort or Dijkstra\'s from the intuitive drop-down menus.',
              },
              {
                id: 2,
                title: 'Configure Your Data',
                desc: 'Use sliders to modify the dataset size and the playback speed. Generate random distributions, reversed data, or input your exact custom arrays.',
              },
              {
                id: 3,
                title: 'Run The Animation',
                desc: 'Hit play and watch the underlying mechanics. The visualizer dissects the logic via glowing compares, swaps, and dynamic color mappings.',
              },
              {
                id: 4,
                title: 'Build Lasting Intuition',
                desc: 'Analyze how the algorithm handles worst-case scenarios vs best-case. Build deep visual memory so you crush your next technical interview.',
              }
            ].map((step, idx) => (
              <div
                key={step.id}
                className={`step-item ${activeStep === step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className="step-indicator">
                  <div className={`step-number ${activeStep >= step.id ? 'filled-number' : ''}`}>{step.id}</div>

                  {/* Vertical Progress Line (even a small one for step 4) */}
                  <div className={`step-line-bg ${idx === 3 ? 'step-4-line' : ''}`}>
                    <div
                      className="step-line-progress"
                      style={{
                        height: activeStep === step.id ? `${progress}%` : activeStep > step.id ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="step-content">
                  <span className="step-label">STEP 0{step.id}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="step-visual-container">
            <div className="step-visual-mockup">
              <div className="mockup-header">
                <span className="dot" style={{ background: '#ef4444' }}></span>
                <span className="dot" style={{ background: '#f59e0b' }}></span>
                <span className="dot" style={{ background: '#10b981' }}></span>
              </div>
              <div className="mockup-body" key={activeStep}>
                {/* Visuals change based on active step */}
                {activeStep === 1 && (
                  <div className="mockup-content mockup-step-1 fade-in">
                    <div className="mockup-image-box">
                      <Layers size={48} color="#eab308" />
                      <h4>Algorithm Library</h4>
                      <div className="img-pills">
                        <span className="img-pill active-pill">Graph</span>
                        <span className="img-pill active-pill">Sorting</span>
                        <span className="img-pill active-pill">Trees</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="mockup-content mockup-step-2 fade-in">
                    <div className="mockup-image-box">
                      <Cpu size={48} color="#eab308" />
                      <h4>Configure Engine</h4>
                      <div className="slider-mockup" style={{ marginTop: '1rem' }}>
                        <div className="s-track"><div className="s-thumb" style={{ left: '50%' }}></div></div>
                      </div>
                      <div className="slider-mockup" style={{ marginTop: '1rem' }}>
                        <div className="s-track"><div className="s-thumb" style={{ left: '80%' }}></div></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="mockup-content mockup-step-3 fade-in">
                    <div className="mockup-image-box">
                      <AlignLeft size={48} color="#f43f5e" />
                      <h4>Execution View</h4>
                      <div className="bars-mockup" style={{ marginTop: '1rem' }}>
                        <div className="bar" style={{ height: '30%', background: '#eab308' }}></div>
                        <div className="bar" style={{ height: '80%', background: '#f43f5e' }}></div>
                        <div className="bar" style={{ height: '50%', background: '#f43f5e' }}></div>
                        <div className="bar" style={{ height: '90%', background: '#ca8a04' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeStep === 4 && (
                  <div className="mockup-content mockup-step-4 fade-in">
                    <div className="mockup-image-box">
                      <BarChart2 size={48} color="#a16207" />
                      <h4>Data Analytics</h4>
                      <div className="stat-pills" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                        <span style={{ borderColor: '#a16207' }}>O(N log N) Time</span>
                        <span style={{ borderColor: '#a16207' }}>O(1) Space</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose AlgoVis Section */}
      <section className="why-section">
        <div className="section-header">
          <span className="section-badge">WHY ALGOVIS?</span>
          <h2>Never Lose Intuition Over Code Again</h2>
          <p>Three reasons why engineers choose AlgoVis over traditional textbooks.</p>
        </div>

        <div className="features-grid">
          <div className="f-card">
            <div className="f-icon">
              <Zap size={22} color="#f4f4f5" />
            </div>
            <h3>Instant Output. Every Time.</h3>
            <p>Students get intuition in seconds, not hours. No more lost context jumping between paragraphs of text. Visual mapping fixes conceptual bugs.</p>
          </div>

          <div className="f-card">
            <div className="f-icon">
              <Globe size={22} color="#f4f4f5" />
            </div>
            <h3>Learning That Speaks Visuals.</h3>
            <p>Our playback engine steps through algorithms frame-by-frame. You control the speed, the data scale, and the inputs in a perfectly seamless loop.</p>
          </div>

          <div className="f-card">
            <div className="f-icon">
              <Network size={22} color="#f4f4f5" />
            </div>
            <h3>Scale Without Breaking Intuition.</h3>
            <p>Automate 80% of your conceptual learning. Free your brain to handle complex dynamic programming issues by fully mastering the basics.</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Activity size={24} color="#eab308" />
              <span>AlgoVis</span>
            </div>
            <p className="footer-desc">
              Empowering engineers globally to master complex algorithms with real-time visual precision and interactive learning environments.
            </p>
            <div className="footer-about">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="about-us-link">About Us</a>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Visualizers</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('sorting'); }}>Sorting</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('searching'); }}>Searching</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('trees'); }}>Trees</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('graphs'); }}>Graphs</a>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Community</a>
              <a href="#">Blog</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AlgoVis. All rights reserved.</p>
          <div className="footer-status">
            <span className="status-dot"></span>
            Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
