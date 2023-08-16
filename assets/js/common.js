function clearCountdown() {
    clearInterval(cInt);
}

function playAlertSound() {

    var pspi = $('input#pspi').val();

    try {
        // localStorage is accessible so we can save..
        var alertMe = localStorage.getItem("PSPNotification['"+pspi+"'']").toString();
    } catch(e) {
        // localStorage is not accessible
    }

    if (pspi == "1") {
        $("audio#notification")[0].play();
    }
}

// Autoreload every hour to make it easir on RAM and load new app version - prevent runnig old PSP version opened for weeks in browser
setTimeout(function(){
   window.location.reload(true);
}, 3600000);

// Fomat date

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


// Generate events list function - used on home and history page

function generateAnnListItem(event, live) {

    var eventID = '';
    var eventClass= '';

    // this we need to test on beta...
    if (event.eventType == "alrt") {
        eventID = 'data-monitor-id="m-' + event.monitorID + '"';
        eventID += 'data-date="d-' + formatDate(event.date) +'"';

        if (live && $('.announcement-feed .psp-announcement[data-date=""]').lenght <= 30) {
            $('.announcement-feed[data-monitor-id="m-' + event.monitorID +'][data-date="' + formatDate(event.date) +'"]').remove();
        }
    } else {
        eventClass = " is-"+ event.icon;
    }

    var annList = '<div class="psp-announcement' + eventClass + '" ' + eventID + '>';
    annList += '<div class="uk-flex uk-flex-middle uk-flex-wrap uk-margin-small-bottom">';

    if (live === true) {
        annList += '<div class="uk-label uk-label-small uk-margin-small-right">NEW</div>';
    }
    annList += '<div class="uk-text-muted uk-text-bold font-14">' + event.date + '</div>';

    annList += '</div>';

    annList += '<div class="uk-flex">';

    // downtime alerts  (alrt OR ann)
    if (event.eventType == "alrt") {

        annList += '<svg class="psp-announcement-icon icon icon-arrow-down-circle uk-flex-none"><use xlink:href="/assets/symbol-defs.svg#icon-arrow-down-circle"></use></svg>';
        annList += '<div class="uk-flex-auto">';

        annList += '<h4 class="uk-margin-remove">'+ event.monitor +' was down <span class="uk-text-muted">for ' + event.duration + ' in total</span></h4>';

        if (event.alertCount == 1) {
            annList += '<p>There was 1 outage during this day.</p>';
        } else {
            annList += '<p>There were ' + event.alertCount + ' outages during the day.</p>';
        }

        annList += '<p class="uk-text-muted font-14">';

        if (window.enableD) {
            annList += '<a href="'+ pageUrl + '/' + event.monitorID +'#logs">See details<svg class="icon icon-plus-square m-l-5 font-14"><use xlink:href="/assets/symbol-defs.svg#icon-arrow-right"></use></svg></a> | ';
        }

        annList += '<date uk-tooltip title="'+ event.timeGMT +' GMT">\
            Updated on ' + event.time + ' GMT' + window.timeZone + '\
        </date></p>';

    } else {

        annList += '<svg class="psp-announcement-icon icon icon-' + event.icon + ' uk-flex-none"><use xlink:href="/assets/symbol-defs.svg#icon-' + event.icon + '"></use></svg>';
        annList += '<div class="uk-flex-auto">';

        annList += '<h4 class="uk-margin-remove">'+ event.title + '</h4>';

        annList += '<p>' + event.content + '</p>';

        if (event.endDate !== null) {

            annList += '<p class="uk-text-muted font-14">';
            annList += '<span class="uk-display-inline-block" uk-tooltip title="'+ event.timeGMT +' GMT">\
                ' + event.date + ', ' + event.time + ' GMT' + window.timeZone + ' \
            </span>';

            annList += '<span class="uk-display-inline-block" uk-tooltip title="'+ event.endDateGMT +' GMT">\
                &nbsp;— ' + event.endDate + ' GMT' + window.timeZone + '\
            </span>';

            annList += "</p>";
        } else {
            annList += '<p class="uk-text-muted font-14 uk-display-inline-block" uk-tooltip title="'+ event.timeGMT +' GMT">\
                Updated on ' + event.time + ' GMT' + window.timeZone + '\
            </p>';
        }
    }


    annList += '</div></div></div>';

    return annList;

}


// Call event feed function - used on home and history page

function callEventFeed(fromNow, getToDate, getFromDate, outputContainer) {

    var toDate= '';

    var numberOfDays = 7;

    if (window.showO == false) {
        numberOfDays = 30;
    }

    // week/month before
    var fromDate = ~~((parseFloat(Date.now()) - numberOfDays*86400000) / 1000);

    if (fromNow === true) {
        // 2 minute grace period
        fromDate = ~~(parseFloat((Date.now()) - 120) / 1000);
    }

    if (getFromDate !== null) {
        fromDate = ~~(parseFloat(getFromDate) / 1000);
    }

    if (getToDate !== null) {
        toDate = '&to_date='+~~(parseFloat(getToDate) / 1000);
    }

    if (outputContainer !== undefined) {
        outputContainer.html(
            '<div class="psp-fake-monitorname"></div><div class="psp-fake-uptime-bars"></div>\
            <div class="psp-fake-monitorname"></div>\
            <div class="psp-fake-uptime-bars"></div>\
            <div class="psp-fake-monitorname"></div>\
            <div class="psp-fake-uptime-bars"></div>'
        );

        $('.psp-calendar-nav').addClass('loading');
    }

    $.ajax({
        type: "GET",
        url: eventsApiPath+'?from_date='+fromDate+toDate,

        dataType: "json",
        cache: false,
        success: function(data) {
            if (data.status === true) {

                $('.announcement-feed-preloader').addClass('uk-hidden');

                if (data.meta.count > 0) {
                    var events = Object.values(data.results);

                    // Now, iterate through the new object to output grouped alerts
                    var annLists = events.map(function(event) {
                        return generateAnnListItem(event, fromNow);
                    });

                    if (outputContainer !== undefined) {
                        outputContainer.html(annLists.join(''));
                        $('.psp-calendar-nav').removeClass('loading');
                    } else {
                        $('.announcement-feed').prepend(annLists.join(''));

                        $('.announcement-last').removeClass('uk-hidden');

                        if (fromNow) {
                            $('.announcement-empty').addClass('uk-hidden');
                        }
                    }
                } else {
                    if (outputContainer !== undefined) {
                        outputContainer.html('<div><em class="uk-text-muted">No updates for this date.</em></div>');
                        $('.psp-calendar-nav').removeClass('loading');
                    } else {
                        if (!fromNow) {
                            $('.announcement-empty').removeClass('uk-hidden');
                        }
                    }
                }
            }

        },
        error: function(error) {
            console.log(error);
        }
    });
}

$(function (){

    /* Handle full screen mode */

    $('.enter-fullscreen').on('click', function() {
        var elem = document.documentElement;

        if ($(this).data('fullscreen') == false) {
            if (elem.requestFullscreen) {
               elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
            window.scrollTo(0, 0);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

    });

    document.documentElement.addEventListener('fullscreenchange', function(event) {
        // document.fullscreenElement will point to the element that
        // is in fullscreen mode if there is one. If not, the value
        // of the property is null.
        if (document.fullscreenElement === null) {
            $('.enter-fullscreen').data('fullscreen', false);
        } else {
            $('.enter-fullscreen').data('fullscreen', true);
        }
        $('html').toggleClass('is-fullscreen');
        $('.enter-fullscreen .icon').toggleClass('uk-hidden');
    });




    /* Set and toggle notification alert setting - always set to no sound on page load bcs of permissions */

    var pspi = $('input#pspi').val();
    try {
        // localStorage is accessible so we can save..
        localStorage.setItem("PSPNotification['"+pspi+"'']", "0");
    } catch(e) {
        // localStorage is not accessible
    }

    $('.toggle-notif').on('click', function() {
        if ($(this).data('notif') == false) {
            try {
                // localStorage is accessible so we can save..
                localStorage.setItem("PSPNotification['"+pspi+"'']", "1");
            } catch(e) {
                // localStorage is not accessible
            }
            $(this).data('notif', true);
        } else {
            try {
                // localStorage is accessible so we can save..
                localStorage.setItem("PSPNotification['"+pspi+"'']", "0");
            } catch(e) {
                // localStorage is not accessible
            }
            $(this).data('notif', false);
        }
        $('.toggle-notif .icon, .toggle-notif .label').toggleClass('uk-hidden');
    });


    $("#login-form").submit(function(e) {
        $('.form-message').addClass('uk-hidden');

        if ($('#login-form #password-input').val().length > 0) {
            $('.form-message').text('');
            $.ajax({
                type: "POST",
                url: $(this).attr('action'),
                data: $(this).serialize(),
                dataType: "json",
                cache: false,
                success: function(data) {
                    $('.form-message').text(data.message);

                    if(data.success === true) {
                        $('.form-message').removeClass('uk-alert-danger').addClass('uk-alert-success');
                        window.location.replace(window.location.protocol+'//'+window.location.host+'/'+data.redirect);
                    } else {
                        $('.form-message').removeClass('uk-alert-success').addClass('uk-alert-danger');
                    }
                    $('.form-message').removeClass('uk-hidden');$('.form-message').removeClass('uk-hidden');
                }, error: function() {
                    $('.form-message').removeClass('uk-alert-success').addClass('uk-alert-danger').text('There was an unexpected error, please try again.');
                }
            });
        } else {
            $('.form-message').removeClass('uk-alert-success').addClass('uk-alert-danger').text('Password field must not be empty.');
            $('.form-message').removeClass('uk-hidden');$('.form-message').removeClass('uk-hidden');
        }
        e.preventDefault();
    });

    UIkit.util.on('#subscribe-dropdown', 'show', function () {
        $('#subscribe-dropdown input').focus();
        $('#subscribe-form .form-message').text('').addClass('uk-hidden').removeClass('uk-alert-success uk-alert-danger');
        $("#subscribe-form button").prop('disabled', false);

        if (window.sendGAEvents) {
            gtag('event', 'UR_SP_subscribe_open', {
              'event_category': 'UptimeRobot Status page',
              'event_label': 'Open subscription dropdown'
            });
        }
    });


    // handle cookieconesnt

    if(getCookie('ckConsent') != 1) {
        $('#ck-consent').removeClass('uk-hidden');
    }

    $('.hide-ckc').on('click', function() {
        $('#ck-consent').remove();
        setCookie('ckConsent', 1, 7);
    });


    // Handle psp unsubscribe form

    $('#unsubscribe-form').on('submit', function(e) {

        e.preventDefault();

        var pspi = $('input#pspi').val();
        var emailString = $('#unsubscribe-form input[type="email"]').val();
        //var response = grecaptcha.getResponse();

        $('#unsubscribe-form .form-message').text('').addClass('uk-hidden').removeClass('uk-alert-success uk-alert-danger');
        $("#unsubscribe-form button").text('Processing...').prop('disabled', true);

        $.ajax({
            type: "POST",
            url: $('#unsubscribe-form').attr('action'),
            data: {
                email: emailString,
                pspUrlKey: pspi
            },
            dataType: "json",
            cache: false,
            success: function(data) {

                $("#unsubscribe-form button").text('Send unsubscribe link').prop('disabled', false);
                if (data.status == true) {
                    $('#unsubscribe-form .form-message').html('Unsubscribe link has been sent. <strong>Confirm the unsubscribe by clicking a link in the email, please.</strong>').removeClass('uk-hidden').removeClass('uk-alert-danger').addClass('uk-alert-success');
                } else {
                    $('#unsubscribe-form .form-message').text(data.message).removeClass('uk-hidden').addClass('uk-alert-danger');
                }

                if (window.sendGAEvents) {
                    gtag('event', 'UR_SP_unsubscribe_sucessfull', {
                      'event_category': 'UptimeRobot Status page',
                      'event_label': 'Successfully unsubscribed with email'
                    });
                }
                if (window.sendGTM == true) {
                    dataLayer.push({'event': 'psp-unsubscribe-ok'});
                }
            },
            error: function(error) {

                $("#unsubscribe-form button").text('Subscribe').prop('disabled', false);

                var errorMessage = 'There was an error while unsubscribing. Try again, please.';

                if (error.responseJSON.message == "Subscription not found") {
                    errorMessage = 'Given email address is not suscribed to this status page.';
                } else {
                    Rollbar.error("PSP email unsubscribe error", {error: error });
                }

                $('#unsubscribe-form .form-message').text(errorMessage).removeClass('uk-hidden').addClass('uk-alert-danger');
            }
        });

        return false;

    });

    UIkit.util.on('#unsubscribe', 'show', function () {
        $('#unsubscribe-form .form-message').text('').addClass('uk-hidden').removeClass('uk-alert-success uk-alert-danger');
    });


});

//set cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// get cookie
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return null;
}



/*
// handle recaptcha for signup form
function _beforeSubmit(e) {
    e.preventDefault();
    var emailString = $('#subscribe-form input[type="email"]').val();

    if (emailString.length > 0) {
        grecaptcha.execute();
    }
    console.log('submit button clicked.');
    // do other things before captcha validation
    // e represents reference to original form submit event
    // return true if you want to continue triggering captcha validation, otherwise return false
    return false;
}
*/


// handle subscribe form
$('#subscribe-form').on('submit', function(e) {

    e.preventDefault();

    var pspi = $('input#pspi').val();
    var emailString = $('#subscribe-form input[type="email"]').val();
    //var response = grecaptcha.getResponse();

    $('#subscribe-form .form-message').text('').addClass('uk-hidden').removeClass('uk-alert-success uk-alert-danger uk-alert-primary');
    $("#subscribe-form button").text('Processing...').prop('disabled', true);

    $.ajax({
        type: "POST",
        url: $('#subscribe-form').attr('action'),
        data: {
            email: emailString,
            pspUrlKey: pspi
        },
        dataType: "json",
        cache: false,
        success: function(data) {
            $("#subscribe-form button").text('Subscribe').prop('disabled', false);
            if (data[0] == "Subscription successful.") {
                $('#subscribe-form .form-message').html('Success! Now check your inbox and <strong>confirm your subscription.</strong>').removeClass('uk-hidden').addClass('uk-alert-success');
            } else {
                $('#subscribe-form .form-message').text(data[0]).removeClass('uk-hidden').addClass('uk-alert-danger');
            }

            if (window.sendGAEvents) {
                gtag('event', 'UR_SP_subscribe_sucessfull', {
                  'event_category': 'UptimeRobot Status page',
                  'event_label': 'Successfully subscribed with email'
                });
            }
            if (window.sendGTM == true) {
                dataLayer.push({'event': 'psp-subscribe-ok'});
            }
        },
        error: function(error) {
            $("#subscribe-form button").text('Subscribe').prop('disabled', false);

            if (error.status == 409) {
                $('#subscribe-form .form-message').text(error.responseJSON[0]).removeClass('uk-hidden').addClass('uk-alert-primary');
            } else {
                $('#subscribe-form .form-message').text('There was an error while subscribing. Try again, please.').removeClass('uk-hidden').addClass('uk-alert-danger');
                Rollbar.error("PSP email subscribe error", {error: error });
            }
        }
    });

    return false;

});