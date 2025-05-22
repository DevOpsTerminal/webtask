# Installation Guide

## System Requirements

- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Network access to localhost

## Installation Methods

### Method 1: PyPI (Recommended)

```bash
pip install webtask
```

### Method 2: Poetry (Development)

```bash
git clone https://github.com/devopsterminal/webtask.git
cd webtask
poetry install
```

### Method 3: From Source

```bash
git clone https://github.com/devopsterminal/webtask.git
cd webtask
pip install -e .
```

## Verification

After installation, verify webtask is working:

```bash
webtask --version
```

## Quick Start

```bash
webtask
```

This will start the server and open webtask in your default browser.

## Troubleshooting

### Port Already in Use

If port 8000 is busy:

```bash
webtask --port 8080
```

### Browser Doesn't Open

Start without auto-opening browser:

```bash
webtask --no-browser
```

Then manually navigate to `http://localhost:8000`

### Permission Issues

On some systems, you might need to use `sudo` or run as administrator.