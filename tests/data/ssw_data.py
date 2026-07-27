"""
SSW (Specified Skilled Worker) Skill Test Data Provider
Provides structured information regarding Specified Skilled Worker (SSW / 特定技能) sector evaluation tests,
official Bangladesh exam venues (BDJ01 & BDJ02), sector categories, and preparation syllabi.
"""

from typing import Dict, Any, List

def get_ssw_info() -> Dict[str, Any]:
    """Returns general overview details for SSW Skill Tests."""
    return {
        "title": "Specified Skilled Worker (SSW) Skills Evaluation Test",
        "subtitle": "Technical & Occupational Competency Exams for Japan's Specified Skilled Worker Visa (SSW Type 1 & Type 2)",
        "purpose": (
            "The Specified Skilled Worker (SSW) system allows foreign nationals with specialized skills and Japanese language "
            "proficiency to work in key industry sectors in Japan facing labor shortages. To qualify for SSW Type 1 visa status, "
            "candidates must pass both the JFT-Basic (or JLPT N4+) and the sector-specific Skills Evaluation Test."
        ),
        "categories_count": 12,
        "format": "CBT (Computer-Based Testing) & Practical Skill Assessment",
        "passing_threshold": "60% – 70% (Varies by sector standards)",
        "organizers": ["Prometric Japan", "OTAFF (Food Service)", "Silver Wing (Nursing Care)", "JATA (Construction)"],
    }

def get_ssw_sectors() -> List[Dict[str, Any]]:
    """Returns details for major SSW Industry Sectors, exam structures, and syllabi."""
    return [
        {
            "id": "nursing_care",
            "name": "Nursing Care (介護)",
            "icon": "heart",
            "badge_color": "bg-rose-100 text-rose-800 border-rose-200",
            "description": "Evaluates caregiving fundamentals, body mechanics, mental health, communication with seniors, and nursing Japanese vocabulary.",
            "test_components": [
                "Nursing Care Skills Evaluation Test (CBT - 45 Questions / 60 Mins)",
                "Nursing Care Japanese Language Evaluation Test (CBT - 15 Questions / 30 Mins)"
            ],
            "passing_mark": "60% or higher in both sections",
            "language_required": "JFT-Basic A2 OR JLPT N4 + Nursing Care Japanese Test",
            "study_guide_url": "https://www.mhlw.go.jp/stf/newpage_00010.html",
            "sample_pdf": "https://www.mhlw.go.jp/content/12000000/000570535.pdf"
        },
        {
            "id": "food_service",
            "name": "Food Service Industry (外食業)",
            "icon": "utensils",
            "badge_color": "bg-amber-100 text-amber-800 border-amber-200",
            "description": "Assesses hygiene management (HACCP), food preparation safety, customer service etiquette, and restaurant operation knowledge.",
            "test_components": [
                "Written Examination (Hygiene & Food Safety - 30 Mins)",
                "Practical / Customer Service Judgment Test (45 Mins)"
            ],
            "passing_mark": "65% overall score",
            "language_required": "JFT-Basic A2 or JLPT N4",
            "study_guide_url": "https://www.jfnet.or.jp/contents/ssw/",
            "sample_pdf": "https://www.jfnet.or.jp/contents/ssw/pdf/textbook_en.pdf"
        },
        {
            "id": "agriculture",
            "name": "Agriculture (農業)",
            "icon": "leaf",
            "badge_color": "bg-emerald-100 text-emerald-800 border-emerald-200",
            "description": "Covers General Crop Cultivation (vegetables, fruits, flowers) and Livestock Farming (cattle, swine, poultry management).",
            "test_components": [
                "General Crop Farming Skills Exam (CBT - 60 Mins)",
                "Livestock Farming Skills Exam (CBT - 60 Mins)"
            ],
            "passing_mark": "60% passing mark",
            "language_required": "JFT-Basic A2 or JLPT N4",
            "study_guide_url": "https://nca.or.jp/ssw/",
            "sample_pdf": "https://nca.or.jp/ssw/textbook.pdf"
        },
        {
            "id": "food_manufacturing",
            "name": "Food & Beverage Manufacturing (飲食料品製造業)",
            "icon": "factory",
            "badge_color": "bg-blue-100 text-blue-800 border-blue-200",
            "description": "Tests food processing hygiene, machinery operation safety, quality control standards, and health regulations.",
            "test_components": [
                "Food Processing Safety & Quality Control Exam (CBT - 80 Mins)"
            ],
            "passing_mark": "60% or higher",
            "language_required": "JFT-Basic A2 or JLPT N4",
            "study_guide_url": "https://shokuhin-kensyu.or.jp/ssw/",
            "sample_pdf": "https://shokuhin-kensyu.or.jp/ssw/manual_en.pdf"
        },
        {
            "id": "construction",
            "name": "Construction Industry (建設業)",
            "icon": "hard-hat",
            "badge_color": "bg-orange-100 text-orange-800 border-orange-200",
            "description": "Covers structural work, rebar, formwork, carpentry, plastering, heavy equipment operation, and workplace safety protocols.",
            "test_components": [
                "Written Occupational Test (CBT - 60 Mins)",
                "Practical Skill Demonstration / Diagram Test (30 Mins)"
            ],
            "passing_mark": "65% score threshold",
            "language_required": "JFT-Basic A2 or JLPT N4",
            "study_guide_url": "https://www.jac-skill.or.jp/exam/",
            "sample_pdf": "https://www.jac-skill.or.jp/exam/textbook.pdf"
        },
        {
            "id": "manufacturing",
            "name": "Manufacturing & Material Processing (製造業)",
            "icon": "cog",
            "badge_color": "bg-slate-100 text-slate-800 border-slate-200",
            "description": "Includes Machining, Metal Stamping, Welding, Plastic Molding, Industrial Machinery Maintenance, and Electrical Assembly.",
            "test_components": [
                "Engineering & Manufacturing CBT Exam (60 Mins)",
                "Practical Visual/Technical Problem Solving"
            ],
            "passing_mark": "60% or higher",
            "language_required": "JFT-Basic A2 or JLPT N4",
            "study_guide_url": "https://www.jitco.or.jp/ja/regulation/tokuteiginou.html",
            "sample_pdf": "https://www.jitco.or.jp/ssw/textbook_sample.pdf"
        }
    ]

def get_ssw_test_centers() -> List[Dict[str, Any]]:
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
            "sectors_offered": ["Nursing Care", "Food Service", "Agriculture", "Food Manufacturing", "Construction"],
            "booking_info": "Official Prometric Center BDJ01. Formerly Bangladesh Dhaka. Operated by New Horizons Computer Learning Center.",
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
            "sectors_offered": ["Nursing Care", "Food Service", "Manufacturing"],
            "booking_info": "Official Prometric Center BDJ02. Operated by American Alumni Association (AAA).",
            "google_map_url": "https://maps.google.com/?q=Delta+Dahlia+Tower+Kemal+Ataturk+Ave+Banani+Dhaka"
        }
    ]
