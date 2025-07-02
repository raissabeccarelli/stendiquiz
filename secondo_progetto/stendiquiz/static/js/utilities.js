function includiFile() {
    var includes = $('[data-include]');
    $.each(includes, function () {
        var file = '../static/assets/' + $(this).data('include') + '.html';
        if (file == '../static/assets/sidebar.html') {
            $(this).load(file, function () {
                evidenziaVoceSidebar();
            });
        }
        $(this).load(file);
    });
}