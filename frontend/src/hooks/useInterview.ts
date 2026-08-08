import { useCallback, useEffect, useState } from "react";
import {
  continueInterview,
  getCandidate,
  getHealth,
  getSessionProgress,
  getSessionSummary,
  startInterview,
} from "../api/client.js";
import type {
  CandidateProfile,
  InterviewTurn,
  SessionProgress,
  SessionSummary,
} from "../api/types.js";
import type { ActiveTab } from "../components/common/NavigationTabs.js";

export function useInterview() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [currentCandidate, setCurrentCandidate] = useState<CandidateProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [currentDayTitle, setCurrentDayTitle] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);

  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  // Check health and restore candidate session from sessionStorage on mount
  useEffect(() => {
    getHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));

    const savedId = sessionStorage.getItem("candidateId");
    if (savedId) {
      setIsAuthChecking(true);
      getCandidate(savedId)
        .then((prof) => {
          setCurrentCandidate(prof);
        })
        .catch(() => {
          sessionStorage.removeItem("candidateId");
        })
        .finally(() => setIsAuthChecking(false));
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  const handleLogin = async (candidateId: string) => {
    setAuthError(null);
    setIsAuthChecking(true);

    try {
      const prof = await getCandidate(candidateId);
      setCurrentCandidate(prof);
      sessionStorage.setItem("candidateId", prof.id);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError("Candidate ID not found. Please check your ID and try again.");
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("candidateId");
    setCurrentCandidate(null);
    setSessionId(null);
    setProgress(null);
    setSummary(null);
    setTurns([]);
    setActiveTab("dashboard");
    setAuthError(null);
  };

  const refreshProgress = useCallback(async (sid: string) => {
    try {
      const prog = await getSessionProgress(sid);
      setProgress(prog);
      if (prog.currentPosition) {
        setCurrentDay(prog.currentPosition.day);
        setCurrentDayTitle(prog.currentPosition.dayTitle);
        setCurrentTopic(prog.currentPosition.topic);
        setCurrentQuestion(prog.currentPosition.question);
      }
      return prog;
    } catch {
      return null;
    }
  }, []);

  const handleStartInterview = async () => {
    if (!currentCandidate) return;

    setErrorMsg(null);
    setIsStarting(true);
    const newSessionId = `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const res = await startInterview(newSessionId, currentCandidate.id);

      setSessionId(newSessionId);
      setIsCompleted(false);
      setSummary(null);

      // Fetch progress to initialize turn context
      const prog = await refreshProgress(newSessionId);
      if (!prog?.currentPosition) {
        setCurrentQuestion(res.reply);
      }

      setTurns([]);
      setActiveTab("interview");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start interview session.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async (message: string) => {
    if (!sessionId || isSubmitting) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await continueInterview(sessionId, message);

      if (res.done) {
        setIsCompleted(true);
        const [sumRes, progRes] = await Promise.allSettled([
          getSessionSummary(sessionId),
          refreshProgress(sessionId),
        ]);

        if (sumRes.status === "fulfilled") {
          setSummary(sumRes.value);
        }
        if (progRes.status === "fulfilled" && progRes.value) {
          setProgress(progRes.value);
        }

        setActiveTab("results");
      } else {
        // Fetch progress to get updated current position and turn state
        const prog = await refreshProgress(sessionId);
        if (prog?.currentPosition) {
          setIsFollowUp(prog.currentPosition.question.includes("[Follow-up]"));
        } else {
          setCurrentQuestion(res.reply);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    refreshProgress,
  };
}
