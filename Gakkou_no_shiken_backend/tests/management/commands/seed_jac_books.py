import os
import asyncio
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from tests.models import ExamBook, BookTopic
import edge_tts

# Voice to use for Japanese TTS
VOICE_NAME = "ja-JP-NanamiNeural"

# All JAC Examination Books & Guides
JAC_BOOKS_DATA = [
    # ── JAPANESE (Official Textbooks & Condensed Study Guides) ──
    {
        "title": "建築分野 特定技能1号 評価試験テキスト (建築学科)",
        "title_ja": "建築分野 学科テキスト",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "ja",
        "language_name": "日本語 (Japanese)",
        "language_flag": "🇯🇵",
        "book_type": ExamBook.BookType.TEXTBOOK,
        "pdf_url": "https://jac-skill.or.jp/exam/files/text1k.pdf",
        "description": "JAC公式の建築分野特定技能1号評価試験テキスト。日本の建設現場の基本、施工体制、各種専門工事、安全衛生、5S活動などを網羅。",
        "total_pages": 120,
        "order": 1,
    },
    {
        "title": "建築分野 学習用勉強資料 ( condensed )",
        "title_ja": "建築分野 学習用まとめ資料",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "ja",
        "language_name": "日本語 (Japanese)",
        "language_flag": "🇯🇵",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk.pdf",
        "description": "学習を効率的に進められるよう再編集された建築分野の短期集中学習テキスト。",
        "total_pages": 48,
        "order": 2,
    },
    {
        "title": "土木分野 特定技能1号 評価試験テキスト (土木学科)",
        "title_ja": "土木分野 学科テキスト",
        "category": ExamBook.Category.CIVIL,
        "language": "ja",
        "language_name": "日本語 (Japanese)",
        "language_flag": "🇯🇵",
        "book_type": ExamBook.BookType.TEXTBOOK,
        "pdf_url": "https://jac-skill.or.jp/exam/files/text1d.pdf",
        "description": "JAC公式の土木分野評価試験テキスト。道路、ダム、トンネル、海洋土木、重機安全、施工計画などを完全収録。",
        "total_pages": 115,
        "order": 3,
    },
    {
        "title": "土木分野 学習用勉強資料",
        "title_ja": "土木分野 学習用まとめ資料",
        "category": ExamBook.Category.CIVIL,
        "language": "ja",
        "language_name": "日本語 (Japanese)",
        "language_flag": "🇯🇵",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd.pdf",
        "description": "試験前の総復習に最適な土木分野の condensed 要点まとめ資料。",
        "total_pages": 44,
        "order": 4,
    },
    {
        "title": "ライフライン・設備分野 特定技能1号 テキスト",
        "title_ja": "ライフライン・設備分野 学科テキスト",
        "category": ExamBook.Category.LIFELINE,
        "language": "ja",
        "language_name": "日本語 (Japanese)",
        "language_flag": "🇯🇵",
        "book_type": ExamBook.BookType.TEXTBOOK,
        "pdf_url": "https://jac-skill.or.jp/exam/files/text1l.pdf",
        "description": "上下水道、ガス、電気通信、空調給排水などのライフライン設備工事を学ぶ専門テキスト。",
        "total_pages": 110,
        "order": 5,
    },
    {
        "title": "ライフライン・設備分野 学習用勉強資料",
        "title_ja": "ライフライン・設備分野 学習用まとめ資料",
        "category": ExamBook.Category.LIFELINE,
        "language": "ja",
        "language_name": "日本語 (Japanese)",
        "language_flag": "🇯🇵",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextl.pdf",
        "description": "配管、空調、電気などの重要ポイントを凝縮した勉強資料。",
        "total_pages": 42,
        "order": 6,
    },

    # ── ENGLISH ──
    {
        "title": "Architecture (Construction) Study Textbook - English",
        "title_ja": "建築分野 学習用勉強資料 (英語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "en",
        "language_name": "English",
        "language_flag": "🇺🇸",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_en.pdf",
        "description": "Comprehensive English translation reference for Specified Skills Architecture Exam candidates.",
        "total_pages": 147,
        "order": 10,
    },
    {
        "title": "Civil Engineering Study Textbook - English",
        "title_ja": "土木分野 学習用勉強資料 (英語)",
        "category": ExamBook.Category.CIVIL,
        "language": "en",
        "language_name": "English",
        "language_flag": "🇺🇸",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_en.pdf",
        "description": "Official English study textbook covering Civil Engineering fundamentals and Japanese site practices.",
        "total_pages": 147,
        "order": 11,
    },
    {
        "title": "Infrastructure Facilities & Lifeline - English",
        "title_ja": "ライフライン・設備分野 学習用資料 (英語)",
        "category": ExamBook.Category.LIFELINE,
        "language": "en",
        "language_name": "English",
        "language_flag": "🇺🇸",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctexti_en.pdf",
        "description": "English translated study textbook covering piping, plumbing, electrical, and gas facilities.",
        "total_pages": 46,
        "order": 12,
    },

    # ── BENGALI (বাংলা) ──
    {
        "title": "নির্মাণ ক্ষেত্র (Architecture) পরীক্ষার স্টাডি টেক্সটবুক - বাংলা",
        "title_ja": "建築分野 学習用勉強資料 (ベンガル語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "bn",
        "language_name": "বাংলা (Bengali)",
        "language_flag": "🇧🇩",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_bn.pdf",
        "description": "জাপান কনস্ট্রাকশন স্কিল টেস্ট (JAC) আর্কিটেকচার পরীক্ষার সম্পূর্ণ বাংলা অনুবাদ সহায়িকা।",
        "total_pages": 150,
        "order": 20,
    },
    {
        "title": "সিভিল ইঞ্জিনিয়ারিং (Civil) পরীক্ষার স্টাডি টেক্সটবুক - বাংলা",
        "title_ja": "土木分野 学習用勉強資料 (ベンガル語)",
        "category": ExamBook.Category.CIVIL,
        "language": "bn",
        "language_name": "বাংলা (Bengali)",
        "language_flag": "🇧🇩",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_bn.pdf",
        "description": "জাপানে সিভিল কনস্ট্রাকশন কাজের নিরাপত্তা, যন্ত্রপাতি ও কাজের নিয়ম সংক্রান্ত বাংলা সহায়ক বই।",
        "total_pages": 46,
        "order": 21,
    },
    {
        "title": "লাইফলাইন ও অবকাঠামো (Lifeline/Facilities) - বাংলা",
        "title_ja": "ライフライン・設備分野 学習用資料 (ベンガル語)",
        "category": ExamBook.Category.LIFELINE,
        "language": "bn",
        "language_name": "বাংলা (Bengali)",
        "language_flag": "🇧🇩",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextl_bn.pdf",
        "description": "পাইপিং, গ্যাস, বৈদ্যুতিক এবং শীতাতপ নিয়ন্ত্রণ সরঞ্জাম কাজের জন্য বাংলা অনুবাদ পাঠ্যপুস্তক।",
        "total_pages": 44,
        "order": 22,
    },

    # ── VIETNAMESE (Tiếng Việt) ──
    {
        "title": "Giáo Trình Ôn Thi Ngành Xây Dựng (Kiến Trúc) - Tiếng Việt",
        "title_ja": "建築分野 学習用勉強資料 (ベトナム語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "vi",
        "language_name": "Tiếng Việt (Vietnamese)",
        "language_flag": "🇻🇳",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_vn.pdf",
        "description": "Tài liệu học tập kỳ thi đánh giá kỹ năng đặc định số 1 ngành Xây dựng kiến trúc bản tiếng Việt.",
        "total_pages": 138,
        "order": 30,
    },
    {
        "title": "Giáo Trình Ôn Thi Kỹ Năng Ngành Cầu Đường (Xây Dựng Dân Dụng) - Tiếng Việt",
        "title_ja": "土木分野 学習用勉強資料 (ベトナム語)",
        "category": ExamBook.Category.CIVIL,
        "language": "vi",
        "language_name": "Tiếng Việt (Vietnamese)",
        "language_flag": "🇻🇳",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_vn.pdf",
        "description": "Tài liệu ôn thi ngành cầu đường (Doboku) kèm từ vựng kỹ thuật và an toàn lao động.",
        "total_pages": 136,
        "order": 31,
    },
    {
        "title": "Giáo Trình Ngành Hạ Tầng Thiết Bị & Đường Ống - Tiếng Việt",
        "title_ja": "ライフライン・設備分野 学習用資料 (ベトナム語)",
        "category": ExamBook.Category.LIFELINE,
        "language": "vi",
        "language_name": "Tiếng Việt (Vietnamese)",
        "language_flag": "🇻🇳",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextl_vn.pdf",
        "description": "Tài liệu đào tạo các công trình cấp thoát nước, thông gió, điện chiếu sáng tại Nhật.",
        "total_pages": 44,
        "order": 32,
    },

    # ── INDONESIAN (Bahasa Indonesia) ──
    {
        "title": "Buku Panduan Belajar Ujian Konstruksi Arsitektur - Bahasa Indonesia",
        "title_ja": "建築分野 学習用勉強資料 (インドネシア語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "id",
        "language_name": "Bahasa Indonesia",
        "language_flag": "🇮🇩",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_id.pdf",
        "description": "Materi panduan belajar resmi ujian Tokutei Ginou bidang arsitektur konstruksi JAC Jepang.",
        "total_pages": 152,
        "order": 40,
    },
    {
        "title": "Buku Panduan Belajar Teknik Sipil (Doboku) - Bahasa Indonesia",
        "title_ja": "土木分野 学習用勉強資料 (インドネシア語)",
        "category": ExamBook.Category.CIVIL,
        "language": "id",
        "language_name": "Bahasa Indonesia",
        "language_flag": "🇮🇩",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_id.pdf",
        "description": "Panduan teknik sipil, keselamatan kerja di lapangan, dan pengoperasian alat berat.",
        "total_pages": 46,
        "order": 41,
    },
    {
        "title": "Panduan Belajar Fasilitas & Saluran Pipa (Lifeline) - Bahasa Indonesia",
        "title_ja": "ライフライン・設備分野 学習用資料 (インドネシア語)",
        "category": ExamBook.Category.LIFELINE,
        "language": "id",
        "language_name": "Bahasa Indonesia",
        "language_flag": "🇮🇩",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextl_id.pdf",
        "description": "Buku panduan pekerjaan pipa air, gas, dan sistem kelistrikan di lokasi konstruksi Jepang.",
        "total_pages": 44,
        "order": 42,
    },

    # ── TAGALOG (Philippines) ──
    {
        "title": "Aklat sa Pag-aaral ng Pagsusulit sa Arkitektura - Tagalog",
        "title_ja": "建築分野 学習用勉強資料 (タガログ語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "tl",
        "language_name": "Tagalog (Filipino)",
        "language_flag": "🇵🇭",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_tl.pdf",
        "description": "Gabay sa pag-aaral ng Specified Skilled Worker Exam para sa construction sa wikang Tagalog.",
        "total_pages": 164,
        "order": 50,
    },
    {
        "title": "Aklat sa Pag-aaral ng Civil Engineering - Tagalog",
        "title_ja": "土木分野 学習用勉強資料 (タガログ語)",
        "category": ExamBook.Category.CIVIL,
        "language": "tl",
        "language_name": "Tagalog (Filipino)",
        "language_flag": "🇵🇭",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_tl.pdf",
        "description": "Mga pangunahing kaalaman sa civil engineering at mga patakaran sa kaligtasan sa lugar ng trabaho.",
        "total_pages": 162,
        "order": 51,
    },

    # ── MYANMAR / BURMESE ──
    {
        "title": "အဆောက်အအုံဆောက်လုပ်ရေး စာမေးပွဲလေ့လာရန်ဖတ်စာအုပ် - မြန်မာ",
        "title_ja": "建築分野 学習用勉強資料 (ミャンマー語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "my",
        "language_name": "မြန်မာ (Burmese)",
        "language_flag": "🇲🇲",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_mm.pdf",
        "description": "ဂျပန်ဆောက်လုပ်ရေး ကျွမ်းကျင်မှုစာမေးပွဲ အထောက်အကူပြု မြန်မာဘာသာပြန်ဖတ်စာအုပ်။",
        "total_pages": 50,
        "order": 60,
    },
    {
        "title": "မြို့ပြအင်ဂျင်နီယာဆိုင်ရာ လေ့လာရန်စာအုပ် (Doboku) - မြန်မာ",
        "title_ja": "土木分野 学習用勉強資料 (ミャンマー語)",
        "category": ExamBook.Category.CIVIL,
        "language": "my",
        "language_name": "မြန်မာ (Burmese)",
        "language_flag": "🇲🇲",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_mm.pdf",
        "description": "မြေကြီးလုပ်ငန်း၊ လမ်းတံတားနှင့် ဘေးကင်းလုံခြုံရေးဆိုင်ရာ မြန်မာဘာသာပြန်ဖတ်စာအုပ်။",
        "total_pages": 46,
        "order": 61,
    },

    # ── NEPALI ──
    {
        "title": "निर्माण क्षेत्र (वास्तुकला) अध्ययन पाठ्यपुस्तक - नेपाली",
        "title_ja": "建築分野 学習用勉強資料 (ネパール語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "ne",
        "language_name": "नेपाली (Nepali)",
        "language_flag": "🇳🇵",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_ne.pdf",
        "description": "जापानको निर्दिष्ट सीप परीक्षा वास्तुकला क्षेत्रको लागि नेपाली अनुवादित अध्ययन सामग्री।",
        "total_pages": 138,
        "order": 70,
    },
    {
        "title": "सिभिल इन्जिनियरिङ अध्ययन पुस्तक - नेपाली",
        "title_ja": "土木分野 学習用勉強資料 (ネパール語)",
        "category": ExamBook.Category.CIVIL,
        "language": "ne",
        "language_name": "नेपाली (Nepali)",
        "language_flag": "🇳🇵",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextd_ne.pdf",
        "description": "सिभिल निर्माण, सुरुङ, सडक तथा सुरक्षा गतिविधिहरू सम्बन्धी नेपाली भाषामा पुस्तक।",
        "total_pages": 46,
        "order": 71,
    },

    # ── UZBEK ──
    {
        "title": "Qurilish (Arxitektura) O'quv Qo'llanmasi - O'zbekcha",
        "title_ja": "建築分野 学習用勉強資料 (ウズベク語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "uz",
        "language_name": "Oʻzbekcha (Uzbek)",
        "language_flag": "🇺🇿",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_uz.pdf",
        "description": "Yaponiya maxsus malakali qurilish imtihoni uchun o'zbek tilidagi qo'llanma.",
        "total_pages": 50,
        "order": 80,
    },

    # ── CHINESE (Simplified) ──
    {
        "title": "建筑领域特定技能1号评估考试学习资料 - 中文",
        "title_ja": "建築分野 学習用勉強資料 (中国語)",
        "category": ExamBook.Category.ARCHITECTURE,
        "language": "zh-CN",
        "language_name": "简体中文 (Chinese)",
        "language_flag": "🇨🇳",
        "book_type": ExamBook.BookType.STUDY_GUIDE,
        "pdf_url": "https://jac-skill.or.jp/exam/files/ctextk_zh-CN.pdf",
        "description": "日本建筑领域特定技能1号评估考试官方参考资料中文版。",
        "total_pages": 50,
        "order": 90,
    },
]

# Core Chapters & Topics mapped to exact PDF pages of the 120-page textbook
CORE_TOPICS = [
    {
        "page_number": 1,
        "topic_type": BookTopic.TopicType.CHAPTER,
        "title": "Chapter 1: Principles of Japanese Workplaces",
        "title_ja": "第1章 日本の現場で大切にしていること",
        "summary_text": "Teamwork between specialized subcontractors and general contractors (ゼネコン) is vital. Supervisors (現場監督) and foremen (職長) guide junior workers.",
        "japanese_script": "第１章 日本の現場で大切にしていること。建設工事では、さまざまな専門工事事業者がゼネコンから仕事を請け負って工事を進めます。職長が技能者に指示を出します。",
        "audio_duration": "00:28",
        "order": 1,
    },
    {
        "page_number": 2,
        "topic_type": BookTopic.TopicType.SECTION,
        "title": "1.3 Construction Career Up System (CCUS)",
        "title_ja": "1.3 建設キャリアアップシステム (CCUS)",
        "summary_text": "A 4-level card system (White -> Blue -> Silver -> Gold). Foreign trainees start at Level 1 (White). Level 2 requires at least 645 days (3 years) of registered work.",
        "japanese_script": "建設キャリアアップシステムでは、技能者のレベルが４つに分けられ、カードが発行されます。白、青、シルバー、ゴールドの４色です。みなさんはレベル１のホワイトからスタートします。",
        "audio_duration": "00:25",
        "order": 2,
    },
    {
        "page_number": 3,
        "topic_type": BookTopic.TopicType.SECTION,
        "title": "1.4 Greetings & Safety Salutes",
        "title_ja": "1.4 あいさつと「ご安全に」",
        "summary_text": "Daily greetings prevent accidents and build unity. Key phrases: 'おはようございます' (Good morning), 'おつかれさまです' (Thank you for your hard work), and 'ご安全に' (Be Safe!).",
        "japanese_script": "建設現場で最も基本的で大切なことが挨拶です。朝は、おはようございます。現場では事故を防ぐために、ご安全に、と声をかけ合います。",
        "audio_duration": "00:22",
        "order": 3,
    },
    {
        "page_number": 4,
        "topic_type": BookTopic.TopicType.SECTION,
        "title": "1.5 Morning Assembly & KY Hazard Prediction",
        "title_ja": "1.5 朝礼と危険予知活動 (KY活動)",
        "summary_text": "Daily meeting before work starts: Radio calisthenics (ラジオ体操), work content confirmation, and Kiken Yochi (KY activity) to predict dangers before they occur.",
        "japanese_script": "毎朝の朝礼では、ラジオ体操を行い、その日の作業内容を確認します。そして危険予知活動、KY活動を行い、事故を未然に防ぎます。",
        "audio_duration": "00:24",
        "order": 4,
    },
    {
        "page_number": 5,
        "topic_type": BookTopic.TopicType.SAFETY,
        "title": "Safety Chanting (Touch & Call)",
        "title_ja": "安全唱和「ゼロ災で行こう、ヨシ‼」",
        "summary_text": "Touch & Call: All workers point together and chant the safety slogan: 'ゼロ災で行こう、ヨシ‼' (Let's aim for zero accidents, Yoshi!!).",
        "japanese_script": "安全唱和、タッチアンドコールです。全員で指差しをしながら大きな声で唱和します。「ゼロ災で行こう、ヨシ！」",
        "audio_duration": "00:18",
        "order": 5,
    },
    {
        "page_number": 7,
        "topic_type": BookTopic.TopicType.CHAPTER,
        "title": "Chapter 2: Labor Laws & Regulations",
        "title_ja": "第2章 守らなければならない法令",
        "summary_text": "Labor Standards Act, Industrial Safety & Health Act. Working hours limit: 40 hrs/week, 8 hrs/day. 30 days advance notice required for dismissal.",
        "japanese_script": "第２章 日本の現場で働く上で守らなければならない法令。労働基準法では、法定労働時間は原則、週４０時間、１日８時間と定められています。",
        "audio_duration": "00:24",
        "order": 6,
    },
    {
        "page_number": 10,
        "topic_type": BookTopic.TopicType.SAFETY,
        "title": "Preventing Falls & Heat Stroke (熱中症)",
        "title_ja": "墜落・転落防止と熱中症予防",
        "summary_text": "Falls are the #1 cause of fatal construction accidents (110 out of 288 deaths). Full harness safety equipment is strictly required for work at heights.",
        "japanese_script": "建設業の死亡災害で最も多いのは墜落・転落です。高所作業では、フルハーネス型墜落制止用器具を確実に装着してください。夏は水分と塩分を補給して熱中症を予防しましょう。",
        "audio_duration": "00:27",
        "order": 7,
    },
    {
        "page_number": 19,
        "topic_type": BookTopic.TopicType.CHAPTER,
        "title": "Chapter 3: Construction Categories & Trades",
        "title_ja": "第3章 建設工事の種類と業務",
        "summary_text": "Civil engineering (dams, rivers, roads, tunnels, marine works), Architecture (RC, Steel frame, Wooden buildings), Lifeline facilities (piping, electrical, HVAC).",
        "japanese_script": "第３章 建設工事の種類と業務。土木工事にはダムや道路、トンネル工事があります。建築工事には鉄筋コンクリート造や鉄骨造、木造があります。",
        "audio_duration": "00:25",
        "order": 8,
    },
    {
        "page_number": 32,
        "topic_type": BookTopic.TopicType.SECTION,
        "title": "Steel & Rebar Reinforcement Work",
        "title_ja": "3.2.10 鉄骨工事・3.2.11 鉄筋工事",
        "summary_text": "Rebar provides tensile strength while concrete provides compressive strength. Rebar connections: Gas pressure welding, couplers, lap splicing.",
        "japanese_script": "コンクリートは圧縮に強いですが、引っ張る力には弱いです。鉄筋は引っ張りに強いため、コンクリートの中に鉄筋を配置して強い構造物を作ります。",
        "audio_duration": "00:26",
        "order": 9,
    },
    {
        "page_number": 48,
        "topic_type": BookTopic.TopicType.CHAPTER,
        "title": "Chapter 4: Site Terminology, Greetings & 5S",
        "title_ja": "第4章 現場用語と5S活動",
        "summary_text": "The 5S Activity: Seiri (Sort), Seiton (Set in order), Seisou (Shine), Seiketsu (Standardize), Shituke (Sustain). 'Ho-Ren-So' (Report, Communicate, Consult).",
        "japanese_script": "第４章 建設現場の５Ｓ活動です。整理、整頓、清掃、清潔、しつけの５つです。また、ほうれんそう、報告、連絡、相談を徹底しましょう。",
        "audio_duration": "00:25",
        "order": 10,
    },
    {
        "page_number": 63,
        "topic_type": BookTopic.TopicType.CHAPTER,
        "title": "Chapter 5: Tools, Heavy Machinery & Safety",
        "title_ja": "第5章 工事現場で使われる工具・機械",
        "summary_text": "Hydraulic excavators (バックホウ), rollers (転圧機), cranes. Power tools: Impact driver, circular saw (丸のこ - watch out for kickback!).",
        "japanese_script": "第５章 工事現場で使われる工具と機械です。油圧ショベル、クレーン、電動工具の丸のこでは、キックバックによる重大事故に十分注意してください。",
        "audio_duration": "00:26",
        "order": 11,
    },
    {
        "page_number": 107,
        "topic_type": BookTopic.TopicType.CHAPTER,
        "title": "Chapter 7: Safety Management & Fall Protection",
        "title_ja": "第7章 建設工事の安全と三大災害",
        "summary_text": "Top 3 Disasters (三大災害): 1. Falls & Drops, 2. Heavy machinery accidents, 3. Collapses. Full harness is mandatory over 5m/6.75m heights.",
        "japanese_script": "第７章 建設工事の安全です。三大災害は、墜落・転落、建設機械災害、崩壊・倒壊です。高所作業では必ずフルハーネスを装着し、今日も一日ご安全に！",
        "audio_duration": "00:27",
        "order": 12,
    },

    # ── IMPORTANT HIGH-FREQUENCY EXAM QUESTIONS ──
    {
        "page_number": 5,
        "topic_type": BookTopic.TopicType.QUESTION,
        "title": "Exam Q1: Safety Slogan Chanting at Morning Meeting",
        "title_ja": "重要問題1：朝礼での安全唱和",
        "summary_text": "Question: 朝礼で職種ごとに行う安全唱和（タッチアンドコール）でよく使われるスローガンはどれですか？\nAnswer: 「ゼロ災で行こう、ヨシ‼」",
        "question_options": [
            "A. 早く終わらせよう、ヨシ！",
            "B. ゼロ災で行こう、ヨシ‼",
            "C. 静かに作業しよう、ヨシ！",
            "D. 給料アップだ、ヨシ！"
        ],
        "correct_answer": "B. ゼロ災で行こう、ヨシ‼",
        "japanese_script": "問題です。朝礼で全員で行う安全唱和のスローガンは何ですか？正解は、ゼロ災で行こう、ヨシ！です。",
        "audio_duration": "00:19",
        "order": 20,
    },
    {
        "page_number": 10,
        "topic_type": BookTopic.TopicType.QUESTION,
        "title": "Exam Q2: Most Common Cause of Fatal Construction Accidents",
        "title_ja": "重要問題2：建設業で最も多い死亡災害の原因",
        "summary_text": "Question: 建設業の死亡労働災害のうち、最も件数が多い原因は何ですか？\nAnswer: 墜落・転落 (全体の約4割)",
        "question_options": [
            "A. 交通事故",
            "B. 熱中症",
            "C. 墜落・転落",
            "D. 感電"
        ],
        "correct_answer": "C. 墜落・転落",
        "japanese_script": "問題です。日本の建設業で最も多い死亡労働災害の原因は何ですか？正解は、墜落・転落です。全体の約４割を占めています。",
        "audio_duration": "00:21",
        "order": 21,
    },
    {
        "page_number": 59,
        "topic_type": BookTopic.TopicType.QUESTION,
        "title": "Exam Q3: Meaning of the 5S Activity",
        "title_ja": "重要問題3：5S活動の5つの言葉",
        "summary_text": "Question: 日本の職場環境を良くするための「5S活動」に含まれないものはどれですか？\nAnswer: 「睡眠 (Suimin)」 (正しくは: 整理・整頓・清掃・清潔・しつけ)",
        "question_options": [
            "A. 整理 (Seiri)",
            "B. 整頓 (Seiton)",
            "C. 睡眠 (Suimin)",
            "D. 清掃 (Seisou)"
        ],
        "correct_answer": "C. 睡眠 (Suimin)",
        "japanese_script": "問題です。５Ｓ活動に含まれないものはどれですか？正解は、睡眠です。５Ｓは整理、整頓、清掃、清潔、しつけです。",
        "audio_duration": "00:22",
        "order": 22,
    },
    {
        "page_number": 116,
        "topic_type": BookTopic.TopicType.QUESTION,
        "title": "Exam Q4: Mandatory Equipment for Work at Heights",
        "title_ja": "重要問題4：高所作業で必須の装備",
        "summary_text": "Question: 高所作業で墜落事故を防ぐために着用が義務付けられている保護具はどれですか？\nAnswer: フルハーネス型墜落制止用器具",
        "question_options": [
            "A. 運動靴",
            "B. フルハーネス型墜落制止用器具",
            "C. 遮光サングラス",
            "D. 耳栓"
        ],
        "correct_answer": "B. フルハーネス型墜落制止用器具",
        "japanese_script": "問題です。高所作業で着用が義務付けられている安全器具は何ですか？正解は、フルハーネス型墜落制止用器具です。",
        "audio_duration": "00:20",
        "order": 23,
    },
]


def generate_audio_for_topic(topic, media_dir):
    """Generates an MP3 file using Edge-TTS and attaches it to the topic."""
    if not topic.japanese_script:
        return None

    filename = f"topic_{topic.id}_{topic.page_number}.mp3"
    filepath = os.path.join(media_dir, filename)

    async def _speak():
        tts = edge_tts.Communicate(topic.japanese_script, VOICE_NAME, rate="-4%")
        await tts.save(filepath)

    try:
        asyncio.run(_speak())
        topic.audio_file = f"book_audios/{filename}"
        topic.save(update_fields=['audio_file'])
        return filename
    except Exception as e:
        print(f"Error generating audio for topic {topic.id}: {e}")
        return None


class Command(BaseCommand):
    help = "Seed all JAC Examination books across all languages and generate neural audio for topics"

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-audio',
            action='store_true',
            help='Skip neural audio generation to seed books rapidly',
        )

    def handle(self, *args, **options):
        skip_audio = options.get('skip_audio', False)

        self.stdout.write(self.style.NOTICE("1. Seeding JAC Examination Books across 15+ languages..."))
        created_books = []
        for b_data in JAC_BOOKS_DATA:
            book, created = ExamBook.objects.update_or_create(
                title=b_data["title"],
                defaults={
                    "title_ja": b_data.get("title_ja", ""),
                    "category": b_data["category"],
                    "language": b_data["language"],
                    "language_name": b_data["language_name"],
                    "language_flag": b_data.get("language_flag", ""),
                    "book_type": b_data["book_type"],
                    "pdf_url": b_data["pdf_url"],
                    "description": b_data.get("description", ""),
                    "total_pages": b_data.get("total_pages", 120),
                    "order": b_data.get("order", 0),
                    "is_published": True,
                }
            )
            created_books.append(book)
            status_txt = "Created" if created else "Updated"
            try:
                self.stdout.write(f"   [{status_txt}] [{book.language}] {book.title} ({book.language_name})")
            except Exception:
                self.stdout.write(f"   [{status_txt}] [{book.language}] Book ID {book.id}")

        self.stdout.write(self.style.SUCCESS(f"[OK] Total {len(created_books)} JAC books ready in database."))

        # Attach Core Chapters, Topics and Important Questions to the primary textbooks
        primary_books = ExamBook.objects.filter(
            category__in=[ExamBook.Category.ARCHITECTURE, ExamBook.Category.CIVIL]
        )

        self.stdout.write(self.style.NOTICE("\n2. Linking Topics, Chapters & Important Questions..."))
        all_topics_to_audio = []

        # Attach the full curriculum and exam questions to all books in the catalog
        target_books = ExamBook.objects.all()

        for target_book in target_books:
            for t_data in CORE_TOPICS:
                topic, created = BookTopic.objects.update_or_create(
                    book=target_book,
                    title=t_data["title"],
                    defaults={
                        "title_ja": t_data.get("title_ja", ""),
                        "page_number": t_data["page_number"],
                        "topic_type": t_data["topic_type"],
                        "summary_text": t_data.get("summary_text", ""),
                        "question_options": t_data.get("question_options"),
                        "correct_answer": t_data.get("correct_answer", ""),
                        "japanese_script": t_data.get("japanese_script", ""),
                        "audio_duration": t_data.get("audio_duration", "00:30"),
                        "order": t_data.get("order", 0),
                    }
                )
                if target_book.language == "ja":
                    all_topics_to_audio.append(topic)

        self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(CORE_TOPICS)} topics and questions per target book."))

        # Generate Audio
        if not skip_audio:
            media_dir = os.path.join("media", "book_audios")
            os.makedirs(media_dir, exist_ok=True)
            self.stdout.write(self.style.NOTICE("\n3. Generating Neural Japanese Audio (Edge-TTS)..."))

            for t in all_topics_to_audio:
                fn = generate_audio_for_topic(t, media_dir)
                if fn:
                    try:
                        self.stdout.write(self.style.SUCCESS(f"   [Audio OK] P.{t.page_number} - {t.title_ja}"))
                    except Exception:
                        self.stdout.write(self.style.SUCCESS(f"   [Audio OK] P.{t.page_number}"))

            # Also clone audio links to other language versions of the same topics
            japanese_topics = BookTopic.objects.filter(book__language="ja", audio_file__isnull=False)
            for jt in japanese_topics:
                # Find matching topics in other books by page_number and title_ja
                matching = BookTopic.objects.filter(
                    page_number=jt.page_number,
                    title_ja=jt.title_ja,
                    audio_file=""
                )
                for mt in matching:
                    mt.audio_file = jt.audio_file
                    mt.save(update_fields=['audio_file'])

            self.stdout.write(self.style.SUCCESS("[OK] Neural Japanese audio generated and linked across all languages!"))
        else:
            self.stdout.write(self.style.WARNING("Skipped audio generation (--skip-audio flag)."))
