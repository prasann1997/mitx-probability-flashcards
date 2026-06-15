window.TEST_UI += `            </div>
            <span class="difficulty" id="questionDifficulty"></span>
          </div>
          <div class="question-prompt" id="questionPrompt"></div>
          <div class="choices" id="choices"></div>
          <div class="question-actions">
            <button class="secondary" id="revealUngradedBtn">Reveal without answer</button>
            <button class="primary" id="checkBtn" disabled>Check answer</button>
          </div>
        </section>

        <section class="mcq-face mcq-back">
          <div class="review-head">
            <div>
              <div class="eyebrow">Answer review</div>
              <h2 id="resultHeading">Correct</h2>
            </div>
            <span class="result-badge" id="resultBadge"></span>
          </div>
          <div class="correct-answer" id="correctAnswer"></div>
          <ol class="solution-steps" id="solutionSteps"></ol>
          <div class="review-grid">
            <div class="callout rule-box"><b>Core rule</b><span id="coreRule"></span></div>
            <div class="callout trap"><b>Common trap</b><span id="questionTrap"></span></div>
          </div>
          <div class="question-actions">
            <button class="secondary" id="flipBackBtn">View question</button>
            <button class="primary" id="nextQuestionBtn">Next question</button>
          </div>
        </section>
      </article>
    </div>

    <div class="session-footer">
      <span><kbd>1–4</kbd> choose · <kbd>Enter</kbd> check/next</span>
      <button class="secondary" id="endTestBtn">End test</button>
    </div>
  </main>

  <main id="testComplete" class="screen">
    <section class="complete">
      <div class="eyebrow">Test complete</div>
      <h2 id="completeHeading">Results</h2>
      <p id="completeSummary"></p>
      <div class="complete-grid">
        <div class="stat"><strong id="finalScore">0%</strong><span>Score</span></div>
        <div class="stat"><strong id="finalCorrect">0 / 0</strong><span>Correct</span></div>
        <div class="stat"><strong id="finalTime">0m</strong><span>Elapsed time</span></div>
      </div>
      <div class="result-list" id="missedList"></div>
      <div class="complete-actions">
        <button class="secondary" id="reviewSessionMissedBtn">Retest session misses</button>
        <button class="primary" id="testHomeBtn">Return to test menu</button>
      </div>
    </section>
  </main>
</div>
`;
document.getElementById("testRoot").innerHTML = window.TEST_UI;
