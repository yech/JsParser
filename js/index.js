var runParser = function () {
    var $out = $("#astsOut");
    var $evalOut = $("#evaluationOut");
    var $refOut = $("#refOut");
    var printOut = function (str) {
        $out.html(str);
    };
    var source = $("#source").val();
    try {
        if (expression !== undefined) {
            $out.removeClass("bad").addClass('good');
            var asts = expression.parse(source);
            printOut(JSON.stringify(asts));
            var compile = new Compile(asts);
            var context = $.parseJSON($("#context").val());

            $evalOut.removeClass("bad").addClass('good').text(compile.evaluate(context));
            var refs = compile.getReferenceNameArray();
            var refsText = '';
            for (var i = 0; i < refs.length; i++) {
                refsText += (refs[i] + ((i !== refs.length - 1) ? ',' : ''));
            }
            $refOut.removeClass("bad").addClass('good').text(refsText);

        }
    } catch (e) {
        $out.removeClass("good").addClass('bad');
        $evalOut.removeClass("good").addClass('bad');
        $refOut.removeClass("good").addClass('bad');
        printOut(e.message || e);
    }
};

$(document).ready(function () {
    $("#parse_btn").on("click", runParser);
});