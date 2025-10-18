// ==UserScript==
// @name         Macros Delta (bottom + imgur background + key/mouse + footer)
// @namespace    http://tampermonkey.net/
// @version      3.5
// @description  x64 split toggle + custom key or mouse bind + imgur background + footer credit
// @author       @unknownkr (mod) + Sarah
// @match        *://agar.io/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function waitForGame() {
        if (window.app && window.app.unitManager) {
            console.log('[x64] Game detected.');
            init();
        } else {
            setTimeout(waitForGame, 2000);
        }
    }

    function init() {
        const imgurBg = 'https://i.imgur.com/typ5Qdl.png';

        const style = document.createElement('style');
        style.textContent = `
        .macro-btn {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30,30,30,0.85);
            color: #fff;
            border: 1px solid #444;
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            z-index: 99999;
            transition: background 0.2s;
        }
        .macro-btn:hover {
            background: rgba(60,60,60,0.9);
        }
        .macro-panel {
            position: fixed;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: url('${imgurBg}') center/cover no-repeat, rgba(0,0,0,0.85);
            color: #eee;
            padding: 15px;
            border-radius: 8px;
            z-index: 99999;
            width: 250px;
            text-align: center;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 15px rgba(0,0,0,0.7);
            display: none;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .macro-panel button {
            margin: 10px 5px 0 5px;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        .save-btn { background: #4a90e2; color: white; }
        .close-btn { background: #555; color: white; }
        .macro-panel h3 {
            margin: 0 0 10px 0;
            color: #fff;
            font-size: 15px;
            text-shadow: 0 0 3px #000;
        }
        .macro-panel label span {
            color: #fff;
            text-shadow: 0 0 2px #000;
        }
        .footer-credit {
            margin-top: 12px;
            font-size: 11px;
            color: #ccc;
            text-shadow: 0 0 3px #000;
            opacity: 0.8;
        }`;
        document.head.appendChild(style);

        // UI
        const button = document.createElement('button');
        button.className = 'macro-btn';
        button.textContent = 'PRIVATE HAX';
        document.body.appendChild(button);

        const panel = document.createElement('div');
        panel.className = 'macro-panel';
        panel.innerHTML = `
            <h3>PRIVATE HAX</h3>
            <label style="display:flex;align-items:center;justify-content:center;gap:10px;">
                <input type="checkbox" id="x64Checkbox">
                <span>x64 Macro</span>
            </label>

            <div style="margin-top:8px;">
                <span style="font-size:13px;">Keyboard Key:</span>
                <button id="keyButton" style="margin-left:8px;padding:4px 10px;background:#222;color:#fff;border:1px solid #555;border-radius:4px;">Set</button>
            </div>

            <div style="margin-top:8px;">
                <span style="font-size:13px;">Mouse Button:</span>
                <select id="mouseSelect" style="margin-left:8px;padding:4px 8px;background:#222;color:#fff;border:1px solid #555;border-radius:4px;">
                    <option value="none">None</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="middle">Middle</option>
                </select>
            </div>

            <div>
                <button class="save-btn">Save</button>
                <button class="close-btn">Close</button>
            </div>
            <div class="footer-credit">Made with ❤️ by Sarah</div>
        `;
        document.body.appendChild(panel);

        // Logic
        let x64Enabled = JSON.parse(localStorage.getItem('x64Enabled') || 'false');
        let keyBind = localStorage.getItem('x64Key') || 'Shift';
        let mouseBind = localStorage.getItem('x64Mouse') || 'none';
        let splitInterval = null;

        const checkbox = panel.querySelector('#x64Checkbox');
        const keyButton = panel.querySelector('#keyButton');
        const mouseSelect = panel.querySelector('#mouseSelect');
        checkbox.checked = x64Enabled;
        keyButton.textContent = keyBind;
        mouseSelect.value = mouseBind;

        button.onclick = () => {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        };
        panel.querySelector('.close-btn').onclick = () => (panel.style.display = 'none');

        keyButton.onclick = () => {
            keyButton.textContent = 'Press any key...';
            const keyListener = (e) => {
                keyBind = e.key;
                keyButton.textContent = keyBind;
                localStorage.setItem('x64Key', keyBind);
                document.removeEventListener('keydown', keyListener);
            };
            document.addEventListener('keydown', keyListener);
        };

        mouseSelect.onchange = () => {
            mouseBind = mouseSelect.value;
            localStorage.setItem('x64Mouse', mouseBind);
        };

        panel.querySelector('.save-btn').onclick = () => {
            x64Enabled = checkbox.checked;
            localStorage.setItem('x64Enabled', JSON.stringify(x64Enabled));
            alert(`x64 ${x64Enabled ? 'ENABLED' : 'DISABLED'} (Key: ${keyBind}, Mouse: ${mouseBind})`);
            panel.style.display = 'none';
        };

        // --- Input Logic ---
        document.addEventListener('keydown', (e) => {
            if (!x64Enabled || e.key !== keyBind) return;
            if (splitInterval) return;
            splitInterval = startSplit();
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === keyBind && splitInterval) stopSplit();
        });
        document.addEventListener('mousedown', (e) => {
            if (!x64Enabled) return;
            const match =
                (mouseBind === 'left' && e.button === 0) ||
                (mouseBind === 'middle' && e.button === 1) ||
                (mouseBind === 'right' && e.button === 2);
            if (!match || splitInterval) return;
            splitInterval = startSplit();
        });
        document.addEventListener('mouseup', (e) => {
            const match =
                (mouseBind === 'left' && e.button === 0) ||
                (mouseBind === 'middle' && e.button === 1) ||
                (mouseBind === 'right' && e.button === 2);
            if (match && splitInterval) stopSplit();
        });

        function startSplit() {
            return setInterval(() => {
                try {
                    const u = window?.app?.unitManager?.activeUnit;
                    if (u) for (let i = 0; i < 6; i++) u.sendSplit();
                } catch {}
            }, 40);
        }

        function stopSplit() {
            clearInterval(splitInterval);
            splitInterval = null;
        }

        console.log(`[x64] Loaded ✅ | Key: ${keyBind}, Mouse: ${mouseBind}`);
    }

    waitForGame();
})();