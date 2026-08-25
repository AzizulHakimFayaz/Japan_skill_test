import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip header and footer on cover page
            return
        
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(54, 752, "GAKKOU NO SHIKEN (学校の試験)  |  Official REST API Documentation v2.0")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 744, 558, 744)
        
        # Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "https://gakkounoshiken.site/api/  •  Mobile App & Client Specification")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def create_api_documentation_pdf(filename="Gakkou_No_Shiken_API_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    C_PRIMARY = colors.HexColor("#0f172a") # Slate 900
    C_ACCENT = colors.HexColor("#dc2626")  # Japan Red
    C_SECONDARY = colors.HexColor("#4f46e5") # Indigo
    C_TEXT = colors.HexColor("#1e293b")
    C_MUTED = colors.HexColor("#64748b")
    C_BG_CODE = colors.HexColor("#f8fafc")
    C_BORDER_CODE = colors.HexColor("#e2e8f0")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_PRIMARY,
        alignment=0
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=C_MUTED,
        alignment=0
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=C_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=C_ACCENT,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Header3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=C_SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=C_TEXT,
        spaceAfter=4
    )

    badge_get = ParagraphStyle(
        'BadgeGET',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0284c7")
    )
    
    badge_post = ParagraphStyle(
        'BadgePOST',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#059669")
    )

    badge_put = ParagraphStyle(
        'BadgePUT',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#d97706")
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0f172a"),
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=C_TEXT
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=C_PRIMARY
    )

    table_cell_code = ParagraphStyle(
        'TableCellCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#b91c1c")
    )

    story = []

    # -------------------------------------------------------------
    # COVER / HEADER
    # -------------------------------------------------------------
    logo_path = os.path.abspath("Gakkou_no_shiken_frontend/public/img/logo.png")
    if os.path.exists(logo_path):
        story.append(Image(logo_path, width=70, height=70))
        story.append(Spacer(1, 10))

    story.append(Paragraph("Gakkou No Shiken (学校の試験)", title_style))
    story.append(Paragraph("Official REST API Specification & Mobile Integration Manual", ParagraphStyle('Sub', parent=title_style, fontSize=14, leading=18, textColor=C_ACCENT)))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Version 2.0 • 2026 Prometric CBT Engine Edition • Bangladesh's #1 Japanese Exam Platform", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_ACCENT, spaceBefore=2, spaceAfter=14))

    # Meta Overview Box
    meta_data = [
        [
            Paragraph("<b>Base URL (Production API):</b>", table_cell_bold),
            Paragraph("<font color='#0284c7'><b>https://gakkounoshiken.site/api/</b> (Do NOT use 'www')</font>", table_cell_code)
        ],
        [
            Paragraph("<b>Base URL (Local Dev):</b>", table_cell_bold),
            Paragraph("<font color='#0284c7'>http://127.0.0.1:8000/api/</font>", table_cell_code)
        ],
        [
            Paragraph("<b>Authentication Scheme:</b>", table_cell_bold),
            Paragraph("JSON Web Token (JWT) — <code>Authorization: Bearer &lt;access_token&gt;</code>", table_cell_style)
        ],
        [
            Paragraph("<b>Data Format / Content-Type:</b>", table_cell_bold),
            Paragraph("<code>application/json; charset=utf-8</code>", table_cell_code)
        ],
        [
            Paragraph("<b>Target Clients:</b>", table_cell_bold),
            Paragraph("Flutter (iOS/Android), React Native, Kotlin, Swift, Web SPA", table_cell_style)
        ],
    ]
    meta_table = Table(meta_data, colWidths=[140, 364])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Quick Summary
    story.append(Paragraph("<b>Overview</b>", h2_style))
    story.append(Paragraph(
        "This specification documents the complete backend API for <b>Gakkou No Shiken</b>. "
        "The API powers authentic Computer-Based Testing (CBT) simulations for <b>JFT-Basic (A2)</b> and "
        "<b>Specified Skilled Worker (SSW 1 & 2)</b> examinations. It includes real-time scoring, "
        "CEFR scaling (10–250 scaled IRT score), 10 native language translation aids, OTP email verification, "
        "Google OAuth, candidate dashboard analytics, and live national leaderboards.",
        body_style
    ))
    story.append(Spacer(1, 12))

    # -------------------------------------------------------------
    # HELPER FUNCTIONS FOR SECTIONS & ENDPOINTS
    # -------------------------------------------------------------
    def render_endpoint_box(method, path, auth_required, summary, params=None, req_json=None, res_json=None):
        flowables = []
        
        # Method Color
        badge = badge_get if method == "GET" else (badge_post if method == "POST" else badge_put)
        method_bg = colors.HexColor("#e0f2fe") if method == "GET" else (colors.HexColor("#dcfce7") if method == "POST" else colors.HexColor("#fef3c7"))
        
        auth_text = "<font color='#dc2626'><b>Required (Bearer)</b></font>" if auth_required else "<font color='#059669'>Public (None)</font>"
        
        header_data = [
            [
                Paragraph(f"<b>{method}</b>", badge),
                Paragraph(f"<b>{path}</b>", ParagraphStyle('Path', parent=table_cell_bold, fontSize=8.5, fontName='Courier-Bold')),
                Paragraph(f"Auth: {auth_text}", table_cell_style)
            ]
        ]
        h_table = Table(header_data, colWidths=[55, 310, 139])
        h_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), method_bg),
            ('BACKGROUND', (1, 0), (-1, -1), colors.HexColor("#f1f5f9")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        flowables.append(h_table)
        flowables.append(Spacer(1, 4))
        
        flowables.append(Paragraph(f"<b>Description:</b> {summary}", body_style))
        flowables.append(Spacer(1, 4))

        if params:
            p_rows = [[
                Paragraph("Parameter", table_header_style),
                Paragraph("Type", table_header_style),
                Paragraph("Required", table_header_style),
                Paragraph("Description", table_header_style)
            ]]
            for p in params:
                p_rows.append([
                    Paragraph(f"<code>{p[0]}</code>", table_cell_code),
                    Paragraph(p[1], table_cell_style),
                    Paragraph(f"<b>{p[2]}</b>" if p[2] == "Yes" else p[2], table_cell_style),
                    Paragraph(p[3], table_cell_style)
                ])
            ptable = Table(p_rows, colWidths=[100, 60, 55, 289])
            ptable.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), C_PRIMARY),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('LEFTPADDING', (0, 0), (-1, -1), 5),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ]))
            flowables.append(ptable)
            flowables.append(Spacer(1, 4))

        if req_json:
            flowables.append(Paragraph("<b>Request Payload (JSON):</b>", h3_style))
            req_table = Table([[Paragraph(f"<pre>{req_json}</pre>", code_style)]], colWidths=[504])
            req_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), C_BG_CODE),
                ('BOX', (0, 0), (-1, -1), 1, C_BORDER_CODE),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            flowables.append(req_table)
            flowables.append(Spacer(1, 4))

        if res_json:
            flowables.append(Paragraph("<b>Response Example (200/201 OK):</b>", h3_style))
            res_table = Table([[Paragraph(f"<pre>{res_json}</pre>", code_style)]], colWidths=[504])
            res_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), C_BG_CODE),
                ('BOX', (0, 0), (-1, -1), 1, C_BORDER_CODE),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            flowables.append(res_table)
            flowables.append(Spacer(1, 6))

        flowables.append(Spacer(1, 6))
        return KeepTogether(flowables)

    # -------------------------------------------------------------
    # SECTION 1: AUTHENTICATION & CANDIDATE ACCOUNTS
    # -------------------------------------------------------------
    story.append(Paragraph("1. Authentication & Candidate Accounts", h1_style))
    story.append(Paragraph(
        "Candidate authentication utilizes JWT tokens. Pass access tokens in the <code>Authorization: Bearer &lt;token&gt;</code> "
        "header. Registration is secured with a 6-digit email OTP verification step.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # 1.1 Send Registration OTP
    story.append(render_endpoint_box(
        method="POST",
        path="/api/auth/send-otp/",
        auth_required=False,
        summary="Validates candidate details, generates a 6-digit verification OTP code, and emails it to the user. (Expires in 15 mins).",
        params=[
            ("username", "string", "Yes", "Unique username for candidate."),
            ("email", "string", "Yes", "Valid email address for OTP delivery."),
            ("password", "string", "Yes", "Password (min 6 characters)."),
            ("password_confirm", "string", "Yes", "Must match password exactly."),
            ("first_name", "string", "No", "Candidate given name."),
            ("last_name", "string", "No", "Candidate surname.")
        ],
        req_json='''{
  "username": "tanvir_japan",
  "email": "tanvir@example.com",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "first_name": "Tanvir",
  "last_name": "Ahmed"
}''',
        res_json='''{
  "status": "success",
  "email": "tanvir@example.com",
  "message": "A 6-digit verification code has been sent to tanvir@example.com."
}'''
    ))

    # 1.2 Verify OTP & Create Account
    story.append(render_endpoint_box(
        method="POST",
        path="/api/auth/verify-otp/",
        auth_required=False,
        summary="Verifies the 6-digit OTP, creates the candidate account in the database, and returns JWT access/refresh tokens.",
        params=[
            ("email", "string", "Yes", "Candidate registered email."),
            ("otp_code", "string", "Yes", "6-digit code received via email.")
        ],
        req_json='''{
  "email": "tanvir@example.com",
  "otp_code": "839201"
}''',
        res_json='''{
  "user": {
    "id": 42,
    "username": "tanvir_japan",
    "first_name": "Tanvir",
    "last_name": "Ahmed",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "is_staff": false,
    "profile": {
      "bio": "",
      "target_exam": "jft_basic",
      "target_exam_display": "JFT-Basic (A2 Standard)",
      "japanese_level": "n4",
      "japanese_level_display": "Elementary (N4 / A2)",
      "location": "Dhaka, Bangladesh"
    }
  },
  "tokens": {
    "refresh": "eyJhbGciOi...",
    "access": "eyJhbGciOi..."
  },
  "message": "Email verified successfully! Welcome to Gakkou No Shiken, tanvir_japan!"
}'''
    ))

    # 1.3 Resend OTP
    story.append(render_endpoint_box(
        method="POST",
        path="/api/auth/resend-otp/",
        auth_required=False,
        summary="Resends a fresh 6-digit OTP code to the candidate's email if the previous code expired or was not received.",
        params=[
            ("email", "string", "Yes", "Candidate registered email.")
        ],
        req_json='''{
  "email": "tanvir@example.com"
}''',
        res_json='''{
  "status": "success",
  "email": "tanvir@example.com",
  "message": "A new 6-digit verification code has been sent to your email."
}'''
    ))

    # 1.4 Login
    story.append(render_endpoint_box(
        method="POST",
        path="/api/auth/login/",
        auth_required=False,
        summary="Authenticates a candidate using either their Username OR Email address + Password. Returns JWT tokens.",
        params=[
            ("username", "string", "Yes", "Username or Email address."),
            ("password", "string", "Yes", "Account password.")
        ],
        req_json='''{
  "username": "tanvir@example.com",
  "password": "Password123!"
}''',
        res_json='''{
  "user": {
    "id": 42,
    "username": "tanvir_japan",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "is_staff": false,
    "profile": { "target_exam": "jft_basic", "japanese_level": "n4" }
  },
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  },
  "message": "Welcome back, tanvir_japan!"
}'''
    ))

    # 1.5 Google One-Tap / OAuth Sign-In
    story.append(render_endpoint_box(
        method="POST",
        path="/api/auth/google/",
        auth_required=False,
        summary="Authenticates candidate via Google One-Tap or Google Sign-In (ID Token). Auto-registers if user does not exist.",
        params=[
            ("id_token", "string", "Yes", "Google ID Token JWT received from Google Identity Services SDK.")
        ],
        req_json='''{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
}''',
        res_json='''{
  "user": {
    "id": 45,
    "username": "tanvir_ahmed",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir.google@gmail.com"
  },
  "tokens": { "access": "...", "refresh": "..." },
  "is_new_user": false,
  "message": "Welcome back, Tanvir!"
}'''
    ))

    # 1.6 Refresh JWT Token
    story.append(render_endpoint_box(
        method="POST",
        path="/api/auth/token/refresh/",
        auth_required=False,
        summary="Refreshes an expired JWT access token using the long-lived refresh token.",
        params=[
            ("refresh", "string", "Yes", "Valid Refresh Token string.")
        ],
        req_json='''{
  "refresh": "eyJhbGciOi..."
}''',
        res_json='''{
  "access": "eyJhbGciOi..."
}'''
    ))

    # 1.7 Current User Profile & Results
    story.append(render_endpoint_box(
        method="GET",
        path="/api/auth/me/",
        auth_required=True,
        summary="Fetches authenticated candidate profile, full name, email, target exam, and Japanese level.",
        res_json='''{
  "user": {
    "id": 42,
    "username": "tanvir_japan",
    "full_name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "is_staff": false,
    "profile": {
      "bio": "Studying for JFT-Basic A2 exam in Dhaka.",
      "target_exam": "jft_basic",
      "target_exam_display": "JFT-Basic (A2 Standard)",
      "japanese_level": "n4",
      "japanese_level_display": "Elementary (N4 / A2)",
      "location": "Dhaka, Bangladesh"
    }
  }
}'''
    ))

    story.append(render_endpoint_box(
        method="PUT / PATCH",
        path="/api/auth/profile/",
        auth_required=True,
        summary="Updates candidate profile fields (bio, target exam, Japanese proficiency level, location).",
        params=[
            ("bio", "string", "No", "Short candidate bio / goals (max 500 chars)."),
            ("target_exam", "string", "No", "Choice: jft_basic, ssw_nursing, ssw_food, ssw_agri, ssw_const, etc."),
            ("japanese_level", "string", "No", "Choice: beginner, n5, n4, n3, n2, n1."),
            ("location", "string", "No", "City/Country (e.g. Dhaka, Bangladesh).")
        ],
        req_json='''{
  "bio": "Targeting 220+ on Prometric JFT test next month.",
  "target_exam": "jft_basic",
  "japanese_level": "n4",
  "location": "Dhaka, Bangladesh"
}''',
        res_json='''{
  "user": { ... },
  "message": "Profile updated successfully!"
}'''
    ))

    # 1.8 Exam History & Dashboard Analytics
    story.append(render_endpoint_box(
        method="GET",
        path="/api/auth/my-results/",
        auth_required=True,
        summary="Returns candidate's full exam attempt history, pass rate %, highest scaled score (10–250), section stats, and graph chart series.",
        res_json='''{
  "total_attempts": 5,
  "passed_attempts": 3,
  "pass_rate": 60,
  "highest_scaled_score": 218,
  "avg_scaled_score": 194,
  "highest_level": "A2.2 (A2)",
  "section_stats": [
    { "key": "script_vocab", "name_en": "Script & Vocabulary", "correct": 48, "total": 60, "pct": 80 },
    { "key": "conversation", "name_en": "Conversation & Expression", "correct": 45, "total": 60, "pct": 75 },
    { "key": "listening", "name_en": "Listening Comprehension", "correct": 50, "total": 60, "pct": 83 },
    { "key": "reading", "name_en": "Reading Comprehension", "correct": 42, "total": 60, "pct": 70 }
  ],
  "attempts": [
    {
      "id": 108,
      "test_id": 1,
      "test_title": "JFT-Basic Official Practice Mock Test 1",
      "test_category": "basic",
      "score": 38,
      "total_questions": 42,
      "percentage": 90,
      "scaled_score": 226,
      "assessment_level": "A2.2 (A2)",
      "passed": true,
      "completed_at": "2026-08-24T18:30:00Z"
    }
  ],
  "chart_data": {
    "labels": ["Aug 20, 14:00", "Aug 22, 10:30", "Aug 24, 18:30"],
    "scores": [180, 195, 226],
    "titles": ["Mock 1", "Mock 1", "Mock 1"]
  }
}'''
    ))

    # -------------------------------------------------------------
    # SECTION 2: TESTS & CBT EXAMINATION ENGINE
    # -------------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. Tests & CBT Examination Engine", h1_style))
    story.append(Paragraph(
        "Endpoints to list practice exams, retrieve structured CBT screens with native audio and 10-language translations, "
        "submit candidate answers, and view detailed scorecards.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # 2.1 Test List
    story.append(render_endpoint_box(
        method="GET",
        path="/api/tests/",
        auth_required=False,
        summary="Lists all published mock tests. Filterable by category (basic, skill). Staff/admin users also receive draft tests.",
        params=[
            ("category", "string", "No", "Filter tests: 'basic' (JFT-Basic) or 'skill' (SSW Skills).")
        ],
        res_json='''{
  "tests": [
    {
      "id": 1,
      "title": "JFT-Basic Official Practice Mock Test 1",
      "description": "Authentic 60-minute Prometric simulation with 42 questions and audio listening.",
      "category": "basic",
      "requires_account": false,
      "is_published": true,
      "is_actual_exam_demo": true,
      "time_limit_seconds": 3600,
      "question_count": 42
    },
    {
      "id": 2,
      "title": "JFT-Basic Official Practice Mock Test 2",
      "category": "basic",
      "requires_account": true,
      "time_limit_seconds": 3600,
      "question_count": 42
    }
  ],
  "tests_by_category": {
    "basic": [ ... ],
    "skill": [ ... ]
  }
}'''
    ))

    # 2.2 Test Details
    story.append(render_endpoint_box(
        method="GET",
        path="/api/tests/<id>/",
        auth_required=False,
        summary="Retrieves detailed metadata for a single test (title, description, time limit, question count).",
        res_json='''{
  "id": 1,
  "title": "JFT-Basic Official Practice Mock Test 1",
  "description": "Standard A2 evaluation test.",
  "category": "basic",
  "requires_account": false,
  "time_limit_seconds": 3600,
  "question_count": 42
}'''
    ))

    # 2.3 CBT Quiz Data (Steps & Translations)
    story.append(render_endpoint_box(
        method="GET",
        path="/api/tests/<id>/quiz/",
        auth_required=False,
        summary="Retrieves structured CBT quiz screens/steps. If test.requires_account=true, Auth token is required. Questions include audio_url, image_url, and 10 language translation aids.",
        params=[
            ("preview", "string", "No", "Set '?preview=admin' to allow previewing unpublished draft tests.")
        ],
        res_json='''{
  "test": { "id": 1, "title": "JFT-Basic Mock 1", "time_limit_seconds": 3600 },
  "total_questions": 42,
  "total_steps": 35,
  "steps": [
    {
      "step_number": 1,
      "section": "script_vocab",
      "group": null,
      "questions": [
        {
          "id": 101,
          "type": "single_choice",
          "section": "script_vocab",
          "instruction": "次のことばの読み方として最もよいものを、1・2・3・4から一つえらんでください。",
          "resolved_instruction": "Choose the correct reading for the underlined word.",
          "prompt": "あしたは <ins>雨</ins> がふります。",
          "image_url": null,
          "audio_url": null,
          "translations": {
            "en": "Tomorrow it will rain.",
            "bn": "আগামীকাল বৃষ্টি হবে।",
            "vi": "Ngày mai trời sẽ mưa.",
            "id": "Besok akan turun hujan.",
            "my": "မနက်ဖြန် မိုးရွာမည်။",
            "ne": "भोलि पानी पर्नेछ।",
            "th": "พรุ่งนี้ฝนจะตก"
          },
          "options": [
            { "id": 401, "label": "あめ", "image_url": null, "order_index": 1 },
            { "id": 402, "label": "ゆき", "image_url": null, "order_index": 2 },
            { "id": 403, "label": "かぜ", "image_url": null, "order_index": 3 },
            { "id": 404, "label": "くもり", "image_url": null, "order_index": 4 }
          ]
        }
      ]
    }
  ]
}'''
    ))

    # 2.4 Submit Answers
    story.append(render_endpoint_box(
        method="POST",
        path="/api/tests/<id>/submit/",
        auth_required=False,
        summary="Submits candidate's quiz answers, calculates raw score, saves an Attempt record, and returns the attempt_id.",
        params=[
            ("answers", "object", "Yes", "Key-value map of question_id to selected answer_option_id.")
        ],
        req_json='''{
  "answers": {
    "101": 401,
    "102": 406,
    "103": 412,
    "104": null
  }
}''',
        res_json='''{
  "attempt_id": 158,
  "score": 35,
  "total_questions": 42,
  "message": "Quiz submitted successfully!"
}'''
    ))

    # 2.5 Scorecard & Review
    story.append(render_endpoint_box(
        method="GET",
        path="/api/attempts/<id>/",
        auth_required=False,
        summary="Returns official Prometric CEFR scorecard, 10–250 scaled score, pass/fail status, section breakdowns, and question-by-question review with correct answers.",
        res_json='''{
  "attempt": {
    "id": 158,
    "score": 35,
    "total_questions": 42,
    "percentage": 83.3,
    "passed": true,
    "scaled_score": 210,
    "assessment_level": "A2.2 (A2)",
    "scaled_score_percent": 83.3,
    "completed_at": "2026-08-25T10:15:00Z"
  },
  "test": { "id": 1, "title": "JFT-Basic Mock 1" },
  "section_breakdown": {
    "script_vocab": { "name_ja": "文字と語彙", "name_en": "Script and Vocabulary", "correct": 10, "total": 12, "pct": 83 },
    "conversation": { "name_ja": "会話と表現", "name_en": "Conversation and Expression", "correct": 10, "total": 12, "pct": 83 },
    "listening": { "name_ja": "聴解", "name_en": "Listening Comprehension", "correct": 8, "total": 10, "pct": 80 },
    "reading": { "name_ja": "読解", "name_en": "Reading Comprehension", "correct": 7, "total": 8, "pct": 88 }
  },
  "questions": [
    {
      "id": 101,
      "prompt": "あしたは <ins>雨</ins> がふります。",
      "selected_option_id": 401,
      "is_answered_correctly": true,
      "options": [
        { "id": 401, "label": "あめ", "is_correct": true },
        { "id": 402, "label": "ゆき", "is_correct": false }
      ]
    }
  ]
}'''
    ))

    # -------------------------------------------------------------
    # SECTION 3: INFORMATION & TEST VENUES
    # -------------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. Information & Venue Guides", h1_style))
    story.append(Paragraph(
        "Static and promotional data for JFT-Basic structure, Bangladesh Prometric test centers (BDJ01, BDJ02), and 12 SSW industry sectors.",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(render_endpoint_box(
        method="GET",
        path="/api/info/jft/",
        auth_required=False,
        summary="Retrieves JFT-Basic overview, syllabus, Prometric Bangladesh test centers (BDJ01, BDJ02), address, map GPS coords, and voucher guide.",
        res_json='''{
  "jft_info": {
    "title": "Japan Foundation Test for Basic Japanese (JFT-Basic)",
    "passing_score": "200 / 250 (Scaled Score)",
    "duration_minutes": 60,
    "questions_count": 42
  },
  "test_centers": [
    {
      "code": "BDJ01",
      "name": "Prometric Testing Center - Dhaka Center 1",
      "address": "Banani, Dhaka, Bangladesh",
      "latitude": 23.7937,
      "longitude": 90.4066
    },
    {
      "code": "BDJ02",
      "name": "Prometric Testing Center - Dhaka Center 2",
      "address": "Dhanmondi, Dhaka, Bangladesh",
      "latitude": 23.7465,
      "longitude": 90.3760
    }
  ]
}'''
    ))

    story.append(render_endpoint_box(
        method="GET",
        path="/api/info/ssw/",
        auth_required=False,
        summary="Retrieves Specified Skilled Worker (SSW) visa requirements, 12 industry sectors (Nursing Care, Food Service, Agriculture, Construction, etc.), and venue guidelines.",
        res_json='''{
  "ssw_info": { "title": "Specified Skilled Worker (SSW) Evaluation Exams" },
  "ssw_sectors": [
    { "id": "nursing", "name_en": "Nursing Care", "name_ja": "介護分野" },
    { "id": "food_service", "name_en": "Food Service Industry", "name_ja": "外食業分野" },
    { "id": "agriculture", "name_en": "Agriculture", "name_ja": "農業分野" }
  ]
}'''
    ))

    # -------------------------------------------------------------
    # SECTION 4: LEADERBOARD & CANDIDATE PROFILES
    # -------------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Leaderboard & Candidate Profiles", h1_style))
    story.append(Paragraph(
        "Candidate rankings and public candidate showcase profiles with achievement badges.",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(render_endpoint_box(
        method="GET",
        path="/api/leaderboard/",
        auth_required=False,
        summary="Returns candidate ranking list ordered by: 1) Tests Passed, 2) Highest Scaled Score, 3) Average Score, 4) Total Attempts. Splits into top 3 podium and rest.",
        res_json='''{
  "total_candidates": 84,
  "top_three": [
    {
      "rank": 1,
      "username": "fayaz_sensei",
      "full_name": "Azizul Hakim Fayaz",
      "passed_attempts": 12,
      "highest_score": 248,
      "avg_score": 238,
      "pass_rate": 100,
      "target_exam_display": "JFT-Basic"
    }
  ],
  "rankings": [ ... ],
  "current_user_rank": { "rank": 5, "highest_score": 218 }
}'''
    ))

    story.append(render_endpoint_box(
        method="GET",
        path="/api/candidates/<username>/",
        auth_required=False,
        summary="Returns public profile for candidate by username, including unlocked badges (e.g. Registered, First Pass, High Scorer Elite, Podium Champion) and recent exam history.",
        res_json='''{
  "id": 42,
  "username": "tanvir_japan",
  "full_name": "Tanvir Ahmed",
  "bio": "Preparing for JFT-Basic A2.",
  "target_exam_display": "JFT-Basic",
  "japanese_level_display": "Elementary (N4 / A2)",
  "location": "Dhaka, Bangladesh",
  "rank": 5,
  "stats": {
    "total_attempts": 5,
    "passed_attempts": 3,
    "pass_rate": 60,
    "highest_scaled_score": 218,
    "avg_scaled_score": 194,
    "highest_level": "A2 (Passed)"
  },
  "achievements": [
    { "id": "registered", "title": "Registered Candidate", "unlocked": true, "icon": "🌸" },
    { "id": "first_pass", "title": "JFT-Basic Qualified (A2)", "unlocked": true, "icon": "💮" },
    { "id": "high_scorer", "title": "High Scorer Elite", "unlocked": false, "icon": "⚡" }
  ],
  "recent_attempts": [ ... ]
}'''
    ))

    # -------------------------------------------------------------
    # SECTION 5: MOBILE APP INTEGRATION SNIPPET (FLUTTER / DART)
    # -------------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. Mobile App Integration Guide (Flutter / Dart Example)", h1_style))
    story.append(Paragraph(
        "Here is a production-ready HTTP Client and Authentication interceptor snippet in Dart / Flutter for mobile developers:",
        body_style
    ))
    story.append(Spacer(1, 6))

    flutter_code = '''import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = "https://gakkounoshiken.site/api";
  static final _storage = FlutterSecureStorage();

  // Helper to get stored access token
  static Future<Map<String, String>> _getHeaders({bool auth = false}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    if (auth) {
      final token = await _storage.read(key: 'jwt_access_token');
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  // 1. Candidate Login
  static Future<Map<String, dynamic>> login(String usernameOrEmail, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login/'),
      headers: await _getHeaders(),
      body: jsonEncode({'username': usernameOrEmail, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      await _storage.write(key: 'jwt_access_token', value: data['tokens']['access']);
      await _storage.write(key: 'jwt_refresh_token', value: data['tokens']['refresh']);
    }
    return data;
  }

  // 2. Fetch CBT Quiz Steps
  static Future<Map<String, dynamic>> getQuizData(int testId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/tests/$testId/quiz/'),
      headers: await _getHeaders(auth: true),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 3. Submit Answers
  static Future<Map<String, dynamic>> submitQuiz(int testId, Map<String, dynamic> answers) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tests/$testId/submit/'),
      headers: await _getHeaders(auth: true),
      body: jsonEncode({'answers': answers}),
    );
    return jsonDecode(response.body);
  }
}'''

    code_table = Table([[Paragraph(f"<pre>{flutter_code}</pre>", code_style)]], colWidths=[504])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_BG_CODE),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(code_table)

    # -------------------------------------------------------------
    # SECTION 6: HTTP STATUS CODES & ERROR HANDLING
    # -------------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("6. HTTP Status Codes & Error Conventions", h1_style))
    
    error_rows = [
        [Paragraph("Code", table_header_style), Paragraph("Meaning", table_header_style), Paragraph("Description & Client Action", table_header_style)],
        [Paragraph("200 OK", table_cell_bold), Paragraph("Success", table_cell_style), Paragraph("Request processed normally. Returns requested JSON payload.", table_cell_style)],
        [Paragraph("201 Created", table_cell_bold), Paragraph("Resource Created", table_cell_style), Paragraph("Returned upon successful registration, OTP verification, or quiz submission.", table_cell_style)],
        [Paragraph("400 Bad Request", table_cell_bold), Paragraph("Validation Error", table_cell_style), Paragraph("Missing parameters, password mismatch, or invalid OTP code. Inspect <code>detail</code> field.", table_cell_style)],
        [Paragraph("401 Unauthorized", table_cell_bold), Paragraph("Auth Required", table_cell_style), Paragraph("Missing or expired JWT access token. Attempt token refresh or redirect to login.", table_cell_style)],
        [Paragraph("403 Forbidden", table_cell_bold), Paragraph("Permission Denied", table_cell_style), Paragraph("Attempting to access draft tests or view other candidates' private results.", table_cell_style)],
        [Paragraph("404 Not Found", table_cell_bold), Paragraph("Not Found", table_cell_style), Paragraph("The specified test ID, attempt ID, or username does not exist.", table_cell_style)],
        [Paragraph("500 Server Error", table_cell_bold), Paragraph("Internal Error", table_cell_style), Paragraph("Unexpected backend exception. Client should prompt retry.", table_cell_style)],
    ]
    error_table = Table(error_rows, colWidths=[80, 100, 324])
    error_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(error_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"SUCCESS: PDF generated -> {filename}")


if __name__ == "__main__":
    output_pdf = "Gakkou_No_Shiken_API_Documentation.pdf"
    create_api_documentation_pdf(output_pdf)
