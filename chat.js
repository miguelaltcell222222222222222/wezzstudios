const socket = io();
let currentUser = null;
let isAdmin = false;
let currentChatId = null;
let allChats = {};

async function initializeChat() {
    const checkResponse = await fetch('/api/check-user');
    const checkData = await checkResponse.json();

    const adminResponse = await fetch('/api/admin/verify');
    const adminData = await adminResponse.json();
    isAdmin = adminData.isAdmin;

    if (!isAdmin) {
        if (checkData.userId) {
            currentUser = checkData.userId;
        } else {
            const assignResponse = await fetch('/api/assign-user', { method: 'POST' });
            const assignData = await assignResponse.json();
            currentUser = assignData.userId;
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const productName = urlParams.get('name');

    await loadChatList();

    if (!isAdmin) {
        currentChatId = currentUser;
        socket.emit('join-chat', currentUser);
        await loadMessages(currentUser);
        setupMessageInput();
        document.querySelector('.chat-sidebar').style.display = 'none';

        if (productName) {
            document.getElementById('chatTitle').textContent = `Chatt med Admin - ${productName}`;
        }
    } else if (userId) {
        currentChatId = userId;
        socket.emit('join-chat', userId);
        await loadMessages(userId);
        setupMessageInput();
        document.getElementById('adminActions').style.display = 'flex';
    }
}

async function loadChatList() {
    if (!isAdmin) return;

    const response = await fetch('/api/chats');
    allChats = await response.json();

    const chatList = document.getElementById('chatList');
    const chatEntries = Object.entries(allChats);

    if (chatEntries.length === 0) {
        chatList.innerHTML = '<div class="loading">Inga chattar ännu</div>';
        return;
    }

    chatList.innerHTML = chatEntries
        .sort((a, b) => {
            if (a[1].pinned && !b[1].pinned) return -1;
            if (!a[1].pinned && b[1].pinned) return 1;
            return 0;
        })
        .map(([userId, chat]) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const messagePreview = lastMessage 
                ? (lastMessage.text || lastMessage.type || 'Meddelande') 
                : 'Ingen aktivitet';

            return `
                <div class="chat-list-item ${chat.pinned ? 'pinned' : ''} ${currentChatId === userId ? 'active' : ''}" 
                     onclick="switchChat('${userId}')">
                    <h4>${chat.pinned ? '📌 ' : ''}${userId}</h4>
                    <p>${messagePreview}</p>
                </div>
            `;
        }).join('');
}

async function switchChat(userId) {
    currentChatId = userId;
    socket.emit('join-chat', userId);
    await loadMessages(userId);
    setupMessageInput();

    document.querySelectorAll('.chat-list-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.chat-list-item').classList.add('active');

    document.getElementById('chatTitle').textContent = `Chatt med ${userId}`;
    document.getElementById('adminActions').style.display = 'flex';

    const chat = allChats[userId];
    const pinBtn = document.getElementById('pinChatBtn');
    pinBtn.textContent = chat.pinned ? '📌 Avfixera' : '📌 Fäst';
}

async function loadMessages(chatId) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '<div class="loading">Laddar meddelanden...</div>';

    try {
        const response = await fetch(`/api/chats/${chatId}`);
        const chatData = await response.json();

        if (!chatData.messages || chatData.messages.length === 0) {
            container.innerHTML = '<div class="no-chat-selected"><p>Inga meddelanden ännu. Börja konversationen!</p></div>';
            return;
        }

        container.innerHTML = chatData.messages.map(msg => renderMessage(msg)).join('');
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
        container.innerHTML = '<div class="no-chat-selected"><p>Fel vid laddning av meddelanden</p></div>';
    }
}

function renderMessage(msg) {
    const isSent = isAdmin ? msg.senderType === 'admin' : msg.senderType === 'user';

    if (msg.type === 'buy-request') {
        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="buy-request-card">
                    <h4>💳 Köpbegäran</h4>
                    <div class="info-row">
                        <span class="info-label">Swish Nummer:</span>
                        <span>${msg.swishNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Belopp:</span>
                        <span>${msg.amount} SEK</span>
                    </div>
                    <div class="payment-message">
                        <strong>Meddelande att inkludera:</strong><br>
                        ${msg.message}
                    </div>
                    <p class="message-time">${formatTime(msg.timestamp)}</p>
                </div>
            </div>
        `;
    }

    if (msg.type === 'offer-request') {
        const canRespond = isAdmin && msg.status === 'pending';

        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="offer-request-card">
                    <h4>💰 Prisförslag</h4>
                    <div class="info-row">
                        <span class="info-label">Produkt:</span>
                        <span>${msg.productName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nuvarande Pris:</span>
                        <span>${msg.currentPrice} SEK</span>
                    </div>
                    ${msg.proposedPrice ? `
                        <div class="info-row">
                            <span class="info-label">Föreslaget Pris:</span>
                            <span>${msg.proposedPrice} SEK</span>
                        </div>
                    ` : ''}
                    <div class="offer-status ${msg.status}">
                        ${msg.status === 'pending' ? '⏳ Väntar på svar' : msg.status === 'accepted' ? '✓ Accepterad' : '✗ Nekad'}
                    </div>
                    ${canRespond ? `
                        <div class="offer-actions">
                            <button class="btn-success" onclick="respondToOffer('${msg.id}', 'accepted')">Acceptera</button>
                            <button class="btn-danger" onclick="respondToOffer('${msg.id}', 'rejected')">Neka</button>
                        </div>
                    ` : ''}
                    <p class="message-time">${formatTime(msg.timestamp)}</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            <span class="message-sender">${msg.sender}</span>
            <div class="message-bubble">
                ${msg.text}
            </div>
            <span class="message-time">${formatTime(msg.timestamp)}</span>
        </div>
    `;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function setupMessageInput() {
    document.getElementById('messageInput').style.display = 'block';

    if (isAdmin) {
        document.getElementById('buyRequestBtn').style.display = 'inline-block';
    }
}

function sendMessage() {
    const messageText = document.getElementById('messageText').value.trim();
    if (!messageText || !currentChatId) return;

    const sender = isAdmin ? 'Admin' : currentUser;
    const senderType = isAdmin ? 'admin' : 'user';

    socket.emit('send-message', {
        chatId: currentChatId,
        message: messageText,
        sender: sender,
        senderType: senderType
    });

    document.getElementById('messageText').value = '';
}

function sendBuyRequest() {
    document.getElementById('buyRequestModal').style.display = 'block';
}

function sendOfferRequest() {
    document.getElementById('offerRequestModal').style.display = 'block';
}

function respondToOffer(offerId, response) {
    socket.emit('respond-offer', {
        chatId: currentChatId,
        offerId: offerId,
        response: response
    });
}

async function togglePinChat() {
    if (!currentChatId || !isAdmin) return;

    const chat = allChats[currentChatId];
    const newPinnedState = !chat.pinned;

    const response = await fetch(`/api/chats/${currentChatId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinnedState })
    });

    if (response.ok) {
        await loadChatList();
        await switchChat(currentChatId);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeChat();

    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

    document.getElementById('messageText').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('buyRequestBtn')?.addEventListener('click', sendBuyRequest);
    document.getElementById('offerRequestBtn').addEventListener('click', sendOfferRequest);
    document.getElementById('pinChatBtn')?.addEventListener('click', togglePinChat);

    document.getElementById('buyRequestForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const swishNumber = document.getElementById('swishNumber').value;
        const amount = document.getElementById('paymentAmount').value;
        const message = document.getElementById('paymentMessage').value;

        socket.emit('send-buy-request', {
            chatId: currentChatId,
            swishNumber: swishNumber,
            amount: amount,
            message: message
        });

        document.getElementById('buyRequestModal').style.display = 'none';
        document.getElementById('buyRequestForm').reset();
    });

    document.getElementById('offerRequestForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = document.getElementById('offerProductName').value;
        const currentPrice = document.getElementById('offerCurrentPrice').value;
        const proposedPrice = document.getElementById('offerProposedPrice').value;

        const sender = isAdmin ? 'Admin' : currentUser;
        const senderType = isAdmin ? 'admin' : 'user';

        socket.emit('send-offer-request', {
            chatId: currentChatId,
            productName: productName,
            currentPrice: currentPrice,
            proposedPrice: proposedPrice,
            sender: sender,
            senderType: senderType
        });

        document.getElementById('offerRequestModal').style.display = 'none';
        document.getElementById('offerRequestForm').reset();
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtns = modal.querySelectorAll('.close, .close-modal');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    socket.on('new-message', (message) => {
        const container = document.getElementById('messagesContainer');
        const noChat = container.querySelector('.no-chat-selected');
        if (noChat) {
            container.innerHTML = '';
        }

        container.innerHTML += renderMessage(message);
        container.scrollTop = container.scrollHeight;
    });

    socket.on('offer-updated', (offer) => {
        loadMessages(currentChatId);
    });

    socket.on('chat-update', () => {
        if (isAdmin) {
            loadChatList();
        }
    });
});