module.exports = (function () {

	function SectionCalendar (db) {
		this.db = db;
		
	}

	SectionCalendar.prototype.addSection = function(course, selsect) {

		course.sections.forEach(function (element, index, array) {
			if (element.selected)
			if (element.ssr_component == selsect.ssr_component && element)
		});
		
		section.selected = true;
		this.checkConflict
	};
	
})();

// class = {start_time, end_time, class_number}
function addClassOn (class, day) {
	hash[day]
}



sections: [{

    meeting: {
        start_time: "11:40AM",
        end_time: "12:55PM",
        meeting_pattern: "TR"
    },


    ssr_component: "LEC", // Type
    class_section: "001", // First digit groups types. 

    // For id-ing with parent course
    catalog_number: "2130", 
    subject_key: "AAS",

    class_number: "9638" // UID

}]







var user = (function () {

  function User (data) {
    var _data = data || defaultData();

    this.terms = _data.terms;
    this.name  = _data.name;
  }

  User.prototype.addCourse = function(term, course) {
    // body...
  };

  User.prototype.addedCourse = function(term, course) {

  };

  
  var defaultData = function () {
    return {
      name  : 'User',
      terms : {
        FA14 : {
          courses : [],
          combos  : [],
          events  : []
        }
      }
    };
  };
  return User;
})();

