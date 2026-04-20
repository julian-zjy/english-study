
export const LIKERT_LABELS = {
  1: '非常不同意',
  7: '非常同意'
};

export const PRE_SURVEY_ITEMS = [
  '我現在願意用英文表達自己的想法。',
  '就算一時想不到最精確的說法，我也可以繼續用英文表達。',
  '如果我說得不夠準確，我會很在意。',
  '當我沒辦法用英文準確表達自己的意思時，我會對自己失望。'
];

export const POST_SURVEY_ITEMS = [
  ...PRE_SURVEY_ITEMS,
  '這段互動讓我更容易用英文表達自己的想法。',
  '我在這段互動中感受到被支持。',
  '如果有這種英文練習工具，我會願意繼續使用。'
];

export const ELIGIBILITY_QUESTIONS = [
  { id: 'age', text: '您是否年滿 18 歲？' },
  { id: 'taiwanese', text: '您是否為台灣人？' },
  { id: 'nativeEnglish', text: '英文是否為您的母語？' },
  { id: 'canChat', text: '您是否可以用英文完成一段簡短的文字對話，主題和英語學習經驗有關？' }
];

export const LANDING_TEXT = {
  title: '英文學習研究',
  points: [
    '這是一項針對課堂專案進行的簡短研究。',
    '參與過程完全匿名，不會收集您的個人身份資料。',
    '參與者將與 AI 聊天機器人進行英文文字對話互動。',
    '預計花費時間約 8–10 分鐘。',
    '請一次完成。'
  ],
  button: '開始參與'
};

export const CONSENT_MESSAGE = `本研究旨在探討不同類型的聊天機器人互動對英文學習體驗的影響。您的參與完全是隨機的且為匿名。

1. 本研究將與 AI 聊天機器人進行短暫的英文文字對話。
2. 參與過程完全匿名，研究團隊不會收集任何可識別您個人身份的資料。
3. 您隨時可以中止實驗，不需負擔任何責任。
4. 您的對話記錄與問卷資料將僅用於學術分析，並以去識別化的方式處理。
5. 本研究無已知的重大風險。

若您同意以上內容，請點擊下方的按鈕以繼續。`;

export const CONSENT_TEXT = '同意並繼續';

export const SURVEY_INSTRUCTION = '請根據您目前的情況，回答下列問題以繼續：';

export const PROGRESS_LABELS = [
  '資格',
  '同意',
  '前測',
  '對話',
  '後測'
];

export const INELIGIBLE_MESSAGE = '抱歉，根據您的回答，您不符合本次研究的參與資格。感謝您的關注。';

export const CHAT_INSTRUCTIONS = 
  '哈囉！這是一段簡短的英文對話練習。請你用英文和我聊聊你學英文、特別是英文口說的經驗與感受。你可以談談哪些情況會讓你比較卡住、開口說英文時的感受、還有當你一時想不到最剛好的英文時，通常會怎麼做。當你完成 6 次有效回覆後，系統將自動跳轉至下一頁。請先用英文回答：對你來說，英文口說最困難的地方是什麼？';

export const VALID_TURN_PROMPT = '請再多寫一點，盡量用英文多描述一些你的想法或經驗。';

export const THANK_YOU_MESSAGE = '研究已完成，非常感謝您的參與與奉獻！您的資料已安全儲存。';
