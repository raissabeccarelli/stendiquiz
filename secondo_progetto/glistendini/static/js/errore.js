$(document).ready(function () {
    $('.btn-secondary').on('click', function () {
        if (document.referrer) {
            window.location.replace(document.referrer);
        } else {
            window.location.replace('/');
        }
    });
});