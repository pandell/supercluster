'use strict';

var test = require('tap').test;
var supercluster = require('../');

var places = require('./fixtures/places.json');
var placesTile = require('./fixtures/places-z0-0-0.json');

test('Test with no selector', function (t) {
    var index = supercluster().load(places.features);
    var tile = index.getTile(0, 0, 0);
    t.same(tile.features, placesTile.features);
    t.end();
});

var placesTileSimpleProperties = require('./fixtures/placesWithSimpleProperties-z0-0-0.json');
var selectorSimple = (p) => {
    var temp = p.properties.featureclass;
    return temp;
};
var aggregatorSimple = (props) => {
    var propertyCounts = {};
    for (var i = 0; i < props.length; i++) {
        var propertyValue = props[i];
        propertyCounts[propertyValue] = (propertyCounts[propertyValue] || 0) + 1;
    }
    return propertyCounts;
};

test('Test with simple selector & aggregator', function (t) {
    var index = supercluster({selector: selectorSimple, aggregator: aggregatorSimple}).load(places.features);
    var tile = index.getTile(0, 0, 0);
    t.same(tile.features, placesTileSimpleProperties.features);
    t.end();
});

var placesTileComplexProperties = require('./fixtures/placesWithComplexProperties-z0-0-0.json');
var selectorComplex = (p) => {
    var temp = {
        lat: p.properties.lat_y,
        lng: p.properties.long_x,
        scalerank: p.properties.scalerank
    };
    return temp;
};
var aggregatorComplex = (props) => {
    var min_lat = 90;
    var max_lat = -90;
    var min_lng = 180;
    var max_lng = -180;
    var sum_scalerank = 0, avg_scalerank;
    for (var i = 0; i < props.length; i++) {
        var p = props[i];
        min_lat = Math.min(min_lat, p.lat);
        max_lat = Math.max(max_lat, p.lat);
        min_lng = Math.min(min_lng, p.lng);
        max_lng = Math.max(max_lng, p.lng);
        sum_scalerank += p.scalerank;
    }
    avg_scalerank = sum_scalerank / props.length;

    return {min_lat, max_lat, min_lng, max_lng, avg_scalerank};
};

test('Test with complex selector & aggregator', function (t) {
    var index = supercluster({selector: selectorComplex, aggregator: aggregatorComplex}).load(places.features);
    var tile = index.getTile(0, 0, 0);
    t.same(tile.features, placesTileComplexProperties.features);
    t.end();
});
