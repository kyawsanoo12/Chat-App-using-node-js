const socket = io();

const inboxPeople = document.querySelector('.inbox_people');

let userName = "";

const newUserConnected = (user) => {
    userName = user || `User${Math.floor(Math.random()*100000)}`;
    socket.emit('new user', userName);
    addtoUserBox(userName);
};

const addtoUserBox = (userName) => {
    if (document.querySelector(`.${userName}-list`)) {
        return;
    };
    const user = `
    <div class="chat_ib ${userName}-list">
    <h5>${userName}</h5></div>
    `;

    inboxPeople.innerHTML += user;
};

newUserConnected();
socket.on('new user', (data) => {
    data.map(user => addtoUserBox(user));
});

socket.on('user disconnected', (userName) => {
    document.querySelector(`.${userName}-list`).remove();
});

const inputField = document.querySelector('.message_form_input');
const messageBox = document.querySelector('.messages_history');
const messageForm = document.querySelector('.message_form');
const fallback = document.querySelector('.fallback');

const addnewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString('en-US', { hour: "numeric", minute: 'numeric' });

    const receiveMsg = `
    <div class="incoming_msg">
        <div class='receive_msg'>
         <p>${message}</p>
        </div>
        <div class='message_info'>
          <span class='message_author'>${user}</span>
          <span class="time_date">${formattedTime}</span>
        </div>
    </div>
    `;

    const myMsg = `
    <div class="outgoing_msg">
        <div class='sent_msg'>
         <p>${message}</p>
        </div>
        <div class='message_info'>
         
          <span class="time_date">${formattedTime}</span>
        </div>
    </div>
    `;

    messageBox.innerHTML += user === userName ? myMsg : receiveMsg;
};

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    };
    socket.emit('chat message', {
        message: inputField.value,
        nick: userName
    });

    inputField.value = "";
});

inputField.addEventListener('keyup', () => {
    socket.emit('typing', {
        isTyping: inputField.value > 0,
        nick: userName,
    });
})

socket.on('chat message', (data) => {
    addnewMessage({ user: data.nick, message: data.message });
});

socket.on('typing', (data) => {
    const { isTyping, nick } = data;
    if (!isTyping) {
        fallback.innerHTML = "";
        return;
    }
    fallback.innerHTML = `<i>${nick} is typing.....</i>`;
})


