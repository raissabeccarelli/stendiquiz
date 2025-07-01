(function ($) {

    "use strict";

    var fullHeight = function () {

        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });

    };
    fullHeight();

})(jQuery);

function evidenziaVoceSidebar() {
    $('#sidebar li').each(function () {
        const isActive = $(this).attr('active-page');
        if (isActive === 'true') {
            $(this).addClass('active');
        }
    });
}