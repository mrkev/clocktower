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


var TakenCourse = (function () {
  
  function TakenCourse (cobj) {
    // Should cancel construction and return string.
    // http://stackoverflow.com/questions/1978049/what-values-can-a-constructor-return-to-avoid-returning-this
    if (typeof cobj !== 'object' || cobj === null) return cobj;
    if (cobj === undefined) return null;

    var self = this;
    $.extend(this, cobj);

    // Select some sections to take. One per type. Types could be defned by 
    // class_section's first digit (class_section / 100 >> 0) or by 
    // ssr_component.
    // 
    // Let's use ssr_component.
    
    self._selectedSections = {};

    this.sections.forEach(function (sect) {

      // There's already one. Return.
      if (self._selectedSections[sect.ssr_component]) return;

      // Set it.
      self._selectedSections[sect.ssr_component] = sect;

    });

    Object.defineProperty(this, 'selectedSections', {
      get : self.getSelectedSections,
      set : self.setSelectedSections
    });
  }

  TakenCourse.prototype.getSelectedSections = function() {
    var self = this;
    return Object.keys(self._selectedSections)
      .map(function (x) { return self._selectedSections[x]; });
  };

  TakenCourse.prototype.setSelectedSections = function(sctarr) {
    
  };

  return TakenCourse;

})();

console.log('TakenCourse', TakenCourse);


