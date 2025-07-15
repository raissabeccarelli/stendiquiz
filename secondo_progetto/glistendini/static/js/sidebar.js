(function ($) {

    "use strict";

    var fullHeight = function () {

        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });

    };

    fullHeight();
}); (jQuery);

function mostraAlertLogout() {
    $("#alertLogout").removeClass('d-none');
    setTimeout(function () {
        $("#alertLogout").addClass('d-none');
    }, 2000);
}