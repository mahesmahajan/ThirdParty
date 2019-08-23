// inyector.js// Get the ipcRenderer of electron
const { ipcRenderer } = require('electron');
const log = require('electron-log');
var videoEnable = false;
/**
 * Simple function to excute the channel meeting 
 * of the <webview>
 *
 **/
ipcRenderer.on("bind-end-meeting", function (event, data) {
    switch(data) {
        case 'webex': bindWebexControls(); break;
        case 'zoom':  bindZoomControls(); break;
        default : log.info('channel name is missing'); break;
    }
});

/**
 * Simple function to excute the zoom meeting 
 * of the <webview>
 *
 **/
function bindZoomControls() {
    var meetingIdentifier = document.querySelector('.footer__leave-btn.ax-outline');
    // TODO: Cleanup timeout
    setTimeout(function(){
        document.querySelectorAll(".left-tool-item button")[2] && document.querySelectorAll(".left-tool-item button")[2].click(); 
    },10000);
    if (meetingIdentifier) {
        meetingIdentifier.addEventListener('click', function () {
            // TODO: Cleanup timeout
            setTimeout(function(){   
            var endmeeting = document.querySelector('.zm-btn.zm-btn-legacy.zm-btn-primary');
                endmeeting.addEventListener('click', function () { 
                    ipcRenderer.sendToHost('close meeting');
                });
            },500);
        });
    }
}
/**
 * Simple function to excute the webex meeting 
 * of the <webview>
 *
 **/
function bindWebexControls() {
    // TODO: Cleanup timeout
    setTimeout(function () {
        var crossLink = document.querySelector('.pb-meeting-loader.pb-ani-home .loading-action .leave-meeting');
        // TODO: Cleanup timeout
        setTimeout(function () {
            var mainContainer = document.querySelector('#pb_iframecontainer');
            if (mainContainer.childNodes[0]) {   
                var video = mainContainer.childNodes[0].contentDocument.querySelectorAll('.menu-item.haspop.icon-video.item-preview.btn-52');
                var red = mainContainer.childNodes[0].contentDocument.querySelectorAll('.menu-item.haspop.red.icon-leave.item-leave.btn-52');
                video[0] && video[0].classList.remove('unavailable');
                if(!videoEnable) {
                    video[0].click();
                    videoEnable = true;
                red[0] && red[0].click();
                var startMeeting = mainContainer.childNodes[0].contentDocument.querySelectorAll('.button.green.start-my-video');
                startMeeting[0].removeAttribute("disabled");
                startMeeting[0] && startMeeting[0].click();
                }
                var leaveMeeting = mainContainer.childNodes[0].contentDocument.querySelectorAll('.button.leave-btn.first-item.last-item');
                if (leaveMeeting.length > 0) {
                    leaveMeeting[0].addEventListener('click', function () {
                        ipcRenderer.sendToHost('close meeting');
                    });
                }
            }
        }, 5000);
        if (crossLink) {
            crossLink.addEventListener('click', function () {
                ipcRenderer.sendToHost('close meeting webex');
            });
        }

    }, 1000);
}