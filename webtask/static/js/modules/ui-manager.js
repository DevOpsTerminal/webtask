/**
 * UI Manager Module
 * Handles all UI-related functionality
 */
class UIManager {
    constructor(processManager, systemMonitor, fileSystemManager) {
        this.processManager = processManager;
        this.systemMonitor = systemMonitor;
        this.fileSystemManager = fileSystemManager;
        this.previewVisible = false;
    }
    
    /**
     * Bind all UI event listeners
     */
    bindEvents() {
        // Process filter input
        const filterInput = document.getElementById('process-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.processManager.setFilterText(e.target.value);
                this.renderProcesses();
            });
        }
        
        // Process sort headers
        document.querySelectorAll('.process-header .sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const column = e.target.dataset.sort;
                const currentDirection = this.processManager.sortConfig.direction;
                const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
                
                // Update sort indicators
                document.querySelectorAll('.process-header .sortable').forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                e.target.classList.add(`sort-${newDirection}`);
                
                // Update sort configuration
                this.processManager.setSortConfig(column, newDirection);
                
                // Re-render processes
                this.renderProcesses();
            });
        });
        
        // Kill process button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('kill-button')) {
                const pid = parseInt(e.target.dataset.pid);
                this.toggleKillOptions(pid);
            } else if (e.target.classList.contains('kill-option')) {
                const pid = parseInt(e.target.dataset.pid);
                const signal = e.target.dataset.signal;
                if (pid && signal) {
                    this.processManager.killProcess(pid, signal);
                    this.toggleKillOptions(pid); // Close the dropdown
                }
            }
        });
        
        // Process row selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.process-row') && !e.target.closest('.kill-options') && !e.target.closest('.process-preview')) {
                const row = e.target.closest('.process-row');
                const pid = parseInt(row.dataset.pid);
                
                this.selectProcess(pid);
            }
        });
        
        // Advanced controls toggle
        const advancedToggle = document.getElementById('advanced-toggle');
        if (advancedToggle) {
            advancedToggle.addEventListener('click', () => {
                document.getElementById('advanced-controls').classList.toggle('show');
            });
        }
        
        // Close preview button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preview-close-button')) {
                this.closePreview();
            }
        });
        
        // Preview thumbnails
        document.addEventListener('click', (e) => {
            // Check if the clicked element or any of its parents has the preview-thumbnail class
            let target = e.target;
            while (target && !target.classList?.contains('preview-thumbnail')) {
                target = target.parentElement;
            }
            
            if (target && target.dataset.pid) {
                const pid = parseInt(target.dataset.pid);
                this.showProcessPreview(pid, e);
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.previewVisible) {
                    this.closePreview();
                } else if (document.getElementById('advanced-controls').classList.contains('show')) {
                    document.getElementById('advanced-controls').classList.remove('show');
                }
            }
        });
    }
    
    /**
     * Render the process list
     */
    renderProcesses() {
        const container = document.getElementById('process-list');
        if (!container) return;
        
        // Clear existing processes
        container.innerHTML = '';
        
        // Render each process
        this.processManager.filteredProcesses.forEach(process => {
            const row = this.createProcessRow(process);
            container.appendChild(row);
        });
        
        // Update process count
        const countElement = document.getElementById('process-count');
        if (countElement) {
            countElement.textContent = `${this.processManager.filteredProcesses.length} processes`;
        }
    }
    
    /**
     * Create a process row element
     * @param {Object} process - Process object
     * @returns {HTMLElement} Process row element
     */
    createProcessRow(process) {
        const row = document.createElement('div');
        row.className = 'process-row';
        row.dataset.pid = process.pid;
        
        // Add hierarchy indicator
        let hierarchyIndicator = '';
        if (process.parentPid) {
            const depth = this.processManager.getProcessDepth(process);
            const hierarchyClass = depth === 1 ? 'child' : 'grandchild';
            hierarchyIndicator = `<div class="process-hierarchy ${hierarchyClass}"></div>`;
        }
        
        const thumbnail = this.generatePreviewThumbnail(process);
        
        row.innerHTML = `
            ${hierarchyIndicator}
            <div class="sortable" data-sort="pid">${process.pid}</div>
            <div class="sortable" data-sort="user">${process.user}</div>
            <div class="sortable" data-sort="cpu">${process.cpu.toFixed(1)}</div>
            <div class="sortable" data-sort="mem">${process.memory.toFixed(1)}</div>
            <div class="sortable" data-sort="time">${process.time}</div>
            <div class="sortable" data-sort="port">${process.port || '-'}</div>
            <div class="sortable process-command" data-sort="command">
                ${thumbnail}
            </div>
            <div class="process-actions">
                <button class="kill-button" data-pid="${process.pid}">
                    <span class="kill-icon">×</span>
                </button>
                <div class="kill-dropdown" id="dropdown-${process.pid}">
                    <div class="kill-option" data-pid="${process.pid}" data-signal="TERM">
                        SIGTERM (Terminate)
                    </div>
                    <div class="kill-option" data-pid="${process.pid}" data-signal="KILL">
                        SIGKILL (Kill)
                    </div>
                    <div class="kill-option" data-pid="${process.pid}" data-signal="INT">
                        SIGINT (Interrupt)
                    </div>
                    <div class="kill-option" data-pid="${process.pid}" data-signal="HUP">
                        SIGHUP (Hangup)
                    </div>
                </div>
            </div>
        `;
        
        row.style.opacity = process.transparency;
        
        return row;
    }
    
    /**
     * Generate command text with appropriate icon
     * @param {Object} process - Process object
     * @returns {string} HTML for the command with icon
     */
    generateCommandWithIcon(process) {
        let iconHtml = '';
        
        // Determine the type of icon based on the process service or command
        if (process.service === 'nginx') {
            iconHtml = '<span class="command-icon nginx-icon">NGINX</span>';
        } else if (process.service === 'node') {
            iconHtml = '<span class="command-icon node-icon">NODE</span>';
        } else if (process.service === 'python' || process.command.includes('python')) {
            iconHtml = '<span class="command-icon python-icon">PY</span>';
        } else if (process.service === 'java' || process.command.includes('java')) {
            iconHtml = '<span class="command-icon java-icon">JAVA</span>';
        } else if (process.service === 'mysql' || process.command.includes('mysql')) {
            iconHtml = '<span class="command-icon mysql-icon">SQL</span>';
        } else if (process.command.includes('firefox')) {
            iconHtml = '<span class="command-icon firefox-icon">FF</span>';
        } else if (process.command.includes('chrome')) {
            iconHtml = '<span class="command-icon chrome-icon">CR</span>';
        } else if (process.command.includes('pycharm')) {
            iconHtml = '<span class="command-icon pycharm-icon">PC</span>';
        } else if (process.command.includes('vscode') || process.command.includes('code')) {
            iconHtml = '<span class="command-icon vscode-icon">VS</span>';
        } else {
            iconHtml = '<span class="command-icon process-icon">PROC</span>';
        }
        
        return `<div class="command-with-icon">${iconHtml} <span class="command-text">${process.command}</span></div>`;
    }
    
    /**
     * Generate a preview thumbnail for a process
     * @param {Object} process - Process object
     * @returns {string} HTML for the preview thumbnail
     */
    generatePreviewThumbnail(process) {
        let thumbnailContent = '';
        let thumbnailClass = 'preview-thumbnail';
        
        // Determine the type of preview based on the process
        if (process.file) {
            // Get file content from fileSystemManager if available, otherwise use local method
            const fileContent = this.fileSystemManager ? 
                this.fileSystemManager.getFileContent(process.file) : 
                this.getFileContent(process.file);
            
            if (fileContent) {
                if (process.file.endsWith('.html')) {
                    thumbnailClass += ' html-preview';
                    thumbnailContent = `<iframe srcdoc="${this.escapeHTML(fileContent)}"></iframe>`;
                } else if (process.file.endsWith('.js')) {
                    thumbnailClass += ' code-preview js-preview';
                    thumbnailContent = `
                        <div class="code-preview-header"><span class="file-icon js-icon">JS</span> ${process.file.split('/').pop()}</div>
                        <pre class="code-snippet">${this.escapeHTML(fileContent.substring(0, 100))}...</pre>
                    `;
                } else if (process.file.endsWith('.css')) {
                    thumbnailClass += ' code-preview css-preview';
                    thumbnailContent = `
                        <div class="code-preview-header"><span class="file-icon css-icon">CSS</span> ${process.file.split('/').pop()}</div>
                        <pre class="code-snippet">${this.escapeHTML(fileContent.substring(0, 100))}...</pre>
                    `;
                } else if (process.file.endsWith('.json')) {
                    thumbnailClass += ' code-preview json-preview';
                    thumbnailContent = `
                        <div class="code-preview-header"><span class="file-icon json-icon">JSON</span> ${process.file.split('/').pop()}</div>
                        <pre class="code-snippet">${this.escapeHTML(fileContent.substring(0, 100))}...</pre>
                    `;
                } else if (process.file.endsWith('.sh') || process.file.endsWith('.bash')) {
                    thumbnailClass += ' code-preview bash-preview';
                    thumbnailContent = `
                        <div class="code-preview-header"><span class="file-icon bash-icon">BASH</span> ${process.file.split('/').pop()}</div>
                        <pre class="code-snippet">${this.escapeHTML(fileContent.substring(0, 100))}...</pre>
                    `;
                } else if (process.file.endsWith('.txt') || process.file.endsWith('.md')) {
                    thumbnailClass += ' text-preview';
                    thumbnailContent = `
                        <div class="text-preview-header"><span class="file-icon text-icon">TXT</span> ${process.file.split('/').pop()}</div>
                        <div class="text-content">${this.escapeHTML(fileContent.substring(0, 150))}...</div>
                    `;
                } else if (process.file.endsWith('.pdf')) {
                    thumbnailClass += ' pdf-preview';
                    thumbnailContent = `
                        <div class="pdf-icon">PDF</div>
                        <div class="file-name">${process.file.split('/').pop()}</div>
                    `;
                } else if (/\.(jpg|jpeg|png|gif|svg)$/i.test(process.file)) {
                    thumbnailClass += ' image-preview';
                    thumbnailContent = `
                        <div class="image-icon">IMG</div>
                        <div class="file-name">${process.file.split('/').pop()}</div>
                    `;
                }
            }
        } else if (process.port) {
            // Process with a port - likely a web service
            if (process.service === 'nginx' || process.service === 'apache' || process.command.includes('http')) {
                thumbnailClass += ' web-service-preview';
                thumbnailContent = `
                    <div class="web-service-header">
                        <span class="service-icon ${process.service}-icon">${process.service.toUpperCase()}</span>
                        <span class="port-badge">:${process.port}</span>
                    </div>
                    <div class="web-service-content">
                        <div class="browser-mockup">
                            <div class="browser-bar"></div>
                            <div class="browser-content"></div>
                        </div>
                    </div>
                `;
            } else {
                thumbnailClass += ' port-preview';
                thumbnailContent = `
                    <div class="port-header">
                        <span class="service-icon">${process.service ? process.service.toUpperCase() : 'SVC'}</span>
                        <span class="port-badge">PORT ${process.port}</span>
                    </div>
                    <div class="port-details">
                        <div class="port-status active"></div>
                        <div class="port-info">Listening</div>
                    </div>
                `;
            }
        } else if (process.service === 'nginx') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `
                <div class="service-header nginx-header">
                    <div class="service-icon nginx-icon">NGINX</div>
                </div>
                <div class="service-content">
                    <div class="service-status">Running</div>
                    <div class="service-metrics">
                        <div class="metric">CPU: ${(process.cpu * 100).toFixed(1)}%</div>
                        <div class="metric">MEM: ${(process.memory * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        } else if (process.service === 'node') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `
                <div class="service-header node-header">
                    <div class="service-icon node-icon">NODE</div>
                </div>
                <div class="service-content">
                    <div class="service-status">Running</div>
                    <div class="service-metrics">
                        <div class="metric">CPU: ${(process.cpu * 100).toFixed(1)}%</div>
                        <div class="metric">MEM: ${(process.memory * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        } else if (process.service === 'python') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `
                <div class="service-header python-header">
                    <div class="service-icon python-icon">PY</div>
                </div>
                <div class="service-content">
                    <div class="service-status">Running</div>
                    <div class="service-metrics">
                        <div class="metric">CPU: ${(process.cpu * 100).toFixed(1)}%</div>
                        <div class="metric">MEM: ${(process.memory * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        } else if (process.service === 'java') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `
                <div class="service-header java-header">
                    <div class="service-icon java-icon">JAVA</div>
                </div>
                <div class="service-content">
                    <div class="service-status">Running</div>
                    <div class="service-metrics">
                        <div class="metric">CPU: ${(process.cpu * 100).toFixed(1)}%</div>
                        <div class="metric">MEM: ${(process.memory * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        } else if (process.service === 'mysql') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `
                <div class="service-header mysql-header">
                    <div class="service-icon mysql-icon">SQL</div>
                </div>
                <div class="service-content">
                    <div class="service-status">Running</div>
                    <div class="service-metrics">
                        <div class="metric">CPU: ${(process.cpu * 100).toFixed(1)}%</div>
                        <div class="metric">MEM: ${(process.memory * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        } else {
            // Generic process preview
            thumbnailClass += ' generic-preview';
            thumbnailContent = `
                <div class="process-header">
                    <div class="process-icon">PROC</div>
                    <div class="process-pid">PID: ${process.pid}</div>
                </div>
                <div class="process-content">
                    <div class="process-command">${process.command.substring(0, 20)}${process.command.length > 20 ? '...' : ''}</div>
                    <div class="process-metrics">
                        <div class="metric">CPU: ${(process.cpu * 100).toFixed(1)}%</div>
                        <div class="metric">MEM: ${(process.memory * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        }
        
        // Create the thumbnail element
        if (thumbnailContent) {
            return `<div class="${thumbnailClass}" data-pid="${process.pid}">${thumbnailContent}</div>`;
        }
        
        return '';
    }
    
    /**
     * Show process preview
     * @param {number} pid - Process ID
     * @param {Event} event - Click event
     */
    showProcessPreview(pid, event) {
        if (event) {
            event.stopPropagation();
        }
        
        const process = this.processManager.getProcessByPid(pid);
        if (!process) return;
        
        const overlay = document.getElementById('preview-overlay');
        const title = document.getElementById('preview-title');
        const body = document.getElementById('preview-body');
        
        if (!overlay || !title || !body) return;
        
        title.textContent = `Process Preview: ${process.command} (PID: ${process.pid})`;
        
        // Calculate additional information
        const uptime = this.formatTime(process.time);
        const memoryUsage = (process.memory * 100).toFixed(2) + '%';
        const cpuUsage = (process.cpu * 100).toFixed(2) + '%';
        const status = process.transparency < 0.8 ? 'Background Process' : 'Active Process';
        const startTime = new Date(Date.now() - process.time * 1000).toLocaleString();
        
        // Generate preview content based on process type
        if (process.file) {
            // Get file content from fileSystemManager if available, otherwise use local method
            const content = this.fileSystemManager ? 
                this.fileSystemManager.getFileContent(process.file) : 
                this.getFileContent(process.file);
            if (content) {
                const fileExtension = process.file.split('.').pop();
                
                if (fileExtension === 'html') {
                    body.innerHTML = `
                        <div class="preview-info-section">
                            <h3>HTML Preview</h3>
                            <div class="preview-iframe-container">
                                <iframe srcdoc="${this.escapeHTML(content)}"></iframe>
                            </div>
                        </div>
                        <div class="preview-info-section">
                            <h3>Source Code</h3>
                            <pre><code>${this.escapeHTML(content)}</code></pre>
                        </div>
                    `;
                } else if (fileExtension === 'js' || fileExtension === 'css' || fileExtension === 'json' || fileExtension === 'sh') {
                    body.innerHTML = `
                        <div class="preview-info-section">
                            <h3>${fileExtension.toUpperCase()} File Preview</h3>
                            <pre><code>${this.escapeHTML(content)}</code></pre>
                        </div>
                    `;
                }
            }
        } else {
            // Show process info for non-file processes
            
            // Create a visual representation of the process
            const cpuBarWidth = Math.min(100, process.cpu * 100);
            const memBarWidth = Math.min(100, process.memory * 100);
            const cpuBar = `<div class="preview-bar"><div class="preview-bar-fill" style="width: ${cpuBarWidth}%"></div></div>`;
            const memBar = `<div class="preview-bar"><div class="preview-bar-fill" style="width: ${memBarWidth}%"></div></div>`;
            
            body.innerHTML = `
                <div class="preview-info-section">
                    <h3>Process Information</h3>
                    <div class="preview-info-row"><span class="preview-info-label">PID:</span> <span>${process.pid}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">Command:</span> <span>${process.command}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">User:</span> <span>${process.user}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">CPU:</span> <span>${cpuUsage} ${cpuBar}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">Memory:</span> <span>${memoryUsage} ${memBar}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">Uptime:</span> <span>${uptime}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">Started:</span> <span>${startTime}</span></div>
                    <div class="preview-info-row"><span class="preview-info-label">Status:</span> <span>${status}</span></div>
                </div>
                <div class="preview-info-section">
                    <h3>Process Visualization</h3>
                    <div class="process-visualization">
                        <div class="process-icon">${process.service ? process.service.toUpperCase() : 'PROC'}</div>
                        <div class="process-details">
                            <div class="process-name">${process.command}</div>
                            <div class="process-stats">
                                <div class="stat-item">CPU: ${cpuUsage}</div>
                                <div class="stat-item">MEM: ${memoryUsage}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        overlay.classList.add('show');
        this.previewVisible = true;
    }
    
    /**
     * Close the process preview
     */
    closePreview() {
        const overlay = document.getElementById('preview-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
        this.previewVisible = false;
    }
    
    /**
     * Toggle kill options dropdown
     * @param {number} pid - Process ID
     */
    toggleKillOptions(pid) {
        const dropdown = document.getElementById(`dropdown-${pid}`);
        if (dropdown) {
            // Close all other dropdowns first
            document.querySelectorAll('.kill-dropdown').forEach(d => {
                if (d.id !== `dropdown-${pid}`) {
                    d.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            dropdown.classList.toggle('show');
            
            // Add a click outside listener to close the dropdown
            const closeListener = (e) => {
                if (!e.target.closest('.kill-dropdown') && !e.target.closest('.kill-button')) {
                    dropdown.classList.remove('show');
                    document.removeEventListener('click', closeListener);
                }
            };
            
            document.addEventListener('click', closeListener);
        }
    }
    
    /**
     * Select a process
     * @param {number} pid - Process ID
     */
    selectProcess(pid) {
        this.processManager.selectedPid = pid;
        
        // Update selected PID display
        const selectedPidElement = document.getElementById('selected-pid');
        if (selectedPidElement) {
            selectedPidElement.textContent = pid;
        }
        
        // Remove previous selection
        document.querySelectorAll('.process-row').forEach(r => {
            r.style.background = '';
        });
        
        // Highlight selected row
        const row = document.querySelector(`.process-row[data-pid="${pid}"]`);
        if (row) {
            row.style.background = 'rgba(0, 255, 255, 0.1)';
        }
    }
    
    /**
     * Format time string
     * @param {string} timeString - Time string (HH:MM:SS)
     * @returns {string} Formatted time string
     */
    formatTime(timeString) {
        if (!timeString) return '00:00:00';
        return timeString;
    }
    
    /**
     * Get file content from file system
     * @param {string} path - File path
     * @returns {string} File content or null if not found
     */
    getFileContent(path) {
        // In a real application, this would fetch the file content from an API
        // For now, we'll return some dummy content based on the file extension
        if (path.endsWith('.html')) {
            return '<!DOCTYPE html><html><head><title>Sample HTML</title></head><body><h1>Sample HTML File</h1><p>This is a sample HTML file content.</p></body></html>';
        } else if (path.endsWith('.js')) {
            return '// Sample JavaScript file\nfunction hello() {\n  console.log("Hello, world!");\n}\n\nhello();';
        } else if (path.endsWith('.css')) {
            return '/* Sample CSS file */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}';
        } else if (path.endsWith('.json')) {
            return '{\n  "name": "sample",\n  "version": "1.0.0",\n  "description": "Sample JSON file"\n}';
        } else {
            return null;
        }
    }
    
    /**
     * Escape HTML special characters
     * @param {string} html - HTML string
     * @returns {string} Escaped HTML string
     */
    escapeHTML(html) {
        if (!html) return '';
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
