/* 
 * CountdownForEveryone Safari Extension
 * 2011(c) Zhusee (https://github.com/zhusee2/)
 */
 
safari.application.addEventListener('validate', validationHandler, false);
safari.application.addEventListener('menu', menuValidator, false);
 
function validationHandler(event) {
  switch (event.command) {
    case 'btnCountDown':
      if (safari.extension.settings.countdownData) {
        event.target.toolTip = CDFE.getName() + ' (剩下 ' + CDFE.getTimeLeftString() + ')';
      } else {
        event.target.toolTip = '全民倒數計時器 (未設定)';
      }
      if (safari.extension.settings.showBadge) {
        event.target.badge = CDFE.getDaysForBadge();
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
      console.log(event);
      break;
    default:
      break;
  }
}

function menuValidator(event) {
  if (event.target.identifier === 'menuCountdown') {
    if (safari.extension.settings.countdownData) {
      event.target.menuItems[0].title = CDFE.getName();
      event.target.insertMenuItem(1, 'menuItemCDDate', CDFE.getArrivalDate());
      event.target.insertMenuItem(2, 'menuItemCDTimeLeft', '剩下 ' + CDFE.getTimeLeftStringFull());
      event.target.menuItems[1].disabled = true;
      event.target.menuItems[2].disabled = true;
    } else {
      event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemCDDate'));
      event.target.removeMenuItem(CDFE.utility.getMenuItemIndex('menuItemCDTimeLeft'));
    }
  }
}

var CDFE = {
  getName: function getName() {
    return this.getCountdown().title;
  },
  getArrivalDate: function getArrivalDate() {
    return this.getCountdown().date;
  },
  getTimeLeftObj: function getTimeLeftStringFull() {
    var now = new Date(),
        targetDate = new Date(this.getCountdown().date + ' GMT+0800'),
        diff = new Date(targetDate - now - 28800000);

    var result = {
      days: Math.floor(diff.getTime() / 86400000), // 24hr*60min*60sec*1000ms
      hours: diff.getHours(),
      minutes: diff.getMinutes(),
      seconds: diff.getSeconds()
    };
    
    return result;
  },
  getTimeLeftString: function getTimeLeftString() {
    var timeLeft = CDFE.getTimeLeftObj(), string = '';
    
    if (timeLeft.days) string += timeLeft.days + ' 天 ';
    if (timeLeft.hours) string += timeLeft.hours + ':';
    if (timeLeft.minutes) string += timeLeft.minutes + ':';
    if (timeLeft.seconds) string += timeLeft.seconds;
    
    return string;
  },
  getTimeLeftStringFull: function getTimeLeftStringFull() {
    var timeLeft = CDFE.getTimeLeftObj(), stringArray = [];
    
    if (timeLeft.days) stringArray.push(timeLeft.days, '天');
    if (timeLeft.hours) stringArray.push(timeLeft.hours, '小時');
    if (timeLeft.minutes) stringArray.push(timeLeft.minutes, '分');
    if (timeLeft.seconds) stringArray.push(timeLeft.seconds, '秒');
    
    return stringArray.join(' ');
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
      safari.extension.settings.countdownData = data;
    });
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