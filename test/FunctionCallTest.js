describe("test function call", function () {
    it("test function call parenthesis", function () {
        expect(new Compile(expression.parse("f(2,($a+2))"),{f:function(p1,p2){return p1+p2},fa:function(p){return p+1}}).evaluate({a:1,b:2})).toEqual(5);
        expect(new Compile(expression.parse("f(2+3,($a+2))"),{f:function(p1,p2){return p1+p2},fa:function(p){return p+1}}).evaluate({a:1,b:2})).toEqual(8);
        expect(new Compile(expression.parse("f(1,(2+3)+2)"),{f:function(p1,p2){return p1+p2},fa:function(p){return p+1}}).evaluate({a:1,b:2})).toEqual(8);
        expect(new Compile(expression.parse("fa((2+3)+2)"),{f:function(p1,p2){return p1+p2},fa:function(p){return p+1}}).evaluate({a:1,b:2})).toEqual(8);
        expect(new Compile(expression.parse("fa((1),1)"),{f:function(p1,p2){return p1+p2},fa:function(p){return p+1}}).evaluate({a:1,b:2})).toEqual(2);
    });
});