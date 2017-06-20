const { Wechaty, Room, MediaMessage } = require('wechaty')
const terminal = require('qrcode-terminal')
const axios = require('axios')

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

const ignores = ['<img class="qqemoji qqemoji79" text="[强]_web" src="/zh_CN/htmledition/v2/images/spacer.gif" />',
    '[收到了一个表情，请在手机上查看]']

//19:15~21:00
const startTime = 19*60+15
const endTime = 21*60


Wechaty.instance({head: 'phantomjs'})
.on('scan', (url, code) => {
  if (!/201|200/.test(String(code))){
     let loginUrl = url.replace(/\/qrcode\//, '/l/')
     terminal.generate(loginUrl)
    //  var url = 'http://sc.ftqq.com/.send' // + 'Webot需要登录' + '&desp=' + loginUrl
    //  console.log(url)
    //  axios.get(url, {
    //    params: {
    //    'text': 'Webot需要登录 '+new Date(),
    //    'desp': loginUrl
    //  }
    //  }).then(function (response) {
    //   // console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  }
  console.log(`Scan QR Code in above url to login: `)
})
.on('login',  user => console.log(`User ${user.name()} logined`))
.on('logout'	, user => {
      console.log(` ${user.name()} logouted`)
      // var url = 'http://sc.ftqq.com/.send'
      // axios.get(url,
      //   {
      //     params: {
      //     'text': 'Webot退出了 '+new Date()
      //     }
      //   })
    }
 )
.on('heartbeat', beat => {
  // console.log(`heartbeat ${beat}`)
})
.on('room-topic', (topic, oldTopic, changer)=> {
  console.log(`topic changed from ${oldTopic} to ${topic}`)
})
.on('message', message => {
  //console.log(`${message.from()}: ${message.content()} `))

  const content = message.content()
  const room    = message.room()
  const sender  = message.from()
  const type = message.type()
  const senderAlias = room && room.alias(sender) ? room.alias(sender) : sender.name()
  const roomName = room?room.topic():''
  const data = {
    'room': roomName,
    'sender': sender.name(),
    'senderAlias': senderAlias,
    'contentType': type,
    'content': content
  }

  const now = new Date()
  const minutes = now.getHours()*60 + now.getMinutes();
  // console.log('now:'+now.getHours() + ':'+now.getMinutes())
  if(minutes < startTime || minutes > endTime) {
    console.log("ignore: " + roomName+ '/' + senderAlias+': ' +content)
    return
  }

  if(room) {
    console.log(data)

    if((roomName === 'testbot2' || roomName === '支付产品技术交流群') && type !== 10000) {
        Room.find({ topic:"支付技术架构交流群"} ) //支付技术架构交流群
        .then(dingRoom =>{
          console.log('ding room'+dingRoom)
          if(type === 1) {
            if(ignores.contains(content)) {
                //pass
            }else {
              dingRoom.say('【产品群】'+content + ' \n(By '+senderAlias +')')
            }
          }else if(type === 3) {
            dingRoom.say(message)
          }
        })
    }
  }
})
.init()
