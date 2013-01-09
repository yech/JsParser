/* description: Parses end executes logic expressions. */

/* lexical grammar */
%lex
%x mu b m
%%

<INITIAL,b,m>[.]*?/"$"						{ this.begin("mu"); }
<INITIAL,b,m>\s+						/* skip whitespace */
<INITIAL,b,m>[0-9]+("."[0-9]+)?\b				{ return 'NUMBER'; }
[%\+\-\*/]							{ return yytext; }
"<="								{ return yytext; }
">="								{ return yytext; }
[><]								{ return yytext; }
"=="								{ return yytext; }
"||"								{ return yytext; }
"&&"								{ return yytext; }
"!="								{ return yytext; }
"!"								{ return yytext; }
"="								{ return 'EQUAL'; }
"("								{ return 'PARENTHESIS'; }
")"								{ return 'CLOSE_PARENTHESIS'; }
<INITIAL,b,m>"null"						{ return 'BOOL'; }
<INITIAL,b,m>"false"						{ return 'BOOL'; }
<INITIAL,b,m>"true"						{ return 'BOOL'; }
<INITIAL,b,m>"'"(\\\'|[^\'])*"'"				{ yytext = yytext.substr(1, yyleng-2).replace(/\\'/g,"'"); return 'STRING'; }
<mu>"$"/[{a-zA-Z_]						{ return 'DOLLAR'; }
<mu>[_a-zA-Z][a-zA-Z0-9_]*					{ return 'ID'; }
<mu>"."								{ return 'DOT'; }
<mu,m>","[ ]*							{ return 'COMMA'; }
<mu,b,m>"["							{ this.begin("b"); return 'BRACKET'; }
<b>"]"								{ this.popState(); return 'CLOSE_BRACKET'; }
<mu>"("								{ this.begin("m"); return 'PARENTHESIS'; }
<m>")"								{ this.popState(); return 'CLOSE_PARENTHESIS'; }
<mu>\s+								{ this.popState(); }
<mu>/.								{ this.popState(); }
<mu><<EOF>>							{ this.popState(); return 'EOF'; }
<INITIAL><<EOF>>						{ return 'EOF'; }

/lex

/* operator associations and precedence */

%left '||' '&&'
%left '>=' '<=' '>' '==' '<' '!='
%left '+' '-'
%left '*' '/' '%'
%left '!'

%start expressions

%% /* language grammar */

expressions
    : expression EOF
        { return $1; }
    ;

expression
    : expression '||' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '&&' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | '!' expression
        { $$ = {type: 'expression', expression: [$2], operator: 'not' }; }
    | expression '>' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '<' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '==' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '>=' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '<=' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '!=' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '+' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '-' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '*' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '/' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | expression '%' expression
        { $$ = {type: 'expression', expression: [$1, $3], operator: $2 }; }
    | literal
        { $$ = $1; }
    | parenthesis
        { $$ = $1; }
    | references
	{ $$ = $1; }
    | '-' parenthesis
        { $$ = {type: 'expression', expression: [$2], operator: 'minus' }; }
    ;

parenthesis
    : PARENTHESIS expression CLOSE_PARENTHESIS
        { $$ = {type: 'expression', expression: [$2], operator: 'parenthesis' }; }
    ;

literal
    : string
        { $$ = {type: 'string', value: $1 }; }
    | number
        { $$ = {type: 'number', value: $1 }; }
    | bool
        { $$ = {type: 'bool', value: $1 }; }
    ;

number
    : NUMBER
        { $$ = $1; }
    | '-' NUMBER
        { $$ = '-' + $2; }
    ;

string
    : STRING
        { $$ = $1; }
    ;

bool
    : BOOL
        { $$ = $1; }
    ;

references
	: DOLLAR ID attributes
		{ $$ = {type: "references", id: $2, path: $3}; }
	| DOLLAR ID
		{ $$ = {type: "references", id: $2}; }
	;

attributes
	: attribute
		{ $$ = [$1]; }
	| attributes attribute
		{ $$ = [].concat($1, $2); }
	;

attribute
	: method
		{ $$ = {type:"method", id: $1.id, args: $1.args }; }
	| index
		{ $$ = {type: "index", id: $1 }; }
	| property
		{ $$ = {type: "property", id: $1 };}
	;

method
	: DOT methodbd
		{ $$ = $2; }
	;

methodbd
	: ID PARENTHESIS params CLOSE_PARENTHESIS
		{ $$ = {id: $1, args: $3 }; }
	| ID PARENTHESIS CLOSE_PARENTHESIS
		{ $$ = {id: $1, args: undefined }; }
	;

params
	: literal
		{ $$ = [$1]; }
	| references
		{ $$ = [$1]; }
	| params COMMA literal
		{ $$ = [].concat($1, $3); }
	| params COMMA references
		{ $$ = [].concat($1, $3); }
	;

property
	: DOT ID
		{ $$ = $2; }
	;

index
	: BRACKET literal CLOSE_BRACKET
		{ $$ = $2; }
	| BRACKET references CLOSE_BRACKET
		{ $$ = $2; }
	;
