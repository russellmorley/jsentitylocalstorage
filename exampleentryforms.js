
function Shipment() {
	this.CHILDRENCONSTRUCTORS = new Array('Delivery');
	
	this.ShipmentId = '';
	this.ShipFromId = '';
	this.RouteId = '';
	this.DepartureDate = '';
	this.DepartureTime = '';
	this.VehicleId = '';
}
  
function Delivery() {
	this.CHILDRENCONSTRUCTORS = null;

	this.DeliveryId  = getRandomInt(10000, 99999);
	this.RetailerId = '';
	this.DeliveredDate = '';
	this.DeliveredTime = '';
	this.ItemId = '';
	this.Quantity = '';
	this.QuantityUOM = '';
}  
  
var mainEntitiesArray;

$(document).ready(function(){
	document.documentElement.style.webkitTouchCallout = 'none';
	//next two lines required with slider markup stating data-role="none" because of bug 
	// in jquery slider where sliders don't show dynamically set value the first time a slider is shown after
	// a page refresh
	// (sliders show dynamically set values after first slider is shown after a page refresh).
	$(".slider").slider();
	$(".slider").addClass('ui-input-text ui-body-c ui-corner-all ui-shadow-inset ui-mini');
	$(document).on('pagebeforeshow', function(event, data) {
		var targ = event.target;
		//$(targ).find("input[type=number]").slider("refresh");
		$(targ).find(".slider").slider("refresh");
		$(targ).find("select").selectmenu("refresh");
		//$(targ).find( "input[type='checkbox']" ).checkboxradio( "refresh" );
		//$(targ).find("input[type='radio']" ).checkboxradio( "refresh" );
	});
	
	
	var ua = navigator.userAgent;
	if( ua.indexOf("Android") >= 0 )
	{
	  $("[data-transition]").attr('data-transition', 'none');
	  $("[data-role='header'][data-position='fixed']").removeAttr('data-position');
	  var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8)); 
	  //alert('android v' + androidversion);
	}
	
	mainEntitiesArray = new CPNS.Entities.EntitiesArray('Shipments', 'Shipment');
	mainEntitiesArray.fill();
	mainEntitiesArray.display();
});

function openSettings(transition) {
	$.mobile.changePage($('#settings'),  {transition: transition, role: 'dialog'});
	return "";
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

