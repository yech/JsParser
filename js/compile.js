var Compile = function (asts) {
    this.asts = asts;
};

Compile.prototype = {
    asts:null,
    context:null,

    evaluate:function (context) {
        this.context = context;
        return true;
    }
};