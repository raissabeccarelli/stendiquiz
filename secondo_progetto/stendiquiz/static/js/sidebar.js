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

function evidenziaVoceSidebar() {
    $('#sidebar ul li').each(function () {
        const isActive = $(this).attr('active-page');
        if (isActive) {
            alert(isActive);
            $(this).addClass('active');
        }
    });
}

function mostraAlertLogout() {
    $("#alertLogout").removeClass('d-none');
    setTimeout(function () {
        $("#alertLogout").addClass('d-none');
    }, 2000);
}