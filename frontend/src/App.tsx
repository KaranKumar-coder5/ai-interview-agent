import { CandidateLogin } from "./components/auth/CandidateLogin.js";
import { CohortCalendar } from "./components/calendar/CohortCalendar.js";
import { Badge } from "./components/common/Badge.js";
import { Header } from "./components/common/Header.js";
import { LoadingSkeleton } from "./components/common/LoadingSkeleton.js";
import { NavigationTabs } from "./components/common/NavigationTabs.js";
import { CandidateOverview } from "./components/dashboard/CandidateOverview.js";
import { CohortOverview } from "./components/dashboard/CohortOverview.js";
import { QuickStart } from "./components/dashboard/QuickStart.js";
import { AnswerEditor } from "./components/interview/AnswerEditor.js";
import { FollowUpBanner } from "./components/interview/FollowUpBanner.js";
import { QuestionCard } from "./components/interview/QuestionCard.js";
import { TurnHistory } from "./components/interview/TurnHistory.js";
import { CurrentPosition } from "./components/progress/CurrentPosition.js";
import { ProgressMetrics } from "./components/progress/ProgressMetrics.js";
import { FeedbackSections } from "./components/results/FeedbackSections.js";
import { ScoreOverview } from "./components/results/ScoreOverview.js";
import { TopicBreakdown } from "./components/results/TopicBreakdown.js";

import { useInterview } from "./hooks/useInterview.js";
import "./styles/design-system.css";

export function App() {
  const {
    activeTab,
    setActiveTab,
    currentCandidate,
    isAuthChecking,
    authError,
    handleLogin,
    handleLogout,
    sessionId,
    backendOnline,
    turns,
    currentQuestion,
    currentDay,
    currentDayTitle,
    currentTopic,
    isFollowUp,
    isStarting,
    isSubmitting,
    isCompleted,
    errorMsg,
    setErrorMsg,
    progress,
    summary,
    handleStartInterview,
    handleSubmitAnswer,
  } = useInterview();

  if (isAuthChecking && !currentCandidate) {
    return (
      <div className="app-container">
        <Header backendOnline={backendOnline} />
        <main className="main-content" style={{ marginTop: "4rem" }}>
          <LoadingSkeleton height="300px" width="420px" className="card" />
        </main>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="app-container">
        <Header backendOnline={backendOnline} />
        <main className="main-content">
          <CandidateLogin
            onLogin={handleLogin}
            isLoading={isAuthChecking}
            errorMsg={authError}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        backendOnline={backendOnline}
        candidateName={currentCandidate.member.name}
        sessionId={sessionId}
        onLogout={handleLogout}
      />

      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasActiveSession={!!sessionId}
        isSessionCompleted={isCompleted}
      />

      <main className="main-content">
        {errorMsg && (
          <div className="alert-banner alert-error" style={{ marginBottom: "1rem" }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>{errorMsg}</div>
            <button
              onClick={() => setErrorMsg(null)}
              style={{ background: "none", border: "none", color: "currentColor", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {backendOnline === false && (
          <div className="alert-banner alert-warning" style={{ marginBottom: "1rem" }}>
            <span>⚠️</span>
            <div>
              <strong>Backend Disconnected</strong> — Could not establish HTTP connection to Express server at port 3000. Ensure <code>npm run dev</code> is running.
            </div>
          </div>
        )}

        {/* VIEW 1: CANDIDATE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <QuickStart
              candidate={currentCandidate}
              onStartInterview={handleStartInterview}
              isStarting={isStarting}
              hasActiveSession={!!sessionId}
              onResumeInterview={() => setActiveTab(isCompleted ? "results" : "interview")}
            />

            <CandidateOverview candidate={currentCandidate} />

            <CohortOverview candidate={currentCandidate} />
          </div>
        )}

        {/* VIEW 2: INTERVIEW WORKSPACE */}
        {activeTab === "interview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {isFollowUp && <FollowUpBanner />}

            <QuestionCard
              day={currentDay}
              dayTitle={currentDayTitle}
              topic={currentTopic}
              questionText={currentQuestion || "Initializing question from curriculum engine..."}
              isFollowUp={isFollowUp}
              isCompleted={isCompleted}
            />

            {!isCompleted ? (
              <AnswerEditor
                onSubmitAnswer={handleSubmitAnswer}
                isSubmitting={isSubmitting}
              />
            ) : (
              <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                <Badge variant="success" style={{ fontSize: "0.9rem", padding: "0.4rem 1rem", marginBottom: "0.5rem" }}>
                  ✓ Evaluation Complete
                </Badge>
                <p style={{ color: "var(--text-secondary)", margin: "0.5rem 0 1rem 0" }}>
                  All questions have been evaluated and final feedback is ready.
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTab("results")}>
                  View Detailed Feedback Results →
                </button>
              </div>
            )}

            {progress && (
              <div style={{ marginTop: "1rem" }}>
                <TurnHistory turns={turns.length > 0 ? turns : (progress as any).turns || []} />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LIVE SESSION PROGRESS */}
        {activeTab === "progress" && (
          <div>
            {progress ? (
              <div>
                <ProgressMetrics progress={progress} />
                <CurrentPosition
                  currentPosition={progress.currentPosition}
                  completed={progress.completed}
                />
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ color: "var(--text-muted)" }}>
                  No active session progress loaded. Start an interview to view live progress metrics.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: EVALUATION RESULTS */}
        {activeTab === "results" && (
          <div>
            {summary ? (
              <div>
                <ScoreOverview feedback={summary.feedback} />
                <TopicBreakdown topics={summary.feedback.topicBreakdown} />
                <FeedbackSections feedback={summary.feedback} />
              </div>
            ) : isCompleted && progress?.feedback ? (
              <div>
                <ScoreOverview feedback={progress.feedback} />
                <TopicBreakdown topics={progress.feedback.topicBreakdown} />
                <FeedbackSections feedback={progress.feedback} />
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ color: "var(--text-muted)" }}>
                  Interview results are available once an interview session is completed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: 31-DAY TEST CALENDAR */}
        {activeTab === "calendar" && (
          <CohortCalendar candidate={currentCandidate} />
        )}
      </main>
    </div>
  );
}

export default App;
