$(document).ready(function () {
    handlePostData();
    $('.btn-secondary').on('click', function () {
        history.back();
    });
});


function handlePostData() {
    const errorCode = sessionStorage.getItem('errorCode');
    const errorMessage = sessionStorage.getItem('errorMessage');
    const errorDescription = sessionStorage.getItem('errorDescription');

    if (errorCode) {
        $('.error-number').text(errorCode);
        sessionStorage.removeItem('errorCode');
    }

    if (errorMessage) {
        $('.error-title').text(errorMessage);
        sessionStorage.removeItem('errorMessage');
    }

    if (errorDescription) {
        $('.error-description').text(errorDescription);
        sessionStorage.removeItem('errorDescription');
    }
}