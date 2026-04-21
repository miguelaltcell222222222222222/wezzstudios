.chat-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: 100vh;
    background-color: var(--background);
}

.chat-sidebar {
    background-color: var(--surface);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
    margin-bottom: 0.5rem;
}

.back-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.9rem;
}

.chat-list {
    flex: 1;
    overflow-y: auto;
}

.chat-list-item {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s;
}

.chat-list-item:hover {
    background-color: var(--background);
}

.chat-list-item.active {
    background-color: var(--background);
    border-left: 3px solid var(--primary-color);
}

.chat-list-item.pinned {
    background-color: #fffbeb;
}

.chat-list-item h4 {
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.chat-list-item p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chat-main {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.chat-header {
    background-color: var(--surface);
    border-bottom: 1px solid var(--border-color);
    padding: 1.5rem;
}

.chat-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h3 {
    font-size: 1.3rem;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background-color: var(--background);
}

.no-chat-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--text-secondary);
}

.message {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
}

.message.sent {
    align-items: flex-end;
}

.message.received {
    align-items: flex-start;
}

.message-bubble {
    max-width: 60%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    word-wrap: break-word;
}

.message.sent .message-bubble {
    background-color: var(--primary-color);
    color: white;
}

.message.received .message-bubble {
    background-color: var(--surface);
    color: var(--text-primary);
}

.message-sender {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: var(--text-secondary);
}

.message-time {
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
}

.buy-request-card {
    max-width: 80%;
    padding: 1.5rem;
    background-color: var(--surface);
    border: 2px solid var(--primary-color);
    border-radius: 12px;
    box-shadow: var(--shadow);
}

.buy-request-card h4 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.buy-request-card .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.buy-request-card .info-label {
    font-weight: 600;
    color: var(--text-secondary);
}

.buy-request-card .payment-message {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--background);
    border-radius: 8px;
    font-style: italic;
}

.offer-request-card {
    max-width: 80%;
    padding: 1.5rem;
    background-color: var(--surface);
    border: 2px solid var(--warning-color);
    border-radius: 12px;
    box-shadow: var(--shadow);
}

.offer-request-card h4 {
    color: var(--warning-color);
    margin-bottom: 1rem;
}

.offer-request-card .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.offer-status {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
}

.offer-status.pending {
    background-color: #fef3c7;
    color: #d97706;
}

.offer-status.accepted {
    background-color: #dcfce7;
    color: #16a34a;
}

.offer-status.rejected {
    background-color: #fee2e2;
    color: #dc2626;
}

.offer-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.message-input {
    background-color: var(--surface);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
}

.input-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.action-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background-color: var(--surface);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.action-btn:hover {
    background-color: var(--background);
    border-color: var(--primary-color);
}

.input-area {
    display: flex;
    gap: 0.5rem;
}

.input-area textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    resize: none;
    font-family: inherit;
    font-size: 0.95rem;
}

.input-area textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

@media (max-width: 768px) {
    .chat-container {
        grid-template-columns: 1fr;
    }

    .chat-sidebar {
        display: none;
    }

    .chat-sidebar.mobile-open {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
    }

    .message-bubble,
    .buy-request-card,
    .offer-request-card {
        max-width: 90%;
    }
}