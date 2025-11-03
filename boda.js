window.recaptchaRenderedV2 = false;
window.recaptchaFallback = false;
window.recaptchaSiteKeyV2 = '6LebRIorAAAAAEBCYCVXLpZKNt1KxwfbefWqDvFL';

function gdprConfirmed() {
    return true;
}

function dynamicLoadScript() {
    var script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6LeLEPcrAAAAAJm_K2ZdBC2VHjbUfsqTZZhER0vh';
    script.async = true;
    script.onload = function () {
        var event = new CustomEvent("recaptchaLoaded");
        document.dispatchEvent(event);
    };
    document.body.appendChild(script);
}

function showRecaptchaError(error) {
    error = error || '';
    var formError = document.querySelector('.u-form-send-error');

    if (formError) {
        formError.innerText = 'Error de propietario del Sitio: ' + error.replace(/:[\s\S]*/, '');
        formError.style.display = 'block';
    }

    console.error('Error in grecaptcha: ', error);
}

document.addEventListener('DOMContentLoaded', function () {
    var confirmButtons = document.querySelectorAll('.u-cookies-consent .u-button-confirm');
    confirmButtons.forEach(function (button) {
        button.onclick = dynamicLoadScript;
    });
});

document.addEventListener("DOMContentLoaded", function () {
    if (!gdprConfirmed()) {
        return;
    }
    dynamicLoadScript();
});

document.addEventListener("recaptchaLoaded", function () {
    if (!gdprConfirmed()) {
        return;
    }

    (function (grecaptcha, sitekey, actions) {
        var recaptcha = {
            execute: function (action, submitFormCb) {
                if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') {
                    showRecaptchaError('reCAPTCHA script failed to load.');
                    return;
                }

                try {
                    grecaptcha.execute(sitekey, { action: action }).then((token) => {
                        if (!token) {
                            throw new Error('Empty token received from reCAPTCHA');
                        }

                        var forms = document.getElementsByTagName('form');

                        for (var i = 0; i < forms.length; i++) {
                            var response = forms[i].querySelector('[name="recaptchaResponse"]');

                            if (!response) {
                                response = document.createElement('input');
                                response.setAttribute('type', 'hidden');
                                response.setAttribute('name', 'recaptchaResponse');
                                forms[i].appendChild(response);
                            }

                            response.value = token;
                        }

                        submitFormCb();
                    }).catch((e) => {
                        showRecaptchaError(e.message);
                    });
                } catch (e) {
                    showRecaptchaError(e.message);
                }
            },

            executeContact: function (submitFormCb) {
                recaptcha.execute(actions['contact'], submitFormCb);
            }
        };

        window.recaptchaObject = recaptcha;
        window.grecaptchaObject = grecaptcha;
    })(
        grecaptcha,

        '6LeLEPcrAAAAAJm_K2ZdBC2VHjbUfsqTZZhER0vh',
        { 'contact': 'contact' }
    );
});

window.showRecaptchaV2 = function (form) {
    if (!form || !form.length) {
        return;
    }
    if (typeof window.grecaptchaObject === 'undefined' || !window.grecaptchaObject) {
        return;
    }

    const formEl = form[0];

    let container = document.getElementById('recaptcha-v2-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-v2-container';
        formEl.parentElement.appendChild(container);
    }

    let tokenReceived = false;
    let timeoutHandle;

    if (window.recaptchaRenderedV2 === false || typeof window.recaptchaRenderedV2 === 'undefined') {
        window.recaptchaRenderedV2 = window.grecaptchaObject.render('recaptcha-v2-container', {
            'sitekey': window.recaptchaSiteKeyV2,
            'size': 'invisible',
            'callback': function (token) {
                clearTimeout(timeoutHandle);

                if (!token) {
                    showRecaptchaError('reCAPTCHA v2 token was empty. Please try again.');
                    return;
                }

                tokenReceived = true;

                let recaptchaResponseV2 = formEl.querySelector('input[name="recaptchaResponseV2"]');

                if (!recaptchaResponseV2) {
                    recaptchaResponseV2 = document.createElement('input');
                    recaptchaResponseV2.type = 'hidden';
                    recaptchaResponseV2.name = 'recaptchaResponseV2';
                    formEl.appendChild(recaptchaResponseV2);
                }

                recaptchaResponseV2.value = token;

                if (window.recaptchaSiteKeyV2) {
                    let siteKeyInput = formEl.querySelector('input[name="siteKey"]');

                    if (siteKeyInput) {
                        siteKeyInput.value = window.recaptchaSiteKeyV2;
                    }
                }

                document.querySelectorAll('.u-form-send-error').forEach(el => {
                    el.style.display = 'none';
                });

                const event = new CustomEvent('submit', {
                    detail: { recaptchaPassed: true },
                    bubbles: true,
                    cancelable: true,
                });

                formEl.dispatchEvent(event);
            },
            'error-callback': function () {
                clearTimeout(timeoutHandle);
                showRecaptchaError('reCAPTCHA v2 error. Please try again.');
            },
            'expired-callback': function () {
                clearTimeout(timeoutHandle);
            }
        });

        window.grecaptchaObject.reset(window.recaptchaRenderedV2);

        setTimeout(() => {
            window.grecaptchaObject.execute(window.recaptchaRenderedV2);
        }, 300);

        timeoutHandle = setTimeout(function () {
            if (!tokenReceived) {
                showRecaptchaError('The Contact Form could not be submitted because Google reCAPTCHA v3 detected unusual activity from your connection. Please try again later, or complete the reCAPTCHA v2 challenge if it appears.');
            }
        }, 120000);
    } else {
        window.grecaptchaObject.reset(window.recaptchaRenderedV2);

        setTimeout(() => {
            window.grecaptchaObject.execute(window.recaptchaRenderedV2);
        }, 300);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        const btn = e.target;
        if (btn.classList.contains('u-form-send-message-close')) {
            e.preventDefault();
            const parent = btn.closest('.u-form-send-message');
            if (parent && parent.classList.contains('u-form-send-success')) {
                window.location.href = 'index.html';
            } else if (parent && parent.classList.contains('u-form-send-error')) {
                window.location.href = 'RSPV.html';
            }
        }
    });
});
