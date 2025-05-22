## [2.0.0] - 2025-05-22

### Added - Major Feature Update
- 🗂️ **File Browser System** - Complete virtual file system with directory navigation
- 🔍 **Process File Preview** - Miniature thumbnails showing actual file content
- 📱 **HTML Rendering at 10% Scale** - Live miniature web page previews for web servers
- 🎯 **Advanced Kill Options** - Kill by PID, service name, port, user with signal selection
- 🔗 **Process Hierarchy Visualization** - Parent-child relationships with visual indicators
- 👁️ **Transparency Layers** - Different opacity levels showing process importance
- 📊 **Enhanced Process Details** - Detailed modals with comprehensive process information
- ⌨️ **Extended Keyboard Shortcuts** - F1 (advanced controls), F2 (file browser)
- 🎨 **Modular Architecture** - Separated CSS, JS, and configuration files
- 📋 **Process Dependencies** - Show what processes depend on what services
- 🌐 **Port Monitoring** - Enhanced port detection and service identification
- 📝 **File Type Recognition** - Smart file type detection with appropriate previews

### Enhanced Features
- **Process Transparency System**: 
  - Kernel processes: 20% opacity (most transparent)
  - System processes: 30% opacity
  - Background services: 50% opacity
  - User services: 70% opacity
  - User applications: 90% opacity (least transparent)
- **File Browser**: Navigate through /bin, /etc, /var, /usr with realistic file content
- **Miniature Previews**: 
  - Bash scripts shown as terminal text
  - HTML files rendered as scaled-down web pages
  - Service files displayed with status indicators
  - Port services shown with connection info
- **Advanced Filtering**: Search by PID, user, command, service, or port
- **Signal Management**: Choose from SIGTERM, SIGKILL, SIGINT, SIGHUP, SIGUSR1, SIGUSR2

### Technical Improvements
- Split monolithic HTML into separate files:
  - `index.html` - Main structure
  - `styles.css` - All styling and animations
  - `webtask.js` - Main application logic
  - `process-data.js` - Process simulation engine
  - `file-system.js` - Virtual file system
  - `file-icons.css` - File type styling
  - `config.json` - Configuration settings
- Responsive design improvements for mobile and tablet
- Enhanced accessibility features
- Performance optimizations for large process lists

### File Structure
```
webtask/static/
├── index.html          # Main HTML structure
├── styles.css          # Core styling and layout
├── webtask.js          # Main application logic
├── process-data.js    # Process simulation engine
├── file-system.js     # Virtual file system
├── file-icons.css     # File type icons and styles
├── config.json        # Application configuration
└── manifest.json      # Web app manifest
```

### Breaking Changes
- Updated grid layout to accommodate preview column
- New process data structure with hierarchy support
- Modified CSS class names for better organization

## [1.0.0] - 2025-05-22

### Added
- Initial release of webtask
- Web-based system monitor with htop-inspired interface
- Real-time CPU and memory usage monitoring
- Process list with sorting capabilities
- Basic process termination functionality
- Keyboard shortcuts (F9, F10, Q)
- Interactive process selection
- Terminal-style dark theme with green text
- Auto-updating system statistics
- Command-line interface with customizable host and port
- Cross-platform compatibility
- Zero external dependencies for the web interface

### Features
- 🔄 Real-time monitoring with 2-second update intervals
- 📊 System stats bar showing CPU, memory, load average, and uptime
- 🎯 Interactive process management with click-to-select
- ⌨️ Familiar keyboard shortcuts from htop
- 🎨 Authentic terminal aesthetics
- 📱 Responsive design for various screen sizes
- 🚀 Simple installation and setup

[Unreleased]: https://github.com/devopsterminal/webtop/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/devopsterminal/webtop/releases/tag/v2.0.0
[1.0.0]: https://github.com/devopsterminal/webtop/releases/tag/v1.0.0# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-05-22

### Added
- Initial release of WebTop
- Web-based system monitor with htop-inspired interface
- Real-time CPU and memory usage monitoring
- Process list with sorting capabilities
- Process termination functionality
- Keyboard shortcuts (F9, F10, Q)
- Interactive process selection
- Terminal-style dark theme with green text
- Auto-updating system statistics
- Command-line interface with customizable host and port
- Cross-platform compatibility
- Zero external dependencies for the web interface

### Features
- 🔄 Real-time monitoring with 2-second update intervals
- 📊 System stats bar showing CPU, memory, load average, and uptime
- 🎯 Interactive process management with click-to-select
- ⌨️ Familiar keyboard shortcuts from htop
- 🎨 Authentic terminal aesthetics
- 📱 Responsive design for various screen sizes
- 🚀 Simple installation and setup

[Unreleased]: https://github.com/devopsterminal/webtop/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/devopsterminal/webtop/releases/tag/v0.1.0