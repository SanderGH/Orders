/*function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
document.getElementById("defaultOpen").click();*/

// model
//var monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

offenses = _.map( JSON.parse(localStorage.getItem("offenses") ));

// create viewModel
function ViewModel()
{
    var self = this;
    self.OffensesVM = new OffensesViewModel();
}

function OffensesViewModel()
{
    var self = this;
    self.filteredOffenses = ko.observableArray(offenses);

    self.viewRegistered = ko.observable(true);
    self.changeViewRegistered = function(){
            self.filteredOffenses.removeAll();
            ddd = _.filter( offenses, function( offense ) {
                visible = false;
                if ( self.viewRegistered() && offense.assigned_to == null && offense.close_time == null )
                    visible = true;
                if( self.viewAssigned() && offense.assigned_to != null && offense.close_time == null )
                    visible = true;
                if ( self.viewClosed() && offense.assigned_to != null && offense.close_time != null )
                    visible = true;

                return visible; 
            });
            _.forEach( ddd, function(value) {
                self.filteredOffenses.push(value);
            })
            //self.filteredOffenses = 
            //self.filteredOffenses.valueHasMutated();
    }

    self.viewAssigned = ko.observable(true);
    self.changeViewAssigned = function(){
        //self.filteredOffenses.valueHasMutated();
        ddd = "wdawd";        
    }

    self.viewClosed = ko.observable(true);
    self.changeViewClosed = function(){
        //self.filteredOffenses.valueHasMutated();
        ddd = "wdawd";        
    }
    
}

ViewModel = new ViewModel();
ko.applyBindings( ViewModel );