const ASSET_PATH = ''; 

const CONTACTS = [
    { id: 1, name: 'Alice Smith', avatar: `${ASSET_PATH}alice_avatar.png`, status: 'Active now', lastMessage: 'See you then!', lastMessageTime: '10:30 AM', active: true },
    { id: 2, name: 'Bob Johnson', avatar: `${ASSET_PATH}bob_avatar.png`, status: '15m ago', lastMessage: 'I found the report, thanks.', lastMessageTime: 'Yesterday', active: false },
    { id: 3, name: 'Charlie Davis', avatar: `${ASSET_PATH}charlie_avatar.png`, status: 'Offline', lastMessage: 'We should definitely grab coffee soon.', lastMessageTime: 'Mar 1', active: false },
];

const MESSAGES_MOCK = {
    1: [ // Alice Smith
        { id: 101, sender: 'Alice Smith', content: "Hey! How's the project going?", time: '10:05 AM', type: 'received' },
        { id: 102, sender: 'Me', content: "It's progressing well, just wrapped up the design phase.", time: '10:07 AM', type: 'sent' },
        { id: 103, sender: 'Alice Smith', content: "That's great news! I need to review the specs later today. When are you free for a quick call?", time: '10:15 AM', type: 'received' },
        { id: 104, sender: 'Me', content: "I'm open after 2 PM. Let me know what time works best for you.", time: '10:17 AM', type: 'sent' },
        { id: 105, sender: 'Alice Smith', content: "Sounds perfect. See you then!", time: '10:30 AM', type: 'received' },
    ],
    2: [
        { id: 201, sender: 'Bob Johnson', content: "Did you find the spreadsheet I sent last week?", time: '9:00 AM', type: 'received' },
        { id: 202, sender: 'Me', content: "Checking now... Ah, yes, found it! Thanks.", time: '9:05 AM', type: 'sent' },
    ],
    3: [
        { id: 301, sender: 'Charlie Davis', content: "Thinking about launching a new campaign next month.", time: 'Yesterday', type: 'received' },
    ]
};

const CURRENT_USER_AVATAR = `${ASSET_PATH}user_avatar.png`;

let currentChatId = null;
const chatContainer = document.getElementById('chat-container');
const contactListElement = document.getElementById('contact-list');
const chatHeaderElement = document.getElementById('chat-header');
const messagesAreaElement = document.getElementById('messages-area');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingIndicatorArea = document.getElementById('typing-indicator-area');

// --- Utility Functions ---

function createAvatarElement(src, alt, className = 'contact-avatar') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = className;
    return img;
}

function renderContacts() {
    contactListElement.innerHTML = '';
    CONTACTS.forEach(contact => {
        const li = document.createElement('li');
        li.className = `contact-item ${contact.id === currentChatId ? 'active' : ''}`;
        li.dataset.id = contact.id;

        const avatar = createAvatarElement(contact.avatar, contact.name);
        
        const info = document.createElement('div');
        info.className = 'contact-info';
        
        const name = document.createElement('h4');
        name.textContent = contact.name;
        
        const lastMessage = document.createElement('p');
        lastMessage.className = 'contact-status';
        lastMessage.textContent = `${contact.lastMessage} · ${contact.lastMessageTime}`;

        info.appendChild(name);
        info.appendChild(lastMessage);
        
        li.appendChild(avatar);
        li.appendChild(info);

        li.addEventListener('click', () => switchChat(contact.id));
        contactListElement.appendChild(li);
    });
}

function renderMessage(message, contact) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `message ${message.type}`;
    
    // Create timestamp element (optional: can be displayed on hover in complex UIs, but here we render it hidden or implicitly for demo)
    // const timestamp = document.createElement('span');
    // timestamp.className = 'message-timestamp';
    // timestamp.textContent = message.time;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';

    const bubble = document.createElement('p');
    bubble.className = 'message-bubble';
    bubble.textContent = message.content;


    if (message.type === 'received') {
        const avatar = createAvatarElement(contact.avatar, contact.name, 'message-avatar');
        contentWrapper.appendChild(avatar);
        contentWrapper.appendChild(bubble);

    } else { // Sent
        // Sent message content is just the bubble
        contentWrapper.appendChild(bubble);
    }
    
    messageWrapper.appendChild(contentWrapper);
    messagesAreaElement.appendChild(messageWrapper);
}

function renderChatHeader(contact) {
    // Determine status color
    let statusColor = '#606770'; // Default gray
    if (contact.status.includes('Active')) {
        statusColor = '#4CAF50';
    } else if (contact.status.includes('m ago')) {
        statusColor = '#FFC107'; 
    }

    chatHeaderElement.innerHTML = `
        <span class="back-button" onclick="window.goBackToContacts()">&#x276E;</span>
        <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
        <div class="contact-info">
            <h4>${contact.name}</h4>
            <p class="contact-status" style="color: ${statusColor};">${contact.status}</p>
        </div>
        <div class="desktop-only-header" style="margin-left: auto;">
             <!-- Optional quick actions -->
        </div>
    `;
}

function renderMessages(contactId) {
    messagesAreaElement.innerHTML = '';
    const contact = CONTACTS.find(c => c.id === contactId);
    if (!contact) return;

    const messages = MESSAGES_MOCK[contactId] || [];
    
    messages.forEach(msg => renderMessage(msg, contact));
    
    // Scroll to bottom
    messagesAreaElement.scrollTop = messagesAreaElement.scrollHeight;
}

function switchChat(contactId) {
    // Update state
    currentChatId = contactId;
    const contact = CONTACTS.find(c => c.id === contactId);

    // Update UI elements
    renderContacts(); // Highlight active contact
    renderChatHeader(contact);
    renderMessages(contactId);

    // Toggle mobile view
    if (window.innerWidth <= 768) {
        chatContainer.classList.remove('mobile-view-contacts');
        chatContainer.classList.add('mobile-view-chat');
    }
    
    typingIndicatorArea.classList.add('hidden');
}

function showTypingIndicator(contact) {
    typingIndicatorArea.innerHTML = `
        <div class="message received typing-indicator">
            <img src="${contact.avatar}" alt="${contact.name}" class="message-avatar">
            <div class="message-content">
                <div class="message-bubble">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        </div>
    `;
    typingIndicatorArea.classList.remove('hidden');
    messagesAreaElement.scrollTop = messagesAreaElement.scrollHeight + 50;


    setTimeout(() => {
        // Only hide if a response hasn't already been triggered
        if (!typingIndicatorArea.dataset.responding) {
             typingIndicatorArea.classList.add('hidden');
        }
    }, 5000); 
}

function handleSendMessage() {
    const content = messageInput.value.trim();
    if (content === '' || currentChatId === null) return;

    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newMessage = {
        id: Date.now(),
        sender: 'Me',
        content: content,
        time: timeString,
        type: 'sent'
    };

    // Update contact list preview (only for the demo, real app needs synchronization)
    const currentContactIndex = CONTACTS.findIndex(c => c.id === currentChatId);
    if (currentContactIndex !== -1) {
        CONTACTS[currentContactIndex].lastMessage = content;
        CONTACTS[currentContactIndex].lastMessageTime = timeString;
    }

    // Add message to mock data
    if (!MESSAGES_MOCK[currentChatId]) {
        MESSAGES_MOCK[currentChatId] = [];
    }
    MESSAGES_MOCK[currentChatId].push(newMessage);

    // Render the new message
    const contact = CONTACTS.find(c => c.id === currentChatId);
    renderMessage(newMessage, contact);
    
    messagesAreaElement.scrollTop = messagesAreaElement.scrollHeight;
    messageInput.value = '';
    
    // Re-render contacts list to show new last message preview
    renderContacts(); 

    // Simulate contact typing a response
    typingIndicatorArea.dataset.responding = 'true';
    if (contact) {
        showTypingIndicator(contact);
        setTimeout(() => {
            simulateResponse(contact);
        }, 2000 + Math.random() * 2000);
    }
}

function simulateResponse(contact) {
    typingIndicatorArea.classList.add('hidden');
    delete typingIndicatorArea.dataset.responding;
    
    const responseContent = `Got it! Thanks for the update. (Demo Reply)`;
    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const responseMessage = {
        id: Date.now() + 1,
        sender: contact.name,
        content: responseContent,
        time: timeString,
        type: 'received'
    };
    
    // Update contact list preview
    const currentContactIndex = CONTACTS.findIndex(c => c.id === contact.id);
    if (currentContactIndex !== -1) {
        CONTACTS[currentContactIndex].lastMessage = responseContent;
        CONTACTS[currentContactIndex].lastMessageTime = timeString;
    }


    MESSAGES_MOCK[contact.id].push(responseMessage);
    renderMessage(responseMessage, contact);
    messagesAreaElement.scrollTop = messagesAreaElement.scrollHeight;
    
    renderContacts(); // Update contact list with the response
}

function initialize() {
    // Set initial view state for mobile
    if (window.innerWidth <= 768) {
        chatContainer.classList.add('mobile-view-contacts');
    } else {
        // Ensure desktop layout works fine if resizing from mobile
        chatContainer.classList.remove('mobile-view-contacts', 'mobile-view-chat');
    }

    // Load initial chat (e.g., Alice Smith)
    currentChatId = CONTACTS[0].id;
    switchChat(currentChatId);

    // Expose utility function globally for the mobile back button handler
    window.goBackToContacts = () => {
        chatContainer.classList.remove('mobile-view-chat');
        chatContainer.classList.add('mobile-view-contacts');
        // Hide typing indicator when switching away
        typingIndicatorArea.classList.add('hidden'); 
    };

    // Handle sending a message
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
            e.preventDefault(); // Prevent default newline behavior
        }
    });
    
    // Handle responsiveness on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Desktop mode: ensure both are potentially visible
             chatContainer.classList.remove('mobile-view-contacts', 'mobile-view-chat');
        } else {
            // Mobile mode: ensure we default to contacts list unless a chat is actively open
            if (currentChatId && !chatContainer.classList.contains('mobile-view-chat')) {
                chatContainer.classList.add('mobile-view-contacts');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initialize);
