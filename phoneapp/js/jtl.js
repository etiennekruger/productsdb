
//String.prototype.startwith = function(c){
//	return this.indexOf(c)==0;
//	}
//String.prototype.rescape = function(){
//	return this.replace(/(\(|\)|\{|\})/g,'\\$1');
//	}
//Array.prototype.map = function(fn){
//	for(var i=0,ilen=this.length;i<ilen;i++){
//		this[i] = fn(this[i]);
//		}
//	return this;
//	}
//Array.prototype.filter = function(con){
//	var ret = [];
//	for(var i=0,ilen=this.length;i<ilen;i++){
//		if(this[i] !=con){
//			ret.push(this[i]);
//			}
//		}
//	return ret;	
//	}
//Array.prototype.contain = function(el){
//	for(var i=0,ilen=this.length;i<ilen;i++){
//		if(this[i]==el)return true;
//		}
//	return false;
//	}		

function Jtl(tpl){
	this._nodelist = this._compile(tpl);
	}
Jtl.prototype = {
	/*
	_re : {
		TAG_START : '{%',
		TAG_END : '%}',
		VAR_START : '{{',
		VAR_END : '}}'		
		},*/
	_compile : function(tpl){
		var tag_str = this._formRegx();
		//alert(tag_str)
		var tag_re = new RegExp(tag_str,'g');
		var bits = new Jtl.StringBuilder(tpl).bsplit(tag_re);
		//alert(bits[1])
		bits = new Jtl.ArrayBuilder(bits).filter('');
		var tokens =  new Jtl.ArrayBuilder(bits).map(this._createToken);
		return new Jtl.Parser(tokens).parse();
		},
	_createToken : function(bit){
		var _re = Jtl._re;
		if(new Jtl.StringBuilder(bit).startwith(_re.TAG_START)){
			return new Jtl.Token(Jtl.TAG_TOKEN,bit.slice(_re.TAG_START.length,-_re.TAG_END.length));
			}
		else if(new Jtl.StringBuilder(bit).startwith(_re.VAR_START)){
			return new Jtl.Token(Jtl.VAR_TOKEN,bit.slice(_re.VAR_START.length,-_re.VAR_END.length));
			}
		else{
			return new Jtl.Token(Jtl.TEXT_TOKEN,bit);
			}
		},	
	_formRegx : function(){
		var re = Jtl._re,ret = '';
		ret += '(' + new Jtl.StringBuilder(re.TAG_START).rescape() + '.*?' + new Jtl.StringBuilder(re.TAG_END).rescape() + 
		'|' + new Jtl.StringBuilder(re.VAR_START).rescape() + '.*?' + new Jtl.StringBuilder(re.VAR_END).rescape() + '|$' + ')';
		//ret += '(' + re.VAR_START + '.*?' + re.TAG_END + '|' + re.TAG_START + '.*?' + re.TAG_END + ')';
		return ret;
		},		
	render : function(context){
		var ret = [];
		var nodelist = this._nodelist;
		var node;
		for(var i=0,ilen=nodelist.length;i<ilen;i++){
			node = nodelist[i];
			if(typeof(node)=='object'){
				typeof(node.render)=='function' ? ret.push(node.render(context)) : ret.push(node.toString());
				}
			else{
				ret.push(node.toString());
				}
			}
		return ret.join('');
		}
	}

Jtl.VAR_TOKEN = 0;
Jtl.TAG_TOKEN = 1;
Jtl.TEXT_TOKEN = 2;
Jtl._re =  {
	TAG_START : '{%',
	TAG_END : '%}',
	VAR_START : '{{',
	VAR_END : '}}'	
	}
Jtl.regTag = function(tName,tFunc){
	Jtl.tag[tName] = tFunc;
	}
	
Jtl.list_render = function(context,nodelist){
	var ret = [];
	for(var i=0,ilen=nodelist.length;i<ilen;i++){
		ret.push(nodelist[i].render(context));
		}
	return ret.join('');	
	}

Jtl.getVar = function(context,varstr){
	var ret=context;
	var va = varstr.split('.');
	for(var i=0,ilen=va.length;i<ilen;i++){
		ret = ret[va[i]];
		}
	return ret;	
	}

Jtl.StringBuilder = function(str){
	this.str = str;
	}	
Jtl.StringBuilder.prototype = {
	startwith : function(c){
		return this.str.indexOf(c)==0;
		},
	//abandon
	rescape : function(){
		return this.str.replace(/(\(|\)|\{|\})/g,'\\$1');
		},
	bsplit : function(pat){
		var cursor = 0;
		var ret = [];
		var str = this.str;
		this.str.replace(pat,function(m1,m2,n){
			ret.push(str.slice(cursor,n));
			ret.push(m1);
			cursor = n + m1.length;
			})
		return ret;
		}
	}
	
Jtl.ArrayBuilder = function(arr){
	this.arr = arr;
	}
Jtl.ArrayBuilder.prototype = {
	map : function(fn){
		var a = this.arr;
		for(var i=0,ilen=a.length;i<ilen;i++){
			a[i] = fn(a[i]);
			}
		return a;
		},
	filter : function(con){
		var ret = [];
		var a = this.arr;
		for(var i=0,ilen=a.length;i<ilen;i++){
			if(a[i] !=con){
				ret.push(a[i]);
				}
			}
		return ret;	
		},
	contain : function(el){
		var a = this.arr;
		for(var i=0,ilen=a.length;i<ilen;i++){
			if(a[i]==el)return true;
			}
		return false;
		}			
	}	
Jtl.VarNode = function(content){
	this.content = content;
	this.varstr = this.content;
	}
Jtl.VarNode.prototype = {
	render : function(context){
		return Jtl.getVar(context,this.varstr);
//		var ret=context;
//		var va = this.varstr.split('.');
//		for(var i=0,ilen=va.length;i<ilen;i++){
//			ret = ret[va[i]];
//			}
//		return ret;
		}
	}

Jtl.TextNode = function(s){
	this.s = s;
	}
Jtl.TextNode.prototype = {
	render : function(){
		return this.s;
		}
	}

Jtl.CommentNode = function(){
	}
Jtl.CommentNode.prototype = {
	render : function(context){
		return '';
		}
	}
	
Jtl.ifNode = function(link_type,boolpairs,nodelist_true,nodelist_false){
	this.link_type = link_type;
	this.boolpairs = boolpairs;
	this.nodelist_true = nodelist_true;
	this.nodelist_false = nodelist_false;
	}
Jtl.ifNode.prototype = {
	render : function(context){
		var flag;
		if(this.link_type==Jtl.ifNode._and){
			flag = true;
			if(this.map_boolpair(false,context))flag=false;
			}
		else{
			flag = false;
			if(this.map_boolpair(true,context))flag=true;
			}
		return flag ? Jtl.list_render(context,this.nodelist_true) : Jtl.list_render(context,this.nodelist_false);
		},
	//在context中找出第一个context[bp]==tc的值
	map_boolpair : function(tc,context){
		var tmpbp = '';
		var bp = this.boolpairs;
		for(var i=0,ilen=bp.length;i<ilen;i++){
			tmpbp = bp[i].split(' ');
			if(tmpbp.length==2&&tmpbp[0]=='not'){
				if(tc!=!!Jtl.getVar(context,tmpbp[1]))return true;
				}
			else{
				if(tc==!!Jtl.getVar(context,tmpbp[0]))return true;
				}
			}
		return false;
		}
	}
Jtl.ifNode._and = 0;
Jtl.ifNode._or = 1;	

Jtl.forNode = function(loopvar,sequence,reversed,nodelist_loop){
	this.loopvar = loopvar;
	this.sequence = sequence.split('.');
	this.reversed = reversed;
	this.nodelist_loop = nodelist_loop;
	}
Jtl.forNode.prototype = {
	render : function(context){
		var ret = [];
		var parentloop;
		var items = context;
		if(context['forloop']){
			parentloop = context['forloop'];
			}
		for(var k=0,klen=this.sequence.length;k<klen;k++){
			items = items[this.sequence[k]];
			}
		//items = context[this.sequence] ? context[this.sequence] : [];
		if(!(items instanceof Array)){throw new Error('values is not a array')}
		if(this.reversed){
			items = items.reverse();
			}
		for(var i=0,ilen=items.length;i<ilen;i++){
			context['forloop'] = {
		                //shortcuts for current loop iteration number
		                'counter0': i,
		                'counter': i+1,
		                //reverse counter iteration numbers
		                'revcounter': ilen - i,
		                'revcounter0': ilen - i - 1,
		                //boolean values designating first and last times through loop
		                'first': (i == 0),
		                'last': (i == ilen - 1),
		                'parentloop': parentloop			
				}
			context[this.loopvar] = items[i];
			ret.push(Jtl.list_render(context,this.nodelist_loop));	
			}
		context['forloop'] = undefined;	
		return ret.join('');
		}
	}
/*
tokentype:
0 TAG_TOKEN
1 VAR_TOKEN
2 TEXT_TOKEN
*/
Jtl.Token = function(tokentype,content){
	this.token_type = tokentype;
	this.content = content;
	}
Jtl.Token.prototype = {
	tsplit : function(){
		
		}
	}
Jtl.Parser = function(tokens){
	this.tokens = tokens;
	}
Jtl.Parser.prototype = {
	parse : function(parse_until){
		if(!parse_until)parse_until = [];
		if(!(parse_until instanceof Array)){
			parse_until=[parse_until];
			}
		var nodelist = [];
		var token = null;
		var tagFuncName = null;
		var tagFunc = null;
		while(this.tokens.length){
			token = this.tokens.shift();
			if(token.token_type==Jtl.TEXT_TOKEN){
				nodelist.push(new Jtl.TextNode(token.content));
				}
			else if(token.token_type==Jtl.VAR_TOKEN){
				nodelist.push(new Jtl.VarNode(token.content));
				}
			else if(token.token_type==Jtl.TAG_TOKEN){
				if(new Jtl.ArrayBuilder(parse_until).contain(token.content)){
					this.prepend_token(token);
					return nodelist;
					//待处理
					}
				tagFuncName = token.content.split(/\s+/)[0];	
				if(!tagFuncName)throw(new Error('Empty Tag'));
				tagFunc = Jtl.tag[tagFuncName];
				if(!tagFunc)throw(new Error('Unknow Tag'));
				nodelist.push(tagFunc(this,token));
				}
			}
		return nodelist;
		},
	skip_past : function(endtag){
		var token = null;
		while(this.tokens.length){
			token = this.tokens.shift();
			if(token.token_type==Jtl.TAG_TOKEN&&token.content==endtag){
				return;
				}
			}
		throw(new Error('Not Closed Tag'));
		},
	prepend_token : function(token){
		this.tokens.unshift(token);
		},
	next_token : function(){
		return this.tokens.shift();
		},
	delete_first_token : function(){
		this.tokens.shift();
		return true;
		}
	}
Jtl.tag = {};

(function(){
	function do_if(parser,token){
		var bits = token.content.split(/\s+/);
		var link_type,nodelist_true,nodelist_false;
		bits.shift();
		if(!bits){throw(new Error('If node need at least one args'))}
		var bitstr = bits.join(' ');
		var boolpairs = bitstr.split(' or ');
		if(boolpairs.length==1){
			link_type = Jtl.ifNode._and;
			boolpairs = bitstr.split(' and ');
			}
		else{
			link_type = Jtl.ifNode._or;
			if(bitstr.indexOf(' and ')!=-1){throw(new Error('If node do not alow mix "and" & "or"'))}
			}
		nodelist_true = parser.parse(['else','endif']);
		token = parser.next_token();
		if(token.content.indexOf('else')!=-1){
			nodelist_false = parser.parse('endif');
			parser.delete_first_token();
			}
		else{
			nodelist_false = [];
			}
		return new Jtl.ifNode(link_type,boolpairs,nodelist_true,nodelist_false);	
		}	
	Jtl.regTag('if',do_if);
	
	function comment(parser,token){
		parser.skip_past('endcomment');
		return new Jtl.CommentNode();
		}
	Jtl.regTag('comment',comment)
	
	function do_for(parser,token){
		var bits = token.content.split(/\s+/);
		if(bits.length==5&&bits[4] != 'reversed'){
			throw(new Error('The 4 args of for tag must be reversed'));
			}
		if(!new Jtl.ArrayBuilder([4,5]).contain(bits.length)){
			throw(new Error('The for tag should have 4 or 5 args'));
			}
		if(bits[2] != 'in'){
			throw(new Error('The 2nd args of for tag must be "in"'));
			}
		var loopvar = bits[1];
		var sequence = bits[3];
		var reversed = (bits.length==5);	
		var nodelist_loop = parser.parse('endfor');
		parser.delete_first_token();
		return new Jtl.forNode(loopvar,sequence,reversed,nodelist_loop);
		}
	Jtl.regTag('for',do_for);	
	})();
Jtl.filter = {};
(function(){
	//function do_if(){}	
	//jtl.regTag('if',do_if);	
	})();