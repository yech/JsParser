var Compile = function (asts) {
    this.asts = asts;
};

Compile.prototype = {
    asts:null,
    context:null,

    evaluate:function (context) {
        this.context = (context !== undefined) ? context : {};
        return this.getExpression(this.asts);
    },

    getReferenceNameArray:function () {
        this.references = {};
        this.getRef(this.asts);
        var ret = [];
        for(var key in this.references){
            if(this.references.hasOwnProperty(key)){
                ret.push(key);
            }
        }
        return ret;
    },

    getRef:function (ast) {
        var exp = ast.expression;
        var type = ast.type;
        if (type === 'expression') {
            switch (ast.operator) {
                case '+':
                case '-':
                case '/':
                case '%':
                case '*':
                case '||':
                case '&&':
                case '>':
                case '<':
                case '==':
                case '>=':
                case '<=':
                case '!=':
                    this.getRef(exp[0]);
                    this.getRef(exp[1]);
                    break;
                case 'minus':
                case 'not':
                case 'parenthesis':
                    this.getRef(exp[0]);
                    break;
                default:
            }
        } else {
            if (type === 'references') {
                if (this.references[ast.id] === undefined) {
                    this.references[ast.id] = null;
                }
                if (ast.path !== undefined) {
                    for (var i = 0; i < ast.path.length; i++) {
                        var property = ast.path[i];
                        if(property.type==='index'){
                            var indexAst = property.id;
                            if (indexAst.type === 'references') {
                                this.getRef(indexAst);
                            }
                        } else if (property.type === 'method') {
                            if (property.args !== undefined) {
                                for (var argIndex = 0; argIndex < property.args.length; argIndex++) {
                                    var arg = property.args[argIndex];
                                    if(arg.type === 'references'){
                                        this.getRef(arg);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    getExpression:function (ast) {
        var exp = ast.expression;
        var ret;
        if (ast.type === 'expression') {

            switch (ast.operator) {
                case '+':
                    ret = this.getExpression(exp[0]) + this.getExpression(exp[1]);
                    break;

                case '-':
                    ret = this.getExpression(exp[0]) - this.getExpression(exp[1]);
                    break;

                case '/':
                    ret = this.getExpression(exp[0]) / this.getExpression(exp[1]);
                    break;

                case '%':
                    ret = this.getExpression(exp[0]) % this.getExpression(exp[1]);
                    break;

                case '*':
                    ret = this.getExpression(exp[0]) * this.getExpression(exp[1]);
                    break;

                case '||':
                    ret = this.getExpression(exp[0]) || this.getExpression(exp[1]);
                    break;

                case '&&':
                    ret = this.getExpression(exp[0]) && this.getExpression(exp[1]);
                    break;

                case '>':
                    ret = this.getExpression(exp[0]) > this.getExpression(exp[1]);
                    break;

                case '<':
                    ret = this.getExpression(exp[0]) < this.getExpression(exp[1]);
                    break;

                case '==':
                    ret = this.getExpression(exp[0]) == this.getExpression(exp[1]);
                    break;

                case '>=':
                    ret = this.getExpression(exp[0]) >= this.getExpression(exp[1]);
                    break;

                case '<=':
                    ret = this.getExpression(exp[0]) <= this.getExpression(exp[1]);
                    break;

                case '!=':
                    ret = this.getExpression(exp[0]) != this.getExpression(exp[1]);
                    break;

                case 'minus':
                    ret = -this.getExpression(exp[0]);
                    break;

                case 'not':
                    ret = !this.getExpression(exp[0]);
                    break;

                case 'parenthesis':
                    ret = this.getExpression(exp[0]);
                    break;

                default:
                    return undefined;
            }

            return ret;
        } else {
            return this.getLiteral(ast);
        }
    },

    getLiteral:function (literal) {

        var type = literal.type;
        var ret = '';

        if (type == 'string') {
            ret = literal.value;
        } else if (type == 'number') {
            ret = Number(literal.value);
        } else if (type == 'bool') {
            if (literal.value === "null") {
                ret = null;
            } else if (literal.value === 'false') {
                ret = false;
            } else if (literal.value === 'true') {
                ret = true;
            }
        } else {
            return this.getReferences(literal);
        }

        return ret;
    },

    getReferences:function (ast) {
        var context = this.context;
        var ret = context[ast.id];
        if (ast.path !== undefined && ret !== undefined) {
            for (var i = 0; i < ast.path.length; i++) {
                var property = ast.path[i];
                ret = this.getAttributes(property, ret);
                if (ret === undefined) break;
            }
        }
        return ret;
    },

    getAttributes:function (property, baseRef) {
        /**
         * type可以是method, index, property
         */
        var type = property.type;
        var ret;
        var id = property.id;
        if (type === 'method') {
            ret = this.getPropMethod(property, baseRef);
        } else if (type === 'property') {
            ret = baseRef[id];
        } else {
            ret = this.getPropIndex(property, baseRef);
        }
        return ret;
    },


    getPropMethod:function (property, baseRef) {

        var id = property.id;
        var ret = baseRef[id];
        var args = [];

        if (property.args !== undefined) {
            for (var i = 0; i < property.args.length; i++) {
                args.push(this.getLiteral(property.args[i]));
            }
        }

        if (ret && ret.call) {
            ret = ret.apply(baseRef, args);
        } else {
            ret = undefined;
        }


        return ret;
    },

    getPropIndex:function (property, baseRef) {
        var ast = property.id;
        var key;
        if (ast.type === 'references') {
            key = this.getReferences(ast);
        } else {
            key = ast.value;
        }

        var ret;
        ret = baseRef[key];

        return ret;
    }
};