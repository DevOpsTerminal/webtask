# Usage Guide

## Starting webtask

### Basic Usage

```bash
webtask
```

### Advanced Options

```bash
webtask --host 0.0.0.0 --port 9000 --no-browser
```

## Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--host` | Host to bind server to | `localhost` |
| `--port` | Port to bind server to | `8000` |
| `--no-browser` | Don't open browser automatically | `False` |
| `--version` | Show version and exit | - |

## Interface Overview

### System Stats Bar
- **CPU Usage**: Real-time CPU utilization with color-coded progress bar
- **Memory Usage**: Current memory consumption
- **Load Average**: System load indicator
- **Uptime**: Time since webtask started

### Process List

The main table shows:
- **PID**: Process identifier
- **USER**: Process owner
- **CPU%**: CPU usage percentage
- **MEM%**: Memory usage percentage
- **TIME+**: Process runtime
- **COMMAND**: Command line with arguments
- **ACTION**: Kill button for process termination

### Color Coding

- **Red text**: High CPU usage processes (>10%)
- **Yellow text**: High memory usage processes (>20%)
- **Green**: Normal system text
- **Cyan**: Headers and special information

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F9` | Kill selected process |
| `F10` | Quit webtask |
| `q` | Quit WebTop |
| `Click` | Select process |

## Process Management

### Selecting Processes
- Click any process row to select it
- Selected process will be highlighted
- Selected PID shown in footer

### Killing Processes
- **Method 1**: Click the red "KILL" button next to any process
- **Method 2**: Select a process and press `F9`

### Process Information
- Hover over long command names to see full text
- Processes auto-sort by CPU usage (highest first)
- New processes appear automatically

## Tips and Tricks

1. **High Resource Processes**: Look for red/yellow highlighted processes
2. **System Load**: Monitor the load average - above 1.0 indicates system stress
3. **Memory Pressure**: Watch for high memory usage percentages
4. **Process Trends**: Observe how CPU usage changes over time

## Limitations

- Currently shows simulated data for demonstration
- Process termination is simulated (doesn't affect real system)
- Real system integration planned for future versions