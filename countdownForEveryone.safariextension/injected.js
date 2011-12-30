if (top === self) {
  try {
    var btnInstallChrome = document.querySelector('.sharingbuttons a.gcrx_opener');

    var btnInstallSafari = document.createElement('a');
    btnInstallSafari.href = '#safari';
    btnInstallSafari.innerText = '安裝至Safari延伸套件';
    btnInstallSafari = btnInstallChrome.parentElement.insertBefore(btnInstallSafari, btnInstallChrome);
    
    btnInstallSafari.addEventListener('click', function(event) {
      safari.self.tab.dispatchMessage("setCurrentCountdown", location.href);

      event.preventDefault();
    });
  } catch(error) {
    console.error('無法正確判讀倒數計時器頁面。');
  }
}