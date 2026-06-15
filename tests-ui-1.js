window.TEST_UI = `<div class="app">
  <header class="topbar">
    <div class="brand"><div class="logo">Q</div><div><h1>Probability Practice Tests</h1><p>60 original multiple-choice problems · step-by-step review</p></div></div>
    <div class="header-actions">
      <a class="secondary link-btn" href="index.html">Recall cards</a>
      <button class="icon-btn" id="themeBtn" aria-label="Toggle theme">◐</button>
    </div>
  </header>

  <main id="testHome" class="screen active">
    <section class="hero">
      <div class="eyebrow">Capstone-style practice</div>
      <h2>Test the same syllabus with multi-step multiple-choice problems.</h2>
      <p class="lead">Choose an answer on the front of each card. After checking it, the card flips to a detailed back side with the correct answer, derivation, governing rule, and common trap.</p>
      <div class="stats">
        <div class="stat"><strong id="attemptedStat">0</strong><span>Questions attempted</span></div>
        <div class="stat"><strong id="accuracyStat">—</strong><span>Lifetime accuracy</span></div>
        <div class="stat"><strong id="missedStat">0</strong><span>Need review</span></div>
        <div class="stat"><strong id="sessionsStat">0</strong><span>Sessions completed</span></div>
      </div>

      <div class="mode-grid">
        <button class="mode" data-mode="full"><b>Full 60-question test</b><span>All topics, shuffled. Use this for a comprehensive diagnostic.</span></button>
        <button class="mode" data-mode="quick"><b>Quick 20-question test</b><span>Prioritizes unseen and previously missed questions.</span></button>
        <button class="mode" data-mode="missed"><b>Review missed questions</b><span>Retest questions whose most recent graded attempt was incorrect.</span></button>
      </div>

      <div class="unit-picker">
        <div>
          <b>Focused unit test</b>
          <span>Choose one course unit and practice only those questions.</span>
        </div>
        <select id="unitSelect" aria-label="Select unit"><option value="">Select a unit</option></select>
        <button class="primary" id="unitStartBtn">Start unit test</button>
      </div>

      <div class="note"><b>Recommended use:</b> take the full test once without notes. On later days, alternate Quick 20 and Review missed. Work out calculations before selecting an option; do not use answer recognition as a substitute for derivation.</div>
    </section>
  </main>

  <main id="testSession" class="screen">
    <div class="test-status">
      <div class="progress-wrap">
        <div class="progress-label"><span id="testLabel">Practice test</span><span id="questionProgress">1 / 20</span></div>
        <div class="progress"><div id="testProgressBar"></div></div>
      </div>
      <div class="status-chip"><span>Score</span><strong id="liveScore">0 / 0</strong></div>
      <div class="status-chip"><span>Time</span><strong id="elapsedTime">0:00</strong></div>
    </div>

    <div class="mcq-scene">
      <article class="mcq-card" id="mcqCard">
        <section class="mcq-face mcq-front">
          <div class="mcq-head">
            <div>
              <div class="eyebrow" id="questionUnit"></div>
              <h2 id="questionTitle">Question</h2>
`;
