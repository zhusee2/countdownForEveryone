if (top === self) {
  const INSTALL_LABLE = '安裝至Safari瀏覽器',
        INSTALLING_LABLE = '正在安裝...',
        INSTALLED_LABLE = '已安裝至Safari瀏覽器',
        FAILED_LABLE = '安裝失敗，請再試一次',
        FAILED_ALERT = '無法成功安裝倒數計時至Safari瀏覽器，請重新整理網頁後再試一次。',
        INIT_FAILED_LOG = '無法正確判讀倒數計時器頁面。';

  function installButtonClickHandler(event) {
    event.preventDefault();
    if (this.getAttribute('class') == 'disable') return false;
    
    this.setAttribute('class', 'disable');
    this.innerText = INSTALLING_LABLE;
    safari.self.tab.dispatchMessage("setCurrentCountdown", location.href);
  }
  
  function responseToRequest(request) {
    if (request.name === 'installResult') {
      var button = document.querySelector('.sharingbuttons a[href="#safari"]');
      
      if (request.message) {  
        button.innerText = INSTALLED_LABLE;
      } else {
        button.innerText = FAILED_LABLE;
        alert(FAILED_ALERT);
      }
    }
    if (request.name === 'currentCountdown') {
      if (location.search.match(/\?id=(\w+)/)[1] === request.message.id) {
        var button = document.querySelector('.sharingbuttons a[href="#safari"]');
        
        button.setAttribute('class', 'disable');
        button.innerText = INSTALLED_LABLE;
      }
    }
  }
  
  try {
    var btnInstallChrome = document.querySelector('.sharingbuttons a.gcrx_opener');

    var btnInstallSafari = document.createElement('a');
    btnInstallSafari.href = '#safari';
    btnInstallSafari.innerText = INSTALL_LABLE;
    btnInstallSafari = btnInstallChrome.parentElement.insertBefore(btnInstallSafari, btnInstallChrome);
    btnInstallChrome.parentElement.removeChild(btnInstallChrome);
    
    // Check if current countdown is set
    safari.self.tab.dispatchMessage("getCurrentCountdown");
    
    btnInstallSafari.addEventListener('click', installButtonClickHandler);
  } catch(error) {
    console.error(INIT_FAILED_LOG);
  }
  
  safari.self.addEventListener('message', responseToRequest, false);
}