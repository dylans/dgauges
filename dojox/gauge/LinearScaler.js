define(["dojo/_base/lang", "dojo/_base/declare", "dojo/Stateful"], function(lang, declare, Stateful){

    /*=====
     var Stateful = dojo.Stateful;
     =====*/

	return declare("dojox.gauge.LinearScaler", Stateful, {
		//	summary:
		//		The linear scaler. This scaler creates major and minor ticks regularly between 
		//		a minimum and a maximum.
		//		Scalers are responsible for tick generation and various data-transform operations.		
		
		//	minimum:
		//		The minimum value of the scaler. Default is 0.
		minimum: 0,
		//	maximum:
		//		The maximum value of the scaler. Default is 100.
		maximum: 100,
		//	snapInterval:
		//		Specifies the increment value to be used as snap values on this scale 
		//		during user interaction.
		//		Default is 1.
		snapInterval: 1,
		//	majorTickInterval:
		//		The interval between two major ticks.
		majorTickInterval: NaN,
		//	minorTickInterval:
		//		The interval between two minor ticks.
		minorTickInterval: NaN,
		_computedMajorTickInterval: NaN,
		_computedMinorTickInterval: NaN,
		//	majorTicks:
		//		The array of generated major ticks. You should not set this
		//		property when using the scaler.
		majorTicks: null,
		//	minorTicks:
		//		The array of generated minor ticks. You should not set this
		//		property when using the scaler.
		minorTicks: null,
		
		constructor: function(){
			this.inherited(arguments);
			this.watchedProperties = ["minimum", "maximum", "majorTickInterval", "minorTickInterval", "snapInterval"];
		},
		
		_getNextValidValue: function(value){
			var v = Number(value);
			var nv;
			if(isNaN(this.snapInterval)) 
				nv = v + (this.maximum - this.minimum) / 10;
			else 
				nv = v + this.snapInterval;
			return Math.max(nv, this.minimum);
		},
		
		_getPreviousValidValue: function(value){
			var v = Number(value);
			var nv;
			if(isNaN(this.snapInterval)) 
				nv = v - (this.maximum - this.minimum) / 10;
			else 
				nv = v - this.snapInterval;
			return Math.max(nv, this.minimum);
		},
		
		_getFirstValidValue: function(){
			return this.minimum;
		},
		
		_getLastValidValue: function(){
			return this.maximum;
		},

		_buildMinorTickItems: function(){
			var mt = this.majorTicks;
			var minorTickCache = [];
			if(this.maximum > this.minimum){
				var majorTickCount = Math.floor((this.maximum - this.minimum) / this.getComputedMajorTickInterval()) + 1;
				var minorTickCount = Math.floor(this.getComputedMajorTickInterval() / this.getComputedMinorTickInterval());
				var data;
				for (var i = 0; i < majorTickCount - 1; i++){
					for (var j = 1; j < minorTickCount; j++){
						data = {scaler: this};
						data.isMinor = true;
						data.value = mt[i].value + j * this.getComputedMinorTickInterval();
						data.position = (Number(data.value) - this.minimum) / (this.maximum - this.minimum);
						minorTickCache.push(data);
					}
				}
			}
			return minorTickCache;
		},
		
		_buildMajorTickItems: function(){
			var majorTickCache = [];
			if(this.maximum > this.minimum){
				var majorTickCount = Math.floor((this.maximum - this.minimum) / this.getComputedMajorTickInterval()) + 1;
				var data;
				for (var i = 0; i < majorTickCount; i++){
					data = {scaler: this};
					data.isMinor = false;
					data.value = this.minimum + i * this.getComputedMajorTickInterval();
					data.position = (Number(data.value) - this.minimum) / (this.maximum - this.minimum);
					majorTickCache.push(data);
				}
			}
			return majorTickCache;
		},
		
		getComputedMajorTickInterval: function(){
			//	summary:
			//		The computed or user defined major tick interval.
			//	returns: Number
			//		The major tick interval used for ticks generation.
			if(!isNaN(this.majorTickInterval)) 
				return this.majorTickInterval;
			if(isNaN(this._computedMajorTickInterval)) 
				this._computedMajorTickInterval = (this.maximum - this.minimum) / 10;
			return this._computedMajorTickInterval;
		},
		
		getComputedMinorTickInterval: function(){
			//	summary:
			//		The computed or user defined minor tick interval.
			//	returns: Number
			//		The minor tick interval used for ticks generation.
			if(!isNaN(this.minorTickInterval)) 
				return this.minorTickInterval;
			if(isNaN(this._computedMinorTickInterval)) 
				this._computedMinorTickInterval = this.getComputedMajorTickInterval() / 5;
			return this._computedMinorTickInterval;
		},
		
		computeTicks: function(){
			//	summary:
			//		Creates or re-creates the ticks for this scaler.
			//	returns: Array
			//		An array containing all ticks (major then minor ticks).
			this.majorTicks = this._buildMajorTickItems();
			this.minorTicks = this._buildMinorTickItems();
			return this.majorTicks.concat(this.minorTicks);
		},
		positionForValue: function(value){
			//	summary:
			//		Transforms a value into a relative position between 0 and 1.
			//	value: Number
			//		A value to transform.
			//	returns: Number
			//		The position between 0 and 1.
			var position;
			if(value == null || isNaN(value) || value <= this.minimum) 
				position = 0;
			if(value >= this.maximum) 
				position = 1;
			if(isNaN(position)){
				position = (value - this.minimum) / (this.maximum - this.minimum);
			}
			return position;
		},
		valueForPosition: function(position){
			//	summary:
			//		Transforms a relative position (between 0 and 1) into a value.
			//	value: Number
			//		A relative position to transform.
			//	returns: Number
			//		The transformed value between minimum and maximum.
			var range = Math.abs(this.minimum - this.maximum);
			var value = this.minimum + range * position;
			if(!isNaN(this.snapInterval) && this.snapInterval > 0){
				value = Math.round((value - this.minimum) / this.snapInterval) * this.snapInterval + this.minimum;
			}
			return value;
		}
	});
});
