# webtask Setup Guide

Complete setup instructions for the WebTop 2.0 project with file browser, process transparency, and miniature previews.

## 📁 Project Structure

Create the following directory structure:

```
webtop/
├── README.md
├── SETUP.md                    # This file
├── CHANGELOG.md
├── LICENSE
├── pyproject.toml
├── .gitignore
├── webtop/                     # Python package
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
```

## 🚀 Quick Setup

### Method 1: Automated Setup Script

Create this setup script as `setup.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Setting up WebTop 2.0..."

# Create directory structure
mkdir -p webtop/{webtop/static,tests,docs}

echo "📁 Directory structure created"

# Initialize git repository
git init
echo "📝 Git repository initialized"

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
__pycache__/
*.py[cod]
*$py.class
dist/
build/
*.egg-info/
.pytest_cache/
.coverage
htmlcov/
.env
.venv
venv/
ENV/
.DS_Store
Thumbs.db
poetry.lock
node_modules/
EOF
    echo "📄 .gitignore created"
fi

# Initialize Poetry project
if command -v poetry &> /dev/null; then
    echo "📦 Initializing Poetry project..."
    poetry init --no-interaction
    poetry add --group dev pytest black flake8 mypy pytest-cov
    echo "✅ Poetry setup complete"
else
    echo "⚠️  Poetry not found. Please install Poetry first:"
    echo "   curl -sSL https://install.python-poetry.org | python3 -"
fi

echo "🎉 WebTop setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy all files from the artifacts to their respective locations"
echo "2. Run: poetry install"
echo "3. Run: poetry run webtop"
```

Make it executable and run:

```bash
chmod +x setup.sh
./setup.sh
```

### Method 2: Manual Setup

1. **Create directory structure**:
```bash
mkdir -p webtop/{webtop/static,tests,docs}
cd webtop
```

2. **Initialize Poetry**:
```bash
poetry init --no-interaction
poetry add --group dev pytest black flake8 mypy pytest-cov
```

3. **Copy files** from the artifacts provided above to their respective locations.

## 📋 File Checklist

Copy each file from the artifacts to the correct location:

### Core Python Files
- [ ] `webtop/__init__.py` - Package initialization
- [ ] `webtop/main.py` - CLI entry point
- [ ] `webtop/server.py` - HTTP server implementation

### Web Assets
- [ ] `webtop/static/index.html` - Main HTML structure
- [ ] `webtop/static/styles.css` - Core styling and layout
- [ ] `webtop/static/webtask.js` - Main application logic
- [ ] `webtop/static/process-data.js` - Process simulation engine
- [ ] `webtop/static/file-system.js` - Virtual file system
- [ ] `webtop/static/file-icons.css` - File type styling
- [ ] `webtop/static/config.json` - Application configuration
- [ ] `webtop/static/manifest.json` - PWA manifest

### Configuration Files
- [ ] `pyproject.toml` - Poetry configuration
- [ ] `.gitignore` - Git ignore patterns
- [ ] `LICENSE` - MIT license
- [ ] `README.md` - Main documentation
- [ ] `CHANGELOG.md` - Version history

### Tests and Documentation
- [ ] `tests/__init__.py` - Test package
- [ ] `tests/test_webtop.py` - Test suite
- [ ] `docs/installation.md` - Installation guide
- [ ] `docs/usage.md` - Usage documentation
- [ ] `docs/development.md` - Development guide

## 🔧 Installation

After copying all files:

1. **Install dependencies**:
```bash
poetry install
```

2. **Verify installation**:
```bash
poetry run webtop --version
```

3. **Run WebTop**:
```bash
poetry run webtop
```

## 🧪 Testing

Run the test suite:

```bash
# Run tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=webtop --cov-report=html

# Run specific test
poetry run pytest tests/test_webtop.py::TestWebTopServer
```

## 🎨 Development

### Code Quality Tools

```bash
# Format code
poetry run black webtop tests

# Lint code
poetry run flake8 webtop tests

# Type checking
poetry run mypy webtop
```

### Development Server

For development with auto-reload:

```bash
# Run in development mode
poetry run webtop --host 0.0.0.0 --port 8000

# Run without auto-opening browser
poetry run webtop --no-browser
```

## 📦 Building and Distribution

### Build Package

```bash
poetry build
```

This creates distribution files in `dist/`:
- `webtop-2.0.0.tar.gz` (source distribution)
- `webtop-2.0.0-py3-none-any.whl` (wheel distribution)

### Local Installation

```bash
# Install in editable mode
pip install -e .

# Install from wheel
pip install dist/webtop-2.0.0-py3-none-any.whl
```

### Publishing to PyPI

```bash
# Test on TestPyPI first
poetry config repositories.testpypi https://test.pypi.org/legacy/
poetry publish -r testpypi

# Publish to PyPI
poetry publish
```

## 🔍 Features Verification

After setup, verify these features work:

### Basic Functionality
- [ ] WebTop starts and opens in browser
- [ ] Process list displays with simulated data
- [ ] CPU and memory bars update in real-time
- [ ] Process selection works (click on process)

### Advanced Features
- [ ] **F1**: Advanced controls panel opens
- [ ] **F2**: File browser modal opens
- [ ] **F9**: Kill selected process works
- [ ] **ESC**: Closes modals and dropdowns

### File Browser
- [ ] Navigate through directories (/bin, /etc, /var)
- [ ] File previews show content
- [ ] Breadcrumb navigation works
- [ ] Different file types show appropriate icons

### Process Features
- [ ] Process transparency levels visible
- [ ] Miniature previews show for different process types
- [ ] Kill dropdown shows signal options
- [ ] Advanced kill by PID/service/port/user works
- [ ] Process hierarchy indicators visible

### Responsive Design
- [ ] Works on desktop (1200px+)
- [ ] Works on tablet (800px-1200px)
- [ ] Mobile layout adapts (800px-)

## 🐛 Troubleshooting

### Common Issues

**Port already in use**:
```bash
webtop --port 8080
```

**Permission denied**:
```bash
# On Linux/Mac, you might need:
sudo webtop --host 0.0.0.0 --port 80
```

**Poetry not found**:
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

**Browser doesn't open**:
```bash
webtop --no-browser
# Then manually navigate to http://localhost:8000
```

### Debug Mode

For debugging, modify `webtop/static/webtask.js` and add:

```javascript
// Add at the top of WebTop class constructor
console.log('WebTop Debug Mode: ON');
this.debug = true;
```

## 📚 Additional Resources

- [Poetry Documentation](https://python-poetry.org/docs/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Black Code Formatter](https://black.readthedocs.io/)
- [Flake8 Linter](https://flake8.pycqa.org/)

## 🤝 Contributing

See [docs/development.md](docs/development.md) for detailed contribution guidelines.

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with:
   - Your operating system
   - Python version (`python --version`)
   - Poetry version (`poetry --version`)
   - Complete error message
   - Steps to reproduce

---

**Happy monitoring with WebTop 2.0!** 🚀