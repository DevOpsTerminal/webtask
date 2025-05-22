# Development Guide

## Setting Up Development Environment

### Prerequisites

- Python 3.7+
- Poetry
- Git

### Clone and Setup

```bash
git clone https://github.com/devopsterminal/webtask.git
cd webtask
poetry install
```

### Running from Source

```bash
poetry run webtask
```

## Project Structure

```
webtask/
├── webtask/           # Main package
│   ├── main.py       # Entry point
│   ├── server.py     # HTTP server
│   └── static/       # Web assets
├── tests/            # Test suite
├── docs/             # Documentation
└── pyproject.toml    # Poetry configuration
```

## Development Workflow

### Running Tests

```bash
poetry run pytest
```

### Code Formatting

```bash
poetry run black webtask tests
```

### Type Checking

```bash
poetry run mypy webtask
```

### Linting

```bash
poetry run flake8 webtask tests
```

## Adding Features

### Web Interface Changes

1. Edit `webtask/static/index.html`
2. Test changes by running `poetry run webtask`
3. Refresh browser to see updates

### Backend Changes

1. Modify Python files in `webtask/`
2. Restart server to test changes
3. Add tests for new functionality

### Adding Dependencies

```bash
poetry add package-name
```

For development dependencies:

```bash
poetry add --group dev package-name
```

## Testing

### Running Specific Tests

```bash
poetry run pytest tests/test_webtask.py::TestwebtaskServer
```

### Coverage Report

```bash
poetry run pytest --cov=webtask --cov-report=html
```

## Building and Publishing

### Build Package

```bash
poetry build
```

### Publish to PyPI

```bash
poetry publish
```

## Contributing Guidelines

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Make** changes and add tests
4. **Run** test suite: `poetry run pytest`
5. **Format** code: `poetry run black .`
6. **Commit** changes: `git commit -m 'Add amazing feature'`
7. **Push** to branch: `git push origin feature/amazing-feature`
8. **Submit** pull request

## Code Style

- Follow PEP 8
- Use Black for formatting
- Add type hints where possible
- Write docstrings for functions and classes
- Keep functions small and focused

## Future Development

### Planned Features

- Real system integration
- Docker monitoring
- Process filtering
- Custom themes
- Configuration files
- Plugin system

### Architecture Goals

- Keep web interface dependency-free
- Maintain cross-platform compatibility
- Focus on performance and responsiveness
- Ensure easy deployment and distribution