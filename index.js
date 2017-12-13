function openCity(evt, cityName) {
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
document.getElementById("defaultOpen").click();

// model
var monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

orders = //_.filter(
    _.map( JSON.parse(localStorage.getItem("OrdersSC") ), function(value, key) {
        var createDate = new Date( Number( value.create_date ) * 1000 );
        return {
            number: key,
            city: value.city,                        
            user_id: value.user_id,
            sum: Number(value.sum),
            delivery_sum: Number(value.delivery_sum),
            create_date_day: (createDate.getDate()) + " " + monthNames[createDate.getMonth()],// + " " + createDate.getFullYear(),
            create_date: value.create_date,
            create_date_month: monthNames[createDate.getMonth()] + " " + createDate.getFullYear(),
            merchant: value.merchant,
            delivery: value.delivery,
            transport: value.transport,
            coupon_code: value.coupon_code,
            status_name: value.status_name,
            cancel_reason: value.cancel_reason,
            isnew_user: value.isnew_user,
            orders_count: value.orders_count,
            items: _.map(value.items)
        };
    } );/*, function(value) {
        return 1501545600 <= value.create_date && 1509494399 >= value.create_date;
    });*/

    // create viewModel
// create custom binding for chart
ko.bindingHandlers.cancelOrderChartBind = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var data = ko.unwrap(valueAccessor());

        var ctx = document.getElementById('cancelOrderChart');
        chartCancel = new Chart( ctx, {
            type: 'bar',

            // The data for our dataset
            data: {
                datasets: [
                {
                    label: "Количество",
                    borderColor: "#36A2EB",
                    backgroundColor:"#36A2EB",
                    borderWidth: 1,                              
                    //yAxisID: "y-axis-count"
                }]
            },

            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{
                        stacked: true,
                    }]
                    /*yAxes: [ {
                        ticks: {
                            beginAtZero:true
                        },
                        position: "left",
                        id: "y-axis-sum",
                    },{
                        position: "right",
                        id: "y-axis-count",
                        stacked: true
                    }]*/
                }
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var data = ko.unwrap( valueAccessor() );
        chartCancel.data.labels = _.map(data, 'period');
        chartCancel.data.datasets[0].data = _.map(data, 'count');
        chartCancel.update();
    }                        
}

// create custom binding for chart
ko.bindingHandlers.chartBind = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var data = ko.unwrap(valueAccessor());

        var ctx = document.getElementById('myChart');
        chart = new Chart( ctx, {
            type: 'bar',

            // The data for our dataset
            data: {
                datasets: [{
                    stack : "stack 0",
                    label: "Сумма",
                    borderColor: "#FF6384",
                    backgroundColor : "#FF6384",                                                                
                    borderWidth: 1,                              
                    yAxisID: "y-axis-sum"
                }, 
                {
                    stack : "stack 0",
                    label: "Сумма отмененных",
                    borderColor: "#4BC0C0",
                    backgroundColor:"#4BC0C0",                                
                    borderWidth: 1,                              
                    yAxisID: "y-axis-sum"
                },
                {
                    stack : "stack 1",
                    label: "Количество",
                    borderColor: "#36A2EB",
                    backgroundColor:"#36A2EB",
                    borderWidth: 1,                              
                    yAxisID: "y-axis-count"
                }, {
                    stack : "stack 1",
                    label: "Количество отмененных",
                    borderColor: "#ff00ff",
                    backgroundColor:"#ff00ff",
                    borderWidth: 1,                              
                    yAxisID: "y-axis-count"
                }]
            },

            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [ {
                        ticks: {
                            beginAtZero:true
                        },
                        position: "left",
                        id: "y-axis-sum",
                        stacked: true
                    },{
                        position: "right",
                        id: "y-axis-count",
                        stacked: true
                    }]
                }
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var data = ko.unwrap( valueAccessor() );
        chart.data.labels = _.map(data, 'period');
        chart.data.datasets[1].data = _.map(data, 'sum');
        chart.data.datasets[2].data = _.map(data, 'count');               
        chart.data.datasets[2].hidden = !viewModel.viewCount();

        chart.data.datasets[0].data = _.map(viewModel.cancel_group_orders(), 'sum');
        chart.data.datasets[0].hidden = !viewModel.viewCanceled();
        chart.data.datasets[3].data = _.map(viewModel.cancel_group_orders(), 'count');               
        chart.data.datasets[3].hidden = !viewModel.viewCanceled();                    
        
        chart.options.scales.yAxes[0].stacked = viewModel.viewCanceled();
        chart.options.scales.yAxes[1].stacked = viewModel.viewCanceled();                    
        chart.update();
    }                        
}
// create viewModel
function OrdersViewModel()
{
    var self = this;
    self.completeOrders = ko.observableArray(_.reject( orders, { status_name: "Отменен" } ));
    self.sumOrders = ko.computed( function(){
        return _.sumBy(self.completeOrders(), 'sum');
    })          
    
    self.cancelOrders = ko.observableArray(_.filter( orders, { status_name: "Отменен" }));
    self.sumCancelOrders = ko.computed( function(){
        return _.sumBy(self.cancelOrders(), 'sum');
    })          
    self.cancelReasons = ko.observableArray( 
        _.reverse(
            _.sortBy( 
                _.map( 
                    _.groupBy( self.cancelOrders(), 'cancel_reason' ), function(value, key) {
                        return { 'name' : key, 'count' : value.length }
                        }
                    )
            ,'count')
        )
    )

    self.viewCanceled = ko.observable(true);
    self.changeViewCanceled = function(){
        self.group_orders.valueHasMutated();
    }

    self.viewCount = ko.observable(true);
    self.changeViewCount = function(){
        self.group_orders.valueHasMutated();
    }
    
    self.typeChart = ko.observable( "bar" );
    self.changeTypeChart = function(){
        chart.config.type = self.typeChart();
        chart.update(); 
    }

    self.detailTypes = ko.observableArray( [{ 'id': 0, 'name': "Детализация по дням"}, { 'id': 1, 'name': "Детализация по месяцам"}]);
    self.selectedDetailType = ko.observable();                
    self.changeDetailType = function(){
        self.group_orders( _.map( _.groupBy( self.completeOrders(), self.selectedDetailType() == 0 ? 'create_date_day': 'create_date_month' ),
            function(value, key){  
                return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy(value, 'sum')};
            }
        ));

        /*self.cancel_group_orders( 
            _.map( 
                _.groupBy( self.cancelOrders(), self.selectedDetailType() == 0 ? 'create_date_day': 'create_date_month' ), function(value, key){  
                    return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy(value, 'sum')};
                }
        ));*/

        self.cancel_group_orders( 
            _.forEach( _.groupBy( self.cancelOrders(), self.selectedDetailType() == 0 ? 'create_date_day': 'create_date_month' ), function(value,key,col) {
                col[key] =_.groupBy(value, 'cancel_reason');
            } ))

        //    _.map( 
        //        _.groupBy( self.cancelOrders(), self.selectedDetailType() == 0 ? 'create_date_day': 'create_date_month' ), function(value, key){  
        //            return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy(value, 'sum')};
        //        }
        //));

        // сгрупировать по периоду
        /*groups =  _.groupBy( orders, self.selectedDetailType() == 0 ? 'create_date_day': 'create_date_month' );
        
        _.forEach( groups, function(value,key,col) {
                col[key] =_.groupBy(value, 'status_name');
        });
        
        www = _.map( groups, function( value, key){
            return _.map( value, function(value1, key1){ 
                return { 'period' : key1, 'count' : value1.length, 'sum' : _.sumBy(value1, function(o){return Number(o.sum)}) 
            };})
        } );*/
        
        
        //return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy( value, function(o) {return Number(o.sum)})} )
        // сгрупировать по статусу
        //statusBy =  _.map( groupBy, function( value, key ) {
        //    return _.groupBy( value, 'status_name');
        //} )

        // вернуть 
        /*  self.group_orders( _.map( , function(value, key) { 
                                            _.groupBy( value, 'status_name')
                                            return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy( value, function(o) {return Number(o.sum)})};}
        ))*/
    
    }
    
    self.brands = ko.observableArray( 
        _.map( 
            _.uniq( 
                _.map( self.completeOrders(), 'brand_name') ),  
                function (entry){
                    return { "name": entry, "visible": false };
    })),


    moscow_region = [];//["Нижний Новгород", "Саров", "Дзержинск"];
    self.cities = ko.observableArray(_.map(
                _.uniq(_.map(self.completeOrders(), 'city')), function (entry) {
                    check = (moscow_region.indexOf(entry) != -1);
                    return { "name": entry, "visible": check };
                }
            )
        )
    /*self.cities = ko.observableArray( _.map( _.uniq( _.map( self.completeOrders(), 'city') ), function (entry) {
                    return { "name": entry, "visible": false };
                }
            )
        );*/
    
    self.filtered_orders = ko.observableArray(_.map(self.completeOrders()));
    self.goods = ko.observableArray();
    self.choose_cities = ko.observableArray(_.filter(self.cities(), 'visible')),                
    self.changeCities =  function () {

            self.choose_cities(_.map(_.filter(self.cities(), 'visible'), 'name'));

            var sss = self.choose_cities();
            self.filtered_orders(_.filter(self.completeOrders(), function (entry) {
                return sss.indexOf(entry.city) != -1
            }));

            map = new Map();
            items = _.map(self.filtered_orders(), 'items');
            _.forEach(items, function (item) {
                _.forEach(item, function (row) {
                    if (map.has(row.code) == false)
                        map.set(row.code, { 'name': row.name, 'quantity': Number(row.quantity), 'sum': Number(row.quantity) * Number(row.price) })
                    else {
                        ss = map.get(row.code);
                        ss.quantity += Number(row.quantity);
                        ss.sum += Number(row.quantity) * Number(row.price);
                    }
                })
            });
            self.goods.removeAll();
            map.forEach(function (obj) {
                self.goods.push(obj);
            });
        }


    self.Sander = [];
    _.forEach( self.completeOrders(), function( order ) {
                _.forEach( order.items, function( item ) {
                        item.city = order.city;
                        self.Sander.push(item);
                    })
            });


            /*_.forEach( gr, function( value){ _.groupBy(value, "city")} )
        gr = _.groupBy( filt, "name")
        _.groupBy( filt, "name")*/

    self.Sander1 = [];
    self.goodsMedtronic = _.groupBy( _.filter( self.Sander, { brand_name:"Medtronic" } ), "name" );
    _.forEach( self.goodsMedtronic, function(value, key, col){ 
        
        tempCity = [] 
        _.forEach( _.groupBy(value, 'city'), function( value, key, col){
            tempCity.push( { name: key, rows: value, quantity: _.sumBy(value, function(o){return Number(o.quantity)} ) })
        } )
        tempCity = _.reverse( _.sortBy(tempCity, 'quantity'));


        self.Sander1.push( { name: key, cities: tempCity} );
        //col[key]=_.groupBy(value, 'city');
    }); 

    //self.sander2 = ko.observableArray();
    // _.forEach( self.goodsMedtronic, function( value, key){
    //    self.sander2.push({ [key]: value});
    //})
    //self.medtronic = ko.observableArray(
        //"Medtronic"
    //)
        
    //sss= _.groupBy( orders, 'create_date_month')
    //_.forEach( sss, function(value,key,col) { col[key] =_.groupBy(value, 'status_name')})

    self.group_orders =  ko.observableArray(  _.map( _.groupBy( self.completeOrders(), 'create_date_day'),
            function(value, key){ return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy(value, 'sum') };}
    ));

    self.cancel_group_orders =  ko.observableArray(  _.map( _.groupBy( self.cancelOrders(), 'create_date_day'),
            function(value, key){ return { 'period' : key, 'count' : value.length, 'sum' : _.sumBy(value, 'sum') };}
    ));

    /*moscow_region = JSON.parse(localStorage.getItem("cities"));
    moscow = _.filter(completeOrders, { city: 'Москва' });
    moscow_sum = _.sumBy(moscow, function (obj) { return Number(obj.sum) });*/

    //ViewModel = {
        /*brands: ko.observableArray(
            _.map(
                _.uniq(_.map(completeOrders, 'brand_name')), function (entry) {
                    return { "name": entry, "visible": false };
                }
            )
        ),*/

        /*  cities: ko.observableArray(_.map(
                _.uniq(_.map(completeOrders, 'city')), function (entry) {
                    check = (moscow_region.indexOf(entry) != -1);
                    return { "name": entry, "visible": check };
                }
            )
        ),

        goods: ko.observableArray(),

        choose_cities: ko.observableArray(_.filter(cities, 'visible')),

        //filtered_orders: ko.observableArray(_.filter(completeOrders, { 'city': '' })),
        filtered_orders: ko.observableArray(_.map(completeOrders)),

        /*group_orders: ko.observableArray(  _.map( _.groupBy( self.completeOrders, 'create_date'),
                function(value, key){ return { 'month' : key, 'count' : value.length, 'sum' : _.sumBy(value, function(o){return Number(o.sum)}) };}
            )),


        /*   changeCities: function () {
            this.choose_cities(_.map(_.filter(this.cities(), 'visible'), 'name'));

            var sss = this.choose_cities();
            this.filtered_orders(_.filter(completeOrders, function (entry) {
                return sss.indexOf(entry.city) != -1
            }));

            map = new Map();
            items = _.map(this.filtered_orders(), 'items');
            _.forEach(items, function (item) {
                _.forEach(item, function (row) {
                    if (map.has(row.code) == false)
                        map.set(row.code, { 'name': row.name, 'quantity': Number(row.quantity), 'sum': Number(row.quantity) * Number(row.price) })
                    else {
                        ss = map.get(row.code);
                        ss.quantity += Number(row.quantity);
                        ss.sum += Number(row.quantity) * Number(row.price);
                    }
                })
            });
            map.forEach(function (obj) {
                ViewModel.goods.push(obj);
            });
        }*/



    // };             
}

ViewModel = new OrdersViewModel();
ko.applyBindings( ViewModel );