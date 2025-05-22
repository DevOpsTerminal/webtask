# WebTask Makefile

# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export $(shell sed 's/=.*//' .env)
endif

# Default values that can be overridden
PORT ?= 9000
HOST ?= 0.0.0.0
PYTHON ?= python3
LOG_DIR ?= ./logs
DB_PATH ?= $(LOG_DIR)/loglama.db
EXAMPLE_DB_PATH ?= $(LOG_DIR)/example.db

.PHONY: all setup install test test-unit test-integration test-ansible lint format clean run-api web run-example view-logs run-integration run-examples build publish publish-test check-publish help start stop restart status

all: help

# Install dependencies
install:
	@echo "Installing dependencies with Poetry..."
	@poetry install --with dev
	@echo "Dependencies installed."

# Setup the project (install dependencies)
setup: install
	@echo "LogLama setup completed."

# Run all tests
test: test-unit test-integration
	@echo "All tests completed."

# Run unit tests
test-unit:
	@echo "Running unit tests..."
	@poetry run pytest tests/ -v

# Run integration tests
test-integration:
	@echo "Running integration tests..."
	@poetry run pytest tests/integration/ -v

# Run Ansible tests
test-ansible:
	@echo "Running Ansible tests..."
	@poetry run ansible-playbook tests/ansible/test_loglama.yml -v

# Run linting checks
lint:
	@echo "Running linting checks..."
	@poetry run flake8 webtask/
	@poetry run mypy webtask/

# Format code
format:
	@echo "Formatting code..."
	@poetry run black webtask/
	@poetry run isort webtask/

# Build package with Poetry
build:
	@echo "Building package with Poetry..."
	@poetry build
	@echo "Package built successfully. Artifacts in dist/"

# Check if package is ready for publishing
check-publish: lint test
	@echo "Ready to publish."

# Publish to TestPyPI
publish-test: build
	@echo "Publishing to TestPyPI..."
	@poetry publish -r testpypi
	@echo "Published to TestPyPI. Test with:"
	@echo "pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ loglama"

# Publish to PyPI (production)
publish: check-publish
	@echo "Bumping patch version..."
	@poetry version patch
	@$(MAKE) build
	@echo "Publishing to PyPI..."
	@echo "WARNING: This will publish to PyPI (production). This action cannot be undone."
	@read -p "Are you sure you want to continue? (y/N): " confirm && [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]
	@poetry publish
	@echo "Published to PyPI. Install with: pip install loglama"

# Full publishing workflow using the publish script
publish-full:
	@echo "Running full publishing workflow..."
	@chmod +x scripts/publish.sh
	@./scripts/publish.sh

# Start the WebTask server
start:
	@echo "Starting WebTask server on $(HOST):$(PORT)..."
	@poetry run webtask --host $(HOST) --port $(PORT)

# Stop the WebTask server
stop:
	@echo "Stopping WebTask server on port $(PORT)..."
	@-pkill -f "python.*webtask.*--host $(HOST).*--port $(PORT)" || echo "No WebTask server found running on port $(PORT)"
	@-pkill -f "webtask.*--host $(HOST).*--port $(PORT)" || true

# Restart the WebTask server
restart: stop start

# Show status of WebTask server
status:
	@pgrep -f "webtask --host $(HOST) --port $(PORT)" > /dev/null && \
		echo "WebTask server is running on $(HOST):$(PORT)" || \
		echo "WebTask server is not running on $(HOST):$(PORT)"

# Dry run of the publishing process
publish-dry-run:
	@echo "Running dry run of publishing process..."
	@chmod +x scripts/publish.sh
	@./scripts/publish.sh --dry-run

# Quick publish (skip tests and TestPyPI)
publish-quick:
	@echo "Running quick publish (skip tests and TestPyPI)..."
	@chmod +x scripts/publish.sh
	@./scripts/publish.sh --skip-tests --skip-testpypi

# Configure PyPI credentials
configure-pypi:
	@echo "Configuring PyPI credentials..."
	@echo "You'll need API tokens from PyPI and TestPyPI"
	@echo "Get them from:"
	@echo "  PyPI: https://pypi.org/manage/account/token/"
	@echo "  TestPyPI: https://test.pypi.org/manage/account/token/"
	@echo ""
	@read -p "Enter PyPI token: " pypi_token && \
		poetry config pypi-token.pypi $$pypi_token
	@read -p "Enter TestPyPI token: " testpypi_token && \
		poetry config pypi-token.testpypi $$testpypi_token
	@echo "Credentials configured successfully."

# Show current version
version:
	@echo "Current version:"
	@poetry version

# Bump version (patch)
version-patch:
	@echo "Bumping patch version..."
	@poetry version patch
	@git add pyproject.toml
	@git commit -m "Bump version to $$(poetry version -s)"

# Bump version (minor)
version-minor:
	@echo "Bumping minor version..."
	@poetry version minor
	@git add pyproject.toml
	@git commit -m "Bump version to $$(poetry version -s)"

# Bump version (major)
version-major:
	@echo "Bumping major version..."
	@poetry version major
	@git add pyproject.toml
	@git commit -m "Bump version to $$(poetry version -s)"

# Run API server
run-api:
	@echo "Starting LogLama API server on $(HOST):$(PORT)..."
	@poetry run python -m loglama.api.server --host $(HOST) --port $(PORT)

# Run web interface (legacy method)
run-web: web

# Run web interface with new command
web:
	@echo "Starting LogLama web interface on $(HOST):$(PORT)..."
	@poetry run python -m loglama.cli.main web --host $(HOST) --port $(PORT) --db $(DB_PATH)

# Run CLI
run-cli:
	@echo "Starting LogLama CLI..."
	@poetry run python -m loglama.cli.main

# Run example application
run-example:
	@echo "Running example application..."
	@mkdir -p $(LOG_DIR)
	@poetry run python examples/example_app.py --requests 20 --log-dir $(LOG_DIR) --db-path $(EXAMPLE_DB_PATH) --json

# Run multi-language examples
run-examples:
	@echo "Running multi-language examples..."
	@mkdir -p $(LOG_DIR)
	@poetry run python examples/multilanguage_examples.py

# Run shell examples
run-shell-examples:
	@echo "Running shell examples..."
	@mkdir -p $(LOG_DIR)
	@poetry run bash examples/shell_examples.sh

# View logs from example application
view-logs:
	@echo "Starting web interface to view example logs on $(HOST):$(PORT)..."
	@poetry run python -m loglama.cli.web_viewer --host $(HOST) --port $(PORT) --db $(EXAMPLE_DB_PATH)

# Run integration script to integrate LogLama into a component
run-integration:
	@echo "Running LogLama integration script..."
	@poetry run python scripts/integrate_loglama.py --all

# Clean up generated files
clean:
	@echo "Cleaning up generated files..."
	@rm -rf build/ dist/ *.egg-info/ .pytest_cache/ .coverage htmlcov/ .mypy_cache/
	@find . -type d -name __pycache__ -exec rm -rf {} +
	@find . -type f -name "*.pyc" -delete
	@echo "Cleanup completed."

# Display help information
help:
	@echo "LogLama Makefile Commands:"
	@echo ""
	@echo "Setup and Development:"
	@echo "  make setup          - Set up the project (install dependencies)"
	@echo "  make test           - Run all tests"
	@echo "  make test-unit      - Run unit tests"
	@echo "  make test-integration - Run integration tests"
	@echo "  make test-ansible   - Run Ansible tests"
	@echo "  make lint           - Run linting checks"
	@echo "  make format         - Format code"
	@echo "  make clean          - Clean up generated files"
	@echo ""
	@echo "Version Management:"
	@echo "  make version        - Show current version"
	@echo "  make version-patch  - Bump patch version (0.1.0 -> 0.1.1)"
	@echo "  make version-minor  - Bump minor version (0.1.0 -> 0.2.0)"
	@echo "  make version-major  - Bump major version (0.1.0 -> 1.0.0)"
	@echo ""
	@echo "Building and Publishing:"
	@echo "  make build          - Build package with Poetry"
	@echo "  make check-publish  - Check if package is ready for publishing"
	@echo "  make configure-pypi - Configure PyPI and TestPyPI credentials"
	@echo "  make publish-test   - Publish to TestPyPI"
	@echo "  make publish        - Publish to PyPI (production)"
	@echo "  make publish-full   - Run full publishing workflow with checks"
	@echo "  make publish-dry-run - Dry run of publishing process"
	@echo "  make publish-quick  - Quick publish (skip tests and TestPyPI)"
	@echo ""
	@echo "Running LogLama:"
	@echo "  make run-api        - Run API server"
	@echo "  make web            - Run web interface"
	@echo "  make run-cli        - Run CLI"
	@echo ""
	@echo "Examples and Integration:"
	@echo "  make run-example    - Run example application"
	@echo "  make run-examples   - Run multi-language examples"
	@echo "  make run-shell-examples - Run shell examples"
	@echo "  make view-logs      - View logs from example application"
	@echo "  make run-integration - Run integration script"
	@echo ""
	@echo "Environment variables that can be set:"
	@echo "  PORT              - Port for web/API server (default: 8081)"
	@echo "  HOST              - Host for web/API server (default: 127.0.0.1)"
	@echo "  LOG_DIR           - Directory for logs (default: ./logs)"
	@echo "  DB_PATH           - Path to SQLite database (default: ./logs/loglama.db)"
	@echo "  EXAMPLE_DB_PATH   - Path to example SQLite database (default: ./logs/example.db)"
	@echo ""
	@echo "Example usage:"
	@echo "  make web PORT=8081 HOST=0.0.0.0"
	@echo "  make run-examples LOG_DIR=/tmp/logs"
	@echo "  make publish-test"
	@echo "  make version-patch && make publish-full"