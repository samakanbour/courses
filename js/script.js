document.addEventListener('DOMContentLoaded', function () {
	Tabletop.init({
		key: "0AhtG6Yl2-hiRdE9KVHEtSkxscnoxTExua3dyNXJZUXc",
		callback: init
	});
});

function course(id, title, units, dependencies, link, description, color, area) {
	this.id 	= id;
	this.title 	= title;
	this.units 	= units;
	this.dependencies = dependencies;
	this.link 	= link;
	this.description = description;
	this.color 	= color;
	this.area 	= area;
}

function init(result) {
	tooltip();

	var colors 	= {};
	var areas 	= {};
	var electives = {};
	var semesters = [[],[],[],[],[],[],[],[]];

	result.colors.elements.forEach(function (row) {
		colors[row.area] = row.color;
	});

	result.core.elements.forEach(function (row) {
		if (!row.number) return;
		var color = colors[row.number.slice(0,2)];
		if (!color) { color = colors['Other']; }
		var c = new course(row.number, row.title, row.units, row.dependencies.split(','), row.link, row.description, color, 'core');
		semesters[parseInt(row.semester)].push(c);
	});
	
	result.electives.elements.forEach(function (row) {
		if (!row.number) return;
		var e = new course(row.number, row.title, row.units, row.dependencies.split(','), row.link, row.description, colors[row.area], row.area);
		electives[row.number] = e;
		if (row.area in areas) {
			areas[row.area].push(row.number);
		} else {
			areas[row.area] = [row.number];
		}
	});

	result.general.elements.forEach(function (row) {
		if (!row.number) return;
		electives[row.number] = null;
	});

	var graph = new Graph(semesters);
	for (a in areas) {
		addElective(a, areas[a], colors[a]);
	}

	$('#selectcourses').append('<div id="top-group">\
		<input class="form-control" type="text" id="general" placeholder="Add other courses...">\
		<button class="btn btn-info" type="button" id="plus"><span class="glyphicon glyphicon-plus"></span></button>\
		</div>');
	
	$('#general').typeahead({ local: Object.keys(electives).sort() });
	
	$('#plus').click(function(){ 
		addGeneralCourse(graph, colors['General']);
	});

	$('#general').on('keyup', function(e) {
	    if (e.which == 13) {
	    	addGeneralCourse(graph, colors['General']);
	    }
	});

    $("li > a").click(function() {
    	var c = $(this)[0].text;
    	graph.addCourse(electives[c]);
	});
}

function addElective(name, list, color) {
	var content = '<div class="btn-group" id="'+name+'">\
			<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" style="background-color:'+color+'; border: 1px solid '+color+';">'+name+' &nbsp;&nbsp;<span class="caret"></span></button>\
			<ul class="dropdown-menu pull-right">';
	for (i in list){
		var number = list[i].slice(0,6);
		content += '<li><a>'+number+'</a></li>';
	}
	content += '</ul></div>';
	content += '<button class="btn btn-info btn-group" type="button" id="btn'+name+'" style="background-color:'+color+'; border: 1px solid '+color+';">'+name+'</button>';
	$('#selectcourses').append(content);
	$("#btn"+name).hide();
	$("#btn"+name).tooltip({placement: 'left', title: 'Highlight ' + name + ' course'});
	var label = 'Add ';
	if (name[0] == 'A') { label += 'an ' + name + ' course'} else { label += 'a ' + name + ' course'}
	$("#" + name).tooltip({placement: 'left', title: label});
}

function addGeneralCourse(graph, color){
	var number = $('#general').val();
	var re = /([0-9][0-9]-[0-9][0-9][0-9])/;
	var match = number.match(re);
	if (match && match[0] == number) {
		var g = new course(number, 'Undefined title', 'undefined', [], null, null, color, 'general');
		graph.addCourse(g);
		$('#general').val('');
		$('#general').typeahead('setQuery', '');
	}
}

function showElectives(){
	if ($("#selectcourses").is(":visible")){
		$("#btnelectives")[0].innerHTML = 'Add Electives';
		$("#selectcourses").fadeOut();
		$("#highlightcourses").fadeOut();
		$("#description").animate({width: "30em"}, 500);
	} else {
		$("#btnelectives")[0].innerHTML = 'Hide Electives';
		$("#selectcourses").fadeIn();
		$("#highlightcourses").fadeIn();
		$("#description").animate({width: "23em"}, 500);
	}
}

function tooltip(){
	$("#remove").hide();
	$("#link").hide();
    $("#error").hide();
    $("#selectcourses").hide();
	$("#highlightcourses").hide();
	$("#link").tooltip({placement: 'right', title: 'View course page'});
	$("#coursenum").tooltip({placement: 'left', title: 'E.g. 15-112 15-221'});
	$("#btncs").tooltip({placement: 'left', title: 'Highlight CS courses'});
	$("#btnmath").tooltip({placement: 'left', title: 'Highlight Mathematics courses'});
	$("#btnelectives").click(showElectives);
}