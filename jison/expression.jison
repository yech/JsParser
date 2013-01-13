/* description: Parses end executes logic expressions. */

/* lexical grammar */
%lex
%x ref b p func
%%

<INITIAL,b,p,func>[.]*?/"$"                           { this.begin("ref"); }
[a-zA-Z][a-zA-Z_]*?/"("                               { this.begin("func"); return 'ID'; }
<INITIAL,b,p,func>\s+                                 /* skip whitespace */
<INITIAL,b,p,func>[0-9]+("."[0-9]+)?\b                { return 'NUMBER'; }
<INITIAL,ref,b,p,func>[%\+\-\*/]                      { return yytext; }
<INITIAL,p,func>"<="                                  { return yytext; }
<INITIAL,p,func>">="                                  { return yytext; }
<INITIAL,p,func>[><]                                  { return yytext; }
<INITIAL,p,func>"=="                                  { return yytext; }
<INITIAL,p,func>"||"                                  { return yytext; }
<INITIAL,p,func>"&&"                                  { return yytext; }
<INITIAL,p,func>"!="                                  { return yytext; }
<INITIAL,p,func>"!"                                   { return yytext; }
<INITIAL,p,func>"="                                   { return 'EQUAL'; }
<INITIAL,p,func>"null"                                { return 'BOOL'; }
<INITIAL,p,func>"false"                               { return 'BOOL'; }
<INITIAL,p,func>"true"                                { return 'BOOL'; }
<INITIAL,b,p,func>"'"(\\\'|[^\'])*"'"                 { yytext = yytext.substr(1, yyleng-2).replace(/\\'/g,"'"); return 'STRING'; }
<ref>"$"/[{a-zA-Z_]                                   { return 'DOLLAR'; }
<ref>[_a-zA-Z][a-zA-Z0-9_]*                           { return 'ID'; }
<ref>"."                                              { return 'DOT'; }
<ref,p,func>","[ ]*                                   { return 'COMMA'; }
<ref,b,p>"["                                          { this.begin("b"); return 'BRACKET'; }
<b>"]"                                                { this.popState(); return 'CLOSE_BRACKET'; }
<INITIAL,b,func>"("                                   { return 'PARENTHESIS'; }
<INITIAL,b>")"                                        { return 'CLOSE_PARENTHESIS'; }
<ref,p>"("                                            { this.begin("p"); return 'PARENTHESIS'; }
<p,func>")"                                           { this.popState(); return 'CLOSE_PARENTHESIS'; }
<ref>\s+                                              { this.popState(); }
<ref>/.                                               { this.popState(); }
<ref,func><<EOF>>                                     { this.popState(); return 'EOF'; }
<INITIAL><<EOF>>                                      { return 'EOF'; }

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
    | functionCall
        { $$ = {type: 'functionCall', id: $1.id, args: $1.args }; }
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
        { $$ = {type: 'references', id: $2, path: $3}; }
    | DOLLAR ID
        { $$ = {type: 'references', id: $2}; }
    ;

attributes
    : attribute
        { $$ = [$1]; }
    | attributes attribute
        { $$ = [].concat($1, $2); }
    ;

attribute
    : method
        { $$ = {type: 'method', id: $1.id, args: $1.args }; }
    | index
        { $$ = {type: 'index', id: $1 }; }
    | property
        { $$ = {type: 'property', id: $1 };}
    ;

method
    : DOT functionCall
        { $$ = $2; }
    ;

functionCall
    : ID PARENTHESIS params CLOSE_PARENTHESIS
        { $$ = {id: $1, args: $3 }; }
    | ID PARENTHESIS CLOSE_PARENTHESIS
        { $$ = {id: $1, args: undefined }; }
    ;
/*
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
*/
params
    : expression
        { $$ = [$1]; }
    | params COMMA expression
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