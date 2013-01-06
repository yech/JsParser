
/* description: Parses end executes logic expressions. */

/* lexical grammar */
%lex
%%

\s+                   	/* skip whitespace */
[0-9]+("."[0-9]+)?\b  	{ return 'NUMBER'; }
[%\+\-\*/]				{ return yytext; }
"<="					{ return yytext; }
">="					{ return yytext; }
[><]                    { return yytext; }
"=="					{ return yytext; }
"||"					{ return yytext; }
"&&"					{ return yytext; }
"!="					{ return yytext; }
"!"                   	{ return yytext; }
"%"                   	{ return yytext; }
"("                   	{ return 'PARENTHESIS'; }
")"                   	{ return 'CLOSE_PARENTHESIS'; }
"'"(\\\'|[^\'])*"'"   	{ yytext = yytext.substr(1, yyleng-2).replace(/\\'/g,"'"); return 'STRING'; }
"false"      			{ return 'BOOL'; }
"true"       			{ return 'BOOL'; }
"."                   	{ return 'DOT'; }
<<EOF>>               	{ return 'EOF'; }

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
    	{ $$ = - Number($2); }
	;

string
	: STRING
    	{ $$ = $1; }
  	;

bool
	: BOOL
		{ $$ = $1; }
	;




