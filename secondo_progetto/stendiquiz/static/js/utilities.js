function includiFile() {
    var includes = $('[data-include]');
    $.each(includes, function () {
        var file = '../static/assets/' + $(this).data('include') + '.html';
        $(this).load(file);
    });
}