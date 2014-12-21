'use strict';

var program = require('commander');
var fs = require('fs');
var format = require('format');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');
var natural = require('natural'),
	tokenizer = new natural.WordTokenizer();
var _ = require('lodash');
var sbd = require('sbd');
var linearAlgebra = require('linear-algebra')({
	add: require('add')
}),	
	Vector = linearAlgebra.Vector, Matrix = linearAlgebra.Matrix;
var TfIdf = natural.TfIdf,
	tfidf = new TfIdf();

program.version('0.0.1')
	.option('-f, --filename [filename]', 'File path to generate summary of')
	.option('-s, --sentences [num]', 'Number of sentences in summary')
	.parse(process.argv);

if (!program.filename){
	console.log('filename parameter is required.');
	program.help();
}
program.sentences = program.sentences || 5;
program.sentences = Number(program.sentences);
var paraSentenceIndex = [], pindex = 0, allsentences = [];
paraSentenceIndex.getParaIndex = function (sindex) {
	var accsum = 0;
	for (var i = 0; i < this.length; i++) {
		accsum = accsum + this[i];
		if (sindex < accsum) {
			return i;
		}
	}
	return -1;
}
var lg10 = Math.log(10);
function log10(x){
	var res = (Math.log(x) / lg10);
	if (isNaN(res)) {
		res = 0;
	}
	return res;
}

function similarity(s1, s2) {
	var w1s = tokenizer.tokenize(s1);
	var w2s = tokenizer.tokenize(s2);
	var is = _.intersection(w1s, w2s);
	var commoncount = is.length;
	if (commoncount === 0) return 0;
	var res = (commoncount / ( log10(w1s.length) + log10(w2s.length) ) );
	if (isNaN(res)){
		throw 'NaN';
	}
	return res;
}

function processMatrix3Steps(M, aplha) {
	if (!aplha){
		aplha = 0.15;
	}
	for (var i = M.rows - 1; i >= 0; i--) {
		var magnitude = M.data[i].sum();
		for (var j = M.cols - 1; j >= 0; j--) {
			M.data[i][j] = M.data[i][j] / magnitude;
			if (isNaN(M.data[i][j])){
				M.data[i][j] = 0;
			}
			M.data[i][j] = M.data[i][j] * (1 - aplha);
			M.data[i][j] = M.data[i][j] + (aplha / (M.rows));
			if (isNaN(M.data[i][j])){
				throw 'NaN';
			}
		};
	};
};

Array.createLong = function (filler, count, first) {
	var a = [];
	for (var i = count - 1; i >= 0; i--) {
		a[i] = filler;
	};
	if (first) {
		a[0] = first;
	}
	return a;
};

function isEqual(M1, M2, threshold){
	if (M1.rows !== M2.rows || M1.cols !== M2.cols){
		throw 'Rows and columns must be equal!';
	}
	for (var i = M1.rows - 1; i >= 0; i--) {
		for (var j = M1.cols - 1; j >= 0; j--) {
			if (M1.data[i][j].toFixed(18) !== M2.data[i][j].toFixed(18)){
				return false;
			}
		};
	};
	return true;
}

fs.readFile(program.filename, function (err, data) {
	var allsentences = [], sentenceScores = [], selectedSentences = [], $ = cheerio.load(data), title = $('h1').text();

	$('p').each(function (i, elem) {
		var sentences = sbd.sentences($(elem).text());
		paraSentenceIndex[pindex] = sentences.length;
		sentences.forEach(function (sentence) {
			if (sentence.length > 2){
				allsentences.push(sentence);
			}
		});
		pindex = pindex + 1;
	});
debugger;
	var M = Matrix.identity(allsentences.length);
	for (var i = allsentences.length - 1; i >= 0; i--) {
		for (var j = allsentences.length - 1; j >= 0; j--) {
			M.data[i][j] = similarity(allsentences[i], allsentences[j]);
		}
	};
	
	processMatrix3Steps(M);
	var V = new Matrix(Array.createLong(0, M.rows, 1));
	
	while (true) {
		var vn = V.dot(M);
		if (isEqual(V, vn)){
			break;
		}
		V = vn;
	}
	var collection = [];
	for (var j = M.cols - 1; j >= 0; j--) {
		collection.push({
			index: j, mag: V.data[0][j]
		});
	};

	var top5 = _.sortBy(_.pluck(_.take(((_.sortBy(collection, 'mag')).reverse()), program.sentences), 'index'));

	top5.forEach(function (index) {
		selectedSentences.push(allsentences[index]);
	}); 

	var newDoc = $('<p></p>');
	var heading = format('<h1>%s</h1>', title);
	newDoc.text(selectedSentences.join(' '));
	fs.writeFileSync('summary.html', heading + newDoc.html());
});