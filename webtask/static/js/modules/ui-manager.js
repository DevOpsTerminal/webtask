/**
 * UI Manager Module
 * Handles all UI-related functionality
 */
class UIManager {
    constructor(processManager, systemMonitor) {
        this.processManager = processManager;
        this.systemMonitor = systemMonitor;
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
                ${process.command}
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
     * Generate a preview thumbnail for a process
     * @param {Object} process - Process object
     * @returns {string} HTML for the preview thumbnail
     */
    generatePreviewThumbnail(process) {
        let thumbnailContent = '';
        let thumbnailClass = 'preview-thumbnail';
        
        // Determine the type of preview based on the process
        if (process.file && this.fileSystemManager.getFileContent(process.file)) {
            const fileContent = this.fileSystemManager.getFileContent(process.file);
            
            if (process.file.endsWith('.html')) {
                thumbnailClass += ' html-preview';
                thumbnailContent = `<div class="html-icon">HTML</div>`;
            } else if (process.file.endsWith('.js')) {
                thumbnailClass += ' js-preview';
                thumbnailContent = `<div class="js-icon">JS</div>`;
            } else if (process.file.endsWith('.css')) {
                thumbnailClass += ' css-preview';
                thumbnailContent = `<div class="css-icon">CSS</div>`;
            } else if (process.file.endsWith('.json')) {
                thumbnailClass += ' json-preview';
                thumbnailContent = `<div class="json-icon">JSON</div>`;
            } else if (process.file.endsWith('.sh') || process.file.endsWith('.bash')) {
                thumbnailClass += ' bash-preview';
                thumbnailContent = `<div class="bash-icon">BASH</div>`;
            }
        } else if (process.service === 'nginx') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `<div class="service-icon nginx-icon">NGINX</div>`;
        } else if (process.service === 'node') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `<div class="service-icon node-icon">NODE</div>`;
        } else if (process.service === 'python') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `<div class="service-icon python-icon">PY</div>`;
        } else if (process.service === 'java') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `<div class="service-icon java-icon">JAVA</div>`;
        } else if (process.service === 'mysql') {
            thumbnailClass += ' service-preview';
            thumbnailContent = `<div class="service-icon mysql-icon">SQL</div>`;
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
        if (process.file && this.fileSystemManager && this.fileSystemManager.getFileContent(process.file)) {
            const content = this.fileSystemManager.getFileContent(process.file);
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
