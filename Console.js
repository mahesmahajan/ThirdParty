const log = require('electron-log');
const remote = require('electron').remote;
window.ELECTRONWEBVIEW = window.ELECTRONWEBVIEW || {};
ELECTRONWEBVIEW.readyStateLoader = function (callback) {
    if (document && document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else if (document) {
        callback();
    }
};
function myTestFunction() {
    var webviewInit = function () {
        log.info('Application statred');
        var arguments = remote.getGlobal('sharedObject')?remote.getGlobal('sharedObject').prop1:myUrls;
        var isWebex = arguments[2].indexOf('zoom')===-1;
        var isZoom = arguments[2].indexOf('zoom')!==-1;
        var zoomUrl = arguments[2];
        var webexUrl = arguments[2]; 
        // Move common element out side of both zoom/webex logic 
        var loader = document.querySelector(".loader");
        var consoleControl = document.querySelector('.console-controls');
        var exitMeeting = document.querySelector(".exit-meeting-btn");
        var switchConsole = document.querySelector('.pretty.p-switch input');
        var meetingInfoScreen = document.querySelector('.meeting-info-screen');
        var webviewContainer = document.querySelector('.webview-container');
        var webviewElement;
        loader.classList.remove('connecting');

        var getWebView = function (url) {
            return `<webview src=${url} autosize preload = "renderer.js" id="foo"  style="min-width: 786px;min-height:80vh"></webview>`;
        };

        var showMeetingBtn = function (name) {
            loader.classList.add('connecting');
        };

        var onQuit = function () {
            // TODO: Cleanup timeout
            win = null;
            if (webviewElement) {
                document.querySelector("webview").remove();
            }
            if (process.platform !== 'darwin') {
                 window.close();
            }

        };

        // In embedder page
        var bindEvents = function () {
            webviewElement = document.querySelector('webview');
            webviewElement.addEventListener('ipc-message', function (event) {
                loader.classList.remove("connecting");
                switch (event.channel) {
                    case 'close meeting':
                        onQuit();
                        break;
                    default:
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
                consoleControl.classList.remove("connecting");
                webviewElement.send("bind-end-meeting", "zoom");
            } else {
                executeWebexScript();
                log.info('Webex loaded');
                consoleControl.classList.remove("connecting");
                // TODO: Cleanup timeout
                setTimeout(function () {
                    webviewElement.send("bind-end-meeting", "webex");
                }, 5000);
            }
        };

        var showLoader = function (name) {
            name === 'zoom' ? loader.classList.add('connecting') : loader.classList.remove('connecting');
        };

        exitMeeting && exitMeeting.addEventListener("click", function () {
            loader.classList.remove("connecting");
            onQuit();
        });

        switchConsole && switchConsole.addEventListener('change', function (e) {
            if (e.target.checked) {
                meetingInfoScreen.classList.remove('connecting');
            } else {
                meetingInfoScreen.classList.add('connecting');
                consoleControl.classList.add('connecting');
                if (webviewElement !== null) {
                    webviewElement.style.minHeight = '100vh';
                }
            }
        });


        var executeZoomScript = function () {
            // TODO: Cleanup timeout
            setTimeout(function () {
                webviewElement.executeJavaScript(
                    'document.querySelectorAll(".left-tool-item button")[2].click();'
                );
            }, 20000);
        };

        if(isZoom) {
            showLoader('zoom');
            webviewContainer.innerHTML = getWebView(zoomUrl);
            bindEvents();
        }

        if(isWebex) {
            webviewContainer.innerHTML = getWebView(webexUrl);
            bindEvents();
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
                        loader.classList.add("connecting");
                    }, 4500);
                }
            };

        }
    };
    ELECTRONWEBVIEW.readyStateLoader(webviewInit);
}