/* VALIDATE EMAIL */
function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}


/* VALIDATE URL */
function is_valid_url(url) {
    return /^(http(s)?:\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url);
}

function isCaptchaChecked() {
    return grecaptcha && grecaptcha.getResponse().length !== 0;
}

$('body').on('change', '[name="payment_freq"]', function() {

    if ($(this).prop('checked') === true) {

        $('body').addClass('yearly');

        $('body').find('.signup_link').each(function() {

            $(this).attr('href', $(this).attr('data-yearly-href'));

        });

    } else {

        $('body').removeClass('yearly');

        $('body').find('.signup_link').each(function() {

            $(this).attr('href', $(this).attr('data-monthly-href'));

        });

    }

});

$(document).on('click', 'a[href^="#"]', function(event) {
    event.preventDefault();

    var offsetTop = $($.attr(this, 'href')).offset().top;

    if ($(this).attr('href') === '#customers') {
        offsetTop += -40;
    }

    $('html, body').animate({
        scrollTop: offsetTop
    }, 500);
});

/* WORK AROUND DOUBLE EMAIL ADDRESS INPUT */
$('body').on('blur', '[name="email_address"]', function() {

    $(this).closest('fieldset').find('[name="email_address_repeat"]').val($(this).val());

});

/* SHOW HIDE SUBMIT BUTTON */
function checkSignupReady() {

    var errorCount = 0;

    $('body').find('[data-validate]').each(function() {

        if (!$(this).val()) {
            errorCount++;
        } else {

            if ($(this).attr('data-validate') === 'email' && !isValidEmailAddress($(this).val())) {
                errorCount++;
            }

        }

    });

    if ($('body').find('[name="tos_accepted"]').prop('checked') !== true) {
        errorCount++;
    }

    if (!isCaptchaChecked()) {
        errorCount++;
    }

    if (errorCount > 0) {
        // disallow signup
        $('body').find('label.submit').removeClass('enabled');
    } else {
        // allow signup
        $('body').find('label.submit').addClass('enabled');
    }

}

$('body').on('change', 'form[name="signup"] input[type="checkbox"], form[name="signup"] input[type="radio"], form[name="signup"] select', function() {
    //checkSignupReady();
});

$('body').on('blur', 'form[name="signup"] input', function() {
    //checkSignupReady();
});

/* SUBMIT */
$('body').on('submit', 'form[name="signup"]', function(event) {

    var errorCount = 0;

    $('body').find('[data-validate]').each(function() {

        if (!$(this).val()) {

            errorCount++;
            $(this).addClass('error');

        } else {

            if ($(this).attr('data-validate') === 'email' && !isValidEmailAddress($(this).val())) {

                errorCount++;
                $(this).addClass('error');

            } else {

                $(this).removeClass('error');

            }

        }

    });

    if ($('body').find('[name="tos_accepted"]').is(':visible') && $('body').find('[name="tos_accepted"]').prop('checked') !== true) {
        errorCount++;
        $('body').find('[name="tos_accepted"]').addClass('error');
    } else {
        $('body').find('[name="tos_accepted"]').removeClass('error');
    }

    if (errorCount > 0) {

        event.preventDefault();

        $(window).scrollTop(0);
        $('body').find('.alerts').show();
        $('body').find('.alerts').html('There were errors. Please try again!');

        return false;

    } else {

        $('body').find('label.submit').css('pointer-events', 'none').html('Loading ...');

        $(window).scrollTop(0);
        $('body').find('.alerts').addClass('success').show();
        $('body').find('.alerts').html('Please wait ...');

    }

});

$('body').on('submit', 'form[name="login"]', function(event) {

    var errorCount = 0;

    var emailInput = $('body').find('form[name="login"] input[name="email_address"]');
    var passwordInput = $('body').find('form[name="login"] input[name="password"]');

    if (!emailInput.val() || !passwordInput.val()) {

        errorCount++;

    } else {

        if (!isValidEmailAddress(emailInput.val())) {
            errorCount++;
        }

    }

    //console.log(errorCount);

    if (errorCount > 0) {

        event.preventDefault();

        $(window).scrollTop(0);
        $('body').find('.alerts').show();
        $('body').find('.alerts').html('Please enter your account email and password. ');

        return false;

    }

});

/* MOBILE HEADER TOGGLE */
$('body').on('click', '[data-header-toggle="true"]', function() {

    $('.header ul').slideToggle(100);
    $('body').toggleClass('overflow_hidden');

});


/* specific */

/* FAQ open-close */
$('body').on('click', '.faq .topic ul li p.question', function() {

    if ($(this).closest('li').hasClass('open')) {
        $(this).closest('li').removeClass('open');
        return;
    }

    $('body').find('.faq .topic ul li').removeClass('open');
    $(this).closest('li').addClass('open');

});


/* PRICING frequency switch */
$('body').on('click', '.cycle a', function() {

    var selectedCycle = $(this).attr('data-cycle');

    if ($(this).hasClass('selected')) {
        return;
    }

    $('body').find('.cycle a').removeClass('selected');
    $(this).addClass('selected');

    $('body').find('.monthly_data, .yearly_data').hide();
    $('body').find('.' + selectedCycle + '_data').show();

    $('body').find('ul.subscriptions li').each(function() {

        $(this).find('.signup_link').attr('href', $(this).find('.signup_link').attr('data-href-' + selectedCycle + ''));

    });

});


/* CONTACT FORM VALIDATION & SUBMIT */
$('body').on('click', 'form[name="contact"] label[for="submit"]', function(event) {

    var form = $(this).closest('form');
    var button = form.find('label[for="submit"]');

    var emailInput = form.find('[name="email_address"]');
    var firstNameInput = form.find('[name="first_name"]');
    var lastNameInput = form.find('[name="last_name"]');
    var subjectInput = form.find('[name="subject"]');
    var messageInput = form.find('[name="message"]');

    var countryCodeInput = form.find('[name="country_code"]');

    var companyNameInput = form.find('[name="company_name"]');
    var businessPhoneInput = form.find('[name="business_phone"]');
    var termsCondition = form.find('[name="tos_accepted"]');
    // reset form
    form.find('fieldset.alerts').text('').removeClass('success').addClass('hidden');

    button.removeClass('loading');
    button.text('Submit');

    var error = false;


    if (!businessPhoneInput.val()) {
        error = true;
        businessPhoneInput.addClass('error');
    } else {
        businessPhoneInput.removeClass('error');
    }


    if (!companyNameInput.val()) {
        error = true;
        companyNameInput.addClass('error');
    } else {
        companyNameInput.removeClass('error');
    }

    if (!countryCodeInput.val()) {
        error = true;
        countryCodeInput.addClass('error');
    } else {
        countryCodeInput.removeClass('error');
    }


    if (!lastNameInput.val()) {
        error = true;
        lastNameInput.addClass('error');
    } else {
        lastNameInput.removeClass('error');
    }
    if (!firstNameInput.val()) {
        error = true;
        firstNameInput.addClass('error');
    } else {
        firstNameInput.removeClass('error');
    }

    if (!emailInput.val() || !isValidEmailAddress(emailInput.val())) {
        error = true;
        emailInput.addClass('error');
    } else {
        emailInput.removeClass('error');
    }

    if (subjectInput.val() == 0) {
        error = true;
        subjectInput.addClass('error');
    } else {
        subjectInput.removeClass('error');
    }

    if (!messageInput.val()) {
        error = true;
        messageInput.addClass('error');
    } else {
        messageInput.removeClass('error');
    }

    if ($('body').find('[name="tos_accepted"]').is(':visible') && $('body').find('[name="tos_accepted"]').prop('checked') !== true) {
        error = true;
        termsCondition.addClass('error');
    }else{
        termsCondition.removeClass('error');
    }

    if (error !== false) {
        event.preventDefault();
        form.find('fieldset.alerts').removeClass('hidden').text('There were errors. Please try again.');
        return false;
    }

    button.addClass('loading');
    button.text('Sending ...');

});


/* DOCUMENTATION OUTPUT SWITCH */
$('body').on('click', '[data-output]', function() {

    $(this).closest('pre').find('div').hide();
    $(this).closest('pre').find('div.' + $(this).attr('data-output')).show();

    $(this).closest('pre').find('[data-output]').removeClass('current');
    $(this).closest('pre').find('[data-output="' + $(this).attr('data-output') + '"]').addClass('current');

});


/* INDEX EXAMPLE CODE SWITCH */
$('body').on('click', '[data-endpoint-select]', function() {

    var chosenEndpoint = $(this).attr('data-endpoint-select');

    $('body').find('[data-endpoint-select]').removeClass('selected');
    $(this).addClass('selected');

    $('body').find('[data-endpoint]').hide();
    $('body').find('[data-endpoint="' + chosenEndpoint + '"]').show();

});


/* HELPER */
function ucwords(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
        return $1.toUpperCase();
    });
}


/* TRANSLATE WEATHER DESCRIPTION TO ICON CLASS AND DISPLAY TEXT */
function weatherDescriptionToClass(description) {

    var iconClass = 'full_clouds';
    var weatherDescription = description;

    switch (description) {

        case 'Partly Cloudy':
            iconClass = 'partly_cloudy';
            break;

        case 'Haze':
        case 'Overcast':
            iconClass = 'full_clouds';
            break;

        case 'Clear':
            iconClass = 'night';
            break;

        case 'Patchy Light Drizzle':
            iconClass = 'sun_rain_clouds';
            weatherDescription = 'Light Drizzle';
            break;

        case 'Sunny':
            iconClass = 'full_sun';
            break;

        case 'Patchy Rain Possible':
            iconClass = 'cloud_slight_rain';
            weatherDescription = 'Patchy Rain';
            break;

        case 'Light Rain':
        case 'Light Rain, Mist':
            iconClass = 'cloud_slight_rain';
            break;

        case 'Moderate Or Heavy Rain Shower':
            iconClass = 'rainy';
            weatherDescription = 'Heavy Rain';
            break;

        case 'Thunder':
            iconClass = 'thunder';
            break;

        default:
            iconClass = 'full_clouds';
            break;

            // some may be missing

    }

    return [iconClass, weatherDescription];

}


/* INDEX DYNAMIC WEATHER */
$(document).ready(function() {

    if (!$('html').hasClass('index')) {
        return false;
    }

    var clientIP = $('body').find('[name="client_ip"]').val();

    $.ajax({
        url: '/ws_api.php?ip=' + clientIP,
        dataType: 'json',
        error: function(xhr, ajaxOptions, thrownError) {

            $('body').find('.weather_animated').removeClass('loading');

            console.log(xhr);
            console.log(ajaxOptions);
            console.log(thrownError);

        },
        success: function(json) {

            if (json) {

                $('body').find('.weather_animated').removeClass('loading');

                // location
                $('body').find('[data-api="location"]').text(json.location.name + ', ' + json.location.region + ', ' + json.location.country);

                // main icon and description
                var currentWeatherDescription = ucwords(json.current.weather_descriptions[0]);

                // map descripiton to icon class
                var iconClass = weatherDescriptionToClass(currentWeatherDescription)[0];
                var weatherDescription = weatherDescriptionToClass(currentWeatherDescription)[1];

                $('body').find('[data-api="current_icon"]').attr('class', iconClass);
                $('body').find('[data-api="current_main_descr"]').text(weatherDescription);

                // misc data
                $('body').find('[data-api="current_wind_speed"]').text('Wind: ' + json.current.wind_speed + ' kmph');
                $('body').find('[data-api="current_precip"]').text('Precip: ' + json.current.precip + ' mm');
                $('body').find('[data-api="current_pressure"]').text('Pressure: ' + json.current.pressure + ' mb');
                $('body').find('[data-api="current_temperature"]').text(json.current.temperature + '°c');

                // 5-day forecast
                var totalForecastDays = 5;
                var currentForecastDays = 0;
                var forecastDays = '';

                var forecastWeek = $('body').find('[data-api="forecast_week"]');

                // map weekday names with numbers
                var weekday = new Array(7);
                weekday[0] = "SUN";
                weekday[1] = "MON";
                weekday[2] = "TUE";
                weekday[3] = "WED";
                weekday[4] = "THU";
                weekday[5] = "FRI";
                weekday[6] = "SAT";

                $.each(json.forecast, function(i) {

                    currentForecastDays++;

                    if (currentForecastDays === 1) {
                        return true;
                    }

                    var dateObject = new Date(i);
                    var thisWeekDay = weekday[dateObject.getDay()];

                    var thisDayIcon = weatherDescriptionToClass(ucwords(json.forecast[i].hourly[0].weather_descriptions[0]))[0];

                    // add this day to forecastDays
                    forecastDays = forecastDays + '<div class="day"><span class="name">' + thisWeekDay + '</span>';
                    forecastDays = forecastDays + '<i class="' + thisDayIcon + '"></i>';
                    forecastDays = forecastDays + '<span class="temperature">' + json.forecast[i].avgtemp + ' °c</span></div>';

                });

                forecastWeek.html(forecastDays);

            } else {

                console.log('error fetching json');

                $('body').find('.weather_animated').removeClass('loading');

            }

        }

    });

});
var countries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CA', 'GB'];

$(document).ready(function() {

    if(countries.indexOf($('#country_code').val()) == -1) {
    	$('#email-service-updates').hide();
    	$('#tos-accepted').hide();
		jQuery('#tos-accepted input').remove();
		jQuery('#email-service-updates input').remove()
		jQuery('#email_service_exists').val("");
    }else {
        $('#email-service-updates').show();
    	$('#tos-accepted').show();
		if(jQuery('#email-service-updates #email_service_updates').length == 0 ){
			jQuery('#email-service-updates').prepend('<input value="1" type="checkbox" name="email_service_updates" id="email_service_updates">');
			jQuery('#email_service_exists').val("1");
		}
		if(jQuery('#tos-accepted #tos_accepted').length == 0 ){
			jQuery('#tos-accepted').prepend('<input value="1" type="checkbox" name="tos_accepted" id="tos_accepted">');
		}
    }

	$('#country_code').change(function(){
	    if(countries.indexOf($(this).val()) == -1) {
			$('#email-service-updates').hide();
    		$('#tos-accepted').hide();
	    	jQuery('#tos-accepted input').remove();
			jQuery('#email-service-updates input').remove();
			jQuery('#email_service_exists').val("");
	    }else {
			$('#email-service-updates').show();
    		$('#tos-accepted').show();
			if(jQuery('#email-service-updates #email_service_updates').length == 0 ){
				jQuery('#email-service-updates').prepend('<input value="1" type="checkbox" name="email_service_updates" id="email_service_updates">');
				jQuery('#email_service_exists').val("1");
			}
			else {
			}
	        if(jQuery('#tos-accepted #tos_accepted').length == 0 ){
				jQuery('#tos-accepted').prepend('<input value="1" type="checkbox" name="tos_accepted" id="tos_accepted">');
			}
	    }
	});
});

// Popup Contact
$( 'a.apilayer-support' ).click(function(e) {
    e.preventDefault();
    $('#ownership-popup').show();
    window.location.href="https://apilayer.com/support";
});