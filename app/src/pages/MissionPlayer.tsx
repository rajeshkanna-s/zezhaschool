import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Mission, MissionStep, LearnStep, SortStep, QuizStep } from '../types';
import { recordRecent } from '../lib/recent';
import { FiArrowLeft, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';

const stepLabel = (s: MissionStep) => (s.type === 'learn' ? 'Learn' : s.type === 'sort' ? 'Play' : 'Quiz');

export default function MissionPlayer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // No status filter: RLS returns published missions to everyone and
      // drafts only to admins (so admins can test-play before publishing).
      const { data } = await supabase
        .from('missions').select('*').eq('slug', slug).maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setMission(data as Mission);
      recordRecent({ type: 'mission', title: data.title, to: `/missions/${data.slug}`, icon: data.icon || '🚀' });
      if (user) {
        const { data: prog } = await supabase
          .from('mission_progress').select('completed').eq('user_id', user.id).eq('mission_id', data.id).maybeSingle();
        if (prog?.completed) setAlreadyDone(true);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const steps = mission?.steps ?? [];
  const totalSegments = steps.length + 1; // + Done
  const onDone = stepIndex >= steps.length;

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }
  if (notFound || !mission) {
    return (
      <div className="empty-state">
        <h3>Mission not found</h3>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/missions')}>Back to Missions</button>
      </div>
    );
  }

  return (
    <div className="mission-player">
      <button className="btn-link-arrow" style={{ marginBottom: 10 }} onClick={() => navigate('/missions')}>
        <FiArrowLeft /> Missions
      </button>

      {/* Mission header + step progress */}
      <div className="mission-head">
        <div className="mission-head-top">
          <div className="mission-head-icon">{mission.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mission-head-eyebrow">MISSION · {mission.title}</div>
            <h2>{steps[stepIndex]?.title || (onDone ? 'Complete!' : mission.title)}</h2>
          </div>
          <span className="mission-xp">⚡ +{mission.xp} XP</span>
        </div>

        <div className="mission-steps">
          {steps.map((s, i) => (
            <div key={s.id} className={`mission-step ${i < stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}>
              <span className="mission-step-bar" />
              <span className="mission-step-label">{stepLabel(s)}</span>
            </div>
          ))}
          <div className={`mission-step ${onDone ? 'active' : ''}`}>
            <span className="mission-step-bar" />
            <span className="mission-step-label">Done</span>
          </div>
        </div>
      </div>

      {/* Active step */}
      <div className="mission-stage">
        {onDone ? (
          <DoneView mission={mission} userId={user?.id} alreadyDone={alreadyDone} onReplay={() => setStepIndex(0)} />
        ) : (
          <StepView
            key={steps[stepIndex].id}
            step={steps[stepIndex]}
            onComplete={() => setStepIndex(i => i + 1)}
            isLast={stepIndex === steps.length - 1}
          />
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Step {Math.min(stepIndex + 1, totalSegments)} of {totalSegments}
      </div>
    </div>
  );
}

function StepView({ step, onComplete, isLast }: { step: MissionStep; onComplete: () => void; isLast: boolean }) {
  if (step.type === 'learn') return <LearnStepView step={step} onComplete={onComplete} isLast={isLast} />;
  if (step.type === 'sort') return <SortStepView step={step} onComplete={onComplete} isLast={isLast} />;
  return <QuizStepView step={step} onComplete={onComplete} isLast={isLast} />;
}

/* ---- Learn ---- */
function LearnStepView({ step, onComplete, isLast }: { step: LearnStep; onComplete: () => void; isLast: boolean }) {
  const [i, setI] = useState(0);
  const cards = step.cards.length ? step.cards : [{ heading: step.title, text: '' }];
  const card = cards[i];
  const last = i === cards.length - 1;
  return (
    <div className="mission-card mission-learn">
      {card.icon && <div className="mission-learn-icon">{card.icon}</div>}
      <h3>{card.heading}</h3>
      {card.text && <p>{card.text}</p>}
      <button className="mission-primary-btn" onClick={() => (last ? onComplete() : setI(i + 1))}>
        {last ? (isLast ? 'Finish' : 'Continue') : `Got it! (${i + 1}/${cards.length})`} <FiArrowRight />
      </button>
    </div>
  );
}

/* ---- Sort / Play ---- */
function SortStepView({ step, onComplete, isLast }: { step: SortStep; onComplete: () => void; isLast: boolean }) {
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<null | boolean>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const items = step.items;
  const item = items[idx];
  const last = idx === items.length - 1;

  const choose = (bucket: number) => {
    if (result !== null) return;
    const ok = bucket === item.bucket;
    setResult(ok);
    if (ok) setCorrectCount(c => c + 1);
  };
  const next = () => {
    if (last) onComplete();
    else { setIdx(idx + 1); setResult(null); }
  };

  return (
    <div className="mission-card">
      <h3 style={{ marginBottom: 4 }}>{step.title}</h3>
      {step.prompt && <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{step.prompt}</p>}

      <div className="sort-item">{item.text}</div>

      <div className="sort-buckets">
        {step.buckets.map((b, bi) => {
          const chosen = result !== null;
          const isAnswer = bi === item.bucket;
          const cls = chosen ? (isAnswer ? 'correct' : 'dim') : '';
          return (
            <button key={bi} className={`sort-bucket ${cls}`} disabled={chosen} onClick={() => choose(bi)}>
              {b.emoji && <span style={{ marginRight: 6 }}>{b.emoji}</span>}{b.label}
            </button>
          );
        })}
      </div>

      {result !== null && (
        <div className={`mission-feedback ${result ? 'good' : 'bad'}`}>
          {result ? <><FiCheck /> Correct!</> : <><FiX /> Not quite — the right answer is highlighted.</>}
        </div>
      )}

      <button className="mission-primary-btn" disabled={result === null} onClick={next}>
        {last ? (isLast ? 'Finish' : 'Continue') : 'Next'} <FiArrowRight />
      </button>
      <div className="mission-substep">{idx + 1} / {items.length} · {correctCount} correct</div>
    </div>
  );
}

/* ---- Quiz ---- */
function QuizStepView({ step, onComplete, isLast }: { step: QuizStep; onComplete: () => void; isLast: boolean }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = step.questions[idx];
  const last = idx === step.questions.length - 1;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore(s => s + 1);
  };
  const next = () => {
    if (last) onComplete();
    else { setIdx(idx + 1); setPicked(null); }
  };

  return (
    <div className="mission-card">
      <h3 style={{ marginBottom: 16 }}>{q.q}</h3>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = '';
          if (picked !== null) {
            if (i === q.answer) cls = 'correct';
            else if (i === picked) cls = 'wrong';
            else cls = 'dim';
          }
          return (
            <button key={i} className={`quiz-option ${cls}`} disabled={picked !== null} onClick={() => pick(i)}>
              {opt}
              {picked !== null && i === q.answer && <FiCheck style={{ marginLeft: 'auto' }} />}
              {picked !== null && i === picked && i !== q.answer && <FiX style={{ marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </div>
      <button className="mission-primary-btn" disabled={picked === null} onClick={next}>
        {last ? (isLast ? 'Finish' : 'Continue') : 'Next question'} <FiArrowRight />
      </button>
      <div className="mission-substep">Question {idx + 1} / {step.questions.length} · {score} correct</div>
    </div>
  );
}

/* ---- Done ---- */
function DoneView({ mission, userId, alreadyDone, onReplay }: { mission: Mission; userId?: string; alreadyDone: boolean; onReplay: () => void }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(alreadyDone);
  const awardXp = useMemo(() => (alreadyDone ? 0 : mission.xp), [alreadyDone, mission.xp]);

  useEffect(() => {
    if (alreadyDone || !userId || saved) return;
    (async () => {
      await supabase.from('mission_progress').upsert(
        { user_id: userId, mission_id: mission.id, completed: true, xp_earned: mission.xp, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,mission_id' }
      );
      setSaved(true);
    })();
  }, [alreadyDone, userId, saved, mission.id, mission.xp]);

  return (
    <div className="mission-card mission-done">
      <div className="mission-done-badge">🎉</div>
      <h3>Mission complete!</h3>
      <p>You finished <strong>{mission.title}</strong>.</p>
      <div className="mission-xp-earned">
        {alreadyDone ? 'Already completed earlier' : <>⚡ +{awardXp} XP earned</>}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/missions')}>
          Back to Missions
        </button>
        <button className="btn btn-outline-secondary" style={{ width: 'auto' }} onClick={onReplay}>
          Replay
        </button>
      </div>
    </div>
  );
}
