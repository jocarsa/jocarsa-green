let windowCounter = 0;
let zIndexCounter = 1;

function openWebBrowser() {
    const windowElement = document.createElement('div');
    windowElement.classList.add('window');
    windowElement.setAttribute('id', `window-${windowCounter}`);
    windowElement.innerHTML = `
        <div class="window-header">
            <span class="window-title">Web Browser</span>
            <div class="window-controls">
                <button class="minimize-btn" onclick="minimizeWindow('${windowCounter}')">−</button>
                <button class="maximize-btn" onclick="maximizeRestoreWindow('${windowCounter}')">□</button>
                <button class="close-btn" onclick="closeWindow('${windowCounter}')">×</button>
            </div>
        </div>
        <div class="window-content">
            <div class="tab-bar">
                <button class="tab-btn active-tab" onclick="switchTab('${windowCounter}', 0)">Tab 1</button>
                <button class="new-tab-btn" onclick="addTab('${windowCounter}')">+</button>
            </div>
            <div class="browser-content">
                <div class="tab active-tab">
                    <input type="text" class="url-bar" placeholder="Enter URL">
                    <button class="go-btn" onclick="loadURL('${windowCounter}', 0)">Go</button>
                    <iframe class="browser-iframe"></iframe>
                </div>
            </div>
        </div>
    `;
    document.getElementById('desktop').appendChild(windowElement);
    makeDraggable(windowElement);
    windowElement.style.zIndex = zIndexCounter++;
    windowCounter++;
    saveWindowState(windowElement);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        bringToFront(element);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        requestAnimationFrame(() => {
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            saveWindowState(element);
        });
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function bringToFront(element) {
    element.style.zIndex = zIndexCounter++;
}

function minimizeWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    windowElement.classList.add('minimized');
    document.getElementById('taskbar').appendChild(windowElement);
    saveWindowState(windowElement);
}

function maximizeRestoreWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    if (windowElement.classList.contains('maximized')) {
        windowElement.classList.remove('maximized');
        windowElement.style.width = '600px';
        windowElement.style.height = '400px';
    } else {
        windowElement.classList.add('maximized');
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';
        windowElement.style.top = '0';
        windowElement.style.left = '0';
    }
    saveWindowState(windowElement);
}

function closeWindow(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    windowElement.remove();
    deleteWindowState(windowId);
}

function loadURL(windowId, tabIndex) {
    const windowElement = document.getElementById(`window-${windowId}`);
    const tabs = windowElement.querySelectorAll('.tab');
    const activeTab = tabs[tabIndex];
    const urlBar = activeTab.querySelector('.url-bar');
    const iframe = activeTab.querySelector('.browser-iframe');
    iframe.src = urlBar.value;
    iframe.onload = () => {
        const title = iframe.contentDocument.title;
        windowElement.querySelector('.window-title').textContent = title;
        saveWindowState(windowElement);
    };
}

function addTab(windowId) {
    const windowElement = document.getElementById(`window-${windowId}`);
    const tabBar = windowElement.querySelector('.tab-bar');
    const browserContent = windowElement.querySelector('.browser-content');
    const tabCount = browserContent.children.length;

    const newTabButton = document.createElement('button');
    newTabButton.classList.add('tab-btn');
    newTabButton.textContent = `Tab ${tabCount + 1}`;
    newTabButton.onclick = () => switchTab(windowId, tabCount);
    tabBar.insertBefore(newTabButton, tabBar.querySelector('.new-tab-btn'));

    const newTabContent = document.createElement('div');
    newTabContent.classList.add('tab');
    newTabContent.innerHTML = `
        <input type="text" class="url-bar" placeholder="Enter URL">
        <button class="go-btn" onclick="loadURL('${windowId}', ${tabCount})">Go</button>
        <iframe class="browser-iframe"></iframe>
    `;
    browserContent.appendChild(newTabContent);
    switchTab(windowId, tabCount);
    saveWindowState(windowElement);
}

function switchTab(windowId, tabIndex) {
    const windowElement = document.getElementById(`window-${windowId}`);
    const tabs = windowElement.querySelectorAll('.tab');
    const tabButtons = windowElement.querySelectorAll('.tab-btn');
    tabs.forEach((tab, index) => {
        tab.classList.toggle('active-tab', index === tabIndex);
    });
    tabButtons.forEach((button, index) => {
        button.classList.toggle('active-tab', index === tabIndex);
    });
    saveWindowState(windowElement);
}

function saveWindowState(windowElement) {
    const windowId = windowElement.id.split('-')[1];
    const state = {
        top: windowElement.style.top,
        left: windowElement.style.left,
        width: windowElement.style.width,
        height: windowElement.style.height,
        tabs: []
    };
    const tabs = windowElement.querySelectorAll('.tab');
    tabs.forEach(tab => {
        state.tabs.push({
            url: tab.querySelector('.url-bar').value,
            title: tab.querySelector('.browser-iframe').contentDocument?.title || ''
        });
    });
    fetch('save_state.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ windowId, state })
    });
}

function deleteWindowState(windowId) {
    fetch('delete_state.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ windowId })
    });
}

function loadSavedState() {
    fetch('load_state.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(windowState => {
                const windowElement = document.createElement('div');
                windowElement.classList.add('window');
                windowElement.setAttribute('id', `window-${windowState.id}`);
                windowElement.style.top = windowState.top;
                windowElement.style.left = windowState.left;
                windowElement.style.width = windowState.width;
                windowElement.style.height = windowState.height;
                windowElement.innerHTML = `
                    <div class="window-header">
                        <span class="window-title">${windowState.tabs[0].title}</span>
                        <div class="window-controls">
                            <button class="minimize-btn" onclick="minimizeWindow('${windowState.id}')">−</button>
                            <button class="maximize-btn" onclick="maximizeRestoreWindow('${windowState.id}')">□</button>
                            <button class="close-btn" onclick="closeWindow('${windowState.id}')">×</button>
                        </div>
                    </div>
                    <div class="window-content">
                        <div class="tab-bar">
                            ${windowState.tabs.map((tab, index) => `
                                <button class="tab-btn ${index === 0 ? 'active-tab' : ''}" onclick="switchTab('${windowState.id}', ${index})">Tab ${index + 1}</button>
                            `).join('')}
                            <button class="new-tab-btn" onclick="addTab('${windowState.id}')">+</button>
                        </div>
                        <div class="browser-content">
                            ${windowState.tabs.map((tab, index) => `
                                <div class="tab ${index === 0 ? 'active-tab' : ''}">
                                    <input type="text" class="url-bar" value="${tab.url}" placeholder="Enter URL">
                                    <button class="go-btn" onclick="loadURL('${windowState.id}', ${index})">Go</button>
                                    <iframe class="browser-iframe" src="${tab.url}"></iframe>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                document.getElementById('desktop').appendChild(windowElement);
                makeDraggable(windowElement);
                windowElement.style.zIndex = zIndexCounter++;
            });
        });
}

document.addEventListener('DOMContentLoaded', loadSavedState);

