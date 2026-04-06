"""
Generate enterprise-level Product Specification Document for Ductivity App.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether, ListFlowable, ListItem
)
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate
from reportlab.pdfgen import canvas
import datetime

# ── Brand Colors ──
ACCENT = HexColor('#E94560')
DARK_BG = HexColor('#0D1117')
CARD_BG = HexColor('#161B22')
TEXT_PRIMARY = HexColor('#F0F6FC')
TEXT_MUTED = HexColor('#8B949E')
GREEN = HexColor('#58D68D')
YELLOW = HexColor('#F0B429')
RED = HexColor('#FF6B6B')
GRAY = HexColor('#8B949E')
WHITE = white
BLACK = black
DARK_GRAY = HexColor('#2D333B')
LIGHT_GRAY = HexColor('#E8E8E8')

# ── Page Setup ──
PAGE_W, PAGE_H = A4
MARGIN = 60

def header_footer(canvas_obj, doc):
    """Draw header line and footer on every page."""
    canvas_obj.saveState()
    # Header accent line
    canvas_obj.setStrokeColor(ACCENT)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(MARGIN, PAGE_H - 45, PAGE_W - MARGIN, PAGE_H - 45)
    # Header text
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(HexColor('#666666'))
    canvas_obj.drawString(MARGIN, PAGE_H - 40, "DUCTIVITY — Product Specification Document")
    canvas_obj.drawRightString(PAGE_W - MARGIN, PAGE_H - 40, "CONFIDENTIAL")
    # Footer
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(HexColor('#999999'))
    canvas_obj.drawString(MARGIN, 30, f"Version 1.0 | {datetime.date.today().strftime('%B %d, %Y')}")
    canvas_obj.drawRightString(PAGE_W - MARGIN, 30, f"Page {doc.page}")
    canvas_obj.setStrokeColor(HexColor('#DDDDDD'))
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(MARGIN, 42, PAGE_W - MARGIN, 42)
    canvas_obj.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        "DUCTIVITY_TECHNICAL_DOCUMENT.pdf",
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=55, bottomMargin=55,
    )
    frame = Frame(MARGIN, 55, PAGE_W - 2*MARGIN, PAGE_H - 110, id='main')
    template = PageTemplate(id='main', frames=frame, onPage=header_footer)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()

    # ── Custom Styles ──
    s_cover_title = ParagraphStyle('CoverTitle', parent=styles['Title'],
        fontSize=38, leading=44, textColor=ACCENT, fontName='Helvetica-Bold',
        alignment=TA_LEFT, spaceAfter=8)
    s_cover_sub = ParagraphStyle('CoverSub', parent=styles['Normal'],
        fontSize=16, leading=22, textColor=HexColor('#555555'),
        fontName='Helvetica', spaceAfter=4)
    s_cover_meta = ParagraphStyle('CoverMeta', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=HexColor('#888888'),
        fontName='Helvetica')
    s_h1 = ParagraphStyle('H1', parent=styles['Heading1'],
        fontSize=22, leading=28, textColor=ACCENT, fontName='Helvetica-Bold',
        spaceBefore=24, spaceAfter=12, borderPadding=0)
    s_h2 = ParagraphStyle('H2', parent=styles['Heading2'],
        fontSize=16, leading=20, textColor=HexColor('#333333'), fontName='Helvetica-Bold',
        spaceBefore=16, spaceAfter=8)
    s_h3 = ParagraphStyle('H3', parent=styles['Heading3'],
        fontSize=12, leading=16, textColor=HexColor('#444444'), fontName='Helvetica-Bold',
        spaceBefore=10, spaceAfter=6)
    s_body = ParagraphStyle('Body', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=HexColor('#333333'),
        fontName='Helvetica', alignment=TA_JUSTIFY, spaceAfter=6)
    s_code = ParagraphStyle('Code', parent=styles['Normal'],
        fontSize=8.5, leading=12, textColor=HexColor('#333333'),
        fontName='Courier', backColor=HexColor('#F5F5F5'),
        borderPadding=8, spaceBefore=4, spaceAfter=8,
        leftIndent=12, rightIndent=12)
    s_bullet = ParagraphStyle('Bullet', parent=s_body,
        bulletIndent=12, leftIndent=24, spaceAfter=3)
    s_caption = ParagraphStyle('Caption', parent=styles['Normal'],
        fontSize=8, leading=10, textColor=HexColor('#888888'),
        fontName='Helvetica-Oblique', alignment=TA_CENTER, spaceBefore=2, spaceAfter=10)
    s_toc = ParagraphStyle('TOC', parent=styles['Normal'],
        fontSize=11, leading=18, textColor=HexColor('#333333'),
        fontName='Helvetica', leftIndent=20, spaceAfter=2)
    s_toc_h = ParagraphStyle('TOCH', parent=styles['Normal'],
        fontSize=11, leading=18, textColor=ACCENT,
        fontName='Helvetica-Bold', leftIndent=0, spaceAfter=2)

    story = []

    # ═══════════════════════ COVER PAGE ═══════════════════════
    story.append(Spacer(1, 120))
    story.append(Paragraph("DUCTIVITY", s_cover_title))
    story.append(Paragraph("Product Specification Document", s_cover_sub))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="40%", thickness=3, color=ACCENT, spaceAfter=20))
    story.append(Paragraph("A React Native productivity tracking application<br/>built with Expo and Firebase", s_body))
    story.append(Spacer(1, 40))

    cover_data = [
        ['Document ID', 'DUCT-PSD-001'],
        ['Version', '1.0'],
        ['Status', 'Released'],
        ['Classification', 'Confidential'],
        ['Author', 'Anindya Banerjee'],
        ['Date', datetime.date.today().strftime('%B %d, %Y')],
        ['Platform', 'Android (APK via EAS Build)'],
        ['Repository', 'github.com/anindyabanerjee/ductivity_app'],
    ]
    cover_table = Table(cover_data, colWidths=[120, 300])
    cover_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#666666')),
        ('TEXTCOLOR', (1, 0), (1, -1), HexColor('#333333')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(cover_table)
    story.append(PageBreak())

    # ═══════════════════════ TABLE OF CONTENTS ═══════════════════════
    story.append(Paragraph("Table of Contents", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=16))
    toc_items = [
        ("1", "Executive Summary"),
        ("2", "Technology Stack"),
        ("3", "System Architecture"),
        ("4", "Application Flow"),
        ("5", "Feature Specification"),
        ("6", "Database Structure"),
        ("7", "Data Models & Type System"),
        ("8", "Service Layer Architecture"),
        ("9", "State Management"),
        ("10", "Notification System"),
        ("11", "Design System & Theme"),
        ("12", "Performance Optimizations"),
        ("13", "Security Considerations"),
        ("14", "Build & Deployment"),
        ("15", "Coding Standards & Principles"),
        ("16", "File Structure"),
        ("17", "Dependencies"),
        ("18", "Future Roadmap"),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f"<b>{num}.</b>  {title}", s_toc))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 1: EXECUTIVE SUMMARY ═══════════════════════
    story.append(Paragraph("1. Executive Summary", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    story.append(Paragraph(
        "Ductivity is a mobile productivity tracking application designed to help users monitor how they spend "
        "their time throughout the day. The app sends periodic push notifications prompting users to log their "
        "current activity from a customizable list. Logged data is stored in Firebase Firestore and visualized "
        "through interactive charts with configurable time filters.", s_body))
    story.append(Paragraph("1.1 Key Objectives", s_h2))
    for item in [
        "Track user activities at configurable intervals (1 min to 3 hours)",
        "Categorize activities as Productive, Semi-Productive, Non-Productive, or Meh",
        "Provide real-time visual analytics (Pie, Bar, Timeline, Progress charts)",
        "Support user customization of activity lists (5-10 activities)",
        "Maintain 3-month data retention policy",
        "Deliver a polished, dark-themed UI with haptic feedback and animations",
    ]:
        story.append(Paragraph(f"\u2022  {item}", s_bullet))
    story.append(Paragraph("1.2 Target Platform", s_h2))
    story.append(Paragraph(
        "Android devices via standalone APK (built with EAS Build). Development testing via Expo Go on physical "
        "Android devices. iOS support possible with minimal changes.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 2: TECHNOLOGY STACK ═══════════════════════
    story.append(Paragraph("2. Technology Stack", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    tech_data = [
        ['Layer', 'Technology', 'Version', 'Purpose'],
        ['Framework', 'React Native (Expo)', 'SDK 54 / RN 0.81', 'Cross-platform mobile UI'],
        ['Language', 'TypeScript', '5.x', 'Static typing and code safety'],
        ['Backend', 'Firebase Firestore', '12.11.0', 'NoSQL document database'],
        ['Auth', 'Anonymous (single-user)', '-', 'Default user ID pattern'],
        ['Navigation', '@react-navigation', 'v7.x', 'Bottom tab + screen navigation'],
        ['Charts', 'react-native-chart-kit', '6.12.0', 'Pie, Bar, Line chart rendering'],
        ['Notifications', 'expo-notifications', '0.32.16', 'Local scheduled notifications'],
        ['State', 'React Context + AsyncStorage', '-', 'Global state + local persistence'],
        ['Haptics', 'expo-haptics', '-', 'Tactile feedback on interactions'],
        ['Gradients', 'expo-linear-gradient', '15.0.8', 'Gradient backgrounds and buttons'],
        ['Blur', 'expo-blur', '-', 'Glassmorphism card effects'],
        ['Icons', '@expo/vector-icons (Ionicons)', '-', 'Scalable vector icon system'],
        ['Build', 'EAS Build (Cloud)', '-', 'Android APK generation'],
    ]
    t = Table(tech_data, colWidths=[70, 140, 65, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ═══════════════════════ SECTION 3: SYSTEM ARCHITECTURE ═══════════════════════
    story.append(Paragraph("3. System Architecture", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    story.append(Paragraph(
        "The application follows a layered architecture with clear separation of concerns between the "
        "presentation layer (screens/components), business logic (services), state management (contexts), "
        "and external integrations (Firebase, AsyncStorage, OS notifications).", s_body))

    story.append(Paragraph("3.1 Architecture Layers", s_h2))
    arch_data = [
        ['Layer', 'Components', 'Responsibility'],
        ['Presentation', 'Screens, UI Components', 'User interface rendering and interaction handling'],
        ['State', 'UserContext, ActivityContext, NotificationContext', 'Global state management and data distribution'],
        ['Service', 'activityService, notificationService, settingsService, queryCache', 'Business logic, CRUD, caching, scheduling'],
        ['Data', 'Firebase Firestore, AsyncStorage', 'Remote and local data persistence'],
        ['Utility', 'haptics, timeUtils, animations, constants', 'Shared helpers and configuration'],
        ['Theme', 'theme.ts, icons.ts', 'Design tokens, color system, icon mapping'],
    ]
    t = Table(arch_data, colWidths=[70, 170, 210])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)

    story.append(Paragraph("3.2 Data Flow Pattern", s_h2))
    story.append(Paragraph(
        "User Action (tap card) -> Service Layer (logActivity) -> Firebase Firestore (write) -> "
        "Cache Invalidation (clearCache) -> Dashboard (re-fetch) -> Query Cache check -> "
        "Firestore or Cache -> ActivityChart (render). Undo reverses the flow via deleteActivity.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 4: APPLICATION FLOW ═══════════════════════
    story.append(Paragraph("4. Application Flow", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    story.append(Paragraph("4.1 First Launch Sequence", s_h2))
    flow_data = [
        ['Step', 'Screen', 'Action', 'Duration'],
        ['1', 'SplashScreen', 'Animated logo + title fade-in', '2.5 seconds'],
        ['2', 'WelcomeScreen', 'User enters name', 'User-driven'],
        ['3', 'ActivitySetupScreen', 'Pick 5+ activities from 12 defaults', 'User-driven'],
        ['4', 'TaskScreen (Main)', 'Ready to log activities', 'Persistent'],
    ]
    t = Table(flow_data, colWidths=[40, 120, 180, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)

    story.append(Paragraph("4.2 Returning User Flow", s_h2))
    story.append(Paragraph(
        "Splash (2.5s) -> AsyncStorage checks (hasSeenWelcome + activities) -> Main Tab Navigator "
        "(TaskScreen, DashboardScreen, SettingsScreen). Notifications are registered and scheduled on mount.", s_body))

    story.append(Paragraph("4.3 Navigation Structure", s_h2))
    nav_data = [
        ['Tab', 'Screen', 'Icon (Ionicons)', 'Primary Function'],
        ['Log Activity', 'TaskScreen', 'add-circle / add-circle-outline', 'Log current activity from card grid'],
        ['Dashboard', 'DashboardScreen', 'stats-chart / stats-chart-outline', 'View charts, filters, Word of the Day'],
        ['Settings', 'SettingsScreen', 'settings / settings-outline', 'Notification frequency, sleep/DND, clear data'],
    ]
    t = Table(nav_data, colWidths=[70, 100, 140, 140])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ═══════════════════════ SECTION 5: FEATURE SPECIFICATION ═══════════════════════
    story.append(Paragraph("5. Feature Specification", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    features = [
        ("5.1 Activity Logging", [
            "8-12 predefined activities with custom additions (max 10 total)",
            "Each activity has name, icon (Ionicons), emoji, and productivity category",
            "One-tap logging with custom toast confirmation and undo support",
            "Cooldown timer enforces one log per notification interval",
            "FlatList grid layout with 2 columns, React.memo for performance",
        ]),
        ("5.2 Activity Customization", [
            "First-time setup: select 5+ from 12 predefined activities",
            "Add custom activities: name input, icon picker (24 icons), category selector",
            "Remove activities (min 5 enforced) via long-press or Settings",
            "Persisted in AsyncStorage via ActivityContext",
        ]),
        ("5.3 Dashboard Analytics", [
            "4 chart types: Pie (categories), Bar (activity counts), Timeline (recent logs), Progress (category bars)",
            "7 time filters: 3H, 6H, 12H, 24H, Today, Weekly, Monthly",
            "Productivity Score (percentage with color coding: green/yellow/red)",
            "Pull-to-refresh with skeleton loaders during data fetch",
            "Word of the Day: 31 curated vocabulary words rotating daily",
        ]),
        ("5.4 Push Notifications", [
            "Local scheduled notifications at configurable intervals (1m to 3h)",
            "Batch scheduling: individual DATE triggers for next 12 hours",
            "Sleep mode: no notifications during set hours (e.g., 23:00-07:00)",
            "Do Not Disturb: pause notifications for a custom time span",
            "Foreground handling: navigates to TaskScreen + shows reminder banner",
            "Expo Go guard: all notification code disabled in development",
        ]),
        ("5.5 Settings & Preferences", [
            "Notification frequency selector (7 options)",
            "Sleep mode toggle with time picker",
            "Do Not Disturb toggle with time picker",
            "Manage Activities: view, remove activities",
            "Clear Data: clear history, reset settings, or clear everything",
            "Save & Apply: persists settings and navigates to Log Activity",
        ]),
    ]
    for title, items in features:
        story.append(Paragraph(title, s_h2))
        for item in items:
            story.append(Paragraph(f"\u2022  {item}", s_bullet))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 6: DATABASE STRUCTURE ═══════════════════════
    story.append(Paragraph("6. Database Structure", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    story.append(Paragraph("6.1 Firebase Firestore", s_h2))
    story.append(Paragraph("Collection: <b>activities</b>", s_body))

    db_data = [
        ['Field', 'Type', 'Description', 'Example'],
        ['userId', 'string', 'User identifier (single-user: default_user)', 'default_user'],
        ['activity', 'string', 'Activity name as logged', 'Personal Work'],
        ['category', 'string', 'Productivity category', 'productive'],
        ['timestamp', 'Firestore Timestamp', 'When the activity was logged', '2026-04-06T12:30:00Z'],
    ]
    t = Table(db_data, colWidths=[70, 110, 160, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)
    story.append(Paragraph("<i>Composite Index: userId (ASC) + timestamp (DESC)</i>", s_caption))

    story.append(Paragraph("6.2 AsyncStorage Keys", s_h2))
    as_data = [
        ['Key', 'Type', 'Purpose'],
        ['hasSeenWelcome', 'string ("true")', 'Skip welcome screen on return visits'],
        ['@ductivity_userName', 'string', 'User display name for personalization'],
        ['@ductivity_activities', 'JSON (Activity[])', 'User-selected activity list'],
        ['@ductivity_settings', 'JSON (AppSettings)', 'Notification frequency, sleep/DND config'],
    ]
    t = Table(as_data, colWidths=[140, 110, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)

    story.append(Paragraph("6.3 Data Retention", s_h2))
    story.append(Paragraph(
        "Activity logs are retained for 90 days (3 months). Time-based queries filter data at read time. "
        "No server-side TTL policy is currently configured; retention is enforced client-side via query filters.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 7: DATA MODELS ═══════════════════════
    story.append(Paragraph("7. Data Models & Type System", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    story.append(Paragraph(
        "All data structures are defined in TypeScript with strict typing. Union types ensure only valid "
        "category values and time filters can be used throughout the codebase.", s_body))

    story.append(Paragraph("7.1 Core Types", s_h2))
    story.append(Paragraph(
        "CategoryType = 'productive' | 'semi-productive' | 'non-productive' | 'meh'<br/>"
        "TimeFilter = '3h' | '6h' | '12h' | '24h' | 'daily' | 'weekly' | 'monthly'<br/>"
        "NotificationFrequency = '1m' | '2m' | '3m' | '5m' | '30m' | '1h' | '3h'", s_code))

    story.append(Paragraph("7.2 Activity Interface", s_h2))
    story.append(Paragraph(
        "{ id: string, name: string, emoji: string, icon: string, category: CategoryType }", s_code))

    story.append(Paragraph("7.3 ActivityLog Interface", s_h2))
    story.append(Paragraph(
        "{ id?: string, userId: string, activity: string, category: CategoryType, timestamp: Date }", s_code))

    story.append(Paragraph("7.4 AppSettings Interface", s_h2))
    story.append(Paragraph(
        "{ notificationFrequency: NotificationFrequency,<br/>"
        "  sleepModeEnabled: boolean, sleepStart: string, sleepEnd: string,<br/>"
        "  dndEnabled: boolean, dndStart: string, dndEnd: string }", s_code))

    story.append(Paragraph("7.5 Category Color System", s_h2))
    cat_data = [
        ['Category', 'Color', 'Hex', 'Usage'],
        ['Productive', 'Green', '#58D68D', 'Personal Work, Office Work, Resting, Learning, Eating, Exercise, Meditation'],
        ['Semi-Productive', 'Gold', '#F0B429', 'Relaxing, Commuting, Socializing'],
        ['Non-Productive', 'Coral', '#FF6B6B', 'Baal Bichi'],
        ['Meh', 'Gray', '#8B949E', 'Playing CS2'],
    ]
    t = Table(cat_data, colWidths=[90, 50, 60, 250])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ═══════════════════════ SECTION 8: SERVICE LAYER ═══════════════════════
    story.append(Paragraph("8. Service Layer Architecture", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    svc_data = [
        ['Service', 'File', 'Key Functions'],
        ['Activity Service', 'activityService.ts', 'logActivity(), deleteActivity(), getActivities()'],
        ['Notification Service', 'notificationService.ts', 'registerForPushNotifications(), scheduleActivityReminder()'],
        ['Settings Service', 'settingsService.ts', 'getSettings(), saveSettings(), getFrequencySeconds()'],
        ['Query Cache', 'queryCache.ts', 'getCached(), setCache(), clearCache()'],
    ]
    t = Table(svc_data, colWidths=[100, 130, 220])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)

    story.append(Paragraph("8.1 Query Cache Strategy", s_h2))
    story.append(Paragraph(
        "In-memory Map-based cache with 30-second TTL. Prevents re-fetching when users rapidly switch "
        "dashboard time filters. Automatically invalidated on write operations (logActivity, deleteActivity). "
        "Expired entries are lazily cleaned on the next getCached() call.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 9: STATE MANAGEMENT ═══════════════════════
    story.append(Paragraph("9. State Management", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    story.append(Paragraph("9.1 React Context Providers", s_h2))
    ctx_data = [
        ['Context', 'Scope', 'Data Provided'],
        ['UserProvider', 'Entire app', 'userName, setUserName, isLoading'],
        ['ActivityProvider', 'Entire app', 'activities[], addActivity, removeActivity, setActivities, hasSetup'],
        ['NotificationContext', 'Main tabs only', 'notificationTrigger counter'],
    ]
    t = Table(ctx_data, colWidths=[110, 90, 250])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)

    story.append(Paragraph("9.2 Local State (per Screen)", s_h2))
    story.append(Paragraph(
        "Each screen manages its own UI state via useState (loading flags, modal visibility, form inputs, "
        "cooldown timers). Ref-based state (useRef) is used for animation values and one-time initialization "
        "flags (hasAnimated) to prevent re-triggering effects on re-renders.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 10: NOTIFICATION SYSTEM ═══════════════════════
    story.append(Paragraph("10. Notification System", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    story.append(Paragraph(
        "The notification system uses expo-notifications to schedule local reminders. Push notifications "
        "were removed from Expo Go in SDK 53, so all notification code is guarded with an isExpoGo check "
        "(Constants.appOwnership === 'expo'). Notifications only function in the standalone APK build.", s_body))

    story.append(Paragraph("10.1 Scheduling Algorithm", s_h2))
    story.append(Paragraph(
        "1. Read notification frequency from user settings<br/>"
        "2. Cancel all existing scheduled notifications<br/>"
        "3. Calculate intervals for the next 12 hours<br/>"
        "4. For each interval: check if it falls within sleep or DND window<br/>"
        "5. If not blocked: schedule a DATE-type trigger notification<br/>"
        "6. Log count of scheduled notifications", s_body))

    story.append(Paragraph("10.2 Time Window Blocking", s_h2))
    story.append(Paragraph(
        "The isTimeBlocked() function checks each notification timestamp against both the sleep mode "
        "and DND windows. It correctly handles overnight ranges (e.g., 23:00-07:00) using the "
        "isMinuteInRange() utility from timeUtils.ts.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 11: DESIGN SYSTEM ═══════════════════════
    story.append(Paragraph("11. Design System & Theme", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    story.append(Paragraph("11.1 Color Palette", s_h2))
    color_data = [
        ['Token', 'Hex', 'Usage'],
        ['bg.primary', '#0D1117', 'Screen backgrounds (gradient start/end)'],
        ['bg.secondary', '#161B22', 'Card backgrounds, tab bar, inputs'],
        ['bg.card', 'rgba(22,27,34,0.75)', 'Glassmorphism card overlay'],
        ['accent.primary', '#E94560', 'Buttons, active states, highlights, branding'],
        ['text.primary', '#F0F6FC', 'Headers, main content text'],
        ['text.secondary', '#C9D1D9', 'Body text, descriptions'],
        ['text.muted', '#8B949E', 'Captions, secondary info, labels'],
        ['border.subtle', 'rgba(255,255,255,0.06)', 'Glass card borders, dividers'],
    ]
    t = Table(color_data, colWidths=[90, 130, 230])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)

    story.append(Paragraph("11.2 Reusable UI Components", s_h2))
    ui_data = [
        ['Component', 'Purpose'],
        ['GradientBackground', 'LinearGradient screen wrapper (replaces flat backgrounds)'],
        ['GlassCard', 'Semi-transparent card with subtle border and optional category glow'],
        ['GradientButton', 'Accent gradient button with spring-scale press animation'],
        ['SectionHeader', 'Vector icon + title + gradient accent underline'],
        ['IconCircle', 'Ionicons icon centered in a colored circular background'],
        ['AnimatedButton', 'Pressable with spring-scale and haptic feedback'],
        ['Toast', 'Slide-down confirmation with undo button (React.memo)'],
        ['SkeletonLoader', 'Pulsing opacity shimmer placeholder (React.memo)'],
    ]
    t = Table(ui_data, colWidths=[110, 340])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ═══════════════════════ SECTION 12: PERFORMANCE ═══════════════════════
    story.append(Paragraph("12. Performance Optimizations", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    opts = [
        ("React.memo", "Toast, SkeletonLoader, WordOfTheDay, ActivityCard wrapped in React.memo to prevent unnecessary re-renders from parent state changes"),
        ("useMemo", "Chart data aggregation (categoryCounts, activityCounts, productivePercent, sortedActivities) memoized in ActivityChart to only recalculate when logs change"),
        ("Query Cache", "30-second TTL in-memory cache for Firestore queries. Cache invalidated on write/delete. Prevents re-fetching when switching dashboard filters"),
        ("FlatList", "Activity cards use FlatList with numColumns=2 instead of flex-wrap View. Provides stable rendering, recycling, and proper key extraction"),
        ("Cooldown Timer", "setInterval for countdown pauses when screen is unfocused (useIsFocused). Prevents unnecessary state updates on background tabs"),
        ("Constants", "Magic numbers extracted to constants.ts. Eliminates inline calculations and enables easy tuning"),
        ("Time Utilities", "Shared parseTime, isMinuteInRange, formatCountdown eliminate duplicated time logic across services"),
    ]
    for title, desc in opts:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", s_bullet))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 13: SECURITY ═══════════════════════
    story.append(Paragraph("13. Security Considerations", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    sec_items = [
        ("Firebase API Keys", "Embedded in client-side code. These are identifier-only keys; actual data protection relies on Firestore Security Rules."),
        ("Firestore Rules", "Should be configured to restrict read/write access. Currently using test mode for development."),
        ("Data Encryption", "AsyncStorage data is not encrypted. User names and settings are stored as cleartext on device."),
        ("Single-User Model", "No authentication system. All data associated with a hardcoded 'default_user' ID. Multi-user support would require Firebase Auth integration."),
        ("Environment Variables", "Firebase credentials should be migrated to .env files for production deployments."),
    ]
    for title, desc in sec_items:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", s_bullet))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 14: BUILD & DEPLOYMENT ═══════════════════════
    story.append(Paragraph("14. Build & Deployment", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    story.append(Paragraph("14.1 Build Pipeline", s_h2))
    build_steps = [
        "Sync source files from OneDrive project to C:\\dev\\ductivity_build (avoids OneDrive metadata issues)",
        "Clean install: rm -rf node_modules package-lock.json && npm install",
        "Git commit: git add -A && git commit -m 'build message'",
        "EAS Build: eas build -p android --profile preview --non-interactive",
        "Cloud build executes on Expo servers (~10-15 min free tier)",
        "APK download link provided on completion",
    ]
    for i, step in enumerate(build_steps, 1):
        story.append(Paragraph(f"<b>Step {i}:</b> {step}", s_bullet))

    story.append(Paragraph("14.2 EAS Build Profiles", s_h2))
    eas_data = [
        ['Profile', 'Output', 'Distribution', 'Use Case'],
        ['preview', 'APK', 'Internal', 'Testing and sideloading'],
        ['production', 'AAB', 'Store', 'Google Play Store submission'],
    ]
    t = Table(eas_data, colWidths=[80, 60, 80, 230])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)

    story.append(Paragraph("14.3 Known Build Issues", s_h2))
    story.append(Paragraph(
        "<b>OneDrive Interference:</b> Files on OneDrive have alternate data streams that corrupt tar "
        "extraction on EAS Linux build servers. Solution: always build from C:\\dev\\ductivity_build.<br/><br/>"
        "<b>Package Lock Sync:</b> npm ci requires exact lockfile match. Always regenerate with a "
        "fresh npm install before building.<br/><br/>"
        "<b>babel-preset-expo:</b> Must be an explicit dependency (not just transitive) for EAS builds.", s_body))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 15: CODING STANDARDS ═══════════════════════
    story.append(Paragraph("15. Coding Standards & Engineering Principles", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    principles = [
        ("Separation of Concerns", "Screens handle UI, services handle business logic, contexts handle state, utilities handle shared helpers. No screen directly accesses Firestore."),
        ("Single Responsibility", "Each file/module has one clear purpose. activityService handles CRUD only. notificationService handles scheduling only."),
        ("DRY (Don't Repeat Yourself)", "Time parsing logic extracted to timeUtils.ts. Magic numbers centralized in constants.ts. Theme tokens prevent color duplication."),
        ("Composition over Inheritance", "UI built from composable components (GlassCard, IconCircle, GradientButton) rather than complex class hierarchies."),
        ("Defensive Programming", "Expo Go guards on notifications. Min/max enforcement on activity counts. Cache TTL expiration. Graceful error handling with user feedback."),
        ("Type Safety", "Full TypeScript with strict mode. Union types for categories, filters, frequencies. Interface definitions for all data structures."),
        ("Memoization Strategy", "React.memo for pure display components. useMemo for expensive computations. Query cache for network requests."),
        ("Progressive Enhancement", "Core functionality (logging) works without animations, notifications, or charts. Each layer adds value independently."),
        ("Convention over Configuration", "Consistent file naming (camelCase services, PascalCase components). Standardized exports. Barrel files for clean imports."),
    ]
    for title, desc in principles:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", s_bullet))
        story.append(Spacer(1, 2))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 16: FILE STRUCTURE ═══════════════════════
    story.append(Paragraph("16. File Structure", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))
    story.append(Paragraph(
        "App.tsx .......................... Root component + navigation<br/>"
        "app.json ......................... Expo configuration<br/>"
        "babel.config.js .................. Babel preset<br/>"
        "eas.json ......................... EAS Build profiles<br/>"
        "src/<br/>"
        "&nbsp;&nbsp;types/index.ts ............... Type definitions<br/>"
        "&nbsp;&nbsp;theme/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;theme.ts ................. Design tokens<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;icons.ts ................. Icon mappings<br/>"
        "&nbsp;&nbsp;config/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;activities.ts ............ Activity catalogue<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;firebase.ts .............. Firebase init<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;constants.ts ............. Magic numbers<br/>"
        "&nbsp;&nbsp;context/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;UserContext.tsx ........... User name state<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;ActivityContext.tsx ....... Activity list state<br/>"
        "&nbsp;&nbsp;services/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;activityService.ts ....... Firestore CRUD<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;notificationService.ts ... Push scheduling<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;settingsService.ts ....... Settings persistence<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;queryCache.ts ............ In-memory cache<br/>"
        "&nbsp;&nbsp;utils/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;animations.tsx ........... AnimatedButton, FadeInCard<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;haptics.ts ............... Haptic wrappers<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;timeUtils.ts ............. Time parsing<br/>"
        "&nbsp;&nbsp;components/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;ui/ ...................... GradientBackground, GlassCard, etc.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;Toast.tsx ................ Notification toast<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;ActivityChart.tsx ........ Chart visualizations<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;WordOfTheDay.tsx ......... Daily vocabulary<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;SkeletonLoader.tsx ....... Loading placeholder<br/>"
        "&nbsp;&nbsp;screens/<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;SplashScreen.tsx ......... Animated brand intro<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;WelcomeScreen.tsx ........ Onboarding + name<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;ActivitySetupScreen.tsx .. Activity selection<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;TaskScreen.tsx ........... Activity logging<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;DashboardScreen.tsx ...... Charts + analytics<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;SettingsScreen.tsx ....... Preferences",
        s_code))
    story.append(PageBreak())

    # ═══════════════════════ SECTION 17: DEPENDENCIES ═══════════════════════
    story.append(Paragraph("17. Dependencies", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    dep_data = [
        ['Package', 'Version', 'Category'],
        ['expo', '~54.0.33', 'Core Framework'],
        ['react', '19.1.0', 'Core Framework'],
        ['react-native', '0.81.5', 'Core Framework'],
        ['typescript', '~5.x', 'Language'],
        ['firebase', '^12.11.0', 'Backend'],
        ['@react-navigation/native', '^7.x', 'Navigation'],
        ['@react-navigation/bottom-tabs', '^7.x', 'Navigation'],
        ['react-native-chart-kit', '^6.12.0', 'Visualization'],
        ['react-native-svg', '15.12.1', 'Visualization'],
        ['expo-notifications', '~0.32.16', 'Notifications'],
        ['expo-haptics', '-', 'User Experience'],
        ['expo-linear-gradient', '~15.0.8', 'UI Design'],
        ['expo-blur', '-', 'UI Design'],
        ['@expo/vector-icons', '-', 'Icons'],
        ['@react-native-async-storage/async-storage', '2.2.0', 'Local Storage'],
        ['expo-device', '-', 'Device Info'],
        ['expo-constants', '-', 'App Constants'],
        ['babel-preset-expo', '~54.0.10', 'Build'],
    ]
    t = Table(dep_data, colWidths=[180, 80, 190])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ═══════════════════════ SECTION 18: ROADMAP ═══════════════════════
    story.append(Paragraph("18. Future Roadmap", s_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    road_data = [
        ['Priority', 'Feature', 'Description'],
        ['High', 'Firebase Auth', 'Replace default_user with Google/email authentication for multi-user support'],
        ['High', 'Activity History', 'Scrollable list view of past logs with swipe-to-delete'],
        ['High', 'Firestore Security Rules', 'Configure proper read/write rules for production'],
        ['Medium', 'Streak Tracker', 'Show consecutive days of logging consistency'],
        ['Medium', 'Goal Setting', 'Target productivity percentage with progress tracking'],
        ['Medium', 'Activity Notes', 'Attach short text notes to each activity log'],
        ['Medium', 'Export Data', 'CSV/JSON export of activity history for backup'],
        ['Low', 'Mood Logging', 'Pair activities with 1-5 mood ratings for correlation analysis'],
        ['Low', 'Pomodoro Timer', 'Built-in focus timer with auto-logging on completion'],
        ['Low', 'Weekly Insights', 'AI-generated productivity insights and trend analysis'],
        ['Low', 'Home Screen Widget', 'Android widget showing daily productivity score'],
    ]
    t = Table(road_data, colWidths=[55, 110, 285])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, HexColor('#FAFAFA')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ]))
    story.append(t)

    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceAfter=12))
    story.append(Paragraph(
        "<b>END OF DOCUMENT</b><br/>"
        "Ductivity Product Specification Document v1.0<br/>"
        f"Generated: {datetime.date.today().strftime('%B %d, %Y')}",
        ParagraphStyle('End', parent=s_body, alignment=TA_CENTER, textColor=HexColor('#999999'), fontSize=9)))

    # ── Build ──
    doc.build(story)
    print("PDF generated: DUCTIVITY_TECHNICAL_DOCUMENT.pdf")

if __name__ == '__main__':
    build_pdf()
