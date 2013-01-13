describe("test expression", function () {

    var roundNumber = function (number, position) {
        return Math.round(number * 10 ^ position) / (10 ^ position);
    };

    describe("test parse", function () {
        describe("test literal", function () {
            it("test bool", function () {
                expect(expression.parse("true")).toEqual({type:"bool", value:"true"});
                expect(expression.parse("false")).toEqual({type:"bool", value:"false"});
                expect(expression.parse("null")).toEqual({type:"bool", value:"null"});
            });

            it("test number", function () {
                expect(expression.parse("1.5")).toEqual({type:"number", value:"1.5"});
                expect(expression.parse("-1.5")).toEqual({type:"number", value:"-1.5"});
            });

            it("test string", function () {
                expect(expression.parse("'abc'")).toEqual({type:"string", value:"abc"});
            });
        });

        describe("test math expression", function () {
            it("test +", function () {
                expect(expression.parse("1+2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"+"});
            });

            it("test -", function () {
                expect(expression.parse("1-2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"-"});
            });

            it("test *", function () {
                expect(expression.parse("1*2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"*"});
            });

            it("test /", function () {
                expect(expression.parse("1/2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"/"});
            });

            it("test %", function () {
                expect(expression.parse("1%2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"%"});
            });
        });

        describe("test logic expression", function () {

            it("test &&", function () {
                var asts = expression.parse("true && false");
                expect(asts).toEqual({type:"expression", expression:[
                    {type:"bool", value:"true"},
                    {type:"bool", value:"false"}
                ], operator:"&&"});
            });

            it("test ||", function () {
                var asts = expression.parse("true || false");
                expect(asts).toEqual({type:"expression", expression:[
                    {type:"bool", value:"true"},
                    {type:"bool", value:"false"}
                ], operator:"||"});
            });

            it("test !", function () {
                var asts = expression.parse("! true");
                expect(asts).toEqual({type:"expression", expression:[
                    {type:"bool", value:"true"}
                ], operator:"not"});
            });
        });

        describe("test compare expression", function () {
            it("test >", function () {
                expect(expression.parse("1>2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:">"});
            });

            it("test >=", function () {
                expect(expression.parse("1>=2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:">="});
            });

            it("test <", function () {
                expect(expression.parse("1<2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"<"});
            });

            it("test <=", function () {
                expect(expression.parse("1<=2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"<="});
            });

            it("test ==", function () {
                expect(expression.parse("1==2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"=="});
            });

            it("test !=", function () {
                expect(expression.parse("1!=2")).toEqual({type:"expression", expression:[
                    {type:"number", value:"1"},
                    {type:"number", value:"2"}
                ], operator:"!="});
            })

        });

        describe("test parenthesis expression", function () {
            it("test parenthesis", function () {
                expect(expression.parse("(true)")).toEqual({type:"expression", expression:[
                    {type:"bool", value:"true"}
                ], operator:"parenthesis"});
            });
            it("test - parenthesis", function () {
                expect(expression.parse("-(true)")).toEqual({type:"expression", expression:[
                    {type:"expression", expression:[
                        {type:"bool", value:"true"}
                    ], operator:"parenthesis"}
                ], operator:"minus"});
            });
        });

    });

    describe("test evaluate", function () {

        it("test literal evaluate", function () {
            expect(new Compile(expression.parse("1")).evaluate({})).toEqual(1);
            expect(new Compile(expression.parse("1.2")).evaluate({})).toEqual(1.2);
            expect(new Compile(expression.parse("-1")).evaluate({})).toEqual(-1);
            expect(new Compile(expression.parse("true")).evaluate({})).toBeTruthy();
            expect(new Compile(expression.parse("false")).evaluate({})).toBeFalsy();
            expect(new Compile(expression.parse("null")).evaluate({})).toBeNull();
            expect(new Compile(expression.parse("'abc'")).evaluate({})).toEqual("abc");
        });


        it("test math evaluate", function () {
            expect(new Compile(expression.parse("1+2")).evaluate({})).toEqual(3);
            expect(new Compile(expression.parse("1.2+2.3")).evaluate({})).toEqual(3.5);
            expect(new Compile(expression.parse("2-1")).evaluate({})).toEqual(1);
            expect(roundNumber(new Compile(expression.parse("2.2-1.2")).evaluate({}), 3)).toEqual(1.0);
            expect(new Compile(expression.parse("1*2")).evaluate({})).toEqual(2);
            expect(new Compile(expression.parse("4/2")).evaluate({})).toEqual(2);
            expect(new Compile(expression.parse("4%2")).evaluate({})).toEqual(0);
            expect(new Compile(expression.parse("$a")).evaluate({a:1})).toEqual(1);
            expect(new Compile(expression.parse("$a+1")).evaluate({a:1})).toEqual(2);
            expect(new Compile(expression.parse("$a-1")).evaluate({a:2})).toEqual(1);
            expect(new Compile(expression.parse("$a*2")).evaluate({a:1})).toEqual(2);
            expect(new Compile(expression.parse("$a/2")).evaluate({a:2})).toEqual(1);
            expect(new Compile(expression.parse("$a+'1'")).evaluate({a:"1"})).toEqual("11");
            expect(new Compile(expression.parse("$a+$b")).evaluate({a:1,b:2})).toEqual(3);
        });


        describe("test logic evaluate", function () {
            it("test &&", function () {
                expect(new Compile(expression.parse("true && false")).evaluate({})).toBeFalsy();
                expect(new Compile(expression.parse("$a && $b")).evaluate({a:false,b:true})).toBeFalsy();

            });

            it("test ||", function () {
                expect(new Compile(expression.parse("true || false")).evaluate({})).toBeTruthy();
                expect(new Compile(expression.parse("$a || $b")).evaluate({a:false,b:true})).toBeTruthy();
            });

            it("test !", function () {
                expect(new Compile(expression.parse("!true")).evaluate({})).toBeFalsy();
                expect(new Compile(expression.parse("!false")).evaluate({})).toBeTruthy();
                expect(new Compile(expression.parse("!$a")).evaluate({a:false,b:true})).toBeTruthy();
                expect(new Compile(expression.parse("!$b")).evaluate({a:false,b:true})).toBeFalsy();
            })
        });


        it("test compare evaluate", function () {
            expect(new Compile(expression.parse("1>1")).evaluate({})).toBeFalsy();
            expect(new Compile(expression.parse("1>=1")).evaluate({})).toBeTruthy();
            expect(new Compile(expression.parse("1<1")).evaluate({})).toBeFalsy();
            expect(new Compile(expression.parse("1<=1")).evaluate({})).toBeTruthy();
            expect(new Compile(expression.parse("1==1")).evaluate({})).toBeTruthy();
            expect(new Compile(expression.parse("1!=1")).evaluate({})).toBeFalsy();
            expect(new Compile(expression.parse("$a>$b")).evaluate({a:1,b:1})).toBeFalsy();
            expect(new Compile(expression.parse("$a>$b")).evaluate({a:"2",b:"1"})).toBeTruthy();
            expect(new Compile(expression.parse("$a>=$b")).evaluate({a:1,b:1})).toBeTruthy();
            expect(new Compile(expression.parse("$a<$b")).evaluate({a:1,b:1})).toBeFalsy();
            expect(new Compile(expression.parse("$a<=$b")).evaluate({a:1,b:1})).toBeTruthy();
            expect(new Compile(expression.parse("$a==$b")).evaluate({a:1,b:1})).toBeTruthy();
            expect(new Compile(expression.parse("$a!=$b")).evaluate({a:1,b:1})).toBeFalsy();
        });


        describe("test parenthesis evaluate", function () {
            it("test parenthesis", function () {
                expect(new Compile(expression.parse("2*(1+2)")).evaluate({})).toEqual(6);
                expect(new Compile(expression.parse("2*($a+$b)")).evaluate({a:1,b:2})).toEqual(6);
            });
            it("test - parenthesis", function () {
                expect(new Compile(expression.parse("-(2*(1+2))")).evaluate({})).toEqual(-6);
                expect(new Compile(expression.parse("-(2*($a+$b))")).evaluate({a:1,b:2})).toEqual(-6);
            });
        });

        describe("test reference evaluate", function () {
            it("test index",function(){
                expect(new Compile(expression.parse("$a[0]")).evaluate({a:[1,2,3]})).toEqual(1);
                expect(new Compile(expression.parse("$a[0]+$a[1]")).evaluate({a:[1,3,5]})).toEqual(4);
                expect(new Compile(expression.parse("$a['a']+$b['b']")).evaluate({a:{a:1,b:2},b:{a:1,b:2}})).toEqual(3);
                expect(new Compile(expression.parse("$a[$b]")).evaluate({a:[1,3,6],b:2})).toEqual(6);

            });
            it("test property",function(){
                expect(new Compile(expression.parse("$a.a")).evaluate({a:{a:1,b:2}})).toEqual(1);
                expect(new Compile(expression.parse("$a.b")).evaluate({a:{a:1,b:2}})).toEqual(2);
                expect(new Compile(expression.parse("$b.b")).evaluate({a:1,b:{e:2,b:3}})).toEqual(3);
                expect(new Compile(expression.parse("$a.b.b")).evaluate({a:{a:1,b:{a:3,b:5}}})).toEqual(5);
            });
            it("test method",function(){
                expect(new Compile(expression.parse("$a.fn()")).evaluate({a:{a:1,b:2,fn:function(){return this.a+this.b}}})).toEqual(3);
                expect(new Compile(expression.parse("$a.fn(1,2,3)")).evaluate({a:{a:1,b:2,fn:function(p1,p2,p3){return p1+p2+p3}}})).toEqual(6);
                expect(new Compile(expression.parse("$a.fn($b)")).evaluate({a:{a:1,fn:function(p1){return p1+1}},b:4})).toEqual(5);
                expect(new Compile(expression.parse("$a.fn($a.b)")).evaluate({a:{a:1,b:2,fn:function(p1){return p1+1}},b:4})).toEqual(3);
            });
        });

    });

    describe("test references",function(){
        it("test references",function(){
            expect(new Compile(expression.parse("$a")).getReferenceNameArray()).toEqual(["a"]);
            expect(new Compile(expression.parse("$a+$b")).getReferenceNameArray()).toEqual(["a","b"]);
            expect(new Compile(expression.parse("$a[$c]+$b")).getReferenceNameArray()).toEqual(["a","c","b"]);
            expect(new Compile(expression.parse("$a[$c]+$b[$d][$e]")).getReferenceNameArray()).toEqual(["a","c","b","d","e"]);
            expect(new Compile(expression.parse("$a.c+$b")).getReferenceNameArray()).toEqual(["a","b"]);
            expect(new Compile(expression.parse("$a.abc($c,$d)+$b")).getReferenceNameArray()).toEqual(["a","c","d","b"]);
        });
    });

});