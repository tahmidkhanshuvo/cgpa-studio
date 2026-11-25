<div align="center">
  <img src="assets/favicon.svg" alt="CGPA Studio logo" width="72" height="72" />
  <h1>CGPA Studio</h1>
  <p><strong>Track your grades. Understand your progress. Plan your graduation.</strong></p>
  <p>A privacy-first, browser-based academic planner for students.</p>
  <p>
    <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
    <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
    <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
    <img alt="Client-side" src="https://img.shields.io/badge/Storage-Local%20only-287454?style=flat-square" />
    <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" /></a>
    <img alt="Vercel ready" src="https://img.shields.io/badge/Vercel-Ready-000000?style=flat-square&logo=vercel" />
  </p>
  <p><a href="#getting-started">Get started</a> · <a href="#features">Features</a> · <a href="#json-import--export">JSON guide</a> · <a href="#deployment">Deployment</a> · <a href="#author">Author</a></p>
</div>

---

## About

CGPA Studio makes academic planning more transparent. Instead of manually calculating weighted averages or maintaining multiple spreadsheets, students can enter their grades, explore the impact of repeat examinations, and see what results they need to reach a desired graduation CGPA.

The application comes with an eight-semester, 73-course AUST Computer Science and Engineering curriculum as a starting point. Every course and semester can be customized for other departments. The grading and repeat-exam engine currently models AUST's four-year academic system.

Everything runs in the browser. No account, backend, database, or university portal credentials are required.

## Features

| Feature | Description |
| :--- | :--- |
| **Overview dashboard** | Track degree credits, semester completion, unfinished grades and repeat-exam opportunities from one place. |
| **Live GPA & CGPA** | Adjust individual course grade sliders and instantly see credit-weighted results. |
| **Semester workspace** | Separate theory, lab/sessionals and thesis; view course details and repeat history. |
| **Repeat examinations** | Record improvement, carry and clearance attempts with eligibility checks and grade ceilings. |
| **Three CGPA views** | Compare IUMS-style CGPA, CGPA including unresolved F grades, and the original CGPA before repeats. |
| **Academic statistics** | Explore interactive semester trends, grade distribution and credit completion. |
| **Course Explorer** | Search, sort and combine multi-select filters for semesters, grades and examination statuses. |
| **Target CGPA planner** | Estimate maximum attainable CGPA and suggest regular and repeat-exam grades under the modeled rules. |
| **Custom curriculum** | Add, edit or remove courses; adjust credits, course types, semester assignments and labels. |
| **JSON portability** | Import or export curricula and results, restore backups, and migrate between devices manually. |
| **Responsive interface** | Mobile and desktop layouts, light/dark themes, collapsible navigation and subtle glassmorphism. |
| **Local persistence** | Save grades, repeat records, curriculum and preferences in browser storage. |

## Getting started

### For students

1. Open CGPA Studio in a modern browser.
2. Visit **Settings** and compare the curriculum with your registration or syllabus. Edit course credits, types and semester assignments if needed.
3. Select a semester and enter your **original regular examination grades** using the sliders. Leave unpublished results unset; do not enter F as a placeholder.
4. Use **Add exam** in the semester in which a repeat examination took place. Preserve the original grade instead of overwriting it.
5. Explore **Statistics** and **Target CGPA** to review progress and plan future examinations.
6. Export a backup from **Settings** regularly.

The in-app **Rules & Sources** page explains the calculations, grading scale, academic rules and import format in more detail.

### Run locally

Download or clone this repository, then open `index.html` in your browser. Alternatively, serve the project over HTTP from its root directory:

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000). On Windows, `py -m http.server 8000` can also be used if the Python launcher is installed.

No package installation, compilation or environment variables are required.

## How calculations work

GPA and CGPA are credit-weighted, not simple averages of course grades.

$$
\mathrm{GPA} = \frac{\sum_i c_i g_i}{\sum_i c_i}
$$

Here, $c_i$ is the course credit and $g_i$ is its grade point. The included courses depend on the selected calculation mode.

| Calculation | Included results |
| :--- | :--- |
| Semester GPA | Passing regular and valid repeat results in that semester; each course counted once in the term. |
| IUMS-style CGPA | Latest valid passing result per course up to the selected semester; unresolved F credits excluded. |
| CGPA including F | Latest valid results, including attempted failed courses at zero grade points. |
| Original CGPA | Original regular results only, including F; all repeat attempts ignored. |

A repeat result replaces the previous course result in cumulative calculations rather than adding extra degree credits. Historical semester GPAs are not rewritten by later examinations. Unentered grades do not contribute to averages. Displayed results are rounded to three decimal places.

> [!NOTE]
> The IUMS-style model was derived from sample result sheets. It is not a published implementation of the university's internal calculation engine. Always use official IUMS results for academic decisions.

### Grading scale

Grade indices are the integer values used in JSON backups; they are **not** the numerical GPA values themselves.

| Grade | Grade point | JSON index |
| :--- | ---: | ---: |
| Not entered | — | 0 |
| F | 0.00 | 1 |
| D | 2.00 | 2 |
| C | 2.25 | 3 |
| C+ | 2.50 | 4 |
| B− | 2.75 | 5 |
| B | 3.00 | 6 |
| B+ | 3.25 | 7 |
| A− | 3.50 | 8 |
| A | 3.75 | 9 |
| A+ | 4.00 | 10 |

### Supported repeat-examination rules

| Rule | Clearance | Carry | Improvement |
| :--- | :--- | :--- | :--- |
| Course type | Theory only | Theory only | Exactly 3-credit theory |
| Original eligibility | F | Unresolved F | Original passing grade D–B+, no prior repeat |
| Exam semester | Original semester | Later semester | Later semester in the planner¹ |
| Maximum grade | B (3.00) | B (3.00) | A− (3.50) |
| Attempts per course | One clearance | Until passed, within limits | One improvement |
| Semester limit | Two combined with carry | Two combined with clearance | Two improvements |
| Degree-wide limit | No separate cap modeled | No separate cap modeled | Eight improvements |

¹ Historical same-semester improvement records are accepted for compatibility with existing grade sheets.

Labs, sessionals and thesis are ineligible for all three repeat types in the application. A lower improvement result replaces the previous grade; an unsuccessful repeat can leave a course unresolved. Invalid repeat records are excluded from calculations and flagged for review.

Some eligibility limits are application-specific planning assumptions, including the exact 3-credit improvement restriction and the combined two carry/clearance limit. The planner estimates outcomes, not official registration eligibility. Consult the Controller of Examinations and current notices before applying for any examination.

## JSON import & export

CGPA Studio supports three data-transfer workflows in **Settings**:

| Format | Purpose |
| :--- | :--- |
| Curriculum only | Import or export semesters and course definitions. |
| Results only | Merge matching regular grades; replace repeat records if an `exams` array is supplied. |
| Full backup | Restore a curriculum and its results together, replacing the existing data. |

A ready-to-use fictional example is available in [`cgpa_sample.json`](cgpa_sample.json).

### Example full backup

```json
{
  "schemaVersion": 2,
  "curriculum": {
    "semesters": ["1-1", "1-2"],
    "courses": [
      {
        "code": "MAT 101",
        "name": "Mathematics",
        "credits": 3,
        "type": "Theory",
        "semester": 1
      },
      {
        "code": "PHY 102",
        "name": "Physics Lab",
        "credits": 1.5,
        "type": "Lab / Sessional",
        "semester": 1
      },
      {
        "code": "ENG 201",
        "name": "English",
        "credits": 3,
        "type": "Theory",
        "semester": 2
      }
    ]
  },
  "values": {
    "MAT 101": 4,
    "PHY 102": 9
  },
  "exams": [
    {
      "code": "MAT 101",
      "type": "improvement",
      "sem": 1,
      "grade": 8
    }
  ]
}
```

In this example, Mathematics was originally graded C+ (2.50) in the first semester and improved to A− (3.50) in the second semester. Physics Lab received A (3.75), while English remains unset.

### Schema reference

| Field | Format / constraint |
| :--- | :--- |
| `schemaVersion` | `2` for current exports. |
| `curriculum.semesters` | Array of 1–24 unique semester labels. |
| `curriculum.courses` | Array of 1–1,000 course objects. |
| `code` | Unique course identifier, 1–40 characters. |
| `name` | Non-empty course title, at most 180 characters. |
| `credits` | Numeric value greater than zero and at most 60. |
| `type` | Exactly `Theory`, `Lab / Sessional`, or `Thesis`. |
| `semester` | **1-based** index of the course's regular semester. |
| `values` | Object mapping course codes to grade indices (0–10). |
| `exams[].type` | `clearance`, `carry`, or `improvement`. |
| `exams[].sem` | **0-based** index of the repeat exam semester. |
| `exams[].grade` | Grade index 1–6 for recovery exams, 1–8 for improvement, subject to eligibility. |

Semester labels support letters, digits, spaces, hyphens, slashes, underscores and periods, up to 24 characters. Course codes use the same character set. Optional backup fields include `page`, `target`, `start` and `allowImprove`.

To import only a curriculum, omit `values` and `exams` and choose **Import curriculum**. To restore a full backup, use the backup import control. Review imported data for unknown codes, invalid repeat records and credit discrepancies.

> [!IMPORTANT]
> Export a backup before importing a new curriculum, clearing grades or restoring a full backup. A full backup replaces your existing curriculum and results. A results-only import merges matching grades but may replace existing repeat history.

## Privacy & data persistence

CGPA Studio uses browser `localStorage` to save data. No academic records are sent to a backend or linked to IUMS.

- Each browser profile and website origin has independent storage.
- Reloading the page or restarting the browser normally preserves records.
- Deploying an update on the same origin preserves data when storage keys and schema remain compatible.
- Moving to a new domain, browser, device or hosted version of a local HTML file requires a manual JSON export/import.
- Private browsing, clearing site data or browser storage policies may remove saved records.

Local storage is not an encrypted vault. Anyone with access to the same browser profile may access its saved data. Keep personal backups private and never commit them to a public repository. External reference and author links open third-party websites.

## Technology & project structure

Built with semantic HTML, CSS and vanilla JavaScript. All application logic is client-side; there is no framework or runtime package dependency.

```text
cgpa-studio/
├── index.html                # Accessible application shell and student guide
├── assets/
│   ├── css/
│   │   ├── base.css          # Core layout, controls and responsive themes
│   │   ├── analytics-guide.css # Charts, settings and guide styles
│   │   ├── accessibility.css # Focus, motion and creator links
│   │   └── dashboard.css     # Overview, shared footer and metric layout
│   ├── js/
│   │   ├── state.js          # Default curriculum, persistence and migration
│   │   ├── engine.js         # GPA and repeat examination calculations
│   │   ├── course-details.js # Course status, grade colours and dialogs
│   │   ├── semester.js       # Semester entry and shared rendering
│   │   ├── overview.js       # Academic dashboard and next steps
│   │   ├── statistics.js     # Charts and course explorer
│   │   ├── planner.js        # Target CGPA projection model
│   │   ├── navigation.js     # Sidebar and theme preferences
│   │   ├── filters.js        # Course explorer filters
│   │   ├── planner-controls.js # Planner input bindings
│   │   ├── settings.js       # Curriculum editing, import and export
│   │   └── bootstrap.js      # Initialization and chart resize handling
│   └── favicon.svg
├── scripts/build-standalone.py # Optional single-file export utility
├── tests/engine.test.cjs     # Calculation and eligibility regression tests
├── cgpa_sample.json         # Fictional import example
├── .gitignore
├── LICENSE
└── README.md
```

### Maintaining the source

The browser loads small, ordered classic scripts from `index.html`. They share the existing application state, avoiding module fetch restrictions when opening the site directly from disk. Keep the declared script order. The calculation engine is separate from UI rendering, so changes to eligibility and weighted averages can be tested independently.

Run the included regression tests with Node.js (no npm dependencies):

```bash
node --test tests/engine.test.cjs
```

To regenerate an offline single-file version from the same source:

```bash
python scripts/build-standalone.py aust_cgpa_calculator.html
```

The generated HTML is optional and does not need to be deployed with the split source files. Do not change storage keys or grade indices without a migration.

## Deployment

### Vercel (recommended)

1. Create a GitHub repository and upload the project files, keeping `index.html` at the repository root.
2. Open [Vercel](https://vercel.com/new) and import the repository.
3. Apply the static site configuration below, then select **Deploy**.

| Setting | Value |
| :--- | :--- |
| Framework preset | Other |
| Root directory | Repository root (`./`) |
| Build command | No build command |
| Install command | No install command |
| Output directory | Repository root (`.`), if an override is needed |
| Environment variables | None |

Share the stable production domain with students. Future pushes to the connected production branch can deploy automatically. Keep the same production origin and preserve the storage schema during updates.

Vercel documentation: [Git deployments](https://vercel.com/docs/git) · [Deployments](https://vercel.com/docs/deployments).

The app can also be served by any conventional static web host, such as GitHub Pages. No server-side runtime is needed.

## Limitations & academic references

- The curriculum is customizable, but the grade scale and repeat-exam rules are fixed to the modeled four-year AUST system. A different university or five-year program may require different rules.
- The default curriculum's electives and credits may not match every intake. Both thesis parts are configured at 3 credits; check your registration and edit as appropriate.
- Target projections assume the selected grade ceilings are attainable. They do not account for every assessment component, registration requirement, deadline or scheduling conflict.
- The application is an independent student project, not an official AUST or IUMS service. Official academic regulations and grade sheets take precedence.

### Official resources

- [Office of the Controller of Examinations](https://aust.edu/administration/offices/office_of_the_controller_of_examinations)
- [Examination and Grading System](https://www.aust.edu/academics/examincation_and_grading_system) — older published rules may differ from current guidance.
- [Spring 2025 admission prospectus](https://admission.aust.edu/wp-content/uploads/2025/12/Spring-2025-Admission-Prospectus-05-12-2025.pdf)
- [CSE syllabus](https://www.aust.edu/cse/syllabus) and [class routines](https://www.aust.edu/cse/class_routine)
- [University notices](https://www.aust.edu/notice)
- [IUMS portal](https://iums.aust.edu/ums-web/iums/)

The in-app Rules & Sources page provides additional context and references. Consult the latest official notices for your intake before taking action.

## Feedback & contributions

Suggestions, bug reports and curriculum corrections are welcome through GitHub Issues. For a reproducible report, include the browser, affected feature, expected behavior and observed behavior. Use fictional grades or remove identifying information before attaching a backup or screenshot.

When proposing changes to the calculation engine, explain the applicable academic rule and include a reproducible example. Preserve backward compatibility with existing local storage keys and JSON backups.

## License & acknowledgments

CGPA Studio is open-source software licensed under the [MIT License](LICENSE). You are free to use, modify and distribute it, including commercially, provided that the copyright and license notice are retained.

Copyright © 2026 Tahmid Khan. The software is provided as-is, without warranty.

GitHub and LinkedIn brand icons used in the application are from [Font Awesome Free](https://fontawesome.com/license/free) (CC BY 4.0). University regulations and curriculum references belong to their respective publishers.

---

<div align="center">
  <h2 id="author">Author</h2>
  <p>Made with love ♡ by <strong>Tahmid Khan</strong><br />CSE · 20220204086</p>
  <p>
    <a href="https://github.com/tahmidkhanshuvo"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>
    <a href="https://www.linkedin.com/in/tahmid-khan-shuvo/"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" /></a>
    <a href="https://www.tahmidkhan.com.bd/"><img alt="Portfolio" src="https://img.shields.io/badge/Portfolio-287454?style=flat-square&logo=googlechrome&logoColor=white" /></a>
    <a href="mailto:hi@tahmidkhan.com.bd"><img alt="Email" src="https://img.shields.io/badge/Email-444444?style=flat-square&logo=maildotru&logoColor=white" /></a>
  </p>
  <p><sub>Built for students, with the goal of making academic planning simpler.</sub></p>
</div>
