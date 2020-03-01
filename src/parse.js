class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.ast = new AST(this.lexer);
    this.astCompiler = new ASTCompiler(this.ast);
  }
  parse(text) {
    return this.astCompiler.compile(text);
  }
}

class Lexer {
  lex(text) {
    this.text = text;
    this.index = 0;
    this.ch = undefined;
    this.tokens = [];

    while (this.index < this.text.length) {
      this.ch = this.text.charAt(this.index);
      if (
        this.isNumber(this.ch) ||
        (this.ch === "." && this.isNumber(this.peek()))
      ) {
        this.readNumber();
      } else if (this.ch === '\'' || this.ch === '"') {
        this.readString(this.ch);
      } else {
        throw "Unexpected next character: " + this.ch;
      }
      this.index++;
    }

    return this.tokens;
  }

  isNumber(ch) {
    return /[0-9]/.test(ch);
  }

  readNumber() {
    let number = "";
    while (this.index < this.text.length) {
      const ch = this.text.charAt(this.index).toLowerCase();
      if (ch === "." || this.isNumber(ch)) {
        number += ch;
      } else {
        const nextCh = this.peek();
        const prevCh = number.charAt(number.length - 1);
        if (ch === "e" && this.isExpOperator(nextCh)) {
          number += ch;
        } else if (
          this.isExpOperator(ch) &&
          prevCh === "e" &&
          nextCh &&
          this.isNumber(nextCh)
        ) {
          number += ch;
        } else if (
          this.isExpOperator(ch) &&
          prevCh === "e" &&
          (!nextCh || !this.isNumber(nextCh))
        ) {
          throw "invalid exponent";
        } else {
          break;
        }
      }
      this.index++;
    }
    this.tokens.push({
      text: number,
      value: Number(number)
    });
  }

  readString(quote) {
    this.index++;
    let string = '';
    while (this.index < this.text.length) {
      const ch = this.text.charAt(this.index);
      if (ch === quote) {
        this.index++;
        this.tokens.push({
          text: string,
          value: string
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
    throw 'Unmatched quote';
  }

  isExpOperator(ch) {
    return /[-+]/.test(ch) || this.isNumber(ch);
  }

  peek() {
    return this.index < this.text.length - 1
      ? this.text.charAt(this.index + 1)
      : false;
  }
}

class AST {
  constructor(lexer) {
    this.lexer = lexer;
  }
  ast(text) {
    this.tokens = this.lexer.lex(text);
    return this.program();
  }
  program() {
    return {
      type: AST.Program,
      body: this.constant()
    };
  }
  constant() {
    return {
      type: AST.Literal,
      value: this.tokens[0].value
    };
  }
}
AST.Program = "Program";
AST.Literal = "Literal";

class ASTCompiler {
  constructor(astBuilder) {
    this.astBuilder = astBuilder;
  }
  compile(text) {
    const ast = this.astBuilder.ast(text);
    this.state = {
      body: []
    };
    this.recurse(ast);
    return new Function(this.state.body.join(""));
  }
  recurse(ast) {
    switch (ast.type) {
      case AST.Program:
        this.state.body.push("return ", this.recurse(ast.body), ";");
        break;
      case AST.Literal:
        return this.escape(ast.value);
        break;
    }
  }

  escape(val) {
    if (typeof val === 'string') {
      return '\'' + val + '\'';
    } else {
      return val;
    }
  }
}

function parse(expr) {
  const lexer = new Lexer();
  const parser = new Parser(lexer);
  return parser.parse(expr);
}

module.exports = parse;
