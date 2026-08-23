"""
JFT-Basic Data Provider
Provides structured information regarding the Japan Foundation Test for Basic Japanese (JFT-Basic),
including exam structure, official Bangladesh Prometric test center locations (BDJ01 & BDJ02),
registration guidelines, and preparation resources.
"""

from typing import Dict, Any, List

def get_jft_info() -> Dict[str, Any]:
    """Returns general overview details for the JFT-Basic exam."""
    return {
        "title": "Japan Foundation Test for Basic Japanese (JFT-Basic)",
        "subtitle": "Essential Japanese Language Proficiency Benchmark for SSW (Specified Skilled Worker) Visa Pathway",
        "purpose": (
            "The JFT-Basic measures the Japanese language communication skills required for daily life "
            "and work in Japan. It is used primarily as a prerequisite for foreign nationals entering Japan under "
            "the Specified Skilled Worker (SSW - 特定技能) visa program."
        ),
        "target_level": "A1 - A2 Level (CEFR Framework)",
        "format": "Computer-Based Testing (CBT)",
        "duration_minutes": 60,
        "total_questions": "50 – 60 Questions",
        "scoring": "10 – 250 Points (Passing score: 200 points / 80%)",
        "validity_years": 2,
        "sections": [
            {
                "id": "script_vocab",
                "name": "Script and Vocabulary (文字・語彙)",
                "description": "Tests kanji recognition, vocabulary usage, and word meanings in daily life contexts.",
                "item_count": "~12 questions"
            },
            {
                "id": "conversation",
                "name": "Conversation and Expression (会話・表現)",
                "description": "Evaluates understanding of situational dialogues, polite greetings, and standard workplace interactions.",
                "item_count": "~12 questions"
            },
            {
                "id": "listening",
                "name": "Listening Comprehension (聴解)",
                "description": "Audio-based questions assessing comprehension of spoken announcements, instructions, and conversations.",
                "item_count": "~12 questions"
            },
            {
                "id": "reading",
                "name": "Reading Comprehension (読解)",
                "description": "Short reading passages, public notices, signs, schedules, and everyday informational text.",
                "item_count": "~12 questions"
            }
        ]
    }

def get_jft_test_centers() -> List[Dict[str, Any]]:
    """Returns official Prometric Bangladesh test center venue locations (BDJ01 & BDJ02)."""
    return [
        {
            "id": "bdj01_dhanmondi",
            "center_number": "BDJ01",
            "name": "Bangladesh Dhaka Dhanmondi (BDJ01)",
            "operator": "New Horizons Computer Learning Center",
            "district": "Dhaka",
            "address": "Momtaz Plaza 3rd Floor, House 7, Road No 4, Dhanmondi, Dhaka 1205, Bangladesh",
            "latitude": 23.7397,
            "longitude": 90.3828,
            "phone": "+880 2-9674000 / +880 1711-000000",
            "email": "dhanmondi.prometric@nhbd.com",
            "capacity": "CBT Examination Lab",
            "facilities": ["AC Computer Lab", "Biometric ID Check", "Locker Storage"],
            "booking_note": "Official Prometric Center BDJ01. Formerly Bangladesh Dhaka (until June 15, 2026). Operated by New Horizons Computer Learning Center.",
            "google_map_url": "https://maps.google.com/?q=Momtaz+Plaza+Dhanmondi+Dhaka"
        },
        {
            "id": "bdj02_banani",
            "center_number": "BDJ02",
            "name": "Bangladesh Dhaka Banani (BDJ02)",
            "operator": "American Alumni Association (AAA)",
            "district": "Dhaka",
            "address": "Delta Dahlia Twr, 3rd Flr 36 Kemal Ataturk Ave, Dhaka, 1213, Bangladesh",
            "latitude": 23.7937,
            "longitude": 90.4046,
            "phone": "+880 2-9821430 / +880 2-9821431",
            "email": "testing@aaa.net.bd",
            "capacity": "CBT Examination Lab",
            "facilities": ["Audio Headsets", "High-speed LAN", "Candidate Lounge"],
            "booking_note": "Official Prometric Center BDJ02. Operated by American Alumni Association (AAA).",
            "google_map_url": "https://maps.google.com/?q=Delta+Dahlia+Tower+Kemal+Ataturk+Ave+Banani+Dhaka"
        }
    ]

def get_jft_resources() -> List[Dict[str, Any]]:
    """Returns official links, sample resources, and registration steps."""
    return [
        {
            "title": "Official Prometric Exam Booking Portal",
            "description": "Create an ID, check seat availability for BDJ01 and BDJ02, purchase vouchers, and reserve your slot.",
            "url": "https://www.prometric-jp.com/en/jftbasic/",
            "type": "Portal",
            "badge": "Registration"
        },
        {
            "title": "Official JFT-Basic Sample Questions & Practice Test",
            "description": "Try the interactive sample questions on the Japan Foundation website matching the real CBT interface.",
            "url": "https://www.jpf.go.jp/jft-basic/e/sample/sample.html",
            "type": "Practice",
            "badge": "Free Official Resource"
        },
        {
            "title": "Irodori: Japanese for Life in Japan (Free Textbook)",
            "description": "Comprehensive course material specifically aligned with the A1/A2 language competencies tested in JFT-Basic.",
            "url": "https://www.jpf.go.jp/j/urawa/irodori/",
            "type": "Study Guide",
            "badge": "Textbook & Audio"
        },
        {
            "title": "Prometric Bangladesh Voucher Payment Guide",
            "description": "Step-by-step instructions on purchasing exam vouchers in BDT for Bangladesh test takers.",
            "url": "https://www.prometric-jp.com/en/jftbasic/country/bangladesh/",
            "type": "Guide",
            "badge": "Local Guide"
        }
    ]
