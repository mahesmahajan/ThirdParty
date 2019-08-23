const log = require('electron-log');

window.ELECTRONWEBVIEW = window.ELECTRONWEBVIEW || {};
ELECTRONWEBVIEW.readyStateLoader = function (callback) {
    if (document && document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else if (document) {
        callback();
    }
};

(function () {
    var webviewInit = function () {

        const isWebex = true;
        const isZoom = false;

        // Common element 
        var loader = document.querySelector(".loader");
        var webviewElement = document.querySelector('webview');
        var consoleControl = document.querySelector('.console-controls');
        var exitMeeting = document.querySelector(".exit-meeting-btn");
        var switchConsole = document.querySelector('.pretty.p-switch input');
        var meetingInfoScreen = document.querySelector('.meeting-info-screen');

        var getWebView = function (url) {
            return ` <webview src=${url} autosize preload = "renderer.js" id="foo"  style="min-width: 786px;min-height:80vh"></webview>`;
        };

        var showMeetingBtn = function (name) {
            var webex = document.querySelector(".join-webex");
            var zoom = document.querySelector(".join-zoom");
            loader.classList.add('hide');
            webex.classList.remove("hide");
            zoom.classList.remove("hide");
        };

        var reRender = function () {
            var webviewElement = document.querySelector('webview');
            // TODO: Cleanup timeout
            setTimeout(function () {
                if (webviewElement) {
                    document.querySelector("webview").remove();
                }
                showMeetingBtn();
            }, 500);
        };

        // In embedder page
        var bindEvents = function () {
            webviewElement = document.querySelector('webview');
            webviewElement.addEventListener('ipc-message', function (event) {
                console.log(event.channel);
                loader.classList.remove("hide");
                switch (event.channel) {
                    case 'close meeting':
                        reRender();
                        break;
                    default:
                        console.log(event.channel);
                }
            });

            webviewElement.addEventListener("did-finish-load", loadFinish);
            webviewElement.addEventListener("did-stop-loading", loadstop);
        };
        var loadstop = function () {
            var page = webviewElement.getAttribute("src");
            if (page.indexOf("zoom") > 0) {
                executeZoomScript();
            } else {
                executeWebexScript('load-stop');
            }
        };

        var loadFinish = function () {
            log.info('WebView loaded');
            var page = webviewElement.getAttribute("src");
            if (page.indexOf("zoom") > 0) {
                showLoader('zoom');
                log.info('Zoom loaded');
                executeZoomScript();
                consoleControl.classList.remove("hide");
                webviewElement.send("bind-end-meeting", "zoom");
            } else {
                count = count + 1;
                if (count >= 1) {
                    executeWebexScript();
                    log.info('Webex loaded');
                    consoleControl.classList.remove("hide");
                    // TODO: Cleanup timeout
                    setTimeout(function () {
                        webviewElement.send("bind-end-meeting", "webex");
                    }, 5000);
                }
            }
        };

        var showLoader = function (name) {
            var webex = document.querySelector(".join-webex");
            var zoom = document.querySelector(".join-zoom");
            name === 'zoom' ? loader.classList.add('hide') : loader.classList.remove('hide');
            webex.classList.add("hide");
            zoom.classList.add("hide");
        };

        exitMeeting && exitMeeting.addEventListener("click", function () {
            loader.classList.remove("hide");
            reRender();
        });

        switchConsole && switchConsole.addEventListener('change', function (e) {
            if (e.target.checked) {
                meetingInfoScreen.classList.remove('hide');
            } else {
                meetingInfoScreen.classList.add('hide');
                consoleControl.classList.add('hide');
                if (webviewElement !== null) {
                    webviewElement.style.minHeight = '100vh';
                }
            }
        });


        if(isZoom) {
            var webviewContainer = document.querySelector('.webview-container');
            var zoom = document.querySelector(".join-zoom");
            var getwebViewHTML;
            zoom && zoom.addEventListener('click', function (e) {
                showLoader('zoom');
                //getwebViewHTML = getWebView(require('electron').remote.process.argv.slice(1)[0]);
                getwebViewHTML = getWebView('https://zoom.us/wc/4507475950/join?prefer=1&un=TXIuUmlnZWw=');
                webviewContainer.innerHTML = getwebViewHTML;
                bindEvents();
            });

            var executeZoomScript = function () {
                // TODO: Cleanup timeout
                setTimeout(function () {
                    webviewElement.executeJavaScript(
                        'document.querySelectorAll(".left-tool-item button")[2].click();'
                    );
                }, 20000);
            };
        }

        //console.log(require('electron').remote.process.argv.slice(1)[0]);
        if(isWebex) {
            var count = 0; 
            var webex = document.querySelector(".join-webex");
            var loader = document.querySelector(".loader");
            var webviewContainer = document.querySelector('.webview-container');
            var webviewElement = document.querySelector('webview');
            var getwebViewHTML; 

            webex && webex.addEventListener('click', function (e) {
                showLoader();
                getwebViewHTML = getWebView('https://hanitsaffting-f117-ae9b.my.webex.com/hanitsaffting-f117-ae9b.my/j.php?MTID=m8befee18b15366004c841cf46e3cb9b1');
                webviewContainer.innerHTML = getwebViewHTML;
                bindEvents();
            });
            var executeWebexScript = function (flag) {
                if (!flag) {
                    // TODO: Cleanup timeout
                    setTimeout(function () {
    
                        webviewElement.executeJavaScript(
                            'document.querySelector(".meeting-join .user-email .el-input__inner").value = "contoso@contoso.com";'
                        );
                        webviewElement.executeJavaScript(
                            'document.querySelector(".meeting-join .el-input__inner").value = "Contoso";'
                        );
    
                        webviewElement.executeJavaScript(
                            'document.querySelector(".el-button.el-button--success.el-button--large").removeAttribute("disabled")'
                        );
                        webviewElement.executeJavaScript(
                            'document.querySelector(".meeting-join  .el-input__inner").dispatchEvent(new Event("input"))'
                        );
    
                        webviewElement.executeJavaScript(
                            'document.querySelector(".meeting-join .user-email .el-input__inner").dispatchEvent(new Event("input"))'
                        );
    
                        webviewElement.executeJavaScript(
                            'document.querySelectorAll("#smartJoinButton li")[2].click();'
                        );
    
                        webviewElement.executeJavaScript(
                            'document.querySelector(".el-button.el-button--success.el-button--large").click();'
                        );
    
                    }, 1000);
                    // TODO: Cleanup timeout
                    setTimeout(function () {
                        loader.classList.add("hide");
                    }, 4500);
                }
            };

        }
    };
    ELECTRONWEBVIEW.readyStateLoader(webviewInit);
})();