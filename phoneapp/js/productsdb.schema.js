//var SERVER_ROOT = 'http://data.medicinesinfohub.net/';
var SERVER_ROOT = '/';

if (window.openDatabase) {
    persistence.store.websql.config(persistence, "productsdb", 'database', 5 * 1024 * 1024);
} else {
    persistence.store.memory.config(persistence);
};

if (typeof productsdb === 'undefined') {
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
    models.Formulation.enableSync(SERVER_ROOT+'sync/infohub/formulation/');
    
    models.Country = persistence.define('country', {
	code: "TEXT",
	name: "TEXT",
    });
    models.Country.enableSync(SERVER_ROOT+'sync/infohub/country/');
    
    models.Incoterm = persistence.define('incoterm', {
	name: "TEXT",
    });
    models.Incoterm.enableSync(SERVER_ROOT+'sync/infohub/incoterm/');

    models.Manufacturer = persistence.define('manufacturer', {
	name: "TEXT",
	address: "TEXT",
	email: "TEXT",
	phone: "TEXT",
    });
    models.Manufacturer.enableSync(SERVER_ROOT+'sync/infohub/manufacturer/');

    models.Supplier = persistence.define('supplier', {
	name: "TEXT",
	address: "TEXT",
	email: "TEXT",
	phone: "TEXT",
    });
    models.Supplier.enableSync(SERVER_ROOT+'sync/infohub/supplier/');

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
    models.Price.enableSync(SERVER_ROOT+'sync/infohub/price/');

    models.ExchangeRate = persistence.define('exchangerate', {
	symbol: "TEXT",
	year: "INT",
	rate: "REAL",
    });
    models.ExchangeRate.enableSync(SERVER_ROOT+'sync/infohub/exchangerate/')
    
    models.MSHPrice = persistence.define('mshprice', {
	period: "INT",
	price: "REAL",
    });
    models.MSHPrice.hasOne('formulation', models.Formulation, 'mshprices');
    models.Formulation.hasMany('mshprices', models.MSHPrice, 'formulation');
    models.MSHPrice.enableSync(SERVER_ROOT+'sync/infohub/mshprice/')

    models.Product = persistence.define('product', {
	name: "TEXT",
	packaging: "TEXT",
	unit_of_issue: "TEXT",
	who_prequalified: "BOOL",
    });
    models.Product.hasOne('formulation', models.Formulation, 'products');
    models.Formulation.hasMany('products', models.Product, 'formulation');
    models.Product.enableSync(SERVER_ROOT+'sync/infohub/product/')

    models.ProductRegistration = persistence.define('productregistration', {
	repr: "TEXT",
    });
    models.ProductRegistration.hasOne('product', models.Product, 'registration');
    models.Product.hasMany('registrations', models.ProductRegistration, 'product');
    models.ProductRegistration.hasOne('supplier', models.Supplier, 'registrations');
    models.Supplier.hasMany('registrations', models.ProductRegistration, 'supplier');
    models.ProductRegistration.hasOne('country', models.Country, 'registrations');
    models.Country.hasMany('registrations', models.ProductRegistration, 'country');
    models.ProductRegistration.hasOne('manufacturer', models.Manufacturer, 'registrations');
    models.Manufacturer.hasMany('registrations', models.ProductRegistration, 'manufacturer');
    models.ProductRegistration.enableSync(SERVER_ROOT+'sync/infohub/productregistration/')
    
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


productsdb.views = {};

// Function to render an item list.
productsdb.views.list = function(model, related, related_id) {
    $.mobile.showPageLoadingMsg();
    $('#'+model.toLowerCase()+'-list').remove();
    $.mobile.initializePage();
    template = model.toLowerCase() + '-list.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	var callback = function(items) {
	    var context = {};
	    context[model.toLowerCase()+'-list'] = items;
	    $('#page-body').append(t.render(context));
	    $.mobile.initializePage();
	    $('#'+model.toLowerCase()+'-list .item-detail').click(function() {
		productsdb.views.detail($(this).data('model'), $(this).data('id'));
		return false;
            });
	    $.mobile.changePage('#'+model.toLowerCase()+'-list', 'slide', false, true);
	    $.mobile.hidePageLoadingMsg();
	};
	if (typeof related === 'undefined') {
	    productsdb.models[model].all().list(null, callback);
	} else {
	    productsdb.models[model].all().filter(related,'=',related_id).list(null, callback);
	};
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};

productsdb.views.detail = function(model, id) {
    productsdb.views[model.toLowerCase()](id);
};

// Function to render the details of a product.
productsdb.views.product = function(id) {
    var fields = ['id', 'name', 'packaging', 'unit_of_issue', 'who_prequalified', 'formulation.[id, name, generic_name, strength]'];
    $.mobile.showPageLoadingMsg();
    $('#product-detail').remove();
    $.mobile.initializePage();
    template = 'product-detail.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	productsdb.models.Product.load(id, function(item) {
	    var context = item.selectJSON(fields, function(context) {
		console.log(context);
		$('#page-body').append(t.render(context));
		$.mobile.initializePage();
		$('#product-detail .item-detail').click(function() {
		    productsdb.views.detail($(this).data('model'), $(this).data('id'));
		    return false;
		});
		$('#product-detail .item-list').click(function() {
		    productsdb.views.list($(this).data('model'), $(this).data('related'), $(this).data('related-id'));
		    return false;
		});
		$.mobile.changePage('#product-detail', 'slide', false, true);
		$.mobile.hidePageLoadingMsg();		
	    });
	});
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};

// Function to render the details of a formulation.
productsdb.views.formulation = function(id) {
    var fields = ['id', 'name', 'generic_name', 'strength'];
    $.mobile.showPageLoadingMsg();
    $('#formulation-detail').remove();
    $.mobile.initializePage();
    template = 'formulation-detail.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	productsdb.models.Formulation.load(id, function(item) {
	    item.selectJSON(fields, function(context) {
		console.log(context);
		$('#page-body').append(t.render(context));
		$.mobile.initializePage();
		$('#formulation-detail .item-detail').click(function() {
		    productsdb.views.detail($(this).data('model'), $(this).data('id'));
		    return false;
		});
		$('#formulation-detail .item-list').click(function() {
		    productsdb.views.list($(this).data('model'), $(this).data('related'), $(this).data('related-id'));
		    return false;
		});
		$.mobile.changePage('#formulation-detail', 'slide', false, true);
		$.mobile.hidePageLoadingMsg();		
	    });
	});
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};


// Function to render the details of a supplier.
productsdb.views.supplier = function(id) {
    var fields = ['id', 'name', 'address', 'email', 'phone'];
    $.mobile.showPageLoadingMsg();
    $('#supplier-detail').remove();
    $.mobile.initializePage();
    template = 'supplier-detail.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	productsdb.models.Supplier.load(id, function(item) {
	    item.selectJSON(fields, function(context) {
		console.log(context);
		$('#page-body').append(t.render(context));
		$.mobile.initializePage();
		$('#supplier-detail .item-detail').click(function() {
		    productsdb.views.detail($(this).data('model'), $(this).data('id'));
		    return false;
		});
		$('#supplier-detail .item-list').click(function() {
		    productsdb.views.list($(this).data('model'), $(this).data('related'), $(this).data('related-id'));
		    return false;
		});
		$.mobile.changePage('#supplier-detail', 'slide', false, true);
		$.mobile.hidePageLoadingMsg();		
	    });
	});
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};

// Function to render the details of a manufacturer.
productsdb.views.manufacturer = function(id) {
    var fields = ['id', 'name', 'address', 'email', 'phone'];
    $.mobile.showPageLoadingMsg();
    $('#manufacturer-detail').remove();
    $.mobile.initializePage();
    template = 'manufacturer-detail.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	productsdb.models.Manufacturer.load(id, function(item) {
	    item.selectJSON(fields, function(context) {
		console.log(context);
		$('#page-body').append(t.render(context));
		$.mobile.initializePage();
		$('#manufacturer-detail .item-detail').click(function() {
		    productsdb.views.detail($(this).data('model'), $(this).data('id'));
		    return false;
		});
		$('#manufacturer-detail .item-list').click(function() {
		    productsdb.views.list($(this).data('model'), $(this).data('related'), $(this).data('related-id'));
		    return false;
		});
		$.mobile.changePage('#manufacturer-detail', 'slide', false, true);
		$.mobile.hidePageLoadingMsg();		
	    });
	});
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};

// Function to render the details of a product registration.
productsdb.views.productregistration = function(id) {
    var fields = ['id', 'repr', 'product.[name, id]', 'supplier.[name, id]', 'manufacturer.[name, id]'];
    $.mobile.showPageLoadingMsg();
    $('#registration-detail').remove();
    $.mobile.initializePage();
    template = 'productregistration-detail.html';
    $.ajax(template).done(function(data) {
	var t = new Jtl(data);
	productsdb.models.ProductRegistration.load(id, function(item) {
	    item.selectJSON(fields, function(context) {
		console.log(context);
		$('#page-body').append(t.render(context));
		$.mobile.initializePage();
		$('#registration-detail .item-detail').click(function() {
		    productsdb.views.detail($(this).data('model'), $(this).data('id'));
		    return false;
		});
		$('#registration-detail .item-list').click(function() {
		    productsdb.views.list($(this).data('model'), $(this).data('related'), $(this).data('related-id'));
		    return false;
		});
		$.mobile.changePage('#registration-detail', 'slide', false, true);
		$.mobile.hidePageLoadingMsg();		
	    });
	});
    }).fail(function() {
	$.mobile.hidePageLoadingMsg();
    });
};