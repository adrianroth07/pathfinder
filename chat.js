const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are a friendly helper inside PathFinder, a free career guidance tool for 16–18 year olds in Germany deciding what to do after school.

You explain things, compare things, and clarify the German education system. You never tell the user what to choose.

What you can help with:
- The 6 paths: Ausbildung, Studium (Uni / FH / Duales Studium), FSJ/BFD, Freelancing, Bundeswehr, Gap Year
- German education terms (Abitur, Fachhochschulreife, IHK, BAföG, Berufsschule, Meister, etc.)
- Qualifications needed, typical income, what a typical day looks like
- Comparing paths factually side by side
- Where to find more information and how to take a first concrete step

Rules — follow these without exception:
- Never say "I recommend", "you should choose", or "the best option for you is"
- If asked to pick for them, say: "That's genuinely your call — I can only explain what each path actually involves."
- Keep answers under 150 words unless the user asks to go deeper
- Plain language — no jargon or buzzwords
- Be warm but treat them like an intelligent adult, not a child`;

let chatMessages = [];
let isLoading = false;

function getKey() { return localStorage.getItem('pf_api_key') || ''; }
function saveKey(k) { localStorage.setItem('pf_api_key', k.trim()); }

async function callClaude(getContext, onChunk, onError) {
  const key = getKey();
  if (!key) { onError('No API key set — paste your Anthropic key above.'); return; }

  const contextNote = getContext();
  const system = contextNote
    ? SYSTEM_PROMPT + '\n\nUser context (from quiz):\n' + contextNote
    : SYSTEM_PROMPT;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system,
        messages: chatMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error ${res.status}`);
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || '';
    chatMessages.push({ role: 'assistant', content: reply });
    onChunk(reply);
  } catch (e) {
    onError(e.message || 'Something went wrong — check your API key and try again.');
  }
}

export function initChat(getContext) {
  // ── Button ──────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.className = 'chat-fab';
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span>Ask anything</span>
  `;

  // ── Drawer ──────────────────────────────────────────────────────
  const drawer = document.createElement('div');
  drawer.className = 'chat-drawer';
  drawer.innerHTML = `
    <div class="chat-header">
      <div>
        <div class="chat-title">PathFinder Assistant</div>
        <div class="chat-subtitle">Explains paths — never tells you what to choose</div>
      </div>
      <button class="chat-close js-chat-close">×</button>
    </div>
    <div class="chat-key-bar js-key-bar" style="${getKey() ? 'display:none' : ''}">
      <div class="chat-key-label">Paste your Anthropic API key to get started</div>
      <div style="display:flex;gap:6px;">
        <input class="chat-key-input js-key-input" type="password" placeholder="sk-ant-..." value="${getKey()}"/>
        <button class="btn btn-primary btn-sm js-key-save" style="flex-shrink:0;">Save</button>
      </div>
    </div>
    <div class="chat-messages js-messages">
      <div class="chat-msg chat-msg-assistant">
        <div class="chat-bubble">Hi — ask me anything about the paths, how the German education system works, or what a next step might look like. I won't tell you what to choose, but I can explain everything.</div>
      </div>
    </div>
    <div class="chat-input-area">
      <textarea class="chat-input js-chat-input" rows="1" placeholder="Ask a question…"></textarea>
      <button class="chat-send js-chat-send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(drawer);

  const messagesEl  = drawer.querySelector('.js-messages');
  const inputEl     = drawer.querySelector('.js-chat-input');
  const sendBtn     = drawer.querySelector('.js-chat-send');
  const keyBar      = drawer.querySelector('.js-key-bar');
  const keyInput    = drawer.querySelector('.js-key-input');
  const keySaveBtn  = drawer.querySelector('.js-key-save');

  // ── Key save ────────────────────────────────────────────────────
  keySaveBtn.addEventListener('click', () => {
    const k = keyInput.value.trim();
    if (!k) return;
    saveKey(k);
    keyBar.style.display = 'none';
  });

  // ── Open / close ────────────────────────────────────────────────
  function open() {
    drawer.classList.add('open');
    btn.classList.add('active');
    inputEl.focus();
  }
  function close() {
    drawer.classList.remove('open');
    btn.classList.remove('active');
  }

  btn.addEventListener('click', () => drawer.classList.contains('open') ? close() : open());
  drawer.querySelector('.js-chat-close').addEventListener('click', close);

  // ── Render a message bubble ──────────────────────────────────────
  function appendBubble(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg chat-msg-${role}`;
    wrap.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function appendTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg chat-msg-assistant';
    wrap.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  // ── Send ────────────────────────────────────────────────────────
  async function send() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    if (!getKey()) { keyBar.style.display = ''; keyInput.focus(); return; }

    inputEl.value = '';
    inputEl.style.height = 'auto';
    chatMessages.push({ role: 'user', content: text });
    appendBubble('user', text);

    isLoading = true;
    sendBtn.disabled = true;
    const typingEl = appendTyping();

    await callClaude(
      getContext,
      (reply) => {
        typingEl.remove();
        appendBubble('assistant', reply);
      },
      (errMsg) => {
        typingEl.remove();
        appendBubble('error', `⚠ ${errMsg}`);
      },
    );

    isLoading = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  // Auto-grow textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });
}
