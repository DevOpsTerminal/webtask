class webtask {
    constructor() {
        this.processes = [];
        this.filteredProcesses = [];
        this.fileSystem = {};
        this.currentPath = '/';
        this.startTime = Date.now();
        this.selectedPid = null;
        this.processCounter = 1000;
        this.filterText = '';
        
        this.initializeFileSystem();
        this.initializeProcesses();
        this.startUpdating();
        this.bindEvents();
    }

    initializeFileSystem() {
        this.fileSystem = {
            '/': {
                type: 'directory',
                children: {
                    'bin': { type: 'directory', children: {
                        'bash': { type: 'executable', size: 1234567, content: '#!/bin/bash\n# Bash shell executable\n# System shell program' },
                        'node': { type: 'executable', size: 45678901, content: '#!/usr/bin/env node\n// Node.js runtime executable' },
                        'python3': { type: 'executable', size: 23456789, content: '#!/usr/bin/python3\n# Python 3 interpreter' }
                    }},
                    'etc': { type: 'directory', children: {
                        'nginx': { type: 'directory', children: {
                            'nginx.conf': { type: 'config', size: 2048, content: 'server {\n    listen 80;\n    server_name localhost;\n    location / {\n        root /var/www/html;\n    }\n}' }
                        }},
                        'systemd': { type: 'directory', children: {
                            'system': { type: 'directory', children: {
                                'nginx.service': { type: 'service', size: 512, content: '[Unit]\nDescription=The nginx HTTP and reverse proxy server\n[Service]\nType=forking\nExecStart=/usr/sbin/nginx\n[Install]\nWantedBy=multi-user.target' }
                            }}
                        }}
                    }},
                    'var': { type: 'directory', children: {
                        'www': { type: 'directory', children: {
                            'html': { type: 'directory', children: {
                                'index.html': { type: 'html', size: 1024, content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome to nginx!</title>\n    <style>\n        body { font-family: Arial; background: #f0f0f0; }\n        .container { max-width: 800px; margin: 50px auto; padding: 20px; }\n        h1 { color: #333; text-align: center; }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Welcome to nginx!</h1>\n        <p>If you can see this page, the nginx web server is successfully installed and working.</p>\n    </div>\n</body>\n</html>' },
                                'app.js': { type: 'script', size: 856, content: 'const express = require(\'express\');\nconst app = express();\nconst port = 3000;\n\napp.get(\'/\', (req, res) => {\n    res.send(\'Hello World from Node.js!\');\n});\n\napp.listen(port, () => {\n    console.log(`Server running at http://localhost:${port}`);\n});' }
                            }}
                        }},
                        'log': { type: 'directory', children: {
                            'nginx': { type: 'directory', children: {
                                'access.log': { type: 'log', size: 45678, content: '192.168.1.100 - - [22/May/2025:10:30:45 +0000] "GET / HTTP/1.1" 200 612\n192.168.1.101 - - [22/May/2025:10:31:12 +0000] "GET /app.js HTTP/1.1" 404 162' }
                            }}
                        }}
                    }},
                    'usr': { type: 'directory', children: {
                        'local': { type: 'directory', children: {
                            'bin': { type: 'directory', children: {
                                'myapp': { type: 'script', size: 1234, content: '#!/bin/bash\n# Custom application launcher\nexport NODE_ENV=production\ncd /var/www/html\nnode app.js' }
                            }}
                        }}
                    }}
                }
            }
        };
    }

    initializeProcesses() {
        const processTemplates = [
            { cmd: 'systemd', user: 'root', port: null, file: null, service: 'systemd', parent: null },
            { cmd: '/usr/sbin/nginx', user: 'www-data', port: 80, file: '/usr/sbin/nginx', service: 'nginx', parent: 1 },
            { cmd: 'nginx: worker process', user: 'www-data', port: 80, file: '/usr/sbin/nginx', service: 'nginx', parent: 'nginx' },
            { cmd: 'node /var/www/html/app.js', user: 'user', port: 3000, file: '/var/www/html/app.js', service: 'node', parent: null },
            { cmd: '/bin/bash /usr/local/bin/myapp', user: 'user', port: null, file: '/usr/local/bin/myapp', service: 'bash', parent: null },
            { cmd: 'python3 -m http.server 8000', user: 'user', port: 8000, file: '/usr/bin/python3', service: 'python3', parent: null },
            { cmd: 'sshd: /usr/sbin/sshd -D', user: 'root', port: 22, file: '/usr/sbin/sshd', service: 'sshd', parent: null },
            { cmd: 'mysql', user: 'mysql', port: 3306, file: '/usr/bin/mysql', service: 'mysql', parent: null },
            { cmd: 'redis-server', user: 'redis', port: 6379, file: '/usr/bin/redis-server', service: 'redis', parent: null },
            { cmd: 'docker daemon', user: 'root', port: null, file: '/usr/bin/dockerd', service: 'docker', parent: null }
        ];

        this.processes = processTemplates.map((template, index) => ({
            pid: this.processCounter + index,
            user: template.user,
            cpu: Math.random() * 15,
            memory: Math.random() * 25,
            time: this.generateTime(),
            port: template.port,
            command: template.cmd,
            file: template.file,
            service: template.service,
            parent: template.parent,
            children: [],
            transparency: this.calculateTransparency(template.service),
            startTime: Date.now() - Math.random() * 3600000
        }));

        this.processCounter += processTemplates.length;
        this.buildProcessHierarchy();
        this.processes.sort((a, b) => b.cpu - a.cpu);
        this.applyFilter();
    }

    buildProcessHierarchy() {
        // Create parent-child relationships
        this.processes.forEach(process => {
            if (process.parent) {
                const parent = this.processes.find(p => 
                    p.service === process.parent || p.pid === process.parent
                );
                if (parent) {
                    parent.children.push(process.pid);
                    process.parentPid = parent.pid;
                }
            }
        });
    }

    calculateTransparency(service) {
        // Different services have different transparency levels
        const transparencyMap = {
            'systemd': 0.3,      // Core system - very transparent
            'kernel': 0.2,       // Kernel processes - most transparent
            'nginx': 0.8,        // Web server - less transparent
            'node': 0.9,         // Application - visible
            'mysql': 0.7,        // Database - moderate transparency
            'redis': 0.7,        // Cache - moderate transparency
            'sshd': 0.6,         // SSH daemon - moderate transparency
            'docker': 0.5,       // Container runtime - more transparent
            'bash': 1.0,         // Shell - fully visible
            'python3': 0.9       // Python apps - visible
        };
        return transparencyMap[service] || 0.8;
    }

    generateTime() {
        const seconds = Math.floor(Math.random() * 3600);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    applyFilter() {
        if (!this.filterText) {
            this.filteredProcesses = [...this.processes];
        } else {
            const filter = this.filterText.toLowerCase();
            this.filteredProcesses = this.processes.filter(process =>
                process.pid.toString().includes(filter) ||
                process.user.toLowerCase().includes(filter) ||
                process.command.toLowerCase().includes(filter) ||
                process.service.toLowerCase().includes(filter) ||
                (process.port && process.port.toString().includes(filter))
            );
        }
        document.getElementById('filtered-count').textContent = this.filteredProcesses.length;
    }

    updateSystemStats() {
        const cpuUsage = Math.random() * 100;
        const memUsage = Math.random() * 100;
        const loadAvg = (Math.random() * 4).toFixed(2);

        document.getElementById('cpu-fill').style.width = cpuUsage + '%';
        document.getElementById('cpu-percent').textContent = cpuUsage.toFixed(1) + '%';

        document.getElementById('mem-fill').style.width = memUsage + '%';
        document.getElementById('mem-percent').textContent = memUsage.toFixed(1) + '%';

        document.getElementById('load-avg').textContent = loadAvg;

        // Update uptime
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        document.getElementById('uptime').textContent =
            `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProcesses() {
        // Simulate process changes
        this.processes.forEach(process => {
            process.cpu += (Math.random() - 0.5) * 2;
            process.cpu = Math.max(0, Math.min(100, process.cpu));

            process.memory += (Math.random() - 0.5) * 1;
            process.memory = Math.max(0, Math.min(100, process.memory));
        });

        // Occasionally add new processes
        if (Math.random() < 0.1 && this.processes.length < 50) {
            const commands = ['node app.js', 'python3 server.py', 'java -jar app.jar', 'go run main.go'];
            const command = commands[Math.floor(Math.random() * commands.length)];
            const port = Math.random() < 0.3 ? Math.floor(Math.random() * 9000) + 1000 : null;

            this.processes.push({
                pid: this.processCounter++,
                user: 'user',
                cpu: Math.random() * 5,
                memory: Math.random() * 10,
                time: this.generateTime(),
                port: port,
                command: command,
                file: command.includes('node') ? '/var/www/html/app.js' : null,
                service: command.split(' ')[0],
                parent: null,
                children: [],
                transparency: 0.9,
                startTime: Date.now()
            });
        }

        // Sort by CPU usage
        this.processes.sort((a, b) => b.cpu - a.cpu);
        this.applyFilter();
    }

    generatePreviewThumbnail(process) {
        let thumbnailContent = '';
        let thumbnailClass = 'preview-thumbnail';

        if (process.file && this.getFileContent(process.file)) {
            const fileContent = this.getFileContent(process.file);
            const fileExtension = process.file.split('.').pop();

            switch (fileExtension) {
                case 'html':
                    thumbnailClass += ' html-preview';
                    thumbnailContent = `<div class="html-preview">${fileContent}</div>`;
                    break;
                case 'js':
                    thumbnailClass += ' bash-script';
                    thumbnailContent = fileContent.substring(0, 50) + '...';
                    break;
                case 'sh':
                    thumbnailClass += ' bash-script';
                    thumbnailContent = fileContent.substring(0, 50) + '...';
                    break;
                default:
                    if (process.service) {
                        thumbnailClass += ' service-status';
                        thumbnailContent = `<div>⚙️</div><div>${process.service}</div>`;
                    }
            }
        } else if (process.port) {
            thumbnailClass += ' port-indicator';
            thumbnailContent = `<div>🌐</div><div>:${process.port}</div>`;
        } else if (process.service) {
            thumbnailClass += ' service-status';
            thumbnailContent = `<div>⚙️</div><div>${process.service}</div>`;
        }

        return { class: thumbnailClass, content: thumbnailContent };
    }

    renderProcesses() {
        const processList = document.getElementById('process-list');
        processList.innerHTML = '';

        this.filteredProcesses.forEach(process => {
            const row = document.createElement('div');
            row.className = 'process-row';

            if (process.cpu > 10) row.classList.add('high-cpu');
            if (process.memory > 20) row.classList.add('high-mem');
            if (process.transparency < 0.8) row.classList.add('transparent');

            // Add hierarchy indicator
            let hierarchyIndicator = '';
            if (process.parentPid) {
                const depth = this.getProcessDepth(process);
                const hierarchyClass = depth === 1 ? 'child' : 'grandchild';
                hierarchyIndicator = `<div class="process-hierarchy ${hierarchyClass}"></div>`;
            }

            const thumbnail = this.generatePreviewThumbnail(process);

            row.innerHTML = `
                ${hierarchyIndicator}
                <div>${process.pid}</div>
                <div>${process.user}</div>
                <div>${process.cpu.toFixed(1)}</div>
                <div>${process.memory.toFixed(1)}</div>
                <div>${process.time}</div>
                <div>${process.port || '-'}</div>
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${process.command}">
                    ${process.command}
                </div>
                <div class="process-preview" onclick="webtask.showPreview(${process.pid})">
                    <div class="${thumbnail.class}">${thumbnail.content}</div>
                    <span class="preview-icon">👁️</span>
                </div>
                <div class="kill-options">
                    <button class="kill-btn" onclick="webTop.toggleKillDropdown(event, ${process.pid})">
                        KILL ▼
                    </button>
                    <div class="kill-dropdown" id="dropdown-${process.pid}">
                        <div class="kill-option" onclick="webTop.killProcessWithSignal(${process.pid}, 'TERM')">
                            SIGTERM (Graceful)
                        </div>
                        <div class="kill-option danger" onclick="webTop.killProcessWithSignal(${process.pid}, 'KILL')">
                            SIGKILL (Force)
                        </div>
                        <div class="kill-option" onclick="webTop.killProcessWithSignal(${process.pid}, 'INT')">
                            SIGINT (Interrupt)
                        </div>
                        <div class="kill-option" onclick="webTop.killProcessWithSignal(${process.pid}, 'HUP')">
                            SIGHUP (Hangup)
                        </div>
                    </div>
                </div>
            `;

            row.style.opacity = process.transparency;

            row.addEventListener('click', (e) => {
                if (!e.target.closest('.kill-options') && !e.target.closest('.process-preview')) {
                    this.selectedPid = process.pid;
                    document.getElementById('selected-pid').textContent = process.pid;

                    // Remove previous selection
                    document.querySelectorAll('.process-row').forEach(r =>
                        r.style.background = '');
                    row.style.background = '#444';
                }
            });

            row.addEventListener('dblclick', () => {
                this.showProcessDetails(process.pid);
            });

            processList.appendChild(row);
        });

        document.getElementById('process-count').textContent = this.processes.length;
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
    }

    getProcessDepth(process) {
        let depth = 0;
        let current = process;
        while (current.parentPid) {
            depth++;
            current = this.processes.find(p => p.pid === current.parentPid);
            if (!current) break;
        }
        return depth;
    }

    getFileContent(filePath) {
        const parts = filePath.split('/').filter(Boolean);
        let current = this.fileSystem['/'];

        for (const part of parts) {
            if (current.children && current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }

        return current.content || null;
    }

    showPreview(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (!process) return;

        const overlay = document.getElementById('preview-overlay');
        const title = document.getElementById('preview-title');
        const body = document.getElementById('preview-body');

        title.textContent = `Preview - PID ${pid}: ${process.command}`;

        if (process.file && this.getFileContent(process.file)) {
            const content = this.getFileContent(process.file);
            const isHTML = process.file.endsWith('.html');

            if (isHTML) {
                body.className = 'preview-body html-render';
                body.innerHTML = content;
            } else {
                body.className = 'preview-body';
                body.textContent = content;
            }
        } else if (process.port) {
            body.className = 'preview-body';
            body.textContent = `Service running on port ${process.port}\n\nProcess: ${process.command}\nUser: ${process.user}\nPID: ${process.pid}\n\nThis service is ${process.transparency < 0.8 ? 'running in background' : 'actively serving requests'}.`;
        } else {
            body.className = 'preview-body';
            body.textContent = `Process Information:\n\nCommand: ${process.command}\nUser: ${process.user}\nPID: ${process.pid}\nService: ${process.service}\n\nThis is a ${process.transparency < 0.8 ? 'background system process' : 'user-visible process'}.`;
        }

        overlay.classList.add('show');
    }

    closePreview() {
        document.getElementById('preview-overlay').classList.remove('show');
    }

    showProcessDetails(pid) {
        const process = this.processes.find(p => p.pid === pid);
        if (!process) return;

        const modal = document.getElementById('process-details-modal');
        const detailsPid = document.getElementById('details-pid');
        const content = document.getElementById('process-details-content');

        detailsPid.textContent = pid;

        const children = process.children.map(childPid => {
            const child = this.processes.find(p => p.pid === childPid);
            return child ? `${child.pid} (${child.command})` : childPid;
        }).join(', ') || 'None';

        content.innerHTML = `
            <div class="detail-section">
                <h4>Process Information</h4>
                <div class="detail-row">
                    <span class="detail-label">PID:</span>
                    <span class="detail-value">${process.pid}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Command:</span>
                    <span class="detail-value">${process.command}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">User:</span>
                    <span class="detail-value">${process.user}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${process.service}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">File:</span>
                    <span class="detail-value">${process.file || 'N/A'}</span>
                </div>
            </div>
            <div class="detail-section">
                <h4>Resource Usage</h4>
                <div class="detail-row">
                    <span class="detail-label">CPU:</span>
                    <span class="detail-value">${process.cpu.toFixed(2)}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Memory:</span>
                    <span class="detail-value">${process.memory.toFixed(2)}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Runtime:</span>
                    <span class="detail-value">${process.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Port:</span>
                    <span class="detail-value">${process.port || 'N/A'}</span>
                </div>
            </div>
            <div class="detail-section">
                <h4>Process Hierarchy</h4>
                <div class="detail-row">
                    <span class="detail-label">Parent PID:</span>
                    <span class="detail-value">${process.parentPid || 'None'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Children:</span>
                    <span class="detail-value">${children}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transparency:</span>
                    <span class="detail-value">${(process.transparency * 100).toFixed(0)}%</span>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    closeProcessDetails() {
        document.getElementById('process-details-modal').classList.remove('show');
    }

    toggleKillDropdown(event, pid) {
        event.stopPropagation();
        const dropdown = document.getElementById(`dropdown-${pid}`);

        // Close all other dropdowns
        document.querySelectorAll('.kill-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('show');
        });

        dropdown.classList.toggle('show');
    }

    killProcessWithSignal(pid, signal) {
        const process = this.processes.find(p => p.pid === pid);
        if (process) {
            console.log(`Sending ${signal} signal to PID ${pid} (${process.command})`);
            this.killProcess(pid);
        }

        // Close dropdown
        document.getElementById(`dropdown-${pid}`).classList.remove('show');
    }

    killProcess(pid) {
        const index = this.processes.findIndex(p => p.pid === pid);
        if (index !== -1) {
            const process = this.processes[index];

            // Kill child processes first
            if (process.children.length > 0) {
                process.children.forEach(childPid => {
                    this.killProcess(childPid);
                });
            }

            this.processes.splice(index, 1);
            if (this.selectedPid === pid) {
                this.selectedPid = null;
                document.getElementById('selected-pid').textContent = 'none';
            }
            this.applyFilter();
            this.renderProcesses();
        }
    }

    executeAdvancedKill() {
        const pidInput = document.getElementById('kill-pid').value;
        const serviceInput = document.getElementById('kill-service').value;
        const portInput = document.getElementById('kill-port').value;
        const userInput = document.getElementById('kill-user').value;
        const signal = document.getElementById('signal-type').value;

        let targetProcesses = [];

        if (pidInput) {
            const process = this.processes.find(p => p.pid == pidInput);
            if (process) targetProcesses.push(process);
        }

        if (serviceInput) {
            targetProcesses.push(...this.processes.filter(p =>
                p.service.toLowerCase().includes(serviceInput.toLowerCase()) ||
                p.command.toLowerCase().includes(serviceInput.toLowerCase())
            ));
        }

        if (portInput) {
            targetProcesses.push(...this.processes.filter(p =>
                p.port == portInput
            ));
        }

        if (userInput) {
            targetProcesses.push(...this.processes.filter(p =>
                p.user.toLowerCase().includes(userInput.toLowerCase())
            ));
        }

        // Remove duplicates
        const uniqueProcesses = [...new Set(targetProcesses)];

        if (uniqueProcesses.length === 0) {
            alert('No processes found matching the criteria');
            return;
        }

        const confirmMsg = `Kill ${uniqueProcesses.length} process(es) with ${signal}?\n\n` +
            uniqueProcesses.map(p => `PID ${p.pid}: ${p.command}`).join('\n');

        if (confirm(confirmMsg)) {
            uniqueProcesses.forEach(process => {
                console.log(`Sending ${signal} to PID ${process.pid} (${process.command})`);
                this.killProcess(process.pid);
            });

            // Clear inputs
            document.getElementById('kill-pid').value = '';
            document.getElementById('kill-service').value = '';
            document.getElementById('kill-port').value = '';
            document.getElementById('kill-user').value = '';
        }
    }

    killAllFiltered() {
        if (this.filteredProcesses.length === 0) {
            alert('No filtered processes to kill');
            return;
        }

        const signal = document.getElementById('signal-type').value;
        const confirmMsg = `Kill ALL ${this.filteredProcesses.length} filtered processes with ${signal}?`;

        if (confirm(confirmMsg)) {
            this.filteredProcesses.forEach(process => {
                console.log(`Sending ${signal} to PID ${process.pid} (${process.command})`);
                this.killProcess(process.pid);
            });
        }
    }

    showFileBrowser() {
        this.currentPath = '/';
        this.renderFileBrowser();
        document.getElementById('file-browser-modal').classList.add('show');
    }

    closeFileBrowser() {
        document.getElementById('file-browser-modal').classList.remove('show');
    }

    renderFileBrowser() {
        const pathElement = document.getElementById('current-path');
        const breadcrumbElement = document.getElementById('breadcrumb');
        const fileListElement = document.getElementById('file-list');

        pathElement.textContent = this.currentPath;

        // Render breadcrumb
        const pathParts = this.currentPath.split('/').filter(Boolean);
        breadcrumbElement.innerHTML = `
            <span class="breadcrumb-item" onclick="webTop.navigateToPath('/')">/</span>
            ${pathParts.map((part, index) => {
                const path = '/' + pathParts.slice(0, index + 1).join('/');
                return `<span class="breadcrumb-item" onclick="webTop.navigateToPath('${path}')">${part}</span>`;
            }).join(' / ')}
        `;

        // Get current directory
        const currentDir = this.getDirectoryAtPath(this.currentPath);
        if (!currentDir || !currentDir.children) {
            fileListElement.innerHTML = '<div>Directory not found</div>';
            return;
        }

        // Render files
        fileListElement.innerHTML = '';
        Object.entries(currentDir.children).forEach(([name, item]) => {
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${item.type}`;

            let icon = '📄';
            if (item.type === 'directory') icon = '📁';
            else if (item.type === 'executable') icon = '⚙️';
            else if (item.type === 'script') icon = '📜';
            else if (item.type === 'html') icon = '🌐';
            else if (item.type === 'config') icon = '⚙️';
            else if (item.type === 'service') icon = '🔧';
            else if (item.type === 'log') icon = '📋';

            fileItem.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-info">
                    <div class="file-name">${name}</div>
                    <div class="file-size">${item.size ? this.formatFileSize(item.size) : ''}</div>
                </div>
            `;

            fileItem.addEventListener('click', () => {
                if (item.type === 'directory') {
                    this.navigateToPath(this.currentPath === '/' ? `/${name}` : `${this.currentPath}/${name}`);
                } else {
                    this.openFile(this.currentPath === '/' ? `/${name}` : `${this.currentPath}/${name}`);
                }
            });

            fileListElement.appendChild(fileItem);
        });
    }

    getDirectoryAtPath(path) {
        const parts = path.split('/').filter(Boolean);
        let current = this.fileSystem['/'];

        for (const part of parts) {
            if (current.children && current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }

        return current;
    }

    navigateToPath(path) {
        this.currentPath = path;
        this.renderFileBrowser();
    }

    openFile(filePath) {
        const file = this.getDirectoryAtPath(filePath);
        if (file && file.content) {
            this.closeFileBrowser();

            // Show file content in preview
            const overlay = document.getElementById('preview-overlay');
            const title = document.getElementById('preview-title');
            const body = document.getElementById('preview-body');

            title.textContent = `File: ${filePath}`;

            if (filePath.endsWith('.html')) {
                body.className = 'preview-body html-render';
                body.innerHTML = file.content;
            } else {
                body.className = 'preview-body';
                body.textContent = file.content;
            }

            overlay.classList.add('show');
        }
    }

    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    startUpdating() {
        setInterval(() => {
            this.updateSystemStats();
            this.updateProcesses();
            this.renderProcesses();
        }, 2000);

        // Initial render
        this.updateSystemStats();
        this.renderProcesses();
    }

    bindEvents() {
        // Search filter
        document.getElementById('search-filter').addEventListener('input', (e) => {
            this.filterText = e.target.value;
            this.applyFilter();
            this.renderProcesses();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    document.getElementById('advanced-controls').classList.toggle('show');
                    break;
                case 'F2':
                    e.preventDefault();
                    this.showFileBrowser();
                    break;
                case 'F9':
                    e.preventDefault();
                    if (this.selectedPid) {
                        this.killProcess(this.selectedPid);
                    }
                    break;
                case 'F10':
                    e.preventDefault();
                    if (confirm('Really quit webtop?')) {
                        window.close();
                    }
                    break;
                case 'q':
                    if (confirm('Really quit webtop?')) {
                        window.close();
                    }
                    break;
                case 'Escape':
                    // Close any open modals
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.classList.remove('show');
                    });
                    document.getElementById('preview-overlay').classList.remove('show');
                    break;
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.kill-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        });
    }
}

// Initialize webtop
const webTop = new WebTop();