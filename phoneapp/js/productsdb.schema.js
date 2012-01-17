if (window.openDatabase) {
    persistence.store.websql.config(persistence, "productsdb", 'database', 5 * 1024 * 1024);
} else {
    persistence.store.memory.config(persistence);
};

if (typeof someVar === 'undefined') {
    productsdb = {}
};

(function() {
    // Clear models.
    models = {}
    
    // All models corresponding to Django models get created.
    models.Formulation = persistence.define('formulation', {
	name: "TEXT",
	generic_name: "TEXT",
	strength: "TEXT",
    });
    models.Formulation.enableSync('/sync/infohub/formulation/');
    
    models.Country = persistence.define('country', {
	code: "TEXT",
	name: "TEXT",
    });
    models.Country.enableSync('/sync/infohub/country/');
    
    models.Incoterm = persistence.define('incoterm', {
	name: "TEXT",
    });
    models.Incoterm.enableSync('/sync/infohub/incoterm/');

    models.Manufacturer = persistence.define('manufacturer', {
	name: "TEXT",
    });
    models.Manufacturer.enableSync('/sync/infohub/manufacturer/');

    models.Supplier = persistence.define('supplier', {
	name: "TEXT",
    });
    models.Supplier.enableSync('/sync/infohub/supplier/');

    models.Price = persistence.define('price', {
	fob_price: "REAL",
	landed_price: "REAL",
	fob_currency: "TEXT",
	period: "INT",
	issue_unit: "REAL",
	landed_currency: "TEXT",
	volume: "INT",
    });
    models.Price.hasOne('formulation', models.Formulation, 'prices');
    models.Formulation.hasMany('prices', models.Price, 'formulation');
    models.Price.hasOne('country', models.Country, 'prices');
    models.Country.hasMany('prices', models.Price, 'country');
    models.Price.hasOne('manufacturer_country', models.Country, 'manufacturer_prices');
    models.Country.hasMany('manufacturer_prices', models.Price, 'manufacturer_country');
    models.Price.hasOne('supplier_country', models.Country, 'supplier_prices');
    models.Country.hasMany('supplier_prices', models.Price, 'supplier_country');
    models.Price.hasOne('supplier', models.Supplier, 'prices');
    models.Supplier.hasMany('prices', models.Price, 'supplier');
    models.Price.hasOne('incoterm', models.Incoterm, 'prices');
    models.Incoterm.hasMany('prices', models.Price, 'incoterm');
    models.Price.enableSync('/sync/infohub/price/');

    models.ExchangeRate = persistence.define('exchangerate', {
	symbol: "TEXT",
	year: "INT",
	rate: "REAL",
    });
    models.ExchangeRate.enableSync('/sync/infohub/exchangerate/')
    
    models.MSHPrice = persistence.define('mshprice', {
	period: "INT",
	price: "REAL",
    });
    models.MSHPrice.hasOne('formulation', models.Formulation, 'mshprices');
    models.Formulation.hasMany('mshprices', models.MSHPrice, 'formulation');
    models.MSHPrice.enableSync('/sync/infohub/mshprice/')

    models.Product = persistence.define('product', {
	name: "TEXT",
	packaging: "TEXT",
	unit_of_issue: "TEXT",
	who_prequalified: "BOOL",
    });
    models.Product.hasOne('formulation', models.Formulation, 'products');
    models.Formulation.hasMany('products', models.Product, 'formulation');
    models.Product.enableSync('/sync/infohub/product/')

    models.ProductRegistration = persistence.define('productregistration', {
    });
    models.ProductRegistration.hasOne('product', models.Product, 'registrations');
    models.Product.hasMany('registrations', models.ProductRegistration, 'product');
    models.ProductRegistration.hasOne('supplier', models.Supplier, 'registrations');
    models.Supplier.hasMany('registrations', models.ProductRegistration, 'supplier');
    models.ProductRegistration.hasOne('country', models.Country, 'registrations');
    models.Country.hasMany('registrations', models.ProductRegistration, 'country');
    models.ProductRegistration.hasOne('manufacturer', models.Manufacturer, 'registrations');
    models.Manufacturer.hasMany('registrations', models.ProductRegistration, 'manufacturer');
    models.ProductRegistration.enableSync('/sync/infohub/productregistration/')
    
    // Sync the schema to the database.
    productsdb.models = models;
    persistence.schemaSync();
})();

// Function to synchronize the ProductsDB with the hosted database.
productsdb.sync = function() {
    // Show busy message on screen.
    $.mobile.showPageLoadingMsg();
    // Sync all models.
    var models = [];
    (function (){
	for (model in productsdb.models) {
	    models.push(model);
	};
	(function (index) {
	    if (models.length > index) {
		$('#status').html('<h3>Sync: '+ models[index] + '</h3>')
		model = productsdb.models[models[index]]
		var callback = arguments.callee;
		console.log(model)
		model.syncAll(
		    persistence.sync.preferRemoteConflictHandler,
		    function() {
			callback(index+1);
		    },
		    function() {
			$('#status').html('<h3>Sync: '+ models[index] + ' failed!</h3>')
			$.mobile.hidePageLoadingMsg();
		    });
	    } else {
		// We are done.
		$('#status').html('<h3>Sync: Done!</h3>')
		$.mobile.hidePageLoadingMsg();
	    };
	})(0);
    })();
};

// Function to render an item list.
productsdb.itemList = function(item) {
    $.mobile.showPageLoadingMsg();
    template = item.toLowerCase() + '-list.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	productsdb.models[item].all().list(null, function(items) {
	    var context = {};
	    context[item.toLowerCase()+'-list'] = items;
	    $('#list').html(t.render(context));
	    $('#list').page();
	    $.mobile.changePage('#list', 'slide', false, true);
	    $.mobile.hidePageLoadingMsg();
	});
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};

// Function to render the details of an item.
productsdb.itemDetail = function(item) {
    alert(item);
};