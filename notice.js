function sif_Append_Notice() {
  var mainelem = document.querySelector("body > .content");

  var alertelem = document.createElement('div');
  alertelem.className = "alert";
  alertelem.addEventListener('click', function(e) {
    const rootdir = location.hostname == 'localhost' ? '/htdocs' : '';
    var dlgcontent = document.createElement('iframe');
    dlgcontent.src = rootdir + "/llsif/notice.html";
    showDialog(dlgcontent, "「スクフェス」ページ閉鎖のお知らせ", "notice", [], [], [], false, true);
  });

  var elem = document.createElement('div'); elem.className = "alert_title";
  elem.textContent = "重要なお知らせ"
  alertelem.appendChild(elem);

  var elem = document.createElement('div'); elem.className = "alert_description";
  elem.textContent = "「スクフェス」ページ閉鎖について"
  alertelem.appendChild(elem);

  elem = document.createElement('button'); elem.className = "dialog_close";

  elem.addEventListener('click', function(e) {
    toggleClass(e.target.parentNode, "hidden", true); e.stopPropagation();
  });
  alertelem.appendChild(elem);


  mainelem.insertBefore(alertelem, mainelem.firstChild);
}

