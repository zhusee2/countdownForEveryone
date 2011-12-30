/* 
 * CountdownForEveryone Safari Extension
 * 2011(c) Zhusee (https://github.com/zhusee2/)
 */

const CDPAGEPATTERN = /^http:\/\/timer.hugojay.com\/counter.php\?.*id=([^\&]+)/;
 
safari.application.addEventListener('validate', validationHandler, false);
safari.application.addEventListener('menu', menuValidator, false);
safari.application.addEventListener('command', commandHandler, false);
safari.application.addEventListener("message", respondToMessage, false);
safari.extension.settings.addEventListener('change', settingsChangEventHandler, false);
 
function validationHandler(event) {
  switch (event.command) {
    case 'btnCountDown':
      if (safari.extension.settings.countdownData) {
        event.target.toolTip = CDFE.getName() + ' (' + CDFE.getTimeLeftString() + ')';
        if (safari.extension.settings.showBadge && !CDFE.getTimeLeftObj().expire) {
          event.target.badge = CDFE.getDaysForBadge();
        } else {
          event.target.badge = 0;
        }
      } else {
        event.target.toolTip = '全民倒數計時器 (未設定)';
        event.target.badge = 0;
      }
      
      break;
    case 'menuItemCDName':
      if (safari.extension.settings.countdownData) {
        event.target.title = CDFE.getName();
      } else {
        event.target.title = '倒數計時未設定';
      }
      break;
    case 'showBadgeOnToolbar':
      event.target.checkedState = safari.extension.settings.showBadge || 0;
      break;
    default:
      break;
  }
}

function menuValidator(event) {
  //在倒數計時器頁面增加自動設定選項
  var cdPageMatch = safari.application.activeBrowserWindow.activeTab.url.match(CDPAGEPATTERN);

  if (event.target.identifier === 'menuCountdown') {
    if (safari.extension.settings.countdownData) {
      event.target.menuItems[0].title = CDFE.getName();
      event.target.insertMenuItem(1, 'menuItemCDDate', CDFE.getArrivalDate());
      event.target.insertMenuItem(2, 'menuItemCDTimeLeft', CDFE.getTimeLeftStringFull());
      event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemSetCountdown'));
      event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemSetCurrentCountdown'));
      event.target.menuItems[1].disabled = true;
      event.target.menuItems[2].disabled = true;
      event.target.menuItems[4].disabled = false;
    } else {
      event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemCDDate'));
      event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemCDTimeLeft'));
      event.target.menuItems[CDFE.utility.getMenuItemIndex('menuItemCDBrowser')].disabled = true;
      event.target.insertMenuItem(1, 'menuItemSetCountdown', '設定倒數計時⋯', 'setNewCountdown');
      if (cdPageMatch) {
        event.target.insertMenuItem(2, 'menuItemSetCurrentCountdown', '使用本頁的倒數計時', 'setCurrentCountdown');
      } else {
        event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemSetCurrentCountdown'));
      }
    }
  }
  if (event.target.identifier === 'menuOptions') {
    if (cdPageMatch) {
      event.target.menuItems[2].disabled = false;
    } else {
      event.target.menuItems[2].disabled = true;
    }
  }
}

function commandHandler(event) {
  if (event.command === 'setNewCountdown') {
    var url = prompt('請輸入您要使用的全民倒數計時器網址：', '範例：http://timer.hugojay.com/counter.php?id=Rvc');
    
    if (!url || !CDFE.setCountdownWithURL(url)) {
      alert('您輸入的格式錯誤，請檢查後再試一次。\n\n建議您開啟您要使用的全民倒數計時器網頁，並直接將網址複製後再回來貼上。')
    }
  }
  if (event.command === 'setCurrentCountdown') {
    var url = safari.application.activeBrowserWindow.activeTab.url;
    
    if (!url || !CDFE.setCountdownWithURL(url)) {
      alert('設定失敗，請改使用手動輸入設定。')
    }
  }

  if (event.command === 'viewInBrowser') {
    var url = 'http://timer.hugojay.com/counter.php?id=' + CDFE.getCountdown().id;
    safari.application.activeBrowserWindow.openTab().url = url;
  }
  if (event.command === 'showBadgeOnToolbar') {
    safari.extension.settings.showBadge = !safari.extension.settings.showBadge;
  }
  if (event.command === 'removeCountdown') {
    safari.extension.settings.countdownData = null;
  }
}

function respondToMessage(event) {
  if (event.name === 'setCurrentCountdown') {
    if (CDFE.setCountdownWithURL(event.message)) {
      // Do something animated to show working process
    }
  }
}

function settingsChangEventHandler(event) {
  for (var i in safari.extension.toolbarItems) {
    safari.extension.toolbarItems[i].validate();
  }
}

var CDFE = {
  getName: function getName() {
    return this.getCountdown().title;
  },
  getArrivalDate: function getArrivalDate() {
    return this.getCountdown().date;
  },
  getTimeLeftObj: function getTimeLeftObj() {
    var now = new Date(),
        targetDate = new Date(this.getCountdown().date + ' GMT+0800'),
        diff = new Date(targetDate - now - 28800000), flagExpire = false;
        
    if (diff < 0) {
      diff = new Date(now - targetDate - 28800000);
      flagExpire = true;
    }

    var result = {
      days: Math.floor((diff.getTime() + 28800000) / 86400000), // 24hr*60min*60sec*1000ms
      hours: diff.getHours(),
      minutes: diff.getMinutes(),
      seconds: diff.getSeconds(),
      expire: flagExpire
    };
    
    return result;
  },
  getTimeLeftString: function getTimeLeftString() {
    var timeLeft = CDFE.getTimeLeftObj(), string = '';
    
    if (timeLeft.days) string += timeLeft.days + ' 天 ';
    if (timeLeft.hours) string += timeLeft.hours + ':';
    if (timeLeft.minutes) string += timeLeft.minutes + ':';
    if (timeLeft.seconds) string += timeLeft.seconds;
    
    return (timeLeft.expire ? '已過 ' : '剩下 ' ) + string;
  },
  getTimeLeftStringFull: function getTimeLeftStringFull() {
    var timeLeft = CDFE.getTimeLeftObj(), stringArray = [];
    
    if (timeLeft.days) stringArray.push(timeLeft.days, '天');
    if (timeLeft.hours) stringArray.push(timeLeft.hours, '小時');
    if (timeLeft.minutes) stringArray.push(timeLeft.minutes, '分');
    if (timeLeft.seconds) stringArray.push(timeLeft.seconds, '秒');
    
    return (timeLeft.expire ? '已過 ' : '剩下 ' ) + stringArray.join(' ');
  },
  getDaysForBadge: function getDaysForBadge() {
    var timeLeft = this.getTimeLeftObj();
    
    if (timeLeft.days < 1) return 1; else return timeLeft.days;
  },
  getCountdown: function getCountdown() {
    try {
      return JSON.parse(safari.extension.settings.countdownData);
    } catch(e) {
      console.log(e);
      return false;
    }
  },
  setCountdown: function setCountdown(id) {
    $.post('http://timer.hugojay.com/ajax/cdtimer.php', {id: id}, function(data) {
      if (JSON.parse(data).response == 1) {
        safari.extension.settings.countdownData = data;
        console.log('設定完成', data);
      } else {
        alert('找不到指定的倒數計時器，請檢查ID後再試一次。');
        return false;
      }
    });
  },
  setCountdownWithURL: function setCountdownWithURL(url) {
    var match = url.match(CDPAGEPATTERN);
    
    if (match) {
      this.setCountdown(match[1]);
      return true;
    } else {
      console.error('無法設定倒數計時：傳入的網址錯誤。');
      return false;
    }
  }
};

CDFE.utility = {
  getMenuItemIndex: function getMenuItemIndex(identifier) {
    var menuItems = safari.extension.menus[0].menuItems;
    
    for (var i in menuItems) {
      if (menuItems[i].identifier === identifier) return i;
    }
    
    return undefined;
  }
};