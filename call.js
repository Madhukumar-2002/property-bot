const AsteriskManager = require('asterisk-manager');

// Replace with your AMI credentials
const ami = new AsteriskManager(
    5038,          // AMI port
    '127.0.0.1',   // Host
    'admin',       // Username
    'adminpass',   // Password
    true           // Reconnect automatically
);

ami.keepConnected(); // Keep connection alive

ami.on('managerevent', (evt) => {
    console.log('AMI Event:', evt);
});

ami.on('error', (err) => {
    console.error('AMI Error:', err);
});

// Corrected way to send Originate action
const originateAction = {
    Action: 'Originate',    // Must be capitalized
    Channel: 'Local/1000@demo', // Your source channel (using Local since no SIP peers registered)
    Context: 'default',     // Dialplan context
    Exten: '1234',          // Number to call
    Priority: 1,
    CallerID: 'NodeJS <1000>',
    Timeout: 30000          // Optional
};

ami.action(originateAction, (err, res) => {
    if (err) console.error('Originate Error:', err);
    else console.log('Originate Response:', res);
});
