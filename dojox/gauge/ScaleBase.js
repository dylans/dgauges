define(["dojo/_base/lang", "dojo/_base/declare", "dojox/gfx", "../widget/_Invalidating"], function(lang, declare, gfx, _Invalidating){
    
	/*=====
     var _Invalidating = dojox.widget._Invalidating;
     =====*/
	
	return declare("dojox.gauge.ScaleBase", _Invalidating, {
		//	summary:
		//		The ScaleBase class is the base class for the circular and rectangular scales.
		//		A scaler must be set to use this class. A scaler is responsible for  responsible for 
		//		tick generation and various data-transform operations.	

		//	scaler: Object
		//		The scaler used for tick generation and data-transform operations.
		//		This property is mandatory for using the scale.
		scaler: null,
		//	font: Object
		//		The font used for the ticks labels.
		//		This is null by default which means this scale use the font defined 
		//		on the gauge.
		font: null,
		//	labelPosition: String
		//		See CircularScale and RectangularScale for valid values.
		labelPosition: null,
		//	labelGap: Number
		//		The label gap between the ticks and their labels. Default value is 1.
		labelGap: 1,
		_gauge: null,
		_gfxGroup: null,
		_bgGroup: null,
		_fgGroup: null,
		_indicators: null,
		_indicatorsIndex: null,
		_indicatorsRenderers: null,
		
		constructor: function(args, node){
			this._indicators = [];
			this._indicatorsIndex = {};
			this._indicatorsRenderers = {};
			this._gauge = null;
			this._gfxGroup = null;
			this.addInvalidatingProperties(["scaler", "font", "labelGap", "labelPosition", "tickShapeFunc", "tickLabelFunc"]);
			
			var watchedObjects = ["scaler"];
			
			for (var i = 0; i < watchedObjects.length; i++){
				this.watch(watchedObjects[i], lang.hitch(this, this._watchObject));
			}
		},
		
		
		_watchObject: function(name, oldValue, newValue){
			// TODO: unwatch oldValue properties
			
			// Get the properties declared by the watched object
			var props = newValue.watchedProperties;
			if(props){
				for (var i = 0; i < props.length; i++){
					newValue.watch(props[i], lang.hitch(this, this.invalidateRendering));
				}
			}
		},
		
		_getFont: function(){
			var font = this.font;
			if(!font){
				font = this._gauge.font;
			}
			if(!font){
				font = gfx.defaultFont;
			}
			return font;
		},
		
		positionForValue: function(value){
			//	summary:
			//		See CircularScale and Rectangular for more informations.
			//		value: Number
			//			The value to convert.
			//		returns: Number
			//			The position corresponding to the value.
			return 0;
		},
		
		valueForPosition: function(position){
			//	summary:
			//		See CircularScale and Rectangular for more informations.
			//		position: Number
			//			The position to convert.
			//		returns: Number
			//			The value corresponding to the position.
		},
		
		tickLabelFunc: function(tickItem){
			//	summary:
			//		Customize the text of ticks labels.
			//		tickItem: Object
			//			An object containing the tick informations.
			//		returns: String
			//			The text to be aligned with the tick. If null, the tick has no label.
			if(tickItem.isMinor){
				return null;
			} else {
				return String(tickItem.value);
			}
		},
		
		tickShapeFunc: function(group, scale, tickItem){
			//	summary:
			//		Customize the shape of ticks.
			//		scale: ScaleBase
			//			The scale being processed.
			//		group: dojox.gfx.canvas.Group
			//			The GFX group used for drawing the tick.
			//		tickItem: An object containing the tick informations.
			//			The tick item being processed.
			return group.createLine({
				x1: 0,
				y1: 0,
				x2: tickItem.isMinor ? 6 : 10,
				y2: 0
			}).setStroke({
				color: 'black',
				width: 0.5
			});
		},
		
		
		getNextValidValue: function(value){
			return null;
		},
		
		getPreviousValidValue: function(value){
			return null;
		},
		
		getFirstValidValue: function(){
			return null;
		},
		
		getLastValidValue: function(){
			return null;
		},
		
		getIndicatorRenderer: function(name){
			//	summary:
			//		Gets the GFX shape an indicator.
			//	name: String
			//		The name of the indicator as defined using addIndicator.
			//	returns: dojox.gfx.canvas.Shape
			//		The GFX shape of the indicator.
			return this._indicatorsRenderers[name];
		},
		
		removeIndicator: function(name){
			//	summary:
			//		Removes an indicator.
			//	name: String
			//		The name of the indicator as defined using addIndicator.
			//	returns: IndicatorBase
			//		The removed indicator.
			var indicator = this._indicatorsIndex[name];
			if(indicator){
				indicator._gfxGroup.removeShape();
				var idx = this._indicators.indexOf(indicator);
				this._indicators.splice(idx, 1);
				
				indicator._disconnectListeners();
				
				delete this._indicatorsIndex[name];
				delete this._indicatorsRenderers[name];
			}
			this.invalidateRendering();
			return indicator;
		},
		
		getIndicator: function(name){
			//	summary:
			//		Get an indicator instance.
			//	name: String
			//		The name of the indicator as defined using addIndicator.
			//	returns: IndicatorBase
			//		The indicator associated with the name parameter.
			return this._indicatorsIndex[name];
		},
		
		addIndicator: function(name, indicator, behindScale){
			//	summary:
			//		Add an indicator to the scale. Before calling this function, ensure 
			//		this scale has already been added to a gauge using the addElement method
			//		of the gauge.
			//	behindScale: Boolean
			//		If true, this indicator is drawn behind the scale. Default value is false.	
			//	name: String
			//		The name of the indicator to be added.
			if(this._indicatorsIndex[name] && this._indicatorsIndex[name] != indicator){
				this.removeIndicator(name);
			}
			
			this._indicators.push(indicator);
			this._indicatorsIndex[name] = indicator;
			
			if(!this._ticksGroup){
				this._createSubGroups();
			}
			
			var group = behindScale ? this._bgGroup : this._fgGroup;
			indicator._gfxGroup = group.createGroup();
			
			indicator.scale = this;
			
			return this.invalidateRendering();
		},
		
		_createSubGroups: function(){
			if(!this._gfxGroup || this._ticksGroup){
				return;
			}
			this._bgGroup = this._gfxGroup.createGroup();
			this._ticksGroup = this._gfxGroup.createGroup();
			this._fgGroup = this._gfxGroup.createGroup();
		},
		
		refreshRendering: function(){
			if(!this._ticksGroup){
				this._createSubGroups();
			}
		}
		
		
	});
});
