
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Check, X, RefreshCcw, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import * as constants from './constants';
import { 
  Condition, 
  SessionData, 
  ChatMessage, 
  SurveyResponses 
} from './types';
const { 
  LIKERT_LABELS, 
  PRE_SURVEY_ITEMS, 
  POST_SURVEY_ITEMS, 
  ELIGIBILITY_QUESTIONS, 
  LANDING_TEXT, 
  CHAT_INSTRUCTIONS, 
  PROGRESS_LABELS,
  INELIGIBLE_MESSAGE
} = constants;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Utils ---
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

const countEnglishWords = (str: string) => {
  return str.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,""))).length;
};

const containsChinese = (str: string) => /[\u4e00-\u9fa5]/.test(str);
const countChineseCharacters = (str: string) => (str.match(/[\u4e00-\u9fa5]/g) || []).length;

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};

// --- Sub-Components ---
const ProgressHeader = ({ currentStep }: { currentStep: number }) => {
  const totalSteps = PROGRESS_LABELS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="w-full bg-white border-b border-slate-200 shrink-0">
      <div className="h-1.5 w-full bg-slate-100 relative overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-sky-500 rounded-r-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      <div className="flex justify-between px-2 py-3 gap-0.5 bg-white">
        {PROGRESS_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <span className={cn(
              "text-[11px] font-black tracking-tighter text-center leading-none transition-colors duration-300",
              i === currentStep ? "text-sky-500" : (i < currentStep ? "text-slate-700" : "text-slate-400")
            )}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StepContainer = ({ children, className, id, hideProgress }: { children: React.ReactNode, className?: string, id?: string, hideProgress?: boolean }) => {
  const stepMap: Record<string, number> = {
    'eligibility': 0,
    'consent': 1,
    'survey_pre': 2,
    'chat': 3,
    'survey_post': 4
  };
  
  return (
    <motion.div 
      key={id}
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn("w-full max-w-[420px] min-h-screen bg-white overflow-hidden flex flex-col relative font-sans mx-auto", className)}
    >
      {!hideProgress && id && stepMap[id] !== undefined && (
        <ProgressHeader currentStep={stepMap[id]} />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </motion.div>
  );
};

  // --- Survey Stage Component ---
  const SurveyStage = ({ id, type, onComplete }: { id: string, type: 'pre' | 'post', onComplete: (res: SurveyResponses) => void }) => {
    const items = type === 'pre' ? PRE_SURVEY_ITEMS : POST_SURVEY_ITEMS;
    const [responses, setResponses] = useState<SurveyResponses>({});
    const surveyScrollRef = useRef<HTMLDivElement>(null);

    const isComplete = items.every((_, i) => responses[i] !== undefined);
    
    useEffect(() => {
      surveyScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }, [id, type]);

    return (
      <StepContainer id={id}>
        <div ref={surveyScrollRef} className="flex-1 flex flex-col overflow-y-auto px-6 py-8 font-sans">
          <p className="text-[15px] text-sky-500 font-black p-4 bg-sky-50/50 rounded-2xl mb-12 leading-relaxed tracking-tight text-center">
            {(constants as any).SURVEY_INSTRUCTION}
          </p>
          
          <div className="space-y-16 flex-1 pb-16">
            {items.map((item, index) => (
              <div key={index} className="space-y-6">
                <div className="flex gap-3">
                  <span className="text-sky-500 font-black font-mono text-sm">0{index + 1}</span>
                  <p className="text-[14px] text-slate-800 leading-relaxed font-bold tracking-tight">{item}</p>
                </div>
                <div className="flex justify-between items-center px-1">
                  {[1, 2, 3, 4, 5, 6, 7].map(val => (
                    <button 
                      key={val}
                      onClick={() => setResponses(prev => ({ ...prev, [index]: val }))}
                      className={cn(
                        "w-9 h-9 rounded-full border-2 text-[12px] font-black transition-all flex items-center justify-center",
                        responses[index] === val ? "bg-sky-500 text-white border-sky-500 scale-105" : "bg-white text-slate-400 border-slate-300 hover:border-sky-500 hover:text-sky-500"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 px-1 pt-1 font-black uppercase tracking-widest bg-slate-50 py-1 rounded">
                  <span>{LIKERT_LABELS[1]}</span>
                  <span>{LIKERT_LABELS[7]}</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            disabled={!isComplete}
            onClick={() => onComplete(responses)}
            className="w-full py-4 bg-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border-2 border-transparent text-white rounded-2xl font-black uppercase tracking-widest text-[13px] transition-all sticky bottom-0 active:scale-95"
          >
            儲存並繼續
          </button>
        </div>
      </StepContainer>
    );
  };

// --- App Component ---
export default function App() {
  const DEV_TOOLS_ENABLED = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
  const [step, setStep] = useState<'landing' | 'eligibility' | 'consent' | 'survey_pre' | 'chat' | 'survey_post' | 'thanks' | 'ineligible'>('landing');
  const [session, setSession] = useState<SessionData>({
    sessionId: generateSessionId(),
    timestamp: new Date().toISOString(),
    eligibility: { 
      age: null as unknown as boolean, 
      taiwanese: null as unknown as boolean, 
      nativeEnglish: null as unknown as boolean, 
      canChat: null as unknown as boolean 
    },
    consent: false,
    condition: 'B',
    preSurvey: {},
    chatLog: [],
    validTurns: 0,
    postSurvey: {},
    status: 'started'
  });

  const [devMode, setDevMode] = useState(false);
  const [devError, setDevError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatWarning, setChatWarning] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-sync session to server
  useEffect(() => {
    const sync = async () => {
      try {
        await fetch('/api/session/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session })
        });
      } catch (e) {
        console.error('Sync failed', e);
      }
    };
    if (session.sessionId) sync();
  }, [session, step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.chatLog]);

  useEffect(() => {
    if (step === 'chat' && session.chatLog.length === 0) {
      setSession(prev => ({
        ...prev,
        chatLog: [{ role: 'assistant' as const, content: CHAT_INSTRUCTIONS, timestamp: new Date().toISOString() }]
      }));
    }
  }, [step, session.chatLog.length]);

  // --- Handlers ---
  const handleStart = () => setStep('eligibility');

  const handleEligibility = (field: string, val: boolean) => {
    setSession(prev => ({
      ...prev,
      eligibility: { ...prev.eligibility, [field]: val }
    }));
  };

  const checkEligibility = () => {
    const { age, taiwanese, nativeEnglish, canChat } = session.eligibility;
    if (age === true && taiwanese === true && nativeEnglish === false && canChat === true) {
      setStep('consent');
    } else if (age === null || taiwanese === null || nativeEnglish === null || canChat === null) {
      // Do nothing, wait for all answers
    } else {
      setStep('ineligible');
      setSession(prev => ({ ...prev, status: 'ineligible' }));
    }
  };

  const handleConsent = () => {
    setSession(prev => ({ ...prev, consent: true }));
    setStep('survey_pre');
  };

  const handleSurvey = (responses: SurveyResponses, nextStep: 'chat' | 'thanks') => {
    if (nextStep === 'chat') {
      setSession(prev => ({
        ...prev,
        preSurvey: responses,
        status: 'chatting'
      }));
      setStep('chat');
    } else {
      const endTime = new Date();
      const startTime = new Date(session.timestamp);
      const diffSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Compute metrics
      const userMessages = session.chatLog.filter(m => m.role === 'user');
      const botMessages = session.chatLog.filter(m => m.role === 'assistant');
      const userWords = userMessages.reduce((sum, m) => sum + countEnglishWords(m.content), 0);
      const botWords = botMessages.reduce((sum, m) => sum + countEnglishWords(m.content), 0);
      const chineseChars = userMessages.reduce((sum, m) => sum + countChineseCharacters(m.content), 0);
      const chineseMsgs = userMessages.filter(m => containsChinese(m.content)).length;

      setSession(prev => ({
        ...prev,
        postSurvey: responses,
        status: 'completed',
        metrics: {
          completion_time_seconds: diffSeconds,
          user_word_count: userWords,
          bot_word_count: botWords,
          user_turn_count: userMessages.length,
          avg_user_message_length: userMessages.length > 0 ? userWords / userMessages.length : 0,
          avg_response_latency_seconds: 0, // Mocked for now
          user_words_per_minute: userWords / (diffSeconds / 60),
          user_to_bot_word_ratio: botWords > 0 ? userWords / botWords : 0,
          chinese_character_count: chineseChars,
          user_messages_containing_chinese: chineseMsgs
        }
      }));
      setStep('thanks');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const trimmedInput = inputText.trim();
    const words = countEnglishWords(trimmedInput);
    if (words < 10) {
      setChatWarning(`回覆長度不足，請輸入至少 10 個英文單字 (目前: ${words} 字)`);
      return;
    }

    setChatWarning('');
    setIsLoading(true);

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString()
    };

    const newLog = [...session.chatLog, userMessage];
    setSession(prev => ({
      ...prev,
      chatLog: newLog,
      validTurns: prev.validTurns + 1
    }));
    setInputText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          history: session.chatLog,
          message: trimmedInput
        })
      });

      const data = await response.json().catch(() => ({} as any));
      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const botMessagesToAdd: ChatMessage[] = [];
      if (data.correction) {
        botMessagesToAdd.push({
          role: 'assistant',
          content: data.correction,
          timestamp: new Date().toISOString(),
          conditionLabel: 'Correction'
        });
      }
      botMessagesToAdd.push({
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString()
      });

      setSession(prev => ({
        ...prev,
        chatLog: [...prev.chatLog, ...botMessagesToAdd]
      }));

      // Check if finished
      if (session.validTurns + 1 >= 6) {
        setTimeout(() => setStep('survey_post'), 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[chat] send failed', {
        sessionId: session.sessionId,
        step,
        validTurns: session.validTurns,
        error: errorMessage,
      });
      setChatWarning(DEV_TOOLS_ENABLED ? `發生錯誤：${errorMessage}` : '發生錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevJumpToChat = async () => {
    setDevError('');
    const forcedCondition = session.condition;
    const devSession: SessionData = {
      sessionId: generateSessionId(),
      timestamp: new Date().toISOString(),
      eligibility: { age: true, taiwanese: true, nativeEnglish: false, canChat: true },
      consent: true,
      condition: forcedCondition,
      preSurvey: {},
      chatLog: [],
      validTurns: 0,
      postSurvey: {},
      status: 'chatting',
    };

    try {
      const response = await fetch('/api/session/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: devSession,
          devOverrideCondition: true,
        }),
      });
      const data = await response.json().catch(() => ({} as any));
      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const assignedCondition: Condition = (data?.condition || forcedCondition) as Condition;
      if (assignedCondition !== forcedCondition) {
        console.warn(
          `[dev] requested condition ${forcedCondition} but server assigned ${assignedCondition}`
        );
      }

      console.log('[dev] initialized chat session', {
        sessionId: devSession.sessionId,
        requestedCondition: forcedCondition,
        assignedCondition,
      });

      setSession({
        ...devSession,
        condition: assignedCondition,
      });
      setStep('chat');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[dev] failed to initialize jump-to-chat session', { error: errorMessage });
      setDevError(`Jump to chat failed: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center">
      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <StepContainer id="landing" hideProgress>
            <div className="flex justify-center items-center px-6 pt-12">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">英文學習研究</h1>
            </div>
            
            <div className="px-8 py-10 flex-1">
              <div className="space-y-5 text-[15px] text-slate-700 font-bold bg-slate-50/50 p-8 rounded-[40px] border-2 border-slate-100">
                {LANDING_TEXT.points.map((p, i) => (
                  <p key={i} className="flex gap-4 leading-relaxed items-start">
                    <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 shrink-0" />
                    {p}
                  </p>
                ))}
                <p className="leading-relaxed text-slate-700">
                  完成研究後，可選擇參加抽獎，有機會獲得一次免費 90 分鐘 1 對 1 英文寫作／IELTS 寫作輔導。抽獎登記開放至 <span className="font-black">4/22</span> 當日結束前。
                </p>
              </div>
            </div>
            <div className="px-8 pb-8">
              <button 
                onClick={handleStart}
                className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-[14px] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {LANDING_TEXT.button}
              </button>
            </div>
          </StepContainer>
        )}

        {step === 'eligibility' && (
          <StepContainer id="eligibility">
            <h2 className="text-[20px] font-black text-sky-500 mb-8 px-8 mt-6 uppercase tracking-tighter text-center">資格篩選</h2>
            <div className="flex-1 overflow-y-auto px-8 flex flex-col gap-8">
              {ELIGIBILITY_QUESTIONS.map(q => (
                <div key={q.id}>
                  <p className="text-[15px] text-slate-800 mb-4 font-bold leading-relaxed tracking-tight">{q.text}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEligibility(q.id, true)}
                      className={cn(
                        "flex-1 py-3.5 rounded-2xl border-2 text-[15px] font-black transition-all flex items-center justify-center gap-2",
                        (session.eligibility as any)[q.id] === true 
                          ? "bg-sky-500 text-white border-sky-500" 
                          : "bg-white text-slate-700 border-slate-300 hover:border-sky-500 hover:text-sky-600"
                      )}
                    >
                      是 <Check size={16} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleEligibility(q.id, false)}
                      className={cn(
                        "flex-1 py-3.5 rounded-2xl border-2 text-[15px] font-black transition-all flex items-center justify-center gap-2",
                        (session.eligibility as any)[q.id] === false 
                          ? "bg-sky-500 text-white border-sky-500" 
                          : "bg-white text-slate-700 border-slate-300 hover:border-sky-500 hover:text-sky-600"
                      )}
                    >
                      否 <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-8 py-8 mt-auto">
              <button 
                disabled={Object.values(session.eligibility).some(v => v === null)}
                onClick={checkEligibility}
                className="w-full py-4 bg-sky-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 text-white border-2 border-transparent rounded-2xl font-black uppercase tracking-widest text-[14px] transition-all active:scale-95"
              >
                下一步
              </button>
            </div>
          </StepContainer>
        )}

        {step === 'consent' && (
          <StepContainer id="consent">
            <h2 className="text-[20px] font-black text-sky-500 mb-6 px-8 mt-6 uppercase tracking-tighter text-center">知情同意書</h2>
            <div className="flex-1 px-8 pb-8">
              <div className="h-full bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100 overflow-y-auto">
                <p className="text-[15px] text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
                  {constants.CONSENT_MESSAGE}
                </p>
              </div>
            </div>
            
            <div className="px-8 pb-8 mt-auto">
              <button 
                onClick={handleConsent}
                className="w-full py-4.5 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-[14px] transition-all active:scale-95 border-2 border-transparent"
              >
                同意並繼續
              </button>
            </div>
          </StepContainer>
        )}

        {step === 'ineligible' && (
          <StepContainer id="ineligible">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <X size={28} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium px-4">{INELIGIBLE_MESSAGE}</p>
            </div>
          </StepContainer>
        )}

        {(step === 'survey_pre' || step === 'survey_post') && (
          <SurveyStage 
            id={step}
            type={step === 'survey_pre' ? 'pre' : 'post'}
            onComplete={(res) => handleSurvey(res, step === 'survey_pre' ? 'chat' : 'thanks')}
          />
        )}

        {step === 'chat' && (
          <StepContainer id="chat" className="px-0 py-0">
            {/* Header / Info Area */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-2 bg-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h1 className="text-[14px] font-black text-sky-500 uppercase tracking-tighter">訪談對話練習</h1>
                <span className="text-[9px] uppercase tracking-widest font-black text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">進行中</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(session.validTurns / 6) * 100}%` }}
                    className="h-full bg-sky-500 rounded-full"
                  />
                </div>
                <span className="text-[10px] text-slate-600 font-black whitespace-nowrap tracking-tighter">第 {session.validTurns} / 6 次回覆</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 bg-slate-50">
              {session.chatLog.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                  {msg.conditionLabel && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-[1px] w-4 bg-slate-300" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Correction</span>
                      <div className="h-[1px] w-4 bg-slate-300" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[88%] px-4 py-3.5 rounded-2xl text-[14px] leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-sky-500 text-white rounded-tr-none"
                      : msg.conditionLabel
                        ? "bg-slate-200 text-slate-800 rounded-tl-none"
                        : "bg-slate-200 text-slate-800 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-slate-200 px-4 py-3 rounded-2xl rounded-tl-none animate-pulse text-slate-700 text-[13px] font-black tracking-tight">
                    伙伴正在回應中...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 z-10 shrink-0">
              <div className="flex gap-2 items-end">
                <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-300 px-4 py-3 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500 transition-all group">
                  <textarea 
                    value={inputText}
                    onChange={e => {
                      const nextValue = e.target.value;
                      setInputText(nextValue);
                      if (chatWarning && countEnglishWords(nextValue.trim()) >= 10) {
                        setChatWarning('');
                      }
                    }}
                    placeholder="請輸入您的英文回覆..."
                    rows={2}
                    className="w-full bg-transparent border-none focus:ring-0 text-[14px] resize-none leading-relaxed outline-none placeholder:text-slate-400 font-bold text-slate-800"
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0",
                    !inputText.trim() || isLoading 
                      ? "bg-slate-200 text-white" 
                      : "bg-sky-500 text-white"
                  )}
                >
                  <Send size={18} />
                </button>
              </div>
              {chatWarning && (
                <p className="mt-2 text-[12px] text-red-600 font-semibold">
                  {chatWarning}
                </p>
              )}
            </div>
          </StepContainer>
        )}

        {step === 'thanks' && (
          <StepContainer id="thanks" hideProgress>
            <div className="flex-1 flex flex-col items-center px-6 py-10 font-sans">
              <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mb-8 ring-8 ring-sky-50/50">
                <Check size={40} strokeWidth={3} />
              </div>
              
              <h2 className="text-[28px] font-black text-sky-500 mb-6 tracking-tighter uppercase leading-none">謝謝你的參與！</h2>
              
              <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100 mb-6 w-full">
                <p className="text-[14px] text-slate-700 leading-relaxed font-bold tracking-tight">
                  非常謝謝你幫我完成這份研究！
                  <br />
                  如果你身邊也有符合資格的朋友，也歡迎把這個連結分享給他們，真的很感謝！
                </p>
                <div className="space-y-3 mt-5">
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">研究連結</p>
                  <div className="flex gap-2 p-2 bg-white border-2 border-slate-200 rounded-2xl focus-within:border-sky-500 transition-colors">
                    <input 
                      readOnly 
                      value="https://english-study-omega.vercel.app/" 
                      className="flex-1 bg-transparent border-none text-[13px] font-bold text-slate-800 focus:ring-0 overflow-hidden text-ellipsis px-2"
                    />
                    <button 
                      onClick={() => copyToClipboard("https://english-study-omega.vercel.app/")}
                      className="px-4 py-2 bg-sky-500 text-white text-[11px] font-black rounded-xl transition-all active:scale-90 shrink-0"
                    >
                      複製連結
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200">
                  <p className="text-[13px] text-slate-700 leading-relaxed font-semibold tracking-tight">
                    另外，完成研究後也可填寫抽獎表單，參加免費 90 分鐘 1 對 1 英文寫作／IELTS 寫作輔導抽獎（將以英文線上進行）。
                  </p>
                  <a
                    href="https://forms.gle/q5diCwiYGUF87Do9A"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 text-slate-700 text-[12px] font-bold rounded-lg transition-colors hover:border-sky-400 hover:text-sky-600"
                  >
                    填寫抽獎表單
                  </a>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-3">
                    抽獎表單所填寫的 Email 將另外蒐集並分開保存，不會與本研究作答內容直接連結或一起分析。
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center max-w-[360px]">
                若有任何問題或意見，歡迎來信聯絡研究者：
                <a href="mailto:m11410801@mail.ntust.edu.tw" className="text-slate-600 hover:text-sky-600 ml-1">
                  m11410801@mail.ntust.edu.tw
                </a>
              </p>
            </div>
          </StepContainer>
        )}
      </AnimatePresence>

      {DEV_TOOLS_ENABLED && (
        <>
          {/* Dev Mode Toggle */}
          <div className="fixed bottom-4 left-4 z-50">
            <button 
              onClick={() => setDevMode(!devMode)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                devMode ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-400"
              )}
            >
              <Settings size={14} />
            </button>
          </div>

          {devMode && (
            <div className="fixed inset-x-4 bottom-16 z-50 bg-white border-2 border-amber-500 rounded-2xl p-4 max-w-sm mx-auto overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <span className="font-bold text-amber-600 flex items-center gap-2 text-sm"><Settings size={16} /> Dev Controls</span>
                <button onClick={() => setDevMode(false)}><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span>Condition:</span>
                  <div className="flex gap-1">
                    {(['A', 'B', 'C'] as Condition[]).map(c => (
                      <button 
                        key={c}
                        onClick={() => setSession(p => ({ ...p, condition: c }))}
                        className={cn("px-2 py-1 rounded", session.condition === c ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleDevJumpToChat} className="text-[10px] py-1 bg-sky-500 text-white rounded">Jump to Chat</button>
                  <button 
                    onClick={() => {
                      const id = generateSessionId();
                      setSession({ 
                        sessionId: id, timestamp: new Date().toISOString(), eligibility: { age: true, taiwanese: true, nativeEnglish: false, canChat: true }, consent: true, condition: 'B', preSurvey: {}, chatLog: [], validTurns: 0, postSurvey: {}, status: 'started' 
                      });
                      setStep('landing');
                    }} 
                    className="text-[10px] py-1 bg-red-500 text-white rounded flex items-center justify-center gap-1"
                  >
                    <RefreshCcw size={10} /> Reset Session
                  </button>
                  <button
                    onClick={() => setStep('thanks')}
                    className="text-[10px] py-1 bg-emerald-500 text-white rounded col-span-2"
                  >
                    Jump to Thank You
                  </button>
                </div>
                {devError && (
                  <p className="text-[10px] text-red-600 font-semibold">{devError}</p>
                )}
                <div className="border-t pt-2 flex flex-col gap-1">
                  <a href="/api/export?format=json" target="_blank" className="text-[10px] text-sky-600 flex items-center gap-1 hover:underline">Export JSON</a>
                  <a href="/api/export?format=csv" target="_blank" className="text-[10px] text-sky-600 flex items-center gap-1 hover:underline">Export Summary CSV</a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
