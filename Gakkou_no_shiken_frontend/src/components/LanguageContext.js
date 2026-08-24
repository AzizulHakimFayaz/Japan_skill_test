'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    jft_basic: 'JFT-Basic',
    ssw_skills: 'SSW Skills',
    leaderboard: 'Leaderboard',
    sign_in: 'Sign In',
    register: 'Get Started',
    my_results: 'My Results',
    sign_out: 'Sign Out',
    admin_panel: 'Admin',
    cbt_portal: 'CBT Portal',
    
    // Ticker & Notices
    latest_notices: 'Latest Notices',
    live_stream: 'Live Activity',
    
    // Hero & Headers
    hero_title: 'Official Japan Visa CBT Examination Portal',
    hero_subtitle: 'Authentic Prometric CBT simulations for JFT-Basic & Specified Skilled Worker (SSW) exams with immediate CEFR scoring.',
    start_mock_exam: 'Start Mock Exam',
    explore_test_centers: 'Test Venues (BDJ01 & BDJ02)',
    
    // Test Cards
    practice_tests: 'Practice Mock Exams',
    available_tests: 'Tests Available',
    start_exam: 'Start Exam',
    practice_section: 'Practice by Section',
    requires_login: 'Requires Login',
    free_open: 'Free & Open',
    time_limit: 'Time Limit',
    questions: 'Questions',
    sections: 'Sections',
    difficulty: 'Difficulty',
    diff_introductory: 'Introductory',
    diff_standard: 'Standard A2',
    diff_diagnostic: 'Full Prometric Sim',
    not_attempted: 'Not Attempted',
    best_score: 'Best Score',
    passed_badge: 'Passed (CEFR A2)',
    
    // Coming Soon
    coming_soon: 'Coming Soon',
    coming_soon_title: 'SSW Sector Practice Exams Under Preparation',
    coming_soon_desc: 'New official-style mock test sets for Nursing Care, Food Service, and Agriculture are being published.',
    get_notified: 'Get Notified (Email/WhatsApp)',
    
    // Test Centers & Checklist
    test_centers_title: 'Prometric Bangladesh Exam Centers (BDJ01 & BDJ02)',
    test_centers_desc: 'Official test venues in Bangladesh for JFT-Basic and SSW Skills Evaluation Exams.',
    checklist_title: 'Exam Day Venue Checklist',
    checklist_passport: 'Original Machine-Readable Passport required at venue.',
    checklist_voucher: 'Printed Prometric confirmation voucher with Registration ID.',
    checklist_arrive: 'Arrive 30 minutes prior for biometric registration and locker check.',
    search_centers: 'Search BDJ01, BDJ02, address...',
    
    // Voucher & Payment
    voucher_guide_title: 'How to Buy Prometric Vouchers in Bangladesh',
    voucher_guide_desc: 'For candidates without international credit cards: purchase official vouchers in BDT via authorized bank partners or local test agencies.',
    
    // Pre-Exam Audio Check
    audio_check_title: 'Pre-Exam Audio & Headphone Check',
    audio_check_subtitle: 'Ensure your audio output is clearly audible before the 60-minute countdown starts.',
    audio_check_prompt: 'Click "Play Sample" to listen to a native Japanese listening dialogue test clip.',
    play_sample: 'Play Audio Sample',
    pause_sample: 'Pause Audio',
    audio_confirmed: 'I Can Hear Clearly • Start Exam',
    audio_trouble: 'Having Trouble? Check system volume or plug in headphones.',
    
    // Section Practice
    select_section_title: 'Select Section to Practice',
    select_section_subtitle: 'Drill individual sections with focused timing instead of a full 60-minute mock exam.',
    sec_script_vocab: 'Script & Vocabulary (文字・語彙)',
    sec_conversation: 'Conversation & Expression (会話・表現)',
    sec_listening: 'Listening Comprehension (聴解)',
    sec_reading: 'Reading Comprehension (読解)',
    start_section_drill: 'Start Section Drill',
  },
  bn: {
    // Navigation
    home: 'হোম',
    jft_basic: 'জেএফটি-বেসিক',
    ssw_skills: 'এসএসডব্লিউ স্কিলস',
    leaderboard: 'লিডারবোর্ড',
    sign_in: 'লগ ইন',
    register: 'রেজিস্ট্রেশন',
    my_results: 'আমার ফলাফল',
    sign_out: 'সাইন আউট',
    admin_panel: 'অ্যাডমিন',
    cbt_portal: 'সিবিটি পোর্টাল',
    
    // Ticker & Notices
    latest_notices: 'জরুরি নোটিশ',
    live_stream: 'লাইভ আপডেট',
    
    // Hero & Headers
    hero_title: 'জাপান ভিসা সিবিটি পরীক্ষার প্রস্তুতি পোর্টাল',
    hero_subtitle: 'জেএফটি-বেসিক ও স্পেসিফাইড স্কিল্ড ওয়ার্কার (SSW) পরীক্ষার অফিশিয়াল প্রমেট্রিক সিবিটি মক টেস্ট এবং তাৎক্ষণিক সিইএফআর স্কোরিং।',
    start_mock_exam: 'মক টেস্ট শুরু করুন',
    explore_test_centers: 'পরীক্ষা কেন্দ্রসমূহ (BDJ01 ও BDJ02)',
    
    // Test Cards
    practice_tests: 'অনলাইন প্র্যাকটিস মক টেস্ট',
    available_tests: 'উপলব্ধ পরীক্ষা',
    start_exam: 'পরীক্ষা শুরু করুন',
    practice_section: 'সেকশন ভিত্তিক প্র্যাকটিস',
    requires_login: 'লগইন প্রয়োজন',
    free_open: 'উন্মুক্ত ও ফ্রি',
    time_limit: 'সময়সীমা',
    questions: 'প্রশ্নসংখ্যা',
    sections: 'সেকশন',
    difficulty: 'কঠিনতার স্তর',
    diff_introductory: 'প্রাথমিক লেভেল',
    diff_standard: 'স্ট্যান্ডার্ড A2',
    diff_diagnostic: 'প্রমেট্রিক সিমুলেশন',
    not_attempted: 'শুরু করা হয়নি',
    best_score: 'সেরা স্কোর',
    passed_badge: 'উত্তীর্ণ (CEFR A2)',
    
    // Coming Soon
    coming_soon: 'শীঘ্রই আসছে',
    coming_soon_title: 'এসএসডব্লিউ স্কিল পরীক্ষার নতুন সেট প্রস্তুত হচ্ছে',
    coming_soon_desc: 'নার্সিং কেয়ার, ফুড সার্ভিস এবং এগ্রিকালচার সেক্টরের নতুন প্রশ্ন সেট শীঘ্রই আপলোড করা হবে।',
    get_notified: 'আপডেট নোটিফিকেশন পান (Email/WhatsApp)',
    
    // Test Centers & Checklist
    test_centers_title: 'প্রমেট্রিক বাংলাদেশ পরীক্ষা কেন্দ্র (BDJ01 ও BDJ02)',
    test_centers_desc: 'বাংলাদেশে জেএফটি-বেসিক এবং এসএসডব্লিউ পরীক্ষার অনুমোদিত ভেন্যুসমূহ।',
    checklist_title: 'পরীক্ষার দিনের প্রয়োজনীয় চেকলিস্ট',
    checklist_passport: 'ভেন্যুতে প্রবেশের জন্য মূল পাসপোর্ট (Original Passport) বাধ্যতামূলক।',
    checklist_voucher: 'রেজিস্ট্রেশন আইডি সহ প্রিন্ট করা প্রমেট্রিক কনফার্মেশন ভাউচার।',
    checklist_arrive: 'বায়োমেট্রিক ও লকার ভেরিফিকেশনের জন্য ৩০ মিনিট আগে উপস্থিত হন।',
    search_centers: 'BDJ01, BDJ02, ঠিকানা দিয়ে খুঁজুন...',
    
    // Voucher & Payment
    voucher_guide_title: 'বাংলাদেশে প্রমেট্রিক ভাউচার ক্রয়ের নিয়ম',
    voucher_guide_desc: 'যাদের আন্তর্জাতিক ক্রেডিট কার্ড নেই: অনুমোদিত ব্যাংক পার্টনার বা লোকাল এজেন্সির মাধ্যমে টাকায় (BDT) ভাউচার সংগ্রহ করতে পারবেন।',
    
    // Pre-Exam Audio Check
    audio_check_title: 'পরীক্ষার পূর্বে অডিও ও হেডফোন চেক',
    audio_check_subtitle: 'পরীক্ষার ৬০ মিনিটের কাউন্টডাউন শুরু হওয়ার আগে নিশ্চিত করুন সাউন্ড স্পষ্টভাবে শোনা যাচ্ছে।',
    audio_check_prompt: 'টেস্ট জাপানিজ ডায়ালগ শুনতে "নমুনা অডিও শুনুন" বাটনে ক্লিক করুন।',
    play_sample: 'নমুনা অডিও শুনুন',
    pause_sample: 'অডিও থামান',
    audio_confirmed: 'সাউন্ড স্পষ্ট শোনা যাচ্ছে • পরীক্ষা শুরু করুন',
    audio_trouble: 'শব্দ শুনতে সমস্যা হলে হেডফোন চেক করুন বা ভলিউম বাড়ান।',
    
    // Section Practice
    select_section_title: 'অনুশীলনের জন্য সেকশন নির্বাচন করুন',
    select_section_subtitle: 'সম্পূর্ণ ৬০ মিনিটের পরিবর্তে নির্দিষ্ট সেকশনে ১০-২০ মিনিটের শর্ট ড্রিল প্র্যাকটিস করুন।',
    sec_script_vocab: 'বর্ণমালা ও শব্দভাণ্ডার (Script & Vocab)',
    sec_conversation: 'কথোপকথন ও অভিব্যক্তি (Conversation)',
    sec_listening: 'লিসেনিং কম্প্রিহেনশন (Listening)',
    sec_reading: 'রিডিং কম্প্রিহেনশন (Reading)',
    start_section_drill: 'সেকশন ড্রিল শুরু করুন',
  },
  ja: {
    // Navigation
    home: 'ホーム',
    jft_basic: 'JFT-Basic',
    ssw_skills: '特定技能評価試験',
    leaderboard: 'ランキング',
    sign_in: 'ログイン',
    register: '新規登録',
    my_results: '受験履歴・成績',
    sign_out: 'ログアウト',
    admin_panel: '管理画面',
    cbt_portal: 'CBTポータル',
    
    // Ticker & Notices
    latest_notices: '最新のお知らせ',
    live_stream: 'ライブ活動',
    
    // Hero & Headers
    hero_title: '公式 日本語・就労資格CBT試験対策ポータル',
    hero_subtitle: 'JFT-Basicおよび特定技能（SSW）評価試験の本番仕様CBTシミュレーションと即時CEFR採点。',
    start_mock_exam: '模擬試験を開始',
    explore_test_centers: '試験会場案内 (BDJ01 & BDJ02)',
    
    // Test Cards
    practice_tests: '公式仕様 模擬試験一覧',
    available_tests: '利用可能テスト',
    start_exam: '試験を開始する',
    practice_section: 'セクション別練習',
    requires_login: '要ログイン',
    free_open: '無料公開中',
    time_limit: '制限時間',
    questions: '問題数',
    sections: 'セクション',
    difficulty: '難易度',
    diff_introductory: '初級レベル',
    diff_standard: '標準 A2レベル',
    diff_diagnostic: '本番模試 (プロメトリック)',
    not_attempted: '未受験',
    best_score: '最高得点',
    passed_badge: '合格基準達成 (CEFR A2)',
    
    // Coming Soon
    coming_soon: '準備中',
    coming_soon_title: '特定技能分野別模擬試験は準備中です',
    coming_soon_desc: '介護、外食業、農業分野の最新CBT模擬テストを順次公開予定です。',
    get_notified: '公開通知を受け取る (Email/WhatsApp)',
    
    // Test Centers & Checklist
    test_centers_title: 'プロメトリック バングラデシュ試験会場 (BDJ01 & BDJ02)',
    test_centers_desc: 'バングラデシュにおけるJFT-Basicおよび特定技能評価試験の公式テストセンター。',
    checklist_title: '受験当日の持ち物・確認事項',
    checklist_passport: '有効なパスポート原本（コピー不可）の提示が必須です。',
    checklist_voucher: '予約確認書（Prometric Admission Ticket）の印刷物。',
    checklist_arrive: '生体認証およびロッカー手続きのため、開始30分前までに集合。',
    search_centers: '会場番号 (BDJ01, BDJ02) や住所で検索...',
    
    // Voucher & Payment
    voucher_guide_title: 'バングラデシュにおける受験バウチャー購入案内',
    voucher_guide_desc: '国際クレジットカードをお持ちでない場合、公認銀行または現地指定代理店より現地通貨（BDT）にてご購入可能です。',
    
    // Pre-Exam Audio Check
    audio_check_title: '受験前 音声・ヘッドホン動作確認',
    audio_check_subtitle: '60分の試験タイマーが始まる前に、音声が正常に聞こえることをご確認ください。',
    audio_check_prompt: '「サンプル音声を再生」をクリックして日本語の会話音声テストをお聞きください。',
    play_sample: 'サンプル音声を再生',
    pause_sample: '音声を停止',
    audio_confirmed: '音声が正常に聞こえます • 試験開始',
    audio_trouble: '音声が聞こえない場合は、音量設定またはヘッドホンの接続をご確認ください。',
    
    // Section Practice
    select_section_title: '練習するセクションを選択',
    select_section_subtitle: '60分の通し試験だけでなく、10〜20分のセクション別ドリルで効率的に対策できます。',
    sec_script_vocab: '文字・語彙 (Script & Vocabulary)',
    sec_conversation: '会話・表現 (Conversation & Expression)',
    sec_listening: '聴解 (Listening Comprehension)',
    sec_reading: '読解 (Reading Comprehension)',
    start_section_drill: 'セクション別ドリルを開始',
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('gns_language');
      if (savedLang && (savedLang === 'en' || savedLang === 'bn' || savedLang === 'ja')) {
        setLanguageState(savedLang);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'bn' || lang === 'ja') {
      setLanguageState(lang);
      try {
        localStorage.setItem('gns_language', lang);
      } catch {
        // ignore
      }
    }
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
