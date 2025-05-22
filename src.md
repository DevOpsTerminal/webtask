webtask/
├── README.md
├── SETUP.md                    # This file
├── CHANGELOG.md
├── LICENSE
├── pyproject.toml
├── .gitignore
├── webtask/                     # Python package
│   ├── __init__.py
│   ├── main.py
│   ├── server.py
│   └── static/                 # Web assets
│       ├── index.html
│       ├── styles.css
│       ├── webtask.js
│       ├── process-data.js
│       ├── file-system.js
│       ├── file-icons.css
│       ├── config.json
│       ├── manifest.json
│       └── favicon.ico         # Optional
├── tests/                      # Test suite
│   ├── __init__.py
│   └── test_webtop.py
└── docs/                       # Documentation
    ├── installation.md
    ├── usage.md
    └── development.md